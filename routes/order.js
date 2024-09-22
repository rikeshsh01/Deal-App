const express = require("express");
const router = express.Router();
const { fetchuser } = require("../middleware/middleware");
const Notes = require("../models/Notes");
const Orders = require("../models/Orders");
const logActivity = require("./loginfo");

router.post('/request', [fetchuser], async (req, res, next) => {
    try {
      const { noteId, requestCount } = req.body;
  
      // Ensure the requested count is valid
      if (!requestCount || requestCount <= 0) {
        return res.status(400).json({
          status: 400,
          msg: 'Please enter a valid requestCount'
        });
      }
  
      // Find the Note by its ID
      const note = await Notes.findById(noteId);
  
      // Check if the note exists
      if (!note) {
        return res.status(404).json({ msg: 'Note not found' });
      }
  
      // Check if the requested count is greater than available stock
      if (note.stockCount < requestCount) {
        return res.status(400).json({
          status: 400,
          msg: `Insufficient stock. Available stock: ${note.stockCount}`
        });
      }
  
      // Check if the requesting user is not the owner
      if (note.userId.toString() === req.user.id) {
        return res.status(400).json({ msg: 'Cannot request your own note' });
      }
  
      // Add the user (buyer) to buyerId array if they are not already in it
      if (!note.buyerId.includes(req.user.id)) {
        note.buyerId.push(req.user.id);
        await note.save();
  
        // Create an entry in the Orders collection with the requested count
        const newOrder = new Orders({
          noteId: note._id,
          buyerId: req.user.id,
          sellerId: note.userId,
          requestCount: requestCount // The requested count is used here
        });
        await newOrder.save();
  
        res.status(200).json({
          status: 200,
          message: "Request made successfully",
          data: newOrder
        });
      } else {
        res.status(400).json({
          status: 400,
          msg: 'You have already requested this note'
        });
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
  

// Route to get all requested orders for notes added by the logged-in user (seller)
router.get('/orders', [fetchuser], async (req, res, next) => {
    try {
      // Find all orders where the logged-in user is the seller
      const orders = await Orders.find({ sellerId: req.user.id })
        .populate('noteId') // Populate the note details
        .populate('buyerId') // Populate buyer details (fetch only name and email)
  
      if (!orders.length) {
        return res.status(404).json({ 
            status: 404,
            msg: 'No orders found for your postsss' });
      }
  
      res.status(200).json({
        status: 200,
        message: 'Orders fetched successfully',
        data: orders
      });
  
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

 // Route to approve an order and set other buyers to "pending"
router.put('/approve', [fetchuser], async (req, res, next) => {
    try {
      const { orderId } = req.body;
  
      // Find the order to approve and populate the noteId
      const orderToApprove = await Orders.findOne({
        _id: orderId,
        sellerId: req.user.id // Ensure the logged-in user is the seller
      }).populate('noteId'); // Populate noteId
  
      // Check if the order exists
      if (!orderToApprove) {
        return res.status(404).json({ msg: 'Order not found or unauthorized action' });
      }
  
      // Get the note associated with the order
      const note = orderToApprove.noteId;
  
      // Check if there's enough stock for the order request
      if (note.stockCount < orderToApprove.requestCount) {
        return res.status(400).json({
          status: 400,
          message: 'Not enough stock to approve the request'
        });
      }
  
      // Update the selected order's status to "approved"
      orderToApprove.status = "approved";
      await orderToApprove.save();
  
      // Decrease the stockCount of the note based on the requestCount
      note.stockCount -= orderToApprove.requestCount;
      await note.save();
  
      // Set all other orders for the same note to "pending"
      await Orders.updateMany(
        {
          _id: { $ne: orderId }, // Exclude the approved order
          noteId: note._id, // Use noteId from the approved order
          sellerId: req.user.id  // Ensure it's the seller's note
        },
        { status: "pending" }
      );
  
      res.status(200).json({
        status: 200,
        message: "Order approved successfully",
        approvedOrder: orderToApprove,
        updatedStockCount: note.stockCount
      });
  
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
