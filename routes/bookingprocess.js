const express = require("express");
const router = express.Router();
const { fetchuser } = require("../middleware/middleware");
const Notes = require("../models/Notes");
const BookingProcess = require("../models/BookingProcess");
const { validationResult } = require('express-validator');
const logActivity = require("./loginfo");

// Request by buyer
const requestByBuyer = async (buyerId, noteId, sellerId) => {
  const note = await Notes.findById(noteId);
  if (!note) throw { status: 404, message: 'Note not found', error: 'Post not found' };

  const existingRequest = await BookingProcess.findOne({ buyerId, noteId, sellerId });
  if (existingRequest) throw { status: 422, message: 'Already requested', error: 'Unprocessable Entity' };

  const booking = new BookingProcess({
    buyerId,
    noteId,
    sellerId: sellerId,
    requested_date_buyer: new Date(),
    status: 1
  });

  return await booking.save();
};

// Approve by seller
const approveBySeller = async (buyerId, noteId, sellerId) => {
  const note = await Notes.findById(noteId);
  if (!note) throw { status: 404, message: 'Note not found', error: 'Post not found' };

  const existingBooking = await BookingProcess.findOneAndUpdate(
    { buyerId, noteId, sellerId, status: 1 }, // Find the existing booking with status 1
    { 
      $set: { 
        status: 2, // Update the status to 2
        approval_date_seller: new Date() // Set the approval date
      }
    },
    { new: true } // Return the modified document
  );

  if (!existingBooking) {
    throw { status: 404, message: 'Request not found or already approved', error: 'Not Found' };
  }

  return existingBooking;
};


// Route to handle booking process
router.post('/bookingprocess', [fetchuser], async (req, res, next) => {
  try {
    const { status, noteId } = req.body;
    const note = await Notes.findById(noteId);

    let checkSeller = (note.userId == req.user.id)
    let checkBuyer = (note.userId != req.user.id)

    if (![1, 2].includes(status)) {
      throw { status: 400, message: 'Invalid status provided', error: 'Bad Request' };
    }

    if (!noteId) {
      throw { status: 400, message: 'Note ID is required', error: 'Bad Request' };
    }

    if (status === 1 && checkBuyer) {
      const buyerId = req.user.id;
      const sellerId = note.userId;

      const booking = await requestByBuyer(buyerId, noteId, sellerId);
      res.status(200).json({
        status: 200,
        message: "Awaiting approval, you can find the shortest route after the approval from seller",
        data: booking
      });
    } else if (status === 2 && checkSeller) {
      const sellerId = req.user.id;
      const buyerId = req.body.buyerId;

      const booking = await approveBySeller(buyerId, noteId, sellerId);
      res.status(200).json({
        status: 200,
        message: "Approved by seller, please check for the shortest route to the buyer",
        data: booking
      });
    }
    else{
      console.log("Action needed for development")
    }
  } catch (err) {
    console.error(err.message);
    logActivity("Error", err.message, "error", req.user ? req.user.id : null);
    res.status(err.status || 500).json({
      status: err.status || 500,
      message: err.message || "Internal Server Error",
      error: err.error || err.toString()
    });
  }
});

module.exports = router;
