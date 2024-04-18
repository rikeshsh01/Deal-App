const express = require("express");
const router = express.Router();
const Notes = require("../models/Notes");
const AdditionalDetails = require("../models/AdditionalDetails")
const Comments = require("../models/Comments")
const Users = require("../models/Users")
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { body, validationResult } = require('express-validator');
const { STATUS_CODES } = require("http");
const logActivity = require("./loginfo");
const multer = require('multer');
const path = require("path")
const fs = require("fs")





// for multiple image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/post'); // Specify the destination folder for uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Rename the file to prevent collisions
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
  fileFilter: fileFilter
});



// Get all notes using: get "/api/notes/fetchallnotes". Login toBeRequired. 
router.get('/post', async (req, res) => {
  try {
    // Fetch all notes
    let notes = await Notes.find();

    // Fetch all comments
    let comments = await Comments.find();
    let users = await Users.find();

    // Map each note to include its comments
    let notesWithComments = notes.map(note => {

      // Find comments for this note
      let noteComments = comments.filter(comment => comment.noteId.toString() === note._id.toString());
      let userDetails = users.filter(user => note.userId.toString() === user._id.toString())
      console.log(userDetails)

      // Add comments to the note object
      return {
        ...note.toObject(), // Convert Mongoose document to plain JavaScript object
        comments: noteComments,
        userDetails: userDetails
      };
    });

    res.status(200).send({
      status: STATUS_CODES[200],
      message: 'Notes fetched successfully',
      data: notesWithComments
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      status: STATUS_CODES[500],
      message: error.message
    });
  }

});


// Get auth users notes using: get "/api/notes/getnotes". Login toBeRequired. 
router.get('/post/:userId', fetchuser, async (req, res) => {
  try {
    let userId = req.params.userId;
    let note = await Notes.find({ userId: userId });
    // let note = await Notes.find();
    res.status(200).send({
      status: STATUS_CODES[200],
      message: 'Posts of this user fetched successfully',
      data: note
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      status: STATUS_CODES[500],
      message: error.message
    });
  }

});



// Get auth users notes using: get "/api/notes/getnotes". Login toBeRequired. 
router.get('/mypost', fetchuser, async (req, res) => {
  try {
    let note = await Notes.find({ user: req.user.id });
    // let note = await Notes.find();
    res.status(200).send({
      status: STATUS_CODES[200],
      message: 'Posts of this user fetched successfully',
      data: note
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      status: STATUS_CODES[500],
      message: error.message
    });
  }

});



// Create notesusing: post "/api/notes/addnotes". Login toBeRequired. 
router.post('/post', fetchuser, upload.array('image', 12), [
  body('title', "Enter Valid Title").isLength({ min: 3 }),
  body('description', "Description should not be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);

  // Check whether there are any validation errors
  if (!errors.isEmpty()) {
    logActivity("add post", "Failed validation for adding post", "error", req.user ? req.user.id : null);
    return res.status(400).json({ errors: errors.array() });
  }

  // Access uploaded files
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded!' });
  }

  // Save image metadata to the database
  const images = req.files.map(file => ({
    originalname: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    url: `http://localhost:8080/${file.path}`
  }));

  console.log(images)



  try {
    const { title, description, tag, latitude, longitude, location, additionalDetails } = req.body;
    let note;
    note = new Notes({
      userId: req.user.id,
      title,
      description,
      tag,
      image: images,
      latitude,
      longitude,
      location,
      created_at: new Date(),
    });

    const saveNote = await note.save();
    let savedAdditionalDetails = [];

    // If additionalDetails is provided, add them to the database
    if (additionalDetails && additionalDetails.length > 0) {

      const detailsPromises = additionalDetails.map(async (detail) => {
        const { key, value } = detail;
        const additionalDetail = new AdditionalDetails({
          noteId: saveNote._id,
          key,
          value,
          created_at: new Date(),
        });
        const savedDetail = await additionalDetail.save();
        savedAdditionalDetails.push(savedDetail);
      });
      await Promise.all(detailsPromises);
    }

    logActivity("add post", "Post added successfully", "success", req.user ? req.user.id : null);
    res.status(200).send({
      status: STATUS_CODES[200],
      message: 'Posts added successfully',
      data: saveNote,
      additionalDetailsData: savedAdditionalDetails

    });
  } catch (error) {
    console.log(error.message);
    logActivity("add post", "Error adding post: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: STATUS_CODES[500],
      message: error.message
    });
  }
});

