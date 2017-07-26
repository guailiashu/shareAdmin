import mongoose = require('mongoose');
<<<<<<< HEAD
import { taskModel } from './Task';
import { userModel } from './User';
import { taskTagModel } from './TaskTag';
import { taskRecordModel } from './TaskRecord';
import { wxRechargeRecordModel } from './WXRechargeRecord';
import { wxGetMoneyRecordModel } from './WXGetMoneyRecord';
mongoose.connect('mongodb://47.92.87.28 :27017/test');

=======
import {taskModel} from './Task';
import {userModel} from './User';
import {taskTagModel} from './TaskTag';
import {taskRecordModel} from './TaskRecord';
import {wxRechargeRecordModel} from './WXRechargeRecord';
import {wxGetMoneyRecordModel} from './WXGetMoneyRecord';
mongoose.connect('mongodb://47.92.87.28:27017/test');
>>>>>>> da43ba8b333dcc25d6bb13c9739e41d25ca9588e

export var db = {
    userModel,
    taskModel,
    taskTagModel,
    taskRecordModel,
    wxGetMoneyRecordModel,
    wxRechargeRecordModel
}