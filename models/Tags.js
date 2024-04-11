const mongoose = require("mongoose");
const { Schema } = mongoose;

const TagsSchema = new Schema({
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

const Tag = mongoose.model("tag",TagsSchema);
module.exports = Tag;