const express = require("express");
const Users = require("../models/Users");
const Roles = require("../models/Roles");
const router = express.Router();
const { body, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchUser");

var privateKey = "MynameisRicky";


// Create a USER using POST "/api/auth/createuser". No login required

router.post('/createuser', [
    body('email').isEmail(),
    body('name').isLength({ min: 3 }),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    // console.log(req.body);
    const errors = validationResult(req);

    // Check wheather the user with the email exist already
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let user = await Users.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({ success, error: "the user with this email is already exist" });
        }
        // Create new user
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        const { name, email, roleId } = req.body;

        console.log(req.body.password, "Update password");

        const roles = await Roles.find();

        // Use find() to find the role with the matching roleId
        let role = roles.find((r) => {
            return r._id.toString() === roleId.toString();
        });

        user = await Users.create({
            name: name,
            email: email,
            password: secPass,
            role: role.title
        });
        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, privateKey);
        success = true;
        res.send({ success, authToken });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some Error Occured")

    }
});


// Authenticate a USER using POST "/api/auth/login". No login required
router.post('/login', [
    body('email', "Enter valid Email").isEmail(),
    body('password', "Password unvalid").isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    // Check wheather the user with the email exist already
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);
    const { email, password } = req.body;
    try {
        let user = await Users.findOne({ email });

        if (!user) {
            success = false;
            return res.status(400).json({ success, error: "User Doesnot exist" });
        }

        const passwordCOmpare = await bcrypt.compare(password, user.password);

        if (!passwordCOmpare) {
            success = false;
            return res.status(400).json({ success, error: "Password doesnot matched" });
        }

        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, privateKey);
        success = true;
        res.send({ success, authToken });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Enternal Server Error");

    }
});


// Get USER data using POST "/api/auth/getuser". login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        console.log(userId)
        const user = await Users.findById(userId).select("-password");
        res.send(user);

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Enternal Server Error");

    }
});
module.exports = router;