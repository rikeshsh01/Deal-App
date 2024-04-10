const express = require("express");
const router = express.Router();
const {fetchuser} = require("../middleware/middleware");
const Notes = require("../models/Notes");
const { body, validationResult } = require('express-validator');


// Get all notes using: get "/api/notes/fetchallnotes". Login toBeRequired. 
router.get('/getallnotes',fetchuser, async (req, res) => {
  try {
    // let note = await Notes.find({ user: req.user.id });
    let note = await Notes.find();
    res.status(200).send({
      status: 'success',
      message: 'Notes fetched successfully',
      data: note
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }

});


// Get auth users notes using: get "/api/notes/getnotes". Login toBeRequired. 
router.get('/getnotes',fetchuser, async (req, res) => {
  try {
    let note = await Notes.find({ user: req.user.id });
    // let note = await Notes.find();
    res.status(200).send({
      status: 'success',
      message: 'Posts of this user fetched successfully',
      data: note
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }

});



// Create notesusing: post "/api/notes/addnotes". Login toBeRequired. 
router.post('/addnotes', fetchuser, [
  body('title', "Enter Valid Title").isLength({ min: 3 }),
  body('description', "Description should not be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);

  // Check whether there are any validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, tag, image } = req.body;
    let note;
    note = new Notes({
      title,
      description,
      tag,
      image,
      user: req.user.id
    });

    /*
    if (image) {
      // If image is provided, convert it to Buffer and store in the database
      const imageBuffer = Buffer.from(image, 'base64'); // Assuming the image is sent as base64 encoded string
      note = new Notes({
        title,
        description,
        tag,
        image: {
          data: imageBuffer,
          contentType: 'image/png' // You may need to adjust the content type based on the image type
        },
        user: req.user.id
      });
    } else {
      // If no image is provided, create the note without the image field
      note = new Notes({
        title,
        description,
        tag,
        user: req.user.id
      });
    }
    */
    const saveNote = await note.save();

    res.json({ saveNote });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }
});

/*

// Update notes using: post "/api/notes/updatenotes". Login to Be Required. 
router.put('/updatenotes/:id',fetchuser, async (req, res) => {
  try {
    const {title,description,tag} = req.body;
    console.log(title);
    
    // create newNote Object 
    const newNote = {};
    if(title){newNote.title=title}
    if(description){newNote.description=description}
    if(tag){newNote.tag=tag}

    // find the note to be updated and update it 
    let note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString()!==req.user.id) {
      return res.status(401).send("Not allowed");
    }

    note = await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true});
    res.json({note});
    
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Enternal Server Error");
  }


});


// Delete notes using: Delete "/api/notes/deletenote". Login to Be Required. 
router.delete('/deletenote/:id',fetchuser, async (req, res) => {

  try {
    // find the note to be delete and delete it 
    let note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).send("Not Found");
    }
    // allowed deletion if user owns notes 
    if (note.user.toString()!==req.user.id) {
      return res.status(401).send("Not allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({"Success":"Notes Deleted", note:note});
    
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Enternal Server Error");
  }


});
*/

// Update notes using: put "/api/notes/updatenote/:id". Login to be required.
router.put('/updatenote/:id', fetchuser, [
  body('title', "Enter Valid Title").isLength({ min: 3 }),
  body('description', "Description should not be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);

  // Check whether there are any validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, tag, image } = req.body;
    const noteId = req.params.id;

    let note = await Notes.findById(noteId);

    // Check if the note exists
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Check if the user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update the note fields
    note.title = title;
    note.description = description;
    note.tag = tag;

    if (image) {
      // If image is provided, convert it to Buffer and store in the database
      const imageBuffer = Buffer.from(image, 'base64'); // Assuming the image is sent as base64 encoded string
      note.image = {
        data: imageBuffer,
        contentType: 'image/png' // You may need to adjust the content type based on the image type
      };
    }

    const updatedNote = await note.save();

    res.json({ updatedNote });
  } catch (error) {
    cconsole.log(error.message);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }
});


// Delete notes using: delete "/api/notes/deletenote/:id". Login to be required.
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  try {
    const noteId = req.params.id;

    let note = await Notes.findById(noteId);

    // Check if the note exists
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Check if the user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Delete the note
    await note.remove();

    res.json({ msg: 'Note deleted successfully' });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }
});



module.exports = router;

