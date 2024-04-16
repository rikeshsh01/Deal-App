const mongoose = require("mongoose");
const { Schema } = mongoose;

const VerifyEmailSchema = new Schema({
    code: { 
        type: String, 
        required:true 
    },
    userId: { 
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
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

const VerifyEmail = mongoose.model("verifyemail",VerifyEmailSchema);
module.exports = VerifyEmail;