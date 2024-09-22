const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrdersSchema = new Schema({
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post", // Reference to Notes collection
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Reference to the buyer
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Reference to the seller (note creator)
        required: true
    },
    requestCount: {
        type: Number,
        required: true,
        default: 1
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
});

const Order = mongoose.model("order", OrdersSchema);
module.exports = Order;
