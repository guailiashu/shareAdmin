import mongoose = require('mongoose');
import { IUser } from './User';
var taskSchema = new mongoose.Schema({
    title: String,
    // 余额
    totalMoney: { type: Number, default: 0.00 },
    shareMoney: { type: Number, default: 0.00 },
    fee: { type: Number, default: 0 },
    taskTag: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskTag' },
    imageUrl: { type: String },
    websiteUrl: String,
    createDt: { type: Date, default: Date.now },
    publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // 浏览数量
    pv: { type: Number, default: 0 },
    clickNum: { type: Number, default: 0 },
    /**
     * 已经浏览过的ip
     */
    ips: { type: [String], default: [] },
    users: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    active: { type: Boolean, default: false },
    msg: { type: String, default: '正在审核中' }
});

export interface ITask extends mongoose.Document {
    ips: string[];
    users: string[];
    pv: number;
    createDt: Date;
    totalMoney: number;
    shareMoney: number;
    active: boolean;
    clickNum: number;


}

export var taskModel = mongoose.model<ITask>('Task', taskSchema);