const express = require("express");
const router = express.Router();
const { fetchuser } = require("../middleware/middleware");
const Notes = require("../models/Notes");
const Like = require("../models/Like");

// Like a note: POST "/api/notes/:noteId/like"
router.post('/:noteId/like', fetchuser, async (req, res) => {
    try {
        let noteId = req.params.noteId; // Use params to get noteId from URL
        // Check if the note exists
        const note = await Notes.findById(noteId);

        if (!note) {
            return res.status(404).json({ msg: 'Note not found' });
        }

        // Check if the user has already liked the note
        const existingLike = await Like.findOne({ userId: req.user.id, noteId: noteId });

        if (existingLike) {
            await existingLike.remove();
            // If like exists, decrement likeCount
            note.likeCount -= 1;
            // Remove userId from likedUser array
            note.likedUser.pull(req.user.id);
            await note.save();

            return res.status(200).json({
                status: 200,
                message: 'Note unliked successfully',
                data: existingLike
            });
        } else {
            // Create a new like
            const like = new Like({
                userId: req.user.id,
                noteId: noteId,
                created_at: new Date()
            });

            // Save the like
            const savedLike = await like.save();

            // Increment likeCount
            note.likeCount += 1;
            // Add userId to likedUser array
            note.likedUser.push(req.user.id);
            await note.save();

            res.status(200).json({
                status: 200,
                message: 'Note liked successfully',
                data: savedLike
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
