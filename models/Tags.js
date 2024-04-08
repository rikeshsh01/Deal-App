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
    date: { 
        type: Date, 
        default: Date.now 
    }
});

const Tag = mongoose.model("tag",TagsSchema);
module.exports = Tag;