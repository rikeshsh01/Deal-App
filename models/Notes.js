const mongoose = require("mongoose");
const { Schema } = mongoose;
const ImageSchema = require("./Image")

const NotesSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tagId: {
        type: String,
    },
    subtagId: {
        type: String,
    },
    image: [ImageSchema],
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
    geoLocation: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    likedUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "like"
    }],
    likeCount: {
        type: Number,
        required: true,
        default: 0
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
NotesSchema.index({ geoLocation: "2dsphere" });

const Note = mongoose.model("post", NotesSchema);
module.exports = Note;