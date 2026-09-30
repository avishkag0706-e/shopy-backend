// routes/authRoutes.js
// A "route" simply maps a URL + HTTP method to a controller function.

const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register); // http://localhost:5000/api/auth/register
router.post("/login", login); //       http://localhost:5000/api/auth/login

module.exports = router;
