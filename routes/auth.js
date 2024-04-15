const Users = require("../models/Users");
const Roles = require("../models/Roles");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var privateKey = "MynameisRicky";
const  logActivity  = require("./loginfo");

const { router, fetchuser, checkAdminRole, body, validationResult, STATUS_CODES } = require('./import');


// Create a USER using POST "/api/auth/createuser". No login required
router.post('/createuser', [
    body('email').isEmail(),
    body('name').isLength({ min: 3 }),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logActivity("create user", "Failed validation for creating user", "error",req.user ? req.user.id : null);
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, roleId } = req.body;

        // Check if the user with the email already exists
        let user = await Users.findOne({ email });
        if (user) {
            logActivity("create user", "Attempt to create user with existing email", "error", req.user ? req.user.id : null);
            return res.status(400).json({ success: false, error: "A user with this email already exists" });
        }

        // Get the role ID if not provided
        const role = await Roles.findOne({ title: "User" });
        const defaultRoleId = role ? role._id.toString() : null;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = await Users.create({
            name,
            email,
            password: hashedPassword,
            roleId: roleId || defaultRoleId,
            created_at: new Date()
        });

        logActivity("create user", "User created successfully", "success", req.user ? req.user.id : null);
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });
    } catch (error) {
        console.error(error.message);
        logActivity("create user", "Error creating user: " + error.message, "error",req.user ? req.user.id : null);
        res.status(500).json({
            status: STATUS_CODES[500],
            message: error.message
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
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await Users.findOne({ email });

        if (!user) {
            logActivity("login", "Attempt to login with wrong email", "error",req.user ? req.user.id : null);
            return res.status(400).json({ success: false, error: "User does not exist" });
        }

        // Check if password matches
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            logActivity("login", "Attempt to login with wrong password", "error", req.user ? req.user.id : null);
            return res.status(400).json({ success: false, error: "Password does not match" });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };
        const authToken = jwt.sign(payload, privateKey);

        logActivity("login", "Login successfull", "success", req.user ? req.user.id : null);
        res.status(200).json({
            success: true,
            message: "User authenticated successfully",
            authToken: authToken
        });
        logActivity("Login", "User authenticated successfully","success", req.user ? req.user.id : null)
    } catch (error) {
        console.error(error.message);
        logActivity("login", "Error logging in: " + error.message, "error",req.user ? req.user.id : null);
        res.status(500).json({
            status: STATUS_CODES[500],
            message: error.message
        });
    }
});


// Get USER data using POST "/api/auth/getuser". login required
router.get('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await Users.findById(userId).select("-password");

        res.status(200).send({
            status: STATUS_CODES[200],
            msg: "Auth user data",
            data: user
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });

    }
});

// Get USER data using POST "/api/auth/getuser". login required
router.post('/getuser', [fetchuser, checkAdminRole], async (req, res) => {
    try {
        const user = await Users.find().select("-password");
        res.status(200).send({
            status: STATUS_CODES[200],
            msg: "Users data",
            data: user
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });

    }
});

module.exports = router;