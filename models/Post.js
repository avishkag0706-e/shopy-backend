// models/Post.js
// Blueprint for the "posts" collection.

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },

    // "ref: User" links this post to a document in the users collection.
    // We store only the id here, and use .populate() to fetch the name later.
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true } // adds createdAt (and updatedAt) automatically
);

module.exports = mongoose.model("Post", postSchema);
