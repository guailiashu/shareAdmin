"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
var wxRechargeRecordSchema = new mongoose.Schema({
    body: String,
    attach: String,
    out_trade_no: String,
    total_fee: String,
    spbill_create_ip: String,
    openid: String,
    trade_type: { type: String, default: 'JSAPI' },
    createDt: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    //是否已经退款
    isRefund: { type: Boolean, default: false }
});
exports.wxRechargeRecordModel = mongoose.model('WXRechargeRecord', wxRechargeRecordSchema);
