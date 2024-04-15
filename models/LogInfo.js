const mongoose = require("mongoose");
const { Schema } = mongoose;

const LogInfoSchema = new Schema({
    action: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },status:{
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: false
    },
    created_at: {
        type: Date,
        default: null
    }
});

const LogInfo = mongoose.model("loginfo", LogInfoSchema);
module.exports = LogInfo;

