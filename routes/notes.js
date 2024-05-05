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
const os = require("os");
const Tag = require("../models/Tags");
const SubTag = require("../models/Sub-Tag");


// for multiple image upload

// Specify the destination folder
const uploadDir = path.join(__dirname, '../images/post');

// Create directory fo image 
fs.promises.access(uploadDir, fs.constants.F_OK)
  .then(() => {
    console.log('images/post directory already exists');
    // Additional logic can be added here if needed, for when the directory already exists
  })
  .catch(() => {
    // Directory does not exist, create it
    fs.promises.mkdir(uploadDir, { recursive: true })
      .then(() => {
        console.log('images/post directory created successfully');
        // Additional logic for handling successful directory creation
      })
      .catch((err) => {
        console.error('Error creating images/post directory:', err);
        logActivity("Create post image directory", "Error creating post directory: " + err.message, "error", req.user ? req.user.id : null);
      });
  });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    // Check if uploads folder exists, if not, create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    cb(null, Date.now() + '-' + file.originalname.length + ext); // Rename the file to prevent collisions
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
    let additionalDetals = await AdditionalDetails.find();
    let tagDetail = await Tag.find();
    let subtagDetail = await SubTag.find();


    // Map each note to include its comments and user details
    let notesWithCommentsAndUserDetails = notes.map(note => {
      // Find comments for this note
      let noteComments = comments.filter(comment => comment.noteId.toString() === note._id.toString());

      // Map each comment to include user details
      let commentsWithUserDetails = noteComments.map(comment => {
        // Find user details for this comment's userId
        let commentUserDetails = users.find(user => user._id.toString() === comment.userId.toString());

        // Return comment object with user details
        return {
          ...comment.toObject(), // Convert Mongoose document to plain JavaScript object
          userDetails: commentUserDetails
        };
      });

      // Find user details for this note's userId
      let noteUserDetails = users.find(user => user._id.toString() === note.userId.toString());
      let additionalDetail = additionalDetals.filter(aDetails => aDetails.noteId.toString() === note._id.toString());
      let tagDetails = tagDetail.filter(tag => tag._id.toString() === note.tagId.toString());
      let subtagDetails = subtagDetail.filter(subtag => subtag._id.toString() === note.subtagId.toString());

      // Add comments with user details and post user details to the note object
      return {
        ...note.toObject(), // Convert Mongoose document to plain JavaScript object
        userDetails: noteUserDetails,
        comments: commentsWithUserDetails,
        additionalDetail: additionalDetail,
        tagDetails: tagDetails,
        subtagDetails: subtagDetails
      };
    });

    res.status(200).send({
      status: 200,
      message: 'Notes fetched successfully',
      data: notesWithCommentsAndUserDetails
    });
  } catch (error) {
    console.log(error.message);
    logActivity("Fetch all post", "Error fetching all post: " + error.message, "error", req.user ? req.user.id : null);
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
      status: 200,
      message: 'Posts of this user fetched successfully',
      data: note
    });
  } catch (error) {
    logActivity("Fetch user post", "Error fetching post of a user: " + err.message, "error", req.user ? req.user.id : null);
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
      status: 200,
      message: 'Posts of this user fetched successfully',
      data: note
    });
  } catch (error) {
    console.log(error.message);
    logActivity("Fetch auth user post", "Error fetching auth user post: " + err.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: STATUS_CODES[500],
      message: error.message
    });
  }

});



// Create notesusing: post "/api/notes/addnotes". Login toBeRequired. 
router.post('/post', fetchuser, upload.array('image', 12), [
    body('title', "Enter Valid Title").isLength({ min: 3 }),
    body('description', "Description should not be less than 5 characters").isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);

    // Check whether there are any validation errors
    if (!errors.isEmpty()) {
        logActivity("add post", "Failed validation for adding post", "error", req.user ? req.user.id : null);
        return res.status(400).send({
            status: 400,
            message: "Validation failed.",
            error: errors.array()
        });
    }

    // Access uploaded files
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).send({ error: 'No files uploaded!' });
    }

    console.log(req.hostname);

    // Save image metadata to the database
    const images = req.files.map(file => ({
        originalname: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        url: `http://${req.hostname}:${process.env.PORT}/images/post/${file.filename}`
    }));

    try {
        const { title, description, tagId, subtagId, latitude, longitude, location, additionalDetails } = req.body;

        // Create GeoJSON Point for geoLocation field
        const geoLocation = {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };

        let note;
        note = new Notes({
            userId: req.user.id,
            title,
            description,
            tagId,
            subtagId,
            image: images,
            latitude,
            longitude,
            location,
            geoLocation, // Assign the GeoJSON Point object
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
            status: 200,
            message: 'Posts added successfully',
            data: saveNote,
            additionalDetailsData: savedAdditionalDetails

        });
    } catch (error) {
        console.log(error.message);
        logActivity("Create post", "Error creating post: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
});



