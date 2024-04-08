var jwt = require('jsonwebtoken');
var privateKey = "MynameisRicky";

const fetchuser = (req,res,next)=>{
    // Get the user from jwt token and id to req object 
    const token = req.header("auth-token");
    // console.log(token)
    if(!token){
        res.status(401).send({error:"Please authenticate using valid token"})
    }
    try {
        const data = jwt.verify(token,privateKey);
        console.log(data.user)
        req.user = data.user;
        // console.log(data.user.id)
        // console.log(req.user.user.id)
        next();
    } catch (error) {
        res.status(401).send({error:"Please authenticate using valid token"})
    }

}

module.exports = fetchuser;