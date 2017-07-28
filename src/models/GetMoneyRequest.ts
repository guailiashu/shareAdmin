import mongoose = require('mongoose');
import { IUser } from './User';

let getMoneyRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    money: { type: Number, default: 0 },
    createDt: { type: Date, default: Date.now },
    alipay: { type: String, default: '' },
    alipayName: { type: String, default: '' },
    //status  1 审核中,2  审核成功,已经汇款  3. 审核失败,退还提现金额
    status: { type: Number, default: 1 }
});
export interface IGetMoneyRequest extends mongoose.Document {
    user: string | IUser;
    money: number;
    createDt: Date;
    status: 1 | 2 | 3;
    ip


}

export var getMoneyRequestModel = mongoose.model<IGetMoneyRequest>('GetMoneyRequest', getMoneyRequestSchema);