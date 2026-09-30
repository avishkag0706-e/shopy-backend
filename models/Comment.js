// models/Comment.js
// Blueprint for the "comments" collection.
// (Full comment logic is added in Step 6 - we only need the model here so
//  that deleting a post can also delete its comments.)

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },

  // Who wrote the comment
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Which post the comment belongs to
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
}, { timestamps: true }); // adds createdAt

module.exports = mongoose.model("Comment", commentSchema);
