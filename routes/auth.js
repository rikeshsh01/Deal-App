const Users = require("../models/Users");
const Roles = require("../models/Roles");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var privateKey = "MynameisRicky";

const { router, fetchuser,checkAdminRole, body, validationResult, STATUS_CODES } = require('./import');


// Create a USER using POST "/api/auth/createuser". No login required

router.post('/createuser', [
    body('email').isEmail(),
    body('name').isLength({ min: 3 }),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
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

        const roles = await Roles.find();

        // Use find() to find the role with the matching roleId
        // let role = roles.find((r) => {
        //     return r._id.toString() === roleId.toString();
        // });
        // console.log(role)

        user = await Users.create({
            name: name,
            email: email,
            password: secPass,
            role: roleId ? roleId : "User"
        });
        // const data = {
        //     user: {
        //         id: user.id
        //     }
        // }

        // const authToken = jwt.sign(data, privateKey);
        success = true;
        // res.send({ success, authToken, msg: 'user created successfully' });
        res.status(200).send({
            status:STATUS_CODES[200],
            success: success,
            msg:"user created successfully",
            data:user
          });


    } catch (error) {
        console.log(error.message);
        res.status(500).send({
            status: STATUS_CODES[500],
            message: error.message
        });

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
                id: user.id,
                role: user.role
            }
        }

        const authToken = jwt.sign(data, privateKey);
        success = true;

        res.status(200).send({
            status:STATUS_CODES[200],
            success: success,
            msg:"user authenticate successfully",
            authToken:authToken
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
router.get('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await Users.findById(userId).select("-password");

        res.status(200).send({
            status:STATUS_CODES[200],
            msg:"Auth user data",
            data:user
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
            status:STATUS_CODES[200],
            msg:"Users data",
            data:user
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