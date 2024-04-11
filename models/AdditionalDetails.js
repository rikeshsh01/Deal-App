const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdditionalDetailsSchema = new Schema({
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        required: true
    },
    key: {
        type: String,
        required: true
    },
    value: {
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

const AdditionalDetails = mongoose.model("AdditionalDetails", AdditionalDetailsSchema);
module.exports = AdditionalDetails;
