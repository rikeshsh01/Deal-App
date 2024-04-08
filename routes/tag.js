const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchUser");
const Tags = require("../models/Tags")
// const Notes = require("../models/Notes");
const { body, validationResult } = require('express-validator');


// Create notesusing: post "/api/notes/addtags". Login toBeRequired. 
router.post('/addtags',fetchuser , [
    body('title',"Enter Valid Title").isLength({ min: 3 }),
    body('description', "Description counld not be less than 5 charecter").isLength({ min: 5 })
  ], async (req, res) => {
    const errors = validationResult(req);
  
    // Check wheather the user with the email exist already
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
      const {title,description} = req.body;
      const tag= new Tags({
        title,description
      })
  
      const saveTag = await tag.save();
  
      res.json({saveTag});
      
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Enternal Server Error");
    }
  
  });


  // Get all tags using: get "/api/notes/fetchallnotes". Login toBeRequired. 
router.get('/fetchalltags',fetchuser, async (req, res) => {
    try {
      let tags = await Tags.find();
      res.send(tags);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Enternal Server Error");
    }
  
  });


module.exports = router;