/*
// Update notes using: put "/api/notes/updatenote/:id". Login to be required.
router.put('/post/:id', fetchuser, [
  body('title', "Enter Valid Title").isLength({ min: 3 }),
  body('description', "Description should not be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);

  // Check whether there are any validation errors
  if (!errors.isEmpty()) {
    logActivity("update post", "Failed validation for updating post", "error", req.user ? req.user.id : null);
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, tag, latitude, longitude, location } = req.body;
    const noteId = req.params.id;

    let note = await Notes.findById(noteId);

    console.log(note)

    // Check if the note exists
    if (!note) {
      logActivity("update post", "Post not found", "error", req.user ? req.user.id : null);
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Check if the user owns the note
    if (note.user.toString() !== req.user.id) {
      logActivity("update post", "not authorized", "error", req.user ? req.user.id : null);
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update the note fields
    note.title = title;
    note.description = description;
    note.tag = tag;
    note.latitude = latitude;
    note.longitude = longitude;
    note.location = location;
    note.updated_at = new Date();

    const updatedNote = await note.save();

    if (!updatedNote) {
      logActivity("update post", "Note not found or user unauthorized", "error", req.user ? req.user.id : null);
      return res.status(404).json({ status: STATUS_CODES[404], message: 'Note not found or user unauthorized' });
    }

    logActivity("update post", "Post updated successfully", "success", req.user ? req.user.id : null);
    res.status(200).send({
      status: STATUS_CODES[200],
      message: 'Posts updated successfully',
      data: updatedNote
    });

  } catch (error) {
    console.log(error.message);
    logActivity("update post", "Error update post: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: STATUS_CODES[500],
      message: error.message
    });
  }
});
*/

// Update notes using: put "/api/notes/updatenotes/:id". Login to be required.
router.put('/post/:id', fetchuser, upload.array('image', 12), [
  body('title', "Enter Valid Title").isLength({ min: 3 }),
  body('description', "Description should not be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);

  // Check whether there are any validation errors
  if (!errors.isEmpty()) {
    logActivity("update post", "Failed validation for updating post", "error", req.user ? req.user.id : null);
    return res.status(400).json({ errors: errors.array() });
  }

  // Access uploaded files
  const files = req.files;

  // Save image metadata to the database
  const images = files ? files.map(file => ({
    originalname: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    url: `http://localhost:8080/${file.path}`
  })) : [];

  try {
    const { title, description, tag, latitude, longitude, location, additionalDetails } = req.body;
    const noteId = req.params.id;

    // Find the note by ID
    let note = await Notes.findById(noteId);

    if (!note) {
      logActivity("update post", "Post not found", "error", req.user ? req.user.id : null);
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Update the note fields
    note.title = title;
    note.description = description;
    note.tag = tag;
    note.latitude = latitude;
    note.longitude = longitude;
    note.location = location;

    console.log(note.image)

    // Update images if new images are provided
    if (files && files.length > 0) {
      const images = files.map(file => ({
        originalname: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        url: `http://localhost:8080/${file.path}`
      }));

      note.image = [...note.image, ...images]; // Append new images to existing images
    }

    // Save the updated note
    await note.save();


    logActivity("update post", "Post updated successfully", "success", req.user ? req.user.id : null);
    res.status(200).send({
      status: STATUS_CODES[200],
      message: 'Post updated successfully',
      data: note,
    });
  } catch (error) {
    console.log(error.message);
    logActivity("update post", "Error updating post: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: STATUS_CODES[500],
      message: error.message
    });
  }
});


// Delete notes using: delete "/api/notes/deletenote/:id". Login to be required.
router.delete('/post/:id', fetchuser, async (req, res) => {
  try {
    const noteId = req.params.id;

    let note = await Notes.findById(noteId);

    // Check if the note exists
    if (!note) {
      logActivity("delete post", "Post not found", "error", req.user ? req.user.id : null);
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Check if the user owns the note
    if (note.user.toString() !== req.user.id) {
      logActivity("delete post", "not authorized", "error", req.user ? req.user.id : null);
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Delete the post and its additionalDetails
    await Promise.all([
      Notes.findByIdAndRemove(noteId),
      deleteAdditionalDetails(noteId),
      logActivity("delete post", "Post deleted successfully", "success", req.user ? req.user.id : null)

    ]);


    res.status(200).send({
      status: STATUS_CODES[200],
      message: 'Posts deleted successfully',
    });
  } catch (error) {
    console.log(error.message);
    logActivity("delete post", "Error deleting post: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: STATUS_CODES[500],
      message: error.message
    });
  }
});

// Middleware to delete additionalDetails associated with that note
const deleteAdditionalDetails = async (noteId) => {
  try {
    // You can also delete subtags from a separate collection if they are stored that way
    await AdditionalDetails.deleteMany({ noteId: noteId });

  } catch (error) {
    console.error("Error deleting Additional Details:", error);
    throw error;
  }
};


// Delete post image using:. Login toBeRequired.
router.delete('/postimage/:imageId/:noteId', fetchuser, async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const noteId = req.params.noteId

    // Find the note by ID
    let note = await Notes.findById(noteId);

    // Check if the note exists
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
     // Find the index of the image with the given ID
     const imageIndex = note.image.findIndex(image => image.id === imageId);

     // Check if the image exists
     if (imageIndex === -1) {
       return res.status(404).json({ msg: 'Image not found' });
     }

     // Get the filename or filepath of the image
    const filename = note.image[imageIndex].filename; 

    const parentDir = path.dirname(__dirname);
    const imageDir = path.join(parentDir,'./images/post')
 
    //  // Remove the image from the array
     note.image.splice(imageIndex, 1);
 
    //  // Save the updated note
     await note.save();

    //  // Delete the image file from the server
    fs.unlink((path.join(imageDir, filename)), (err) => {
      if (err) {
        console.error('Error deleting image file:', err);
        // Handle error if needed
      }
    });

    res.status(200).send({
      status: STATUS_CODES[200],
      msg: "Image Deleted successfully",
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      status: STATUS_CODES[500],
      message: error.message
    });
  }
});


module.exports = router;

