const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchUser");
const Roles = require("../models/Roles")
const { body, validationResult } = require('express-validator');


// Create notesusing: post "/api/notes/addtags". Login toBeRequired. 
router.post('/addrole',fetchuser , [
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
      const role= new Roles({
        title,description
      });
      console.log(role)
  
      const saveRole = await role.save();
  
      res.json({saveRole});
      
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Enternal Server Error");
    }
  
  });


// Update role using: put "/api/roles/updaterole/:id". Login toBeRequired.
router.put('/updaterole/:id', fetchuser, [
    body('title', "Enter Valid Title").isLength({ min: 3 }),
    body('description', "Description must be at least 5 characters long").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);

    // Check whether there are any validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const roleId = req.params.id;
        const { title, description } = req.body;

        // Find the role by ID
        let role = await Roles.findById(roleId);

        // Check if the role exists
        if (!role) {
            return res.status(404).json({ msg: 'Role not found' });
        }

        // Update role fields
        role.title = title;
        role.description = description;

        // Save the updated role
        role = await role.save();

        res.json({ role });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});


// Delete role using: delete "/api/roles/delete/:id". Login toBeRequired.
router.delete('/deleterole/:id', fetchuser, async (req, res) => {
    try {
        const roleId = req.params.id;

        // Find the role by ID
        let role = await Roles.findById(roleId);

        // Check if the role exists
        if (!role) {
            return res.status(404).json({ msg: 'Role not found' });
        }

        // Delete the role
        await role.remove();

        res.json({ msg: 'Role deleted successfully' });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Get role using: Get "/api/roles/getallroles". Login toBeRequired.
router.get('/getallroles', fetchuser, async (req, res) => {
    try {

        // Find the role by ID
        let role = await Roles.find();

        res.json({ role });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});






module.exports = router;

