import mongoose = require('mongoose');
import { taskModel } from './Task';
import { userModel } from './User';
import { taskTagModel } from './TaskTag';
import { taskRecordModel } from './TaskRecord';
import { wxRechargeRecordModel } from './WXRechargeRecord';
import { wxGetMoneyRecordModel } from './WXGetMoneyRecord';
mongoose.connect('mongodb://localhost:27017/test');


export var db = {
    userModel,
    taskModel,
    taskTagModel,
    taskRecordModel,
    wxGetMoneyRecordModel,
    wxRechargeRecordModel
}