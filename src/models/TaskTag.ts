import mongoose = require('mongoose');


var taskTagSchema = new mongoose.Schema({
    name: String,
    createDt: { type: Date, default: Date.now }
});




export var taskTagModel = mongoose.model('TaskTag', taskTagSchema);