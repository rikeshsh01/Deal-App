const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    },
    content: {
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

const Comment = mongoose.model("comment", CommentSchema);
module.exports = Comment;
