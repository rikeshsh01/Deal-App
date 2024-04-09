const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubTagsSchema = new Schema({
    tagId:{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'tag', required: true },
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

const SubTag = mongoose.model("sub-tag",SubTagsSchema);
module.exports = SubTag;