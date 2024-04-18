const mongoose = require("mongoose");
const { Schema } = mongoose;

const LikeSchema = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
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

const Like = mongoose.model("like", LikeSchema);
module.exports = Like;
