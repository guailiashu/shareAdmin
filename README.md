# Express Effect
是一套基于 typescript + express + mongoose 的快速开发框架
在代码上 封装了路由类,因此你可以这样写代码,路由器





```javascript
import { Route, RequestHandler, Request, Response } from '../route';


export class ShareAdminRoute extends Route.BaseRoute implements Route.IRoute {
    // do 的常见几种操作
    LIST = 'list';
    VIEWDIR = 'share-admin';
    // action 二级路由 , method: http请求方法 ,next 请求的下个组件
    doAction(action: string, method: string, next: RequestHandler) {
        switch (action) {
            case 'task-list':
                return this.taskList;
            case 'task-detail':
                return this.taskDetail;
            case 'task-delete':
                return this.taskDelete;
            case 'taskTag-list':
                return this.taskTagList;
            case 'taskTag-detail':
                return this.taskTagDetail;
            case 'taskTag-new':
                return this.GET == method ? this.taskTagNewPage : this.taskTagNewPageDo;
            case "taskTag-delete":
                return this.taskTagDelete;
            case 'taskRecord-list':
                return this.taskRecordList;
            case 'taskRecord-detail':
                return this.taskRecordDetail;
            case 'order-detail':
                return this.taskRecordDetail;

            default:
                return this.index;
        }


    }

    index(req: Request, res: Response) {
        res.render(`${this.VIEWDIR}/index`);
    }
    async taskTagDelete(req: Request, res: Response) {
        let action = await this.service.db.taskTagModel.findByIdAndRemove(req.query._id).exec();
        res.redirect(`/${this.VIEWDIR}/taskTag-list`);
    }
    async taskDelete(req: Request, res: Response) {
        var _id = req.query._id;
        let action = await this.service.db.taskModel.findByIdAndRemove(_id).exec();
        res.redirect(`/${this.VIEWDIR}/task-list`);
    }
    async  taskList(req: Request, res: Response) {
        var tasks = await this.service.db.taskModel.find().populate('publisher  taskTag').exec();
        res.render(`${this.VIEWDIR}/task-list`, { tasks });
    }
    async taskRecordList(req: Request, res: Response) {
        var taskRecords = await this.service.db.taskRecordModel.find().populate('task').exec();
        res.render(`${this.VIEWDIR}/taskRecord-list`, { taskRecords });
    }
    async taskRecordDetail(req: Request, res: Response) {
        var _id = req.query._id;
        var taskRecord = await this.service.db.taskRecordModel.findById(_id).exec();
        var orders = [];
        for (var detail of taskRecord.shareDetail) {
            let user = await this.service.db.userModel.findById(detail.user).exec();
            orders.push({ user: user, money: detail.money });

        }
        res.render(`${this.VIEWDIR}/taskRecord-detail`, { taskRecord, orders });

    }

    async  taskDetail(req: Request, res: Response) {
        var task = await this.service.db.taskModel.findById(req.query._id).populate('publisher taskTag').exec()
        res.render(`${this.VIEWDIR}/task-detail`, { task });
    }
    async taskTagList(req: Request, res: Response) {
        var taskTags = await this.service.db.taskTagModel.find().exec();
        res.render(`${this.VIEWDIR}/taskTag-list`, { taskTags })
    }
    async taskTagDetail(req: Request, res: Response) {
        var taskTag = await this.service.db.taskTagModel.findById(req.query._id).exec();
        res.render(`${this.VIEWDIR}/taskTag-detail`, { taskTag });
    }
    async taskTagNewPage(req: Request, res: Response) {
        res.render(`${this.VIEWDIR}/taskTag-new`)
    }
    async taskTagNewPageDo(req: Request, res: Response) {
        let { name } = req.body;
        let newTaskTag = await new this.service.db.taskTagModel({ name }).save();
        res.redirect('/share-admin/taskTag-list');
    }
}
```