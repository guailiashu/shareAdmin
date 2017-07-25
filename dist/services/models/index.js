"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const config_1 = require("../config");
const Task_1 = require("./Task");
const User_1 = require("./User");
const TaskTag_1 = require("./TaskTag");
const TaskRecord_1 = require("./TaskRecord");
mongoose.connect(config_1.CONFIG.mongodb || 'mongodb://localhost:27017/test');
exports.db = {
    userModel: User_1.userModel,
    taskModel: Task_1.taskModel,
    taskTagModel: TaskTag_1.taskTagModel,
    taskRecordModel: TaskRecord_1.taskRecordModel
};
