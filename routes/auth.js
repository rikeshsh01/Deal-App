const express = require("express");
const Users = require("../models/Users");
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
        return res.status(400).json({errors: errors.array() });
    }
    try {
        let user = await Users.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({success, error: "the user with this email is already exist" });
        }
        // Create new user
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        user = await Users.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            role:req.body.role
        });
        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, privateKey);
        success = true;
        res.send({success,authToken});

        // .then(user => res.json(user))
        //     .catch(
        //         err => {console.log(err)
        //         res.json({ 
        //             error: "Please enter unique value",
        //             message:err.message 
        //         })
        //     })
        // const User=Users(req.body);
        // User.save();

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Some Error Occured")

    }
});


// Authenticate a USER using POST "/api/auth/login". No login required
router.post('/login', [
    body('email',"Enter valid Email").isEmail(),
    body('password', "Password unvalid").isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    // Check wheather the user with the email exist already
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
console.log(req.body);
    const {email,password} = req.body;
    try {
        let user = await Users.findOne({ email });

        if (!user) {
            success=false;
            return res.status(400).json({success, error: "User Doesnot exist" });
        }
        console.log(user.password, "database pass")
        console.log(password, "destructured pass")

        const passwordCOmpare = await bcrypt.compare(password,user.password);

        if (!passwordCOmpare) {
            success=false;
            return res.status(400).json({success, error: "Password doesnot matched" });
        }

        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, privateKey);
        success = true;
        res.send({success, authToken});

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