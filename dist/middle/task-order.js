"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var taskOrderSchema = new mongoose.Schema({
    task: { type: mongoose.Schema.Types.ObjectId },
    createDt: { type: Date, default: Date.now },
    //受益的钱
    money: { type: Number, default: 0 },
    toPeople: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
exports.taskOrder = mongoose.model('TaskOrder', taskOrderSchema);
