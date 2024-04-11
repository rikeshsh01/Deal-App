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
        type: String, 
        required: true 
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