const mongoose = require("mongoose");
const { Schema } = mongoose;
const ImageSchema = require("./Image")

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
    phoneNumber : {
        type:String,
        require:true
    },
    password: { 
        type: String, 
        required:true 
    },
    roleId:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:"role"
    },
    image:[ImageSchema],
    verified:{
        type:Boolean,
        default: null 
    },
    created_at: { 
        type: Date, 
        default: null 
    },
    updated_at: { 
        type: Date, 
        default: null 
    },
    deleted_at: { 
        type: Date, 
        default: null 
    }

});

const User = mongoose.model("user",userSchema);
// User.createIndexes();
module.exports = User;