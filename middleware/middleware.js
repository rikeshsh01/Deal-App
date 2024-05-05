var jwt = require('jsonwebtoken');
var privateKey = process.env.PRIVATE_KEY;
const Roles = require("../models/Roles")
const logActivity = require("../routes/loginfo");
const STATUS_CODES = require("http");

const fetchuser = (req, res, next) => {
    // Get the user from jwt token and id to req object 
    const token = req.header("auth-token");
    if (!token) {
        res.status(401).send({
            status: STATUS_CODES[401],
            msg: "Please authenticate using valid token"
        })
    }
    try {
        const data = jwt.verify(token, privateKey);
        req.user = data.user;
        next();
    } catch (error) {
        logActivity("Middleware fetchuser", "Error in the middleware for fetching user: " + error.message, "error", req.user ? req.user.id : null);
        res.status(401).send({
            status: STATUS_CODES[401],
            msg: "Please authenticate using valid token",
            error: error.message
        })
    }

}

const checkAdminRole = async (req, res, next) => {
    if (!req.user || !req.user.roleId) {
        return res.status(400).send({
            status: STATUS_CODES[400],
            msg: "Bad request: User data incomplete."
        });
    }

    try {
        const { roleId } = req.user;
        const role = await Roles.findById(roleId);

        if (!role) {
            return res.status(404).send({
                status: STATUS_CODES[404],
                error: "Role not found."
            });
        }

        if (role.title === 'Admin') {
            next();
        } else {
            res.status(403).send({
                status: STATUS_CODES[403],
                error: "Unauthorized access. Admin role required."
            });
        }
    } catch (error) {
        logActivity("Admin role check", "Error on checking admin role: " + error.message, "error", req.user ? req.user.id : null);
        res.status(500).send({
            status: STATUS_CODES[500],
            error: "Internal Server Error while fetching role.",
            error: error.message
        });
    }
};




module.exports = { fetchuser, checkAdminRole };