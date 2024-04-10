const express = require("express");
const router = express.Router();
const { fetchuser } = require("../middleware/middleware");
const Notes = require("../models/Notes");
const Users = require("../models/Users");
const Comments = require('../models/Comments');
const { body, validationResult } = require('express-validator');

// Add comment to a post by multiple users: POST "/api/notes/:noteId/comments"
router.post('/:noteId/addcomment', fetchuser, [
    body('content', "Description counld not be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if the note exists
        const note = await Notes.findById(req.params.noteId);
        if (!note) {
            return res.status(404).json({ msg: 'Note not found' });
        }

        // Create a new comment
        const comment = new Comments({
            userId: req.user.id,
            noteId: req.params.noteId,
            content: req.body.content
        });

        // Save the comment
        await comment.save();

        res.json({ comment }); // Send the newly created comment as response
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            status: 'error',
            message: error.message
        });
    }
});

// Update a comment by a user: PUT "/api/notes/:noteId/comments/:commentId"
router.put('/:noteId/comments/:commentId', fetchuser, [
    body('content', "Description cannot be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if the note exists
        const note = await Notes.findById(req.params.noteId);
        if (!note) {
            return res.status(404).json({ msg: 'Note not found' });
        }

        // Find the comment to be updated
        let comment = await Comments.findById(req.params.commentId);

        // Check if the comment exists and belongs to the user
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }
        if (comment.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Update the comment
        const updatedComment = await Comments.findByIdAndUpdate(req.params.commentId, { $set: { content: req.body.content } }, { new: true });

        res.json({ comment: updatedComment }); // Send the updated comment as response
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            status: 'error',
            message: error.message
        });
    }
});

// Delete a comment by a user: DELETE "/api/notes/:noteId/comments/:commentId"
router.delete('/:noteId/comments/:commentId', fetchuser, async (req, res) => {
    try {
        // Check if the note exists
        const note = await Notes.findById(req.params.noteId);
        if (!note) {
            return res.status(404).json({ msg: 'Note not found' });
        }

        // Find the comment to be deleted
        let comment = await Comments.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        // Check if the comment belongs to the user (or if the user has special permissions, if applicable)
        if (comment.userId.toString() !== req.user.id) {
            // You might also want to check for special permissions here
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Delete the comment
        await comment.remove();

        res.json({ msg: 'Comment removed' });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            status: 'error',
            message: error.message
        });
    }
});


module.exports = router;
