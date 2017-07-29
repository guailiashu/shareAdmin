"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("../route");
let ShareManageRoute = class ShareManageRoute extends route_1.Route.BaseRoute {
    doAction(action, method, next) {
        switch (action) {
            case 'login':
                return this.GET == method ? this.loginPage : this.login;
            case 'system-log':
                return this.systemLog;
            case 'task-delete':
                return this.taskDelete;
            case 'task-edit':
                return this.taskEdit;
            case 'taskTag-list':
                return this.taskTagList;
            case 'taskTag-edit':
                return this.GET == method ? this.taskTagEditPage : this.taskTagEdit;
            case "taskTag-delete":
                return this.taskTagDelete;
            case 'taskRecord-edit':
                return this.taskRecordEdit;
            case 'task-list':
                return this.taskList;
            case 'recharge-list':
                switch (method) {
                    case 'get':
                        return this.rechargeList;
                    case 'post':
                        return;
                    case 'put':
                        return;
                    default:
                        return;
                }
            default:
                return this.index;
        }
    }
    before() {
        this.next();
    }
    after() { }
    async rechargeList() {
        let page = this.req.query.page || 0;
        let rechargeLists = await this.db.wxRechargeRecordModel.find().skip(page * 30).limit(30).populate('user').sort({ createDt: -1 }).exec();
        let count = await this.db.wxRechargeRecordModel.find().count().exec();
        this.res.json({
            ok: true,
            data: {
                rechargeLists,
                count
            }
        });
    }
    async systemLog() {
        let day = new Date();
        let currentTime = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime(); //今日的起始时间
        // console.log(new Date(new Date().getTime() + 28800000));
        // console.log(111, new Date(today.getFullYear(),today.getMonth(),today.getDate()));
        // console.log(333, new Date(currentTime+28800000));
        // 昨日的起始时间 00:00:00
        let yesStart = currentTime - 1 * 24 * 60 * 60 * 1000;
        let yesEnd = currentTime;
        //今日的起始时间 00:00:00
        let todayStart = currentTime;
        let todayEnd = todayStart + 1 * 24 * 60 * 60 * 1000;
        //上周的起始时间
        //本周的起始时间
        let weekStart = currentTime - 7 * 24 * 60 * 60 * 1000;
        let weekEnd = todayEnd;
        //console.log(`todayStart:${todayStart}, todayEnd:${todayEnd}`);
        //昨日注册人数
        let yesSignupCount = await this.db.userModel.find().where('createDt').gt(yesStart).lt(yesEnd).count().exec();
        //今日注册人数
        let todaySignupCount = await this.db.userModel.find().where('createDt').gt(todayStart).lt(todayEnd).count().exec();
        // 活跃的结果集, 数组类型
        let yesTaskRecords = await this.db.taskRecordModel.find().where('createDt').gt(yesStart).lt(yesEnd).exec();
        let todayTaskRecords = await this.db.taskRecordModel.find().where('createDt').gt(todayStart).lt(todayEnd).exec();
        let weekTaskRecords = await this.db.taskRecordModel.find().where('createDt').gt(weekStart).lt(weekEnd).exec();
        // let tests = await this.db.userModel.find({historyMoney:0.2, isFinish:false}).exec();
        let yesActiveUsers = []; //昨日活跃
        let activeUsers = []; //今日活跃
        let weekActiveUsers = []; //本周活跃
        yesTaskRecords.forEach(yesRecord => {
            if (yesActiveUsers.includes(yesRecord.shareDetail[0].user)) {
            }
            else {
                yesActiveUsers.push(yesRecord.shareDetail[0].user);
            }
        });
        todayTaskRecords.forEach(record => {
            if (activeUsers.includes(record.shareDetail[0].user)) {
            }
            else {
                activeUsers.push(record.shareDetail[0].user);
            }
        });
        weekTaskRecords.forEach(weekRecord => {
            if (weekActiveUsers.includes(weekRecord.shareDetail[0].user)) {
            }
            else {
                weekActiveUsers.push(weekRecord.shareDetail[0].user);
            }
        });
        let totalNum = await this.db.userModel.find().count();
        this.res.json({
            ok: true,
            data: {
                yesSignupCount,
                todaySignupCount,
                yesActiveUserNum: yesActiveUsers.length,
                todayActiveUserNum: activeUsers.length,
                weekActiveUserNum: weekActiveUsers.length,
                totalNum //用户总数
            }
        });
    }
    async taskList() {
        let tasks = await this.db.taskModel.find(this.req.query).populate('publisher').exec();
        this.res.json({ ok: true, data: tasks });
    }
    async taskRecordEdit() {
        let taskRecord = await this.service.db.taskRecordModel.findById(this.req.query._id).exec();
        let orders = taskRecord.shareDetail;
        for (let order of orders) {
            let temp = await this.service.db.userModel.findById(order.user).exec();
            order.user = temp;
        }
        var task = await this.service.db.taskModel.findById(taskRecord.task).exec();
        this.res.render('share-admin/taskRecord-edit', { taskRecord, task });
    }
    async taskEdit() {
        var _id = this.req.query._id;
        var task = await this.service.db.taskModel.findById(_id).populate('taskTag').exec();
        var taskTags = await this.service.db.taskTagModel.find().exec();
        var taskRecords = await this.service.db.taskRecordModel.find({ task: task._id.toString() }).exec();
        console.log(taskRecords);
        this.res.render('share-admin/task-edit', { task, taskRecords, taskTags });
    }
    async taskTagEdit() {
        let { _id, name, sort } = this.req.body;
        await this.service.db.taskTagModel.findByIdAndUpdate(_id, { $set: { name, sort } }).exec();
        this.res.redirect('/share-admin/taskTag-list');
    }
    async taskTagEditPage() {
        let taskTag = await this.service.db.taskTagModel.findById(this.req.query._id).exec();
        let subTasks = await this.service.db.taskModel.find({ taskTag: taskTag._id.toString() }).exec();
        this.res.render('share-admin/taskTag-edit', { taskTag, subTasks });
    }
    login() {
        let { username, password } = this.req.body;
        if (username == 'admin' && password == '123') {
            this.req.session.admin = {
                username,
                password
            };
            this.res.redirect('/share-admin/index');
        }
        else {
            this.res.render('share-admin/login', { errorMsg: '用户名或密码不正确' });
        }
    }
    loginPage() {
        this.res.render('share-admin/login');
    }
    async index(req, res) {
        // 任务标签总数
        var taskTagNum = await this.service.db.taskTagModel.find().count().exec();
        // 任务数量
        var taskNum = await this.service.db.taskTagModel.find().count().exec();
        var taskActiveNum = await this.service.db.taskTagModel.find({ active: true }).count().exec();
        var recordNum = await this.service.db.taskRecordModel.find().count().exec();
        this.res.render(`share-admin/index`, { taskTagNum, taskNum, taskActiveNum, recordNum });
    }
    async taskTagDelete(req, res) {
        let action = await this.service.db.taskTagModel.findByIdAndRemove(req.query._id).exec();
        res.redirect(`/share-admin/taskTag-list`);
    }
    async taskDelete(req, res) {
        var _id = req.query._id;
        let action = await this.service.db.taskModel.findByIdAndRemove(_id).exec();
        res.redirect(`/share-admin/task-list`);
    }
    async taskTagList() {
        var taskTags = await this.db.taskTagModel.find().exec();
        var taskNums = [];
        for (let taskTag of taskTags) {
            taskTag = taskTag._id.toString();
            let taskNum = await this.db.taskModel.find({ taskTag }).count().exec();
            taskNums.push(taskNum);
        }
        this.render('taskTag-list', { taskTags, taskNums });
    }
    async taskTagNewPageDo(req, res) {
        let { name } = req.body;
        let newTaskTag = await new this.service.db.taskTagModel({ name }).save();
        res.redirect('/share-admin/taskTag-list');
    }
};
ShareManageRoute = __decorate([
    route_1.Route.Views('share-manage')
], ShareManageRoute);
exports.ShareManageRoute = ShareManageRoute;
