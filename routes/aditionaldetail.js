const AdditionalDetails = require("../models/AdditionalDetails")
const express = require("express");
const router = express.Router();
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { STATUS_CODES } = require("http");


// Update additional detail by ID: put "/api/notes/updatedetail/:id". Login toBeRequired.
router.put('/aditionaldetail/:id', fetchuser, async (req, res) => {
    try {
        const { key, value } = req.body;
        const detailId = req.params.id;

        const updatedDetail = await AdditionalDetails.findOneAndUpdate({ _id: detailId }, { $set: { key, value, updated_at: new Date() } }, { new: true });
        if (!updatedDetail) {
            return res.status(404).json({ status: STATUS_CODES[404], message: 'Additional detail not found' });
        }

        res.status(200).json({
            status: STATUS_CODES[200],
            message: 'Additional detail updated successfully',
            data: updatedDetail
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
});

// Delete additional detail by ID: delete "/api/notes/deletedetail/:id". Login toBeRequired.
router.delete('/aditionaldetail/:id', fetchuser, async (req, res) => {
    try {
        const detailId = req.params.id;

        // Find and delete the additional detail by ID
        const deletedDetail = await AdditionalDetails.findOneAndDelete({ _id: detailId });

        if (!deletedDetail) {
            return res.status(404).json({ status: STATUS_CODES[404], message: 'Additional detail not found' });
        }

        res.status(200).json({
            status: STATUS_CODES[200],
            message: 'Additional detail deleted successfully',
            data: deletedDetail
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
});


module.exports = router;

