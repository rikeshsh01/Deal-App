const Notes = require("../models/Notes");
const AdditionalDetails = require("../models/AdditionalDetails")
const { router, fetchuser, checkAdminRole, body, validationResult, STATUS_CODES } = require('./import');
const  logActivity  = require("./loginfo");


// Get all notes using: get "/api/notes/fetchallnotes". Login toBeRequired. 
router.get('/getallnotes', fetchuser, async (req, res) => {
  try {
    // let note = await Notes.find({ user: req.user.id });
    let note = await Notes.find();
    res.status(200).send({
      status: STATUS_CODES[200],
      message: 'Notes fetched successfully',
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
router.get('/getnotes', fetchuser, async (req, res) => {
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
router.post('/addnotes', fetchuser, [
  body('title', "Enter Valid Title").isLength({ min: 3 }),
  body('description', "Description should not be less than 5 characters").isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);

  // Check whether there are any validation errors
  if (!errors.isEmpty()) {
    logActivity("add post", "Failed validation for adding post", "error",req.user ? req.user.id : null);
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, tag, image, latitude, longitude, location, additionalDetails } = req.body;
    let note;
    note = new Notes({
      title,
      description,
      tag,
      image,
      latitude,
      longitude,
      location,
      user: req.user.id,
      created_at: new Date(),
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
    logActivity("add post", "Error adding post: " + error.message, "error",req.user ? req.user.id : null);
    res.status(500).send({
      status: STATUS_CODES[500],
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
    logActivity("update post", "Failed validation for updating post", "error",req.user ? req.user.id : null);
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, tag, image, latitude, longitude, location } = req.body;
    const noteId = req.params.id;

    let note = await Notes.findById(noteId);

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
    note.image = image;
    note.latitude = latitude;
    note.longitude = longitude;
    note.location = location;
    note.updated_at = new Date();


    // if (image) {
    //   // If image is provided, convert it to Buffer and store in the database
    //   const imageBuffer = Buffer.from(image, 'base64'); // Assuming the image is sent as base64 encoded string
    //   note.image = {
    //     data: imageBuffer,
    //     contentType: 'image/png' // You may need to adjust the content type based on the image type
    //   };
    // }

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
    logActivity("update post", "Error update post: " + error.message, "error",req.user ? req.user.id : null);
    res.status(500).send({
      status: STATUS_CODES[500],
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
      logActivity("delete post", "Post not found", "error", req.user ? req.user.id : null);
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Check if the user owns the note
    if (note.user.toString() !== req.user.id) {
      logActivity("delete post", "not authorized", "error", req.user ? req.user.id : null);
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Delete the note
    await note.remove();
    logActivity("delete post", "Post deleted successfully", "success", req.user ? req.user.id : null);

    res.status(200).send({
      status: STATUS_CODES[200],
      message: 'Posts deleted successfully',
    });
  } catch (error) {
    console.log(error.message);
    logActivity("delete post", "Error deleting post: " + error.message, "error",req.user ? req.user.id : null);
    res.status(500).send({
      status: STATUS_CODES[500],
      message: error.message
    });
  }
});



module.exports = router;

