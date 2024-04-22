const Notes = require("../models/Notes");
const Comments = require('../models/Comments');
const express = require("express");
const router = express.Router();
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { body, validationResult } = require('express-validator');
const { STATUS_CODES } = require("http");

// Add comment to a post by multiple users: POST "/api/notes/:noteId/comments"
router.post('/comment/:noteId', fetchuser, [
    body('content', "Description counld not be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
        return res.status(400).send({ status:400,
                message: "Validation failed.",
                error: errors.array()  });
    }

    try {
        // Check if the note exists
        const note = await Notes.findById(req.params.noteId);
        if (!note) {
            return res.status(404).send({ msg: 'Note not found' });
        }

        // Create a new comment
        const comment = new Comments({
            userId: req.user.id,
            noteId: req.params.noteId,
            content: req.body.content,
            created_at: new Date(),
        });

        // Save the comment
        const saveComment = await comment.save();

        res.status(200).send({
            status:200,
            msg:"Comment saved successfully",
            data:saveComment
          });
    } catch (error) {
        console.log(error.message);
        logActivity("Create comment", "Error creating comment: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
});

// Update a comment by a user: PUT "/api/notes/:noteId/comments/:commentId"
router.put('/comment/:noteId/:commentId', fetchuser, [
    body('content', "Description cannot be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
        return res.status(400).send({ status:400,
                message: "Validation failed.",
                error: errors.array()  });
    }

    try {
        // Check if the note exists
        const note = await Notes.findById(req.params.noteId);
        if (!note) {
            return res.status(404).send({ msg: 'Note not found' });
        }

        // Find the comment to be updated
        let comment = await Comments.findById(req.params.commentId);

        // Check if the comment exists and belongs to the user
        if (!comment) {
            return res.status(404).send({ msg: 'Comment not found' });
        }
        if (comment.userId.toString() !== req.user.id) {
            return res.status(401).send({ msg: 'User not authorized' });
        }

        // Update the comment
        const updatedComment = await Comments.findByIdAndUpdate(req.params.commentId, { $set: { content: req.body.content, updated_at: new Date()  } }, { new: true });

        res.status(200).send({
            status:200,
            msg:"Comment updated successfully",
            data:updatedComment
          });

    } catch (error) {
        console.log(error.message);
        logActivity("Update comment", "Error updating user: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
});

// Delete a comment by a user: DELETE "/api/notes/:noteId/comments/:commentId"
router.delete('/comment/:noteId/:commentId', fetchuser, async (req, res) => {
    try {
        // Check if the note exists
        const note = await Notes.findById(req.params.noteId);
        if (!note) {
            return res.status(404).send({ msg: 'Note not found' });
        }

        // Find the comment to be deleted
        let comment = await Comments.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).send({ msg: 'Comment not found' });
        }

        // Check if the comment belongs to the user (or if the user has special permissions, if applicable)
        if (comment.userId.toString() !== req.user.id) {
            // You might also want to check for special permissions here
            return res.status(401).send({ msg: 'User not authorized' });
        }

        // Delete the comment
        await comment.remove();

        res.status(200).send({
            status:200,
            msg:"Comment deleted successfully",
          })
    } catch (error) {
        console.log(error.message);
        logActivity("Update comment", "Error updating the comment of a post: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
});


//Get comments of a note
router.get('/comment/:noteId', async (req,res)=>{
    try {
        // Check if the note exists
        const note = await Notes.findById(req.params.noteId);
        if (!note) {
            return res.status(404).send({ msg: 'Note not found' });
        }

        //find comment of the post
        let comments = await Comments.find({noteId: req.params.noteId});

        res.status(200).send({
            status:200,
            msg:"Fetched the comment of the post",
            data:comments
        })

    }
    catch (error) {
        console.log(error.message);
        logActivity("Fetch comment", "Error fetching comment of a post: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });

    }
})


module.exports = router;
