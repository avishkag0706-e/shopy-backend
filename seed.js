// seed.js (one-time helper - fills the database with demo data)
// Run with:  node seed.js
require("dotenv").config(); // load MONGO_URI from .env
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // Start from a clean database
  await Promise.all([User.deleteMany(), Post.deleteMany(), Comment.deleteMany()]);

  // Two demo accounts, password for both: password123
  const alice = await User.create({
    name: "Alice Johnson",
    email: "alice@example.com",
    password: await bcrypt.hash("password123", 10),
  });
  const bob = await User.create({
    name: "Bob Smith",
    email: "bob@example.com",
    password: await bcrypt.hash("password123", 10),
  });

  const p1 = await Post.create({
    title: "Getting Started with the MERN Stack",
    content:
      "MERN stands for MongoDB, Express, React and Node.js.\n\nIn this post we look at how the four parts fit together: Node.js runs the server, Express handles the routes, MongoDB stores the data, and React draws the user interface.",
    author: alice._id,
  });

  const p2 = await Post.create({
    title: "Why We Hash Passwords",
    content:
      "We never store a password as plain text.\n\nbcrypt turns the password into a long string that cannot be turned back. When a user logs in we hash the typed password and compare the two hashes.",
    author: bob._id,
  });

  await Comment.create([
    { content: "Clear explanation, thanks!", author: bob._id, post: p1._id },
    { content: "Very useful for our college project.", author: alice._id, post: p1._id },
  ]);

  console.log("Seeded 2 users, 2 posts, 2 comments.");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
