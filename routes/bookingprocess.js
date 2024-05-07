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
    const existingRequest = await BookingProcess.findOne({ buyerId: req.user.id, noteId: noteId });
    console.log(existingRequest)

    if (existingRequest) {
      return res.status(422).send({
        status: 422,
        message: 'Already requested',
        error: "Unprocessable Entity"
      });
    }

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
      message: "Awaiting approval, you can find the shortest route after the approval from seller",
      data: savedBooking
    })

  } catch (error) {
    console.error(error.message);
    logActivity("Make request", "Error making request for post: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }

});

// Create notesusing: post "/api/notes/addtags". Login toBeRequired. 
router.post('/approval/:buyerId/:noteId', [fetchuser], async (req, res) => {
  try {
    const buyerId = req.params.buyerId;
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
    const requestBooking = await BookingProcess.findOne({ buyerId, noteId, status: 1 });

    const existingBooking = await BookingProcess.findOne({ buyerId, noteId, status: 2 });

    if (existingBooking) {
      return res.status(422).send({
        status: 422,
        message: 'Already approved',
        error: "Unprocessable Entity"
      });
    }

    // Create a new booking
    const approved = new BookingProcess({
      buyerId,
      noteId,
      requested_date_buyer: requestBooking.requested_date_buyer, // Assuming this is available in the note object
      approval_date_seller: new Date(),
      status: 2
    });
    // // Save the like
    const savedBooking = await approved.save();

    res.status(200).send({
      status: 200,
      message: "Approved by seller, please check for the shortest route to the buyer",
      data: savedBooking
    })

  } catch (error) {
    console.error(error.message);
    logActivity("Request approval", "Error in approve the request: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }

});

module.exports = router;

