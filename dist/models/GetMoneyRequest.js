"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let getMoneyRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    money: { type: Number, default: 0 },
    createDt: { type: Date, default: Date.now },
    alipay: { type: String, default: '' },
    alipayName: { type: String, default: '' },
    status: { type: Number, default: 1 }
});
exports.getMoneyRequestModel = mongoose.model('GetMoneyRequest', getMoneyRequestSchema);
