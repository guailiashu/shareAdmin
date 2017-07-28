"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let getMoneyRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    money: { type: Number, default: 0 },
    createDt: { type: Date, default: Date.now },
    alipay: { type: String, default: '' },
    alipayName: { type: String, default: '' },
    //status  1 审核中,2  审核成功,已经汇款  3. 审核失败,退还提现金额
    status: { type: Number, default: 1 }
});
exports.getMoneyRequestModel = mongoose.model('GetMoneyRequest', getMoneyRequestSchema);
