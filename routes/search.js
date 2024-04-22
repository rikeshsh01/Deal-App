const Notes = require("../models/Notes");
const express = require("express");
const router = express.Router();
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { STATUS_CODES } = require("http");

// Define the route for searching notes
router.get('/search', async (req, res) => {
    try {
      const { title, description, tag } = req.query;
      const searchQuery = {};
  
      // Build the search query based on the provided parameters
      if (title) {
        searchQuery.title = { $regex: title, $options: 'i' }; // Case-insensitive search in title
      }
      if (description) {
        searchQuery.description = { $regex: description, $options: 'i' }; // Case-insensitive search in description
      }
      if (tag) {
        searchQuery.tag = tag; // Exact match for tag
      }
      if (tag) {
        searchQuery.tag = tag; // Exact match for tag
      }
  
      // Perform the search query
      const notes = await Notes.find(searchQuery);
      res.status(200).send({
        status:200,
        msg:"Search results fetched successfully",
        data:notes
      })
  
    } catch (error) {
      console.error(error.message);
      logActivity("Search", "Error in searching: " + err.message, "error", req.user ? req.user.id : null);
      res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
  });
  
  
module.exports = router;