import {Route, RequestHandler, Request, Response} from '../route';
import moment = require('moment');

@Route.Views('share-manage')
export class ShareManageRoute extends Route.BaseRoute implements Route.IRoute {
    doAction(action: string, method: string, next: RequestHandler) {
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
                return this.GET == method ? this.taskTagEditPage : this.taskTagEdit
            case "taskTag-delete":
                return this.taskTagDelete;
            case 'taskRecord-edit':
                return this.taskRecordEdit;
            case 'task-list':
                return this.taskList;
            case 'recharge-list':
                switch(method){
                    case 'get':
                        return this.rechargeList;
                    case 'post':
                        return ;
                    case 'put':
                        return ;
                    default:
                        return this.rechargeList;
                }
            default:
                return this.index;
        }
    }
    before(){
        this.next();
    }
    after(){}

    async rechargeList(){
        let rechargeLists = await this.db.wxRechargeRecordModel.find().populate('user').sort({createDt:-1}).exec();
        this.res.json({
            ok:true,
            data:rechargeLists
        });
    }

    async systemLog(){
        let today = new Date();
        let currentTime = new Date(today.getFullYear(),today.getMonth(),today.getDate()).getTime();
        //console.log(new Date(today.getFullYear(),today.getMonth(),today.getDate()));
        //今天的起始时间 00:00:00
        let todayStart = currentTime;
        let todayEnd = todayStart+24*60*60*1000;
        //昨天的起始时间 00:00:00
        let yesStart = currentTime-24*60*60*1000;
        let yesEnd = currentTime;
        let weekStart = currentTime-7*24*60*60*1000;
        let weekEnd = todayEnd;

        //console.log(`todayStart:${todayStart}, todayEnd:${todayEnd}`);
        let yesSignupCount = await this.db.userModel.find().where('createDt').gt(yesStart).lt(yesEnd).count().exec();
        let todaySignupCount = await this.db.userModel.find().where('createDt').gt(todayStart).lt(todayEnd).count().exec();
        let todayTaskRecords = await this.db.taskRecordModel.find().where('createDt').gt(todayStart).lt(todayEnd).exec();
        let yesTaskRecords = await this.db.taskRecordModel.find().where('createDt').gt(yesStart).lt(yesEnd).exec();
        let weekTaskRecords = await this.db.taskRecordModel.find().where('createDt').gt(weekStart).lt(weekEnd).exec();
        
        let activeUsers = [];
        let yesActiveUsers = [];
        let weekActiveUsers = [];

        todayTaskRecords.forEach(record=>{
            if(activeUsers.includes(record.shareDetail[0].user)){

            }else{
                activeUsers.push(record.shareDetail[0].user);
            }
        });
        yesTaskRecords.forEach(yesRecord=>{
            if(yesActiveUsers.includes(yesRecord.shareDetail[0].user)){

            }else{
                yesActiveUsers.push(yesRecord.shareDetail[0].user);
            }
        });
        weekTaskRecords.forEach(weekRecord=>{
            if(weekActiveUsers.includes(weekRecord.shareDetail[0].user)){

            }else{
                weekActiveUsers.push(weekRecord.shareDetail[0].user);
            }
        });

        let totalNum = await this.db.userModel.find().count();
        
        this.res.json({
            ok:true,
            data:{
                yesSignupCount,  //昨日关注人数
                todaySignupCount,  //今日关注人数
                yesActiveUserNum:yesActiveUsers.length,  //昨日活跃人数
                todayActiveUserNum:activeUsers.length,  //今日活跃人数
                weekActiveUserNum:weekActiveUsers.length,  //本周活跃人数
                totalNum  //累计关注人数
            }
        })
    }

    async taskList(){
        let tasks = await this.db.taskModel.find(this.req.query).populate('publisher').exec();
        this.res.json({ok:true, data:tasks});
    }

    async taskRecordEdit(){
        let taskRecord = await this.service.db.taskRecordModel.findById(this.req.query._id).exec();
        let orders = taskRecord.shareDetail;
        for(let order of orders){
            let temp: any = await this.service.db.userModel.findById(order.user).exec();
            order.user = temp;
        }
        var task = await this.service.db.taskModel.findById(taskRecord.task).exec();
        this.res.render('share-admin/taskRecord-edit', {taskRecord, task});
    }

    async taskEdit(){
        var _id = this.req.query._id;
        var task = await this.service.db.taskModel.findById(_id).populate('taskTag').exec();
        var taskTags = await this.service.db.taskTagModel.find().exec();
        var taskRecords = await this.service.db.taskRecordModel.find({task: task._id.toString()}).exec();
        console.log(taskRecords);
        this.res.render('share-admin/task-edit', {task, taskRecords, taskTags});
    }
    
    async taskTagEdit(){
        let {_id, name, sort} = this.req.body;
        await this.service.db.taskTagModel.findByIdAndUpdate(_id, {$set:{name,sort}}).exec();
        this.res.redirect('/share-admin/taskTag-list');
    }

    async taskTagEditPage(){
        let taskTag = await this.service.db.taskTagModel.findById(this.req.query._id).exec();
        let subTasks = await this.service.db.taskModel.find({taskTag:taskTag._id.toString()}).exec();
        this.res.render('share-admin/taskTag-edit', {taskTag, subTasks});
    }

    login() {
        let {username, password} = this.req.body;
        console.log(username, password);
        if(username == 'admin' && password == '123'){
            this.req.session.admin = {
                username,
                password
            };
            this.res.redirect('/share-admin/index')
        }else{
            this.res.render('share-admin/login', {errorMsg: '用户名或密码不正确'});
        }
    }
   
    loginPage(){
        this.res.render('share-admin/login');
    }

    async index(req: Request, res: Response) {
        // 任务标签总数
        var taskTagNum = await this.service.db.taskTagModel.find().count().exec();
        // 任务数量
        var taskNum = await this.service.db.taskTagModel.find().count().exec();
        var taskActiveNum = await this.service.db.taskTagModel.find({ active: true }).count().exec();
        var recordNum = await this.service.db.taskRecordModel.find().count().exec();
        this.res.render(`share-admin/index`, {taskTagNum, taskNum, taskActiveNum, recordNum});
    }

    async taskTagDelete(req: Request, res: Response) {
        let action = await this.service.db.taskTagModel.findByIdAndRemove(req.query._id).exec();
        res.redirect(`/share-admin/taskTag-list`);
    }

    async taskDelete(req: Request, res: Response) {
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

    async taskTagNewPageDo(req: Request, res: Response) {
        let {name} = req.body;
        let newTaskTag = await new this.service.db.taskTagModel({name}).save();
        res.redirect('/share-admin/taskTag-list');
    }
}