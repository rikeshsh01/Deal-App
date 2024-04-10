const express = require("express");
const router = express.Router();
const {fetchuser,checkAdminRole} = require("../middleware/middleware");
const SubTags = require("../models/Sub-Tag")
// const Notes = require("../models/Notes");
const { body, validationResult } = require('express-validator');


// Create notesusing: post "/api/notes/addtags". Login toBeRequired. 
router.post('/addsubtags',[fetchuser, checkAdminRole] , [
    body('title',"Enter Valid Title").isLength({ min: 3 }),
    body('description', "Description counld not be less than 5 charecter").isLength({ min: 5 })
  ], async (req, res) => {
    const errors = validationResult(req);
  
    // Check wheather the user with the email exist already
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {title,description,tagId} = req.body;
      const subtag= new SubTags({
        title,description,tagId
      });
      console.log(subtag)
  
      const saveSubTag = await subtag.save();
  
      res.json({saveSubTag});
      
    } catch (error) {
              console.log(error.message);
        res.status(500).send({
            status: 'error',
            message: error.message
        });
    }
  
  });


  // Update subtag: PUT "/api/notes/updatesubtag/:id". Login toBeRequired.
router.put('/updatesubtag/:id', [fetchuser, checkAdminRole], [
  body('title', "Enter Valid Title").isLength({ min: 3 }),
  body('description', "Description should not be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);

  // Check whether there are any validation errors
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }

  try {
      const { title, description, tagId } = req.body;
      const subtagFields = {};
      if (title) subtagFields.title = title;
      if (description) subtagFields.description = description;
      if (tagId) subtagFields.tagId = tagId;

      let subtag = await SubTags.findById(req.params.id);

      // Check if the subtag exists
      if (!subtag) {
          return res.status(404).json({ msg: 'Subtag not found' });
      }

      // Check if the user is authorized to update the subtag
      // if (subtag.user.toString() !== req.user.id) {
      //     return res.status(401).json({ msg: 'User not authorized' });
      // }

      // Update the subtag
      subtag = await SubTags.findByIdAndUpdate(
          req.params.id,
          { $set: subtagFields },
          { new: true }
      );

      res.json(subtag);

  } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
  }
});


// Delete subtag: DELETE "/api/notes/deletesubtag/:id". Login toBeRequired.
router.delete('/deletesubtag/:id', [fetchuser, checkAdminRole], async (req, res) => {
  try {
      let subtag = await SubTags.findById(req.params.id);

      // Check if the subtag exists
      if (!subtag) {
          return res.status(404).json({ msg: 'Subtag not found' });
      }

      // Check if the user is authorized to delete the subtag
      // if (subtag.user.toString() !== req.user.id) {
      //     return res.status(401).json({ msg: 'User not authorized' });
      // }

      // Delete the subtag
      await SubTags.findByIdAndRemove(req.params.id);

      res.json({ msg: 'Subtag deleted' });

  } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
  }
});


module.exports = router;

