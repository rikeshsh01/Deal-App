const Users = require("../models/Users");
const Roles = require("../models/Roles");
const VerifyEmail = require("../models/VerifyEmail")
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const privateKey = process.env.PRIVATE_KEY;
const logActivity = require("./loginfo");
const nodemailer = require("nodemailer")
const multer = require('multer');
const path = require("path");
const fs = require("fs")

const express = require("express");
const router = express.Router();
const { fetchuser, checkAdminRole } = require("../middleware/middleware");
const { body, validationResult } = require('express-validator');
const { STATUS_CODES } = require("http");

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'aglae.corkery60@ethereal.email',
        pass: 'pR9NGsNEXVb7xVPwDU'
    }
});

// Function to send verification email
const sendVerificationEmail = async (email, verificationCode) => {
    const mailOptions = {
        from: "noreply.deal@gmail.com",
        to: email,
        subject: "Please verify your email address",
        text: `Your verification code is: ${verificationCode}`
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
        return info.response;
    } catch (error) {
        logActivity("Send verification email", "Error sending verification email: " + error.message, "error", req.user ? req.user.id : null);
        console.error("Error sending email: ", error);
        throw error; // Rethrow the error to handle it in the calling function
    }
};



// for multiple image upload

// Specify the destination folder
const uploadDir = path.join(__dirname, '../images/profile');

// Create directory fo image 
fs.promises.access(uploadDir, fs.constants.F_OK)
    .then(() => {
        console.log('images/profile directory already exists');
        // Additional logic can be added here if needed, for when the directory already exists
    })
    .catch(() => {
        // Directory does not exist, create it
        fs.promises.mkdir(uploadDir, { recursive: true })
            .then(() => {
                console.log('images/profile directory created successfully');
                // Additional logic for handling successful directory creation
            })
            .catch((err) => {
                console.error('Error creating images/profile directory:', err);
                logActivity("Create profile image directory", "Error creating profile directory: " + err.message, "error", req.user ? req.user.id : null);
            });
    });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images/profile'); // Specify the destination folder for uploaded images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Rename the file to prevent collisions
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
    fileFilter: fileFilter
});


// Create a USER using POST "/api/auth/createuser". No login required
router.post('/signup', upload.array('image', 1), [
    body('email').isEmail(),
    body('name').isLength({ min: 3 }),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logActivity("create user", "Failed validation for creating user", "error", req.user ? req.user.id : null);
            return res.status(400).send({ errors: errors.array() });
        }

        const { name, email, phoneNumber, password, roleId } = req.body;

        // Check if the user with the email already exists
        let user = await Users.findOne({ email });
        if (user) {
            logActivity("create user", "Attempt to create user with existing email", "error", req.user ? req.user.id : null);
            return res.status(400).send({ success: false, error: "A user with this email already exists" });
        }

        // Get the role ID if not provided
        const role = await Roles.findOne({ title: "User" });
        const defaultRoleId = role ? role._id.toString() : null;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        // Send verification email
        let emailRes = await sendVerificationEmail(email, verificationCode);

        let file = req.files;
        // console.log(file)

        if (!file || file.length === 0) {
            return res.status(400).send({ error: 'No files uploaded!' });
        }

        const images = req.files.map(file => ({
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            url: `http://localhost:8080/images/profile/${file.filename}`
        }));

        // Create new user
        user = await Users.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            roleId: roleId || defaultRoleId,
            image: images,
            verified: false,
            created_at: new Date()
        });

        // Store verification code with user ID in VerifyEmail collection
        await VerifyEmail.create({
            code: verificationCode,
            userId: user._id,
            created_at: new Date()
        });

        logActivity("Email Verification", "Verification code created successfully", "success", req.user ? req.user.id : null);

        res.status(200).send({
            success: true,
            message: "Verification code sent successfully",
            data: user._id,
            verified: user.verified
        });
    } catch (error) {
        console.error(error.message);
        logActivity("create user", "Error creating user: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message,

        });
    }
});

router.post('/verifyemail/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { verificationCode } = req.body;

        // Validate inputs
        if (!userId || !verificationCode) {
            return res.status(400).send({ success: false, error: "Missing userId or verificationCode" });
        }

        // Find user and verification record in parallel
        const [user, verifyEmail] = await Promise.all([
            Users.findById(userId),
            VerifyEmail.findOne({ userId })
        ]);

        // Check if user and verification record exist
        if (!user || !verifyEmail) {
            return res.status(404).send({ success: false, error: "User or verification record not found" });
        }

        // Check if verification code matches
        if (verifyEmail.code !== verificationCode) {
            return res.status(400).send({ success: false, error: "Invalid verification code" });
        }
        // Update user status to verified
        user.verified = true;
        const userData = await user.save();

        // Email verified successfully
        res.status(200).send({
            success: true,
            message: "Email verified successfully",
            data: userData
        });
    } catch (error) {
        console.error("Error verifying email:", error);
        logActivity("Verify email", "Error verifying email: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({ success: false, error: "Internal server error" });
    }
});



// Authenticate a USER using POST "/api/auth/login". No login required
router.post('/login', [
    body('email', "Enter valid Email").isEmail(),
    body('password', "Password invalid").isLength({ min: 5 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logActivity("login", "Failed validation for authenticating the user", "error", req.user ? req.user.id : null);
            return res.status(400).send({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await Users.findOne({ email });

        if (!user) {
            logActivity("login", "Attempt to login with wrong email", "error", req.user ? req.user.id : null);
            return res.status(400).send({ success: false, error: "User does not exist" });
        }

        // Check if password matches
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            logActivity("login", "Attempt to login with wrong password", "error", req.user ? req.user.id : null);
            return res.status(400).send({ success: false, error: "Password does not match" });
        }

        if (user.verified === false) {
            logActivity("login", "User is not verified yet", "error", req.user ? req.user.id : null);
            return res.status(400).send({ success: false, error: "User is not verified yet" });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                roleId: user.roleId
            }
        };

        const authToken = jwt.sign(payload, privateKey);

        logActivity("login", "Login successfull", "success", req.user ? req.user.id : null);
        res.status(200).send({
            success: true,
            message: "User authenticated successfully",
            authToken: authToken
        });
        logActivity("Login", "User authenticated successfully", "success", req.user ? req.user.id : null)
    } catch (error) {
        console.error(error.message);
        logActivity("login", "Error logging in: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
});

// Get USER data using POST "/api/auth/getuser". login required
router.get('/user', [fetchuser, checkAdminRole], async (req, res) => {
    try {
        const user = await Users.find().select("-password");
        res.status(200).send({
            status: STATUS_CODES[200],
            msg: "Users data",
            data: user
        });

    } catch (error) {
        console.log(error.message);
        logActivity("Fetching user", "Error fetching user: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });

    }
});


// Get my user data. login required
router.get('/myuser', fetchuser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id).select("-password");
        res.status(200).send({
            status: STATUS_CODES[200],
            msg: "Users data",
            data: user
        });

    } catch (error) {
        console.log(error.message);
        logActivity("Fetching auth user", "Error fetching logged in  user: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });

    }
});
module.exports = router;