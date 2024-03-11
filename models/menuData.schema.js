const mongoose = require('mongoose');

const menuDataSchema = new mongoose.Schema({
    menuID: {
        type:String,
        required:true,
    },
    userID: {
        type:String,
        required:true,
    },
    menuData: Array,
    createdAt: String,
    updatedAt: String,
});

module.exports = mongoose.model("menuData", menuDataSchema);