const Notes = require("../models/Notes");
const AdditionalDetails = require("../models/AdditionalDetails")
const Comments = require("../models/Comments")
const Users = require("../models/Users")
const Tag = require("../models/Tags");
const SubTag = require("../models/Sub-Tag");
const express = require("express");
const router = express.Router();
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { STATUS_CODES } = require("http");
const logActivity = require("./loginfo");

// Define the route for searching notes
router.get('/search', async (req, res) => {
  try {
    const { title, tagId, subtagId, latitude, longitude, radius } = req.query;
    const searchQuery = {};

    // Build the search query based on the provided parameters
    if (title) {
      searchQuery.title = { $regex: title, $options: 'i' }; // Case-insensitive search in title
    }
    // if (description) {
    //   searchQuery.description = { $regex: description, $options: 'i' }; // Case-insensitive search in description
    // }
    if (tagId) {
      searchQuery.tagId = tagId; // Exact match for tag
    }
    if (subtagId) {
      searchQuery.subtagId = subtagId; // Exact match for tag
    }

    if (latitude && longitude && radius) {
      // Add geospatial query for 1 km radius
      searchQuery.geoLocation = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)] // Note the order: longitude, latitude
          },
          $maxDistance: radius // 1 km in meters
        }
      };
    }

    // Perform the search query
    const notes = await Notes.find(searchQuery);

    let comments = await Comments.find();
    let users = await Users.find();
    let additionalDetals = await AdditionalDetails.find();
    let tagDetail = await Tag.find();
    let subtagDetail = await SubTag.find();

    // Map each note to include its comments and user details
    let notesWithCommentsAndUserDetails = notes.map(note => {
      // Find comments for this note
      let noteComments = comments.filter(comment => comment.noteId.toString() === note._id.toString());

      // Map each comment to include user details
      let commentsWithUserDetails = noteComments.map(comment => {
        // Find user details for this comment's userId
        let commentUserDetails = users.find(user => user._id.toString() === comment.userId.toString());

        // Return comment object with user details
        return {
          ...comment.toObject(), // Convert Mongoose document to plain JavaScript object
          userDetails: commentUserDetails
        };
      });

      // Find user details for this note's userId
      let noteUserDetails = users.find(user => user._id.toString() === note.userId.toString());
      let additionalDetail = additionalDetals.filter(aDetails => aDetails.noteId.toString() === note._id.toString());
      let tagDetails = tagDetail.filter(tag => tag._id.toString() === note.tagId.toString());
      let subtagDetails = subtagDetail.filter(subtag => subtag._id.toString() === note.subtagId.toString());

      // Add comments with user details and post user details to the note object
      return {
        ...note.toObject(), // Convert Mongoose document to plain JavaScript object
        userDetails: noteUserDetails,
        comments: commentsWithUserDetails,
        additionalDetail: additionalDetail,
        tagDetails: tagDetails,
        subtagDetails: subtagDetails
      };
    });
    res.status(200).send({
      status: 200,
      msg: "Search results fetched successfully",
      data: notesWithCommentsAndUserDetails
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