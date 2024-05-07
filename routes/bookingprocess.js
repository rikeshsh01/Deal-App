const express = require("express");
const router = express.Router();
const { fetchuser } = require("../middleware/middleware");
const Notes = require("../models/Notes");
const BookingProcess = require("../models/BookingProcess");
const { validationResult } = require('express-validator');
const logActivity = require("./loginfo");

// Middleware for handling async functions
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  logActivity("Error", err.message, "error", req.user ? req.user.id : null);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
    error: err.error || err.toString()
  });
};

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

// Approve by buyer
const approveBySeller = async (buyerId, noteId, sellerId) => {
  const note = await Notes.findById(noteId);
  if (!note) throw { status: 404, message: 'Note not found', error: 'Post not found' };

  const requestBooking = await BookingProcess.findOne({ buyerId, noteId, sellerId });
  if (!requestBooking) throw { status: 404, message: 'Request not found', error: 'Post not found' };

  const existingBooking = await BookingProcess.findOne({ buyerId, noteId, sellerId, status: 2 });
  if (existingBooking) throw { status: 422, message: 'Already approved', error: 'Unprocessable Entity' };

  const approved = new BookingProcess({
    buyerId,
    noteId,
    sellerId,
    requested_date_buyer: requestBooking.requested_date_buyer,
    approval_date_seller: new Date(),
    status: 2
  });

  return await approved.save();
};

// Route to handle booking process
router.post('/bookingprocess', [fetchuser], asyncHandler(async (req, res) => {
  const { status, noteId } = req.body;


  if (status === 1) {
    const buyerId = req.user.id;
    const note = await Notes.findById(noteId);
    const sellerId = note.userId;

    const booking = await requestByBuyer(buyerId, noteId, sellerId);
    res.status(200).json({
      status: 200,
      message: "Awaiting approval, you can find the shortest route after the approval from seller",
      data: booking
    });
  } else if (status === 2) {
    const sellerId = req.user.id;
    const buyerId = req.body.buyerId;
    // console.log(buyerId)

    const processData = await BookingProcess.find({noteId});
    // console.log(processData)

    const approval = processData.filter(data=>data.buyerId == buyerId)
    console.log(approval)

    // const booking = await approveBySeller(buyerId, noteId, sellerId);
    // res.status(200).json({
    //   status: 200,
    //   message: "Approved by seller, please check for the shortest route to the buyer",
    //   data: booking
    // });
  } else {
    throw { status: 400, message: 'Invalid status provided', error: 'Bad Request' };
  }
}));

router.use(errorHandler);

module.exports = router;
