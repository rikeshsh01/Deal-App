const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotesSchema = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    title: { 
        type: String, 
        required:true 
    },
    description: { 
        type: String, 
        required:true 
    },
    tag: { 
        type: String, 
    },
    image: { 
        data: Buffer, // Storing image data as Buffer
        contentType: String // MIME type of the image
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
});

const Note = mongoose.model("post",NotesSchema);
module.exports = Note;