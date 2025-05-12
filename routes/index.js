const express = require("express");
const router = express.Router(); // Initialize the router

// Add your route handlers here
router.get("/", function (req, res) {
  res.redirect("/catalog");
});

module.exports = router; // Don't forget to export the router!
