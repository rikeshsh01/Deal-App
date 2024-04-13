var jwt = require('jsonwebtoken');
var privateKey = "MynameisRicky";

const fetchuser = (req,res,next)=>{
    // Get the user from jwt token and id to req object 
    const token = req.header("auth-token")
    if(!token){
        res.status(401).send({error:"Please authenticate using valid token"})
    }
    try {
        const data = jwt.verify(token,privateKey);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({error:"Please authenticate using valid token"})
    }

}

const checkAdminRole = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).send({error: "Unauthorized access. Admin role required."});
    }
}


  

module.exports = {fetchuser,checkAdminRole};