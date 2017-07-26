"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var taskRecordSchema = new mongoose.Schema({
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    totalFee: { type: Number, default: 0 },
    shareDetail: {
        type: [{
                money: { type: Number, default: 0 },
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
            }]
    },
    createDt: { type: Date, default: Date.now },
});
exports.taskRecordModel = mongoose.model('TaskRecord', taskRecordSchema);
