import mongoose = require('mongoose');



var wxRechargeRecordSchema = new mongoose.Schema({
    body: String,
    attach: String,
    out_trade_no: String,
    total_fee: String,
    spbill_create_ip: String,
    openid: String,
    trade_type: { type: String, default: 'JSAPI' },
    createDt: { type: Date, default: Date.now },
    //是否已经退款
    isRefund: { type: Boolean, default: false }
});


export interface IRechargeRecord extends mongoose.Document {
    body: string;
    attach: string;
    out_trade_no: string;
    total_fee: number;
    spbill_create_ip: string;
    openid: string;
    trade_type: string;
    createDt: Date;
    isRefund: Boolean;
}


export var wxRechargeRecordModel = mongoose.model<IRechargeRecord>('WXRechargeRecord', wxRechargeRecordSchema);