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
const os = require("os")

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'ottis40@ethereal.email',
        pass: '4Am12aMpFuyZpWf968'
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

const isUserVerified = async (user) => {
    if (!user) {
        return false;
    }

    if (!user.verified) {
        // Delete any existing verification codes for this user
        await VerifyEmail.deleteMany({ userId: user._id });

        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        // Send verification email
        await sendVerificationEmail(user.email, verificationCode);

        // Store verification code with user ID in VerifyEmail collection
        await VerifyEmail.create({
            code: verificationCode,
            userId: user._id,
            created_at: new Date()
        });

        logActivity("Email Verification", "Verification code created successfully", "success", user._id);
        return false; // User is not yet verified
    }

    return true; // User is verified
}



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
                logActivity("Create profile image directory", "Error creating profile directory: " + error.message, "error", req.user ? req.user.id : null);
            });
    });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images/profile'); // Specify the destination folder for uploaded images
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, Date.now() + '-' + file.originalname.length + ext); // Rename the file to prevent collisions
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
            return res.status(400).send({
                status: 400,
                message: "Validation failed.",
                error: errors.array()
            });
        }

        const { name, email, phonenumber, password, roleId } = req.body;

        // Check if the user with the email already exists
        let user = await Users.findOne({ email });
        if (user) {
            logActivity("create user", "Attempt to create user with existing email", "error", req.user ? req.user.id : null);
            return res.status(400).send({
                status: 400,
                message: "Please try with new email addresses.",
                error: "A user with this email already exists"
            });
        }

        // Get the role ID if not provided
        const role = await Roles.findOne({ title: "User" });
        const defaultRoleId = role ? role._id.toString() : null;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // // Generate verification code
        // const verificationCode = Math.floor(100000 + Math.random() * 900000);

        // // Send verification email
        // let emailRes = await sendVerificationEmail(email, verificationCode);

        

        // Create new user
        user = await Users.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber:phonenumber,
            roleId: roleId || defaultRoleId,
            image: [],
            verified: false,
            created_at: new Date()
        });


        res.status(200).send({
            status: 200,
            message: "User created successfully, please login to verify the email",
        });
    } catch (error) {
        console.error(error.message);
        logActivity("create user", "Error creating user: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message

        });
    }
});

router.post('/verifyemail/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { verificationCode } = req.body;

        // Validate inputs
        if (!userId || !verificationCode) {
            return res.status(400).send({
                status: 400,
                message: "Please enter the verification code or userId",
                error: "Missing userId or verificationCode",
            });
        }

        // Find user and verification record in parallel
        const [user, verifyEmail] = await Promise.all([
            Users.findById(userId),
            VerifyEmail.findOne({ userId })
        ]);

        // Check if user and verification record exist
        if (!user || !verifyEmail) {
            return res.status(404).send({
                status: 404,
                message: "Data not found in server",
                error: "User or verification record not found"
            });
        }

        // Check if verification code matches

        if (verifyEmail.code !== verificationCode) {
            return res.status(400).send({
                status: 400,
                message: "Verification code is not match, please try again",
                error: "Invalid verification code"
            });
        }
        // Update user status to verified
        user.verified = true;
        const userData = await user.save();

        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                roleId: user.roleId
            }
        };

        const authToken = jwt.sign(payload, privateKey);

        // Email verified successfully
        res.status(200).send({
            status: 200,
            message: "Email verified successfully",
            data: { authToken:authToken, userId: userData._id }
        });
    } catch (error) {
        console.error("Error verifying email:", error);
        logActivity("Verify email", "Error verifying email: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
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
            return res.status(400).send({
                status: 400,
                message: "Validation failed.",
                error: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await Users.findOne({ email });

        if (!user) {
            logActivity("login", "Attempt to login with wrong email", "error", req.user ? req.user.id : null);
            return res.status(400).send({
                status: 400,
                message: "Please login with valid user",
                error: "User does not exist"
            });
        }

        // Check if password matches
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            logActivity("login", "Attempt to login with wrong password", "error", req.user ? req.user.id : null);
            return res.status(400).send({
                status: 400,
                message: "Please enter correct password",
                error: "Password does not match"
            });
        }

        // Check if user is verified
        const isVerified = await isUserVerified(user);

        if (!isVerified) {
            return res.status(200).send({
                status: 200,
                message: "Please verify your user first, Verification code sent to your email",
                data: { authToken: "", userId: user._id }
            });
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
            status: 200,
            message: "User authenticated successfully",
            data: { authToken, userId: user._id }
        });
        logActivity("Login", "User authenticated successfully", "success", req.user ? req.user.id : null)

    } catch (error) {
        console.error(error.message);
        logActivity("login", "Error logging in: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.messagee
        });
    }
});

