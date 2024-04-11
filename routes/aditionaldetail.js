const AdditionalDetails = require("../models/AdditionalDetails")
const { router, fetchuser, checkAdminRole, body, validationResult, STATUS_CODES } = require('./import');


// Update additional detail by ID: put "/api/notes/updatedetail/:id". Login toBeRequired.
router.put('/updateadditionaldetail/:id', fetchuser, async (req, res) => {
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

module.exports = router;

