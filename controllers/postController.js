// controllers/postController.js
// Logic for creating, reading, editing and deleting blog posts.

const Post = require("../models/Post");
const Comment = require("../models/Comment");

// GET /api/posts - anyone can read the list
exports.getPosts = async (req, res) => {
  try {
    // .populate("author", "name") replaces the author id with { _id, name }
    // "-createdAt" etc. is not needed; sort newest first for a nicer UI
    const posts = await Post.find().populate("author", "name").sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/posts/:id - anyone can read one post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/posts - protected: requires a valid token
exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Please provide title and content" });
    }

    // req.userId was attached by the auth middleware
    const post = await Post.create({ title, content, author: req.userId });
    const populated = await post.populate("author", "name");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/posts/:id - protected AND only the author may edit
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ownership check: is the logged-in user the author of this post?
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    post.title = req.body.title ?? post.title;
    post.content = req.body.content ?? post.content;
    await post.save();

    const populated = await post.populate("author", "name");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/posts/:id - protected AND only the author may delete
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();

    // Also remove comments belonging to this post so nothing is left behind
    await Comment.deleteMany({ post: post._id });

    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
