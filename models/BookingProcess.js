/*
1. click on booked status = 0


bookId,
staus 0,1,2,3,4
dates
userId,
postId,

booking process
pending/requesting 0  /request
waiting for aproval 1 / waitiingapproval
aprroved 2           / aprroved

navigation -> 

for buyer
liked: 
unliked: 

for rejection
out of stock after confirmed (if there is multople request) 

*/


const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingProcessSchema = new Schema({
    buyerId:{
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
