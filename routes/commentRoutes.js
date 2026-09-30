// routes/commentRoutes.js
// Full URLs are written out here so they are easy to match with the API list.
// This router is mounted at "/api" in server.js.

const express = require("express");
const {
  getComments,
  createComment,
  deleteComment,
} = require("../controllers/commentController");
const protect = require("../middleware/auth");

const router = express.Router();

router.get("/posts/:postId/comments", getComments); //               GET    /api/posts/:postId/comments
router.post("/posts/:postId/comments", protect, createComment); //   POST   /api/posts/:postId/comments
router.delete("/comments/:id", protect, deleteComment); //           DELETE /api/comments/:id

module.exports = router;
