const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    name: { 
        type: String, 
        required:true 
    },
    email: { 
        type: String, 
        unique:true,
        required:true 
    },
    password: { 
        type: String, 
        required:true 
    },
    role:{
        type:String,
        required:false
    },
    date: { 
        type: Date, 
        default: Date.now 
    }

});

const User = mongoose.model("user",userSchema);
// User.createIndexes();
module.exports = User;