const mongoose = require("mongoose");
const { Schema } = mongoose

const ImageSchema = new Schema({
    originalname: {
        type: String,
        required: true
    },
    filename: { 
        type: String, 
        required: true 
    },
    path: { 
        type: String, 
        required: true 
    },
    size: { 
        type: Number, 
        required: true 
    },
    mimetype: { 
        type: String, 
        required: true 
    },
    url:{ 
        type: String, 
        required: true 
    },
});

module.exports = ImageSchema;
