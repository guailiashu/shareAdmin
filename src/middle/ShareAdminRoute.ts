import { Route, RequestHandler, Request, Response } from '../route';

@Route.Views('share-admin')
export class ShareAdminRoute extends Route.BaseRoute implements Route.IRoute {
    doAction(action: string, method: string, next: RequestHandler) {
        switch (action) {
            case 'user-list': return this.userList;//分页
            case 'main-info': return this.mainInfo;
            case 'index': return this.index;
            case 'task-delete': return this.taskDelete;
            case 'task-edit': return this.taskEdit;
            case 'taskTag-list': return this.taskTagList;//栏目信息
            case 'taskTag': switch (method) {//详情页
                case 'get': return this.taskTagDetail;
                case 'post': return this.taskTagNew;
                case 'put': return this.taskTagUpdate;
                default: return this.taskTagDelete;//删除
            }
            //case "taskTag-delete": return this.taskTagDelete;
            case 'taskRecord-edit': return this.taskRecordEdit;
            case 'task-list': return this.taskList;

            default: return this.index;
        }
    }
    async taskTagDetail() {//get提交
        let taskTag = await this.db.taskTagModel.findById({ _id: this.req.query._id }).exec();
        let subTasks = await this.db.taskModel.find({ taskTag: taskTag._id.toString() }).exec();//子栏目
        if (taskTag) {
            this.res.json({
                ok: true,
                data: {
                    taskTag,
                    subTasks
                }
            });

        } else {
            this.res.json({
                ok: false,
                data: '该栏目不存在,请传入参数正确的id'
            });
        }

    }
    async taskTagNew() {//新增 ,post提交

        let taskTag = await this.db.taskTagModel.findById({ _id: this.req.query._id }).exec();
        let subTasks = await this.db.taskModel.find({ taskTag: taskTag._id.toString() }).exec();//子栏目
        if (taskTag) {
            this.res.json({
                ok: true,
                data: {
                    taskTag,
                    subTasks
                }
            });

        } else {
            this.res.json({
                ok: false,
                data: '该栏目不存在,请传入参数正确的id'
            });
        }

    }

    async taskTagUpdate() { //更新
        let taskTag = await this.db.taskTagModel.findById({ _id: this.req.query._id }).exec();
        let subTasks = await this.db.taskModel.find({ taskTag: taskTag._id.toString() }).exec();//子栏目
        if (taskTag) {
            this.res.json({
                ok: true,
                data: {
                    taskTag,
                    subTasks
                }
            });

        } else {
            this.res.json({
                ok: false,
                data: '该栏目不存在,请传入参数正确的id'
            });
        }
    }

    async taskTagDelete(req: Request, res: Response) {//删除
        let taskTag = await this.db.taskTagModel.findById(this.req.query._id).exec();
        let subTaskCount = await this.db.taskModel.find({ taskTag: taskTag._id.toString() }).count().exec();//子类数量
        if (subTaskCount > 0) {
            res.json({
                ok: false,
                data: '请先该栏目下的子任务'
            })
        } else {
            let deleteAction = await this.db.taskTagModel.findByIdAndRemove(this.req.query._id).exec();
            res.json({ ok: true, data: deleteAction });
        }


    }

    async userList() {//分页
        let page = this.req.query.page || 0;
        let users = await this.db.userModel.find().skip(10 * page).limit(10).exec();
        let count = await this.db.userModel.find().count().exec();
        this.res.json({ ok: true, data: { users, count } });
    }
    async mainInfo() {
        let userCount = await this.db.userModel.find().count().exec();
        let taskTagCount = await this.db.taskTagModel.find().count().exec();
        let activeTaskCount = await this.db.taskModel.find({ active: true }).count().exec();
        let unActiveTaskCount = await this.db.taskModel.find({ active: false }).count().exec();
        this.res.json({
            ok: true,
            data: {
                userCount,//用户总数
                taskTagCount,//栏目分类总数
                activeTaskCount,//已经上架的总数
                unActiveTaskCount,//已经下架的总数
            }
        })
    }

    async taskList() {
        let tasks = await this.db.taskModel.find(this.req.query).populate('publisher').exec();
        let count = await this.db.taskModel.find().count().exec();
        this.res.json({ ok: true, data: { tasks, count } });
    }

    before() {
        // if (this.req.session.admin || this.req.baseUrl == '/share-admin/login') {
        this.next();
        // } else {
        // this.res.redirect('/share-admin/login')
        // }
    }

    after() { }
    async taskRecordEdit() {
        var taskRecord = await this.service.db.taskRecordModel.findById(this.req.query._id).exec();
        let orders = taskRecord.shareDetail;
        for (let order of orders) {
            let temp: any = await this.service.db.userModel.findById(order.user).exec();
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
        ``
        let { username, password } = this.req.body;
        console.log(username, password);
        if (username == 'admin' && password == '123') {
            this.req.session.admin = {
                username,
                password
            };
            this.res.redirect('/share-admin/index')
        } else {
            this.res.render('share-admin/login', { errorMsg: '用户名或密码不正确' });
        }

    }
    loginPage() {
        this.res.render('share-admin/login')

    }

    async  index(req: Request, res: Response) {
        // 任务标签总数
        var taskTagNum = await this.service.db.taskTagModel.find().count().exec();
        // 任务数量
        var taskNum = await this.service.db.taskTagModel.find().count().exec();
        var taskActiveNum = await this.service.db.taskTagModel.find({ active: true }).count().exec();
        var recordNum = await this.service.db.taskRecordModel.find().count().exec();
        this.res.render(`share-admin/index`, { taskTagNum, taskNum, taskActiveNum, recordNum });
    }

    async taskDelete(req: Request, res: Response) {
        var _id = req.query._id;
        let action = await this.service.db.taskModel.findByIdAndRemove(_id).exec();
        res.redirect(`/share-admin/task-list`);
    }



    async taskTagList() {//栏目信息
        var taskTags = await this.db.taskTagModel.find().exec();
        var taskNums = [];
        for (let taskTag of taskTags) {
            taskTag = taskTag._id.toString();
            let taskNum = await this.db.taskModel.find({ taskTag }).count().exec();
            taskNums.push(taskNum);
        }

        //     this.josn('taskTag-list', { taskTags, taskNums });
        // }

        this.res.json({
            ok: true,
            data: {
                taskTags, taskNums
            }
        })
    }



    async taskTagNewPageDo(req: Request, res: Response) {
        let { name } = req.body;
        let newTaskTag = await new this.service.db.taskTagModel({ name }).save();
        res.redirect('/share-admin/taskTag-list');
    }
}
