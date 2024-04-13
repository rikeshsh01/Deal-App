const Users = require("../models/Users");
const Roles = require("../models/Roles");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var privateKey = "MynameisRicky";

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
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, roleId } = req.body;

        // Check if the user with the email already exists
        let user = await Users.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, error: "A user with this email already exists" });
        }

        // Get the role ID
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

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });
    } catch (error) {
        console.error(error.message);
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
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, error: "User does not exist" });
        }

        // Check if password matches
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
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

        res.status(200).json({
            success: true,
            message: "User authenticated successfully",
            authToken: authToken
        });
    } catch (error) {
        console.error(error.message);
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