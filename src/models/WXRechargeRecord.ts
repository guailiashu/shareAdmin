import mongoose = require('mongoose');

<<<<<<< HEAD


=======
>>>>>>> da43ba8b333dcc25d6bb13c9739e41d25ca9588e
var wxRechargeRecordSchema = new mongoose.Schema({
    body: String,
    attach: String,
    out_trade_no: String,
    total_fee: String,
    spbill_create_ip: String,
    openid: String,
<<<<<<< HEAD
    trade_type: { type: String, default: 'JSAPI' },
    createDt: { type: Date, default: Date.now },
    //是否已经退款
    isRefund: { type: Boolean, default: false }
});


=======
    trade_type: {type:String, default:'JSAPI'},
    createDt: {type:Date, default: Date.now},
    //是否已经退款
    user: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
    isRefund: {type:Boolean, default:false}
});

>>>>>>> da43ba8b333dcc25d6bb13c9739e41d25ca9588e
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

<<<<<<< HEAD

=======
>>>>>>> da43ba8b333dcc25d6bb13c9739e41d25ca9588e
export var wxRechargeRecordModel = mongoose.model<IRechargeRecord>('WXRechargeRecord', wxRechargeRecordSchema);