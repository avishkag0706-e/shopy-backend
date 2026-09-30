// server.js - the entry point of our backend
// This file starts the web server and tells it what to do with incoming requests.

// Import the packages we installed
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); // loads variables from the .env file

const app = express();

// Middleware (code that runs on every request BEFORE our route handlers)
app.use(cors()); // allow the React frontend to talk to us
app.use(express.json()); // automatically read JSON bodies sent by the frontend

// --- Step 3: Connect to MongoDB -------------------------------------------
// We connect FIRST and only start listening for requests after the connection
// is ready. This way we never handle a request with no database.
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Everything that needs the database goes inside this function so it
    // only runs after the connection above succeeded.
    registerRoutes();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    // If the database is not reachable there is no point in running the app
    console.error("Could not start server:", error.message);
    process.exit(1);
  }
}

// Here we connect every URL prefix to its group of routes
function registerRoutes() {
  // A simple test route so we know the server is alive
  app.get("/", (req, res) => {
    res.json({ message: "Blog API is running" });
  });

  // Authentication routes -> /api/auth/register, /api/auth/login
  app.use("/api/auth", require("./routes/authRoutes"));

  // Post routes -> /api/posts, /api/posts/:id
  app.use("/api/posts", require("./routes/postRoutes"));

  // Comment routes -> /api/posts/:postId/comments and /api/comments/:id
  app.use("/api", require("./routes/commentRoutes"));
}

startServer();
