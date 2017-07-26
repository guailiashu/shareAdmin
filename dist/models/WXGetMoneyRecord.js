"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var wxGetMoneyRecordSchema = new mongoose.Schema({
    // 提现人
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    money: { type: Number, default: 0 },
    isSuccess: { type: Boolean, default: false },
    errorMsg: { type: String, default: '' },
    createDt: { type: Date, default: Date.now }
});
exports.wxGetMoneyRecordModel = mongoose.model('WXGetMoneyRecord', wxGetMoneyRecordSchema);
