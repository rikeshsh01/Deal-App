var jwt = require('jsonwebtoken');
var privateKey = "MynameisRicky";

const fetchuser = (req,res,next)=>{
    // Get the user from jwt token and id to req object 
    const token = req.header("auth-token")
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjYxNDAxZmFiYTljYmM1MWM4N2I0OTg4In0sImlhdCI6MTcxMjU4NzI1OH0.OWsWvQeIhtA5aLQBTT8HAbfsSD8XV9a7Q1uZwRE7TuU";
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