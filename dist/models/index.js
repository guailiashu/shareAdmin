"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Task_1 = require("./Task");
const User_1 = require("./User");
const TaskTag_1 = require("./TaskTag");
const TaskRecord_1 = require("./TaskRecord");
const WXRechargeRecord_1 = require("./WXRechargeRecord");
const WXGetMoneyRecord_1 = require("./WXGetMoneyRecord");
mongoose.connect('mongodb://localhost:27017/test');
exports.db = {
    userModel: User_1.userModel,
    taskModel: Task_1.taskModel,
    taskTagModel: TaskTag_1.taskTagModel,
    taskRecordModel: TaskRecord_1.taskRecordModel,
    wxGetMoneyRecordModel: WXGetMoneyRecord_1.wxGetMoneyRecordModel,
    wxRechargeRecordModel: WXRechargeRecord_1.wxRechargeRecordModel
};
