import mongoose = require('mongoose');


var taskTagSchema = new mongoose.Schema({
    name: String,
    sort: { type: Number, default: 0 },
    createDt: { type: Date, default: Date.now }
});




export var taskTagModel = mongoose.model('TaskTag', taskTagSchema);