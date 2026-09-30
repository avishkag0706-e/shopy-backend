// routes/postRoutes.js
// Maps post URLs to post controller functions.

const express = require("express");
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const protect = require("../middleware/auth");

const router = express.Router();

router.get("/", getPosts); //           GET    /api/posts
router.get("/:id", getPost); //         GET    /api/posts/:id
router.post("/", protect, createPost); //      POST   /api/posts      (login required)
router.put("/:id", protect, updatePost); //    PUT    /api/posts/:id  (login + owner)
router.delete("/:id", protect, deletePost); // DELETE /api/posts/:id  (login + owner)

module.exports = router;
