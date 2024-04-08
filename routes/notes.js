const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchUser");
const Notes = require("../models/Notes");
const { body, validationResult } = require('express-validator');


// Get all notes using: get "/api/notes/fetchallnotes". Login toBeRequired. 
router.get('/fetchallnotes',fetchuser, async (req, res) => {
  try {
    let note = await Notes.find({ user: req.user.id });
    res.send(note);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Enternal Server Error");
  }

});


// Create notesusing: post "/api/notes/addnotes". Login toBeRequired. 
router.post('/addnotes',fetchuser , [
  body('title',"Enter Valid Title").isLength({ min: 3 }),
  body('description', "Description counld not be less than 5 charecter").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);

  // Check wheather the user with the email exist already
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  try {
    const {title,description,tag,image} = req.body;
    const note= new Notes({
      title,description,tag,image,user:req.user.id
    })

    const saveNote = await note.save();

    res.json({saveNote});
    
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Enternal Server Error");
  }

});


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


module.exports = router;

