const BookingProcess = require("../models/BookingProcess")
const Notes = require("../models/Notes");
const express = require("express");
const router = express.Router();
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { body, validationResult } = require('express-validator');
const logActivity = require("./loginfo");


// Create notesusing: post "/api/notes/addtags". Login toBeRequired. 
router.post('/bookrequest/:noteId', [fetchuser], async (req, res) => {
  try {
    const noteId = req.params.noteId;
    // Check if the note exists
    const note = await Notes.findById(noteId);

    if (!note) {
        return res.status(404).send({
            status: 404,
            message: 'Note not found',
            error: "Post not found"
        });
    }
    // Check if the user has already liked the note
    const existingLike = await BookingProcess.findOne({ buyerId: req.user.id, noteId: noteId });

    // Create a new like
    const booking = new BookingProcess({
        buyerId: req.user.id,
        noteId: noteId,
        requested_date_buyer: new Date(),
        status: 1
    });

    // Save the like
    const savedBooking = await booking.save();

    res.status(200).send({
      status: 200,
      msg: "Booking saved successfully",
      data: savedBooking
    })

  } catch (error) {
    console.error(error.message);
    logActivity("Create subtag", "Error creating subtag: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }

});

module.exports = router;

