const SubTags = require("../models/Sub-Tag")
const express = require("express");
const router = express.Router();
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { body, validationResult } = require('express-validator');
const { STATUS_CODES } = require("http");
const logActivity = require("./loginfo");


// Create notesusing: post "/api/notes/addtags". Login toBeRequired. 
router.post('/subtag', [fetchuser, checkAdminRole], [
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
    const { title, description, tagId } = req.body;
    const subtag = new SubTags({
      title, description, tagId, created_at: new Date()
    });

    const saveSubTag = await subtag.save();

    res.status(200).send({
      status: 200,
      msg: "Subtag added successfully",
      data: saveSubTag
    })

  } catch (error) {
    console.error(error.message);
    logActivity("Create subtag", "Error creating subtag: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }

});


// Update subtag: PUT "/api/notes/updatesubtag/:id". Login toBeRequired.
router.put('/subtag/:id', [fetchuser, checkAdminRole], [
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
    const { title, description, tagId } = req.body;
    const subtagFields = {};
    if (title) subtagFields.title = title;
    if (description) subtagFields.description = description;
    if (tagId) subtagFields.tagId = tagId;
    subtagFields.updated_at = new Date();

    let subtag = await SubTags.findById(req.params.id);

    // Check if the subtag exists
    if (!subtag) {
      return res.status(404).send({
        status: 404,
        message: 'Subtag not found',
        error: "Subtag not found"
      });
    }

    // Check if the user is authorized to update the subtag
    // if (subtag.user.toString() !== req.user.id) {
    //     return res.status(401).send({ msg: 'User not authorized' });
    // }

    // Update the subtag
    subtag = await SubTags.findByIdAndUpdate(
      req.params.id,
      { $set: subtagFields },
      { new: true }
    );

    res.status(200).send({
      status: 200,
      msg: "Subtag updated successfully",
      data: subtag
    })

  } catch (error) {
    console.error(error.message);
    logActivity("Update subtag", "Error updating subtag: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }
});


// Delete subtag: DELETE "/api/notes/deletesubtag/:id". Login toBeRequired.
router.delete('/subtag/:id', [fetchuser, checkAdminRole], async (req, res) => {
  try {
    let subtag = await SubTags.findById(req.params.id);

    // Check if the subtag exists
    if (!subtag) {
      return res.status(404).send({
        status: 404,
        message: 'Subtag not found',
        error: "Subtag not found"
      });
    }

    // Check if the user is authorized to delete the subtag
    // if (subtag.user.toString() !== req.user.id) {
    //     return res.status(401).send({ msg: 'User not authorized' });
    // }

    // Delete the subtag
    await SubTags.findByIdAndRemove(req.params.id);

    res.status(200).send({
      status: 200,
      msg: "Subtag deleted successfully"
    })

  } catch (error) {
    console.error(error.message);
    logActivity("Delete subtag", "Error deleting subtag: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }
});


// Delete subtag: DELETE "/api/notes/deletesubtag/:id". Login toBeRequired.
router.get('/subtag/:tagId', fetchuser, async (req, res) => {
  try {
    let subtags = await SubTags.find({ tagId: req.params.tagId });
    // console.log(subtags)

    // Check if the subtag exists
    if (!subtags) {
      return res.status(404).send({
        status: 404,
        message: 'Subtag not found',
        error: "Subtag not found"
      });
    }

    // Check if the user is authorized to delete the subtag
    // if (subtag.user.toString() !== req.user.id) {
    //     return res.status(401).send({ msg: 'User not authorized' });
    // }

    res.status(200).send({
      status: 200,
      msg: "Subtag fetched successfully",
      data: subtags
    })

  } catch (error) {
    console.error(error.message);
    logActivity("Fetching subtag", "Error detching subtag belongs to a tag: " + error.message, "error", req.user ? req.user.id : null);
    res.status(500).send({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }
});


module.exports = router;

