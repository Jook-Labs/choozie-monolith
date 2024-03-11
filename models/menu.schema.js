const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    menuID: {
        type:String,
        required:true,
    },
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
    menuPhoto: String,
    menuData: String,
    businessName: String,
    businessCoords: Array,
    businessAddress: String,
    lastMessage: String,
    createdAt: String,
    updatedAt: String,
    flagged:Boolean,
});

module.exports = mongoose.model("menu", menuSchema);