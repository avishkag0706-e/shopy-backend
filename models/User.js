// models/User.js
// A "model" is the blueprint for a collection in MongoDB.
// Every document in the users collection must match this schema.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // unique = one account per email
  password: { type: String, required: true }, // this stores the HASH, never the plain text
});

// mongoose.model("User", schema) creates the "users" collection
module.exports = mongoose.model("User", userSchema);
