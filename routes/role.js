const Roles = require("../models/Roles")
const express = require("express");
const router = express.Router();
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { body, validationResult } = require('express-validator');
const { STATUS_CODES } = require("http");


// Create notesusing: post "/api/notes/addtags". Login toBeRequired. 
router.post('/role', [
    body('title', "Enter Valid Title").isLength({ min: 3 }),
    body('description', "Description counld not be less than 5 charecter").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);

    // Check wheather the user with the email exist already
    if (!errors.isEmpty()) {
        return res.status(400).send({ status:400,
                message: "Validation failed.",
                error: errors.array()  });
    }
    try {
        const { title, description } = req.body;
        const role = new Roles({
            title, description,created_at: new Date()
        });

        const saveRole = await role.save();

        res.status(200).send({
            status: 200,
            msg: "Role added successfully",
            data: saveRole
        })

    } catch (error) {
        console.log(error.message);
        logActivity("Create role", "Error creating role: " + err.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }

});


// Update role using: put "/api/roles/updaterole/:id". Login toBeRequired.
router.put('/role/:id', [fetchuser, checkAdminRole], [
    body('title', "Enter Valid Title").isLength({ min: 3 }),
    body('description', "Description must be at least 5 characters long").isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);

    // Check whether there are any validation errors
    if (!errors.isEmpty()) {
        return res.status(400).send({ status:400,
                message: "Validation failed.",
                error: errors.array()  });
    }

    try {
        const roleId = req.params.id;
        const { title, description } = req.body;

        // Find the role by ID
        let role = await Roles.findById(roleId);

        // Check if the role exists
        if (!role) {
            return res.status(404).send({ msg: 'Role not found' });
        }

        // Update role fields
        role.title = title;
        role.description = description;
        role.updated_at = new Date();

        // Save the updated role
        role = await role.save();

        res.status(200).send({
            status: 200,
            msg: "Role updated successfully",
            data: role
        })

        res.json({ role });

    } catch (error) {
        console.log(error.message);
        logActivity("Update role", "Error updating role: " + err.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
});


// Delete role using: delete "/api/roles/delete/:id". Login toBeRequired.
router.delete('/role/:id', [fetchuser, checkAdminRole], async (req, res) => {
    try {
        const roleId = req.params.id;

        // Find the role by ID
        let role = await Roles.findById(roleId);

        // Check if the role exists
        if (!role) {
            return res.status(404).send({ msg: 'Role not found' });
        }

        // Delete the role
        await role.remove();

        res.status(200).send({
            status: 200,
            msg: "Role Deleted successfully",
        });

    } catch (error) {
        cconsole.log(error.message);
        logActivity("Delete role", "Error deleting role: " + err.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
});

// Get role using: Get "/api/roles/getallroles". Login toBeRequired.
router.get('/role', [fetchuser, checkAdminRole], async (req, res) => {
    try {

        // Find the role by ID
        let role = await Roles.find();
        res.status(200).send({
            status: 200,
            msg: "Role fetched successfully",
            data:role
        });

    } catch (error) {
        console.log(error.message);
        logActivity("Fetching role", "Error fetching role: " + err.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
});

module.exports = router;

