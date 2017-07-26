"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var taskTagSchema = new mongoose.Schema({
    name: String,
    createDt: { type: Date, default: Date.now }
});
exports.taskTagModel = mongoose.model('TaskTag', taskTagSchema);
