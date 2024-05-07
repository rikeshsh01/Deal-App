const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingProcessSchema = new Schema({
    buyerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    sellerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    },
    status:{
        type:Number,
        default:0
    },
    requested_date_buyer:{
        type: Date, 
        default: null
    },
    approval_date_seller:{
        type: Date, 
        default: null
    },
    completed_date_buyer: { 
        type: Date, 
        default: null
    },

});

const BokkingProcess = mongoose.model("bookingprocess", BookingProcessSchema);
module.exports = BokkingProcess;
