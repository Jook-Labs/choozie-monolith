const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    userID: {
        type:String,
        required:true,
    },
    name: {
        type:String,
    },
    email: {
        type:String,
    },
    stripeCustomerID: String,
    photoURL: String,
    preferences:String,
    userType: String,
    phone: String,
    createdAt: String,
    updatedAt: String,
    lastLogin: String,
    token: String,
    DTString: String,
    banned: Boolean,
    paid: Boolean,
    messageCount: Number,
    menuDetectionCount: Number,
});

module.exports = mongoose.model("user", userSchema);