// Update notes using: put "/api/notes/updatenotes/:id". Login to be required.
router.put('/post/:id', fetchuser, upload.array('image', 12), [
  body('title', "Enter Valid Title").isLength({ min: 3 }),
  body('description', "Description should not be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);

  // Check whether there are any validation errors
  if (!errors.isEmpty()) {
    logActivity("update post", "Failed validation for updating post", "error", req.user ? req.user.id : null);
    return res.status(400).send({
      status: 400,
      message: "Validation failed.",
      error: errors.array()
    });
  }

  try {
    const { title, description, tagId, subtagId, latitude, longitude, location } = req.body;
    const noteId = req.params.id;

    // Find the note by ID
    let note = await Notes.findById(noteId);

    if (!note) {
      logActivity("update post", "Post not found", "error", req.user ? req.user.id : null);
      return res.status(404).send({ msg: 'Note not found' });
    }

    // Update the note fields
    note.title = title;
    note.description = description;
    note.tagId = tagId;
    note.subtagId = subtagId;
    note.latitude = latitude;
    note.longitude = longitude;
    note.location = location;

    // console.log(note.image)
    // Access uploaded files
    const files = req.files;

    // Update images if new images are provided
    if (files && files.length > 0) {
      const images = files.map(file => ({
        originalname: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        url: `http://localhost:8080/images/post/${file.filename}`
      }));

      note.image = [...note.image, ...images]; // Append new images to existing images
    }

    // Save the updated note
    await note.save();


    logActivity("update post", "Post updated successfully", "success", req.user ? req.user.id : null);
    res.status(200).send({
      status: 200,
      message: 'Post updated successfully',
      data: note,
    });
  } catch (error) {
    console.log(error.message);
    logActivity("Update post", "Error updating post: " + error.message, "error", req.user ? req.user.id : null);
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
      return res.status(404).send({ msg: 'Note not found' });
    }

    // Check if the user owns the note
    if (note.user.toString() !== req.user.id) {
      logActivity("delete post", "not authorized", "error", req.user ? req.user.id : null);
      return res.status(401).send({ msg: 'Not authorized' });
    }

    // Delete the post and its additionalDetails
    await Promise.all([
      Notes.findByIdAndRemove(noteId),
      deleteAdditionalDetails(noteId),
      logActivity("delete post", "Post deleted successfully", "success", req.user ? req.user.id : null)

    ]);


    res.status(200).send({
      status: 200,
      message: 'Posts deleted successfully',
    });
  } catch (error) {
    console.log(error.message);
    logActivity("Delete post", "Error deleting post: " + error.message, "error", req.user ? req.user.id : null);
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
    logActivity("Delete additional details", "Error deleting additional details when delete the post: " + err.message, "error", req.user ? req.user.id : null);
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
      return res.status(404).send({ msg: 'Note not found' });
    }
    // Find the index of the image with the given ID
    const imageIndex = note.image.findIndex(image => image.id === imageId);

    // Check if the image exists
    if (imageIndex === -1) {
      return res.status(404).send({ msg: 'Image not found' });
    }

    // Get the filename or filepath of the image
    const filename = note.image[imageIndex].filename;

    const parentDir = path.dirname(__dirname);
    const imageDir = path.join(parentDir, './images/post')

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
      status: 200,
      msg: "Image Deleted successfully",
    });

  } catch (error) {
    console.log(error.message);
    logActivity("Delete post image", "Error deleting post image: " + err.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: STATUS_CODES[500],
      message: error.message
    });
  }
});


module.exports = router;

