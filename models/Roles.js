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
    date: { 
        type: Date, 
        default: Date.now 
    }
});

const Role = mongoose.model("role",RoleSchema);
module.exports = Role;