const express = require("express");
const router = express.Router();
const {fetchuser} = require("../middleware/middleware");
const Notes = require("../models/Notes");
const { body, validationResult } = require('express-validator');

// Define the route for searching notes
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
  
      res.json({ notes });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  });
  
  
module.exports = router;