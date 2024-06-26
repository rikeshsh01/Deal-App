const Tags = require("../models/Tags")
const SubTags = require("../models/Sub-Tag");
const express = require("express");
const router = express.Router();
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { body, validationResult } = require('express-validator');
const { STATUS_CODES } = require("http");



// Create notesusing: post "/api/notes/addtags". Login toBeRequired. 
router.post('/tag', [fetchuser, checkAdminRole], [
  body('title', "Enter Valid Title").isLength({ min: 3 }),
  body('description', "Description counld not be less than 5 charecter").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);

  // Check wheather the user with the email exist already
  if (!errors.isEmpty()) {
    return res.status(400).send({
      status: 400,
      message: "Validation failed.",
      error: errors.array()
    });
  }

  try {
    const { title, description } = req.body;
    const tag = new Tags({
      title, description, created_at: new Date()
    })

    const saveTag = await tag.save();

    res.status(200).send({
      status: 200,
      message: "Tag added successfully",
      data: saveTag

    })

  } catch (error) {
    cconsole.error(error.message);
    logActivity("Create tag", "Error creating tag: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }

});


// Get all tags using: get "/api/notes/fetchallnotes". Login toBeRequired. 
router.get('/tag', [fetchuser], async (req, res) => {
  try {
    // Fetch all sub-tags and populate the "tagId" field with the "_id" field of the Tags collection
    let subTags = await SubTags.find().populate("_id");

    // Group sub-tags by tagId
    let subTagsByTagId = {};
    subTags.forEach(subTag => {
      const tagId = subTag.tagId._id.toString(); // Convert ObjectId to string for consistency
      if (!subTagsByTagId[tagId]) {
        subTagsByTagId[tagId] = [];
      }
      subTagsByTagId[tagId].push(subTag);
    });

    // Fetch all tags
    let tags = await Tags.find();

    if (!tags) {
      return res.status(404).send({
        status: 404,
        message: 'Tag not found',
        error: "Tag not found"
      });
    }

    // Create an array of tags with their respective sub-tags
    let tagsWithSubTags = tags.map(tag => {
      const tagIdString = tag._id.toString(); // Convert ObjectId to string for consistency
      return {
        tag: tag,
        subTags: subTagsByTagId[tagIdString] || [] // If no sub-tags found for a tag, default to an empty array
      };
    });

    res.status(200).send({
      status: 200,
      message: "Fetched successfully",
      data: tags
    });

    // res.send(tagsWithSubTags);
  } catch (error) {
    console.log(error.message);
    logActivity("Fetch all tag", "Error fetching all tag and subtag: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }
});


// Update tag using: put "/api/notes/updatetags/:id". Login to be required.
router.put('/tag/:id', [fetchuser, checkAdminRole], [
  body('title', "Enter Valid Title").isLength({ min: 3 }),
  body('description', "Description should not be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);

  // Check whether there are any validation errors
  if (!errors.isEmpty()) {
    return res.status(400).send({
      status: 400,
      message: "Validation failed.",
      error: errors.array()
    });
  }

  try {
    const { title, description } = req.body;
    const tagFields = {};

    if (title) tagFields.title = title;
    if (description) tagFields.description = description;
    tagFields.updated_at = new Date();


    let tag = await Tags.findById(req.params.id);



    // Check if the tag exists
    if (!tag) {
      return res.status(404).send({
        status: 404,
        message: 'Tag not found',
        error: "Tag not found"
      });
    }

    // Check if the user owns the tag
    // if (tag.user.toString() !== req.user.id) {
    //   return res.status(401).send({ msg: 'Not authorized' });
    // }

    tag = await Tags.findByIdAndUpdate(req.params.id, { $set: tagFields }, { new: true });

    res.status(200).send({
      status: 200,
      message: "Tag updated successfully",
      data: tag
    });

  } catch (error) {
    console.error(error.message);
    logActivity("Update tag", "Error updating tag: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }
});


// Delete a tag using: delete "/api/notes/deletetags/:id". Login to be required.
router.delete('/tag/:id', [fetchuser, checkAdminRole], async (req, res) => {
  try {
    const tagId = req.params.id;
    const tag = await Tags.findById(tagId);

    // Check if the tag exists
    if (!tag) {
      return res.status(404).send({
        status: 404,
        message: 'Tag not found',
        error: "Tag not found"
      });
    }

    // Check if the user owns the tag
    // if (tag.user.toString() !== req.user.id) {
    //   return res.status(401).send({ msg: 'Not authorized' });
    // }

    // Delete the tag and its subtags
    await Promise.all([
      Tags.findByIdAndRemove(tagId),
      deleteSubtags(tagId)
    ]);

    res.status(200).send({
      status: 200,
      message: "Tag removed"
    });

  } catch (error) {
    console.error(error.message);
    logActivity("Delete tag", "Error deleting tag: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Middleware to delete subtags associated with the tag being removed
const deleteSubtags = async (tagId) => {
  try {
    // You can also delete subtags from a separate collection if they are stored that way
    await SubTags.deleteMany({ tagId: tagId });
  } catch (error) {
    logActivity("Delete subtag", "Error deleting subtag when delete the tag: " + error.message, "error", req.user ? req.user.id : null);
    console.error("Error deleting subtags:", error);
    throw error;
  }
};



module.exports = router;

