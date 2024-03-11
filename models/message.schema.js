const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    menuID: {
        type: String, 
        required: true
    },
    choozieID: {
        type: String, 
        required: true
    },
    userID: {
        type: String, 
        required: true
    },
    sentFrom: String,
    message: String,
    timeSent: String,
    flagged: Boolean,
});

module.exports = mongoose.model("messages", messageSchema);