// Get USER data using POST "/api/auth/getuser". login required
router.get('/user', [fetchuser, checkAdminRole], async (req, res) => {
    try {
        const user = await Users.find().select("-password");
        res.status(200).send({
            status: 200,
            message: "Users data fetched successfully",
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
router.get('/myprofile', fetchuser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id).select("-password");
        res.status(200).send({
            status: 200,
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

// Update a USER using PUT "/api/auth/updateuser/:id"
router.put('/user/:id',fetchuser ,upload.array('image', 1), [
    body('email').isEmail(),
    body('name').isLength({ min: 3 }),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logActivity("update user", "Failed validation for updating user", "error", req.user ? req.user.id : null);
            return res.status(400).send({
                status: 400,
                message: "Validation failed.",
                error: errors.array()
            });
        }

        const { id } = req.params;
        const { name, email, phoneNumber, password, roleId } = req.body;

        // Check if the user with the provided ID exists
        let user = await Users.findById(id);
        if (!user) {
            logActivity("update user", "Attempt to update non-existing user", "error", req.user ? req.user.id : null);
            return res.status(404).send({
                status: 404,
                message: "User not found.",
                error: "User with the provided ID does not exist"
            });
        }

        // Update user fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (password) {
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }
        if (roleId) user.roleId = roleId;

        let file = req.files;
        // console.log(file)

        if(file){
            const images = req.files.map(file => ({
                originalname: file.originalname,
                filename: file.filename,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype,
                url: `http://${req.hostname}:${process.env.PORT}/images/post/${file.filename}`
              }));

              user.image = images;

        }
        // Save the updated user
        await user.save();

        res.status(200).send({
            status: 200,
            message: "User updated successfully",
            data: user // Optionally, you can send back the updated user object
        });
    } catch (error) {
        console.error(error.message);
        logActivity("update user", "Error updating user: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
});

router.post('/forgetpassword', async (req, res) => {
    try {
        const { emailAddress } = req.body;


        let userDetails = await Users.findOne({ email:emailAddress });


        // Validate inputs
        if (!userDetails) {
            return res.status(400).send({
                status: 400,
                message: "Please enter valid email",
                error: "Email not found on database",
            });
        }

        if(userDetails){
            await VerifyEmail.deleteMany({ userId: userDetails._id});
        }
        console.log(userDetails)
        // Generate verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        // Send verification email
        await sendVerificationEmail(emailAddress, verificationCode);
        // Store verification code with user ID in VerifyEmail collection
        await VerifyEmail.create({
            code: verificationCode,
            userId: userDetails._id,
            created_at: new Date()
        });

        logActivity("Password reset", "Verification code created successfully", "success", req.user ? req.user.id : null);

        return res.status(200).send({
            status: 200,
            message: "Verification code sent successfully for reset password",
            data: { authToken:"", userId: userDetails._id }
        });

    } catch (error) {
        console.error("Error verifying email:", error);
        logActivity("Verify email", "Error verifying email: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
});


router.post('/resetpassword/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { newpassword, confirmpassword} = req.body;

        if(newpassword !== confirmpassword){
            return res.status(400).send({
                status: 400,
                message: "Password not matched, Please enter correct conform password",
                error: "confirm password is not matched with new passwod",
            });
        }


        let user = await Users.findById(userId)

        // Check if user and verification record exist
        if (!user) {
            return res.status(404).send({
                status: 404,
                message: "user not found in server",
                error: "User record not found"
            });
        }
        if (newpassword) {
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newpassword, salt);
            user.password = hashedPassword;
        }

        await user.save();

        res.status(200).send({
            status: 200,
            message: "Password has been changed successfully, please login with new password",
            data: { authToken:"", userId: user._id }
        });
    } catch (error) {
        console.error("Error resetting password:", error);
        logActivity("Reset pasword", "Error resetting password: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: 500,
            message: "Internal server error",
            error: error.message
        });
    }
});

module.exports = router;