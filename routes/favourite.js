const express = require("express");
const router = express.Router();
const { fetchuser } = require("../middleware/middleware");
const Notes = require("../models/Notes");
const Like = require("../models/Like");

// Like a note: POST "/api/notes/:noteId/like"
router.get('/favourite', fetchuser, async (req, res) => {
    try {
        let userId = req.user.id;
        // Check if the note exists
        const favourite = await Like.find({ userId });

        if (!favourite) {
            return res.status(200).json({
                status: 200,
                message: 'You have not marked as Favourite',
                data: favourite
            });
        }

        let noteArr = favourite.map((note) => {
            return note.noteId.toString();
        });
        
       

        // let notesData = await Notes.findById(noteArr)
        let notesData = await Notes.find({ _id: { $in: noteArr } });

        res.status(200).json({
            status: 200,
            message: 'Favourite marked posts',
            data: notesData
        });


    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            status: 500,
            message: 'Server Error'
        });
    }
});

// Dislike a note: DELETE "/api/notes/:noteId/dislike"
router.delete('/:noteId/dislike', fetchuser, async (req, res) => {
    try {
        // Check if the note exists
        const note = await Notes.findById(req.params.noteId);
        if (!note) {
            return res.status(404).json({ msg: 'Note not found' });
        }

        // Check if the user has already liked the note
        const existingLike = await Like.findOne({ userId: req.user.id, noteId: req.params.noteId });
        if (!existingLike) {
            return res.status(400).json({ msg: 'You have not liked this note' });
        }

        // Remove the like
        await existingLike.remove();

        // Remove the like from the note's likes array
        note.likes = note.likes.filter(likeId => likeId.toString() !== existingLike._id.toString());
        await note.save();

        res.status(200).json({
            status: 200,
            message: 'Note disliked successfully',
            data: {}
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            status: 500,
            message: 'Server Error'
        });
    }
});

module.exports = router;
