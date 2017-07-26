import mongoose = require('mongoose');
import { IUser } from './User';

var wxGetMoneyRecordSchema = new mongoose.Schema({
    // 提现人
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    money: { type: Number, default: 0 },
    isSuccess: { type: Boolean, default: false },
    errorMsg: { type: String, default: '' },
    createDt: { type: Date, default: Date.now }
});

export interface IGetMoneyRecord extends mongoose.Document {
    user: IUser;
    money: number;
    isSuccess: boolean;
    errorMsg: string;
    createDt: Date;
}
export var wxGetMoneyRecordModel = mongoose.model<IGetMoneyRecord>('WXGetMoneyRecord', wxGetMoneyRecordSchema);





