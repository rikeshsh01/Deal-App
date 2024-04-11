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
    image:{
        type: String, 
        required:true
    },
    // image: { 
    //     data: Buffer, // Storing image data as Buffer
    //     contentType: String // MIME type of the image
    // },
    latitude: {
        type: Number, // Latitude value
        required: true
    },
    longitude: {
        type: Number, // Longitude value
        required: true
    },
    location: {
        type: String, // Location name or description
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

const Note = mongoose.model("post",NotesSchema);
module.exports = Note;