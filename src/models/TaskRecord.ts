import mongoose = require('mongoose');
import { IUser } from './User';

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


export interface ITaskRecord extends mongoose.Document {
    task: ITaskRecord | string;
    totalFee: number;
    shareDetail: { money: number, user: IUser | string }[];
    createDt?: Date;


}

export interface TaskRecord {
    task: ITaskRecord | string;
    totalFee: number;
    shareDetail: { money: number, user: IUser | string }[];
    createDt?: Date;

}


export var taskRecordModel = mongoose.model<ITaskRecord>('TaskRecord', taskRecordSchema);