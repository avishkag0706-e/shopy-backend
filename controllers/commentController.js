// controllers/commentController.js
// Logic for reading, creating and deleting comments.

const Comment = require("../models/Comment");
const Post = require("../models/Post");

// GET /api/posts/:postId/comments - anyone can read the comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "name") // replace author id with { _id, name }
      .sort({ createdAt: 1 });    // oldest first

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/posts/:postId/comments - protected: requires login
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Make sure the post really exists before commenting on it
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      content,
      author: req.userId,        // who is logged in (from the JWT)
      post: req.params.postId,   // which post it belongs to
    });

    await comment.populate("author", "name");
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/comments/:id - protected AND only the author may delete
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Ownership check
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
