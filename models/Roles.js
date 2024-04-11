const mongoose = require("mongoose");
const { Schema } = mongoose;

const RoleSchema = new Schema({
    title: { 
        type: String, 
        required:true 
    },
    description: { 
        type: String, 
        required:true 
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

const Role = mongoose.model("role",RoleSchema);
module.exports = Role;