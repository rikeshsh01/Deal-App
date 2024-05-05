const Notes = require("../models/Notes");
const express = require("express");
const router = express.Router();
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { STATUS_CODES } = require("http");
const logActivity = require("./loginfo");

// Define the route for searching notes
router.get('/search', async (req, res) => {
    try {
      const { title, tag, subtag, latitude, longitude } = req.query;
      const searchQuery = {};
  
      // Build the search query based on the provided parameters
      if (title) {
        searchQuery.title = { $regex: title, $options: 'i' }; // Case-insensitive search in title
      }
      // if (description) {
      //   searchQuery.description = { $regex: description, $options: 'i' }; // Case-insensitive search in description
      // }
      if (tag) {
        searchQuery.tag = tag; // Exact match for tag
      }
      if (subtag) {
        searchQuery.subtag = subtag; // Exact match for tag
      }

      if (latitude && longitude) {
        // Add geospatial query for 1 km radius
        searchQuery.geoLocation = {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)] // Note the order: longitude, latitude
                },
                $maxDistance: 5000 // 1 km in meters
            }
        };
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
      logActivity("Search", "Error in searching: " + error.message, "error", req.user ? req.user.id : null);
      res.status(500).send({
        status: 500,
        message: "Internal server error",
        error: error.message
        });
    }
  });
  
  
module.exports = router;