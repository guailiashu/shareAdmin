import { Route } from '../route';
import mongoose = require('mongoose');
import path = require('path');
import fs = require('fs');
export class ApiRoute extends Route.BaseRoute implements Route.IRoute {
    doAction(action: string, method: string, next: Route.RequestHandler) {
        switch (action) {
            case 'uploadBase64':
                return this.uploadBase64
        }
    }
    constructor() {
        super();
    }
    after() { }
    before() { }

    async  uploadBase64(req: Route.Request, res: Route.Response) {
        let base64 = req.body.base64;
        var ctrl = this;
        function uploadFile(file, filename) {
            return new Promise((resolve, reject) => {
                if (file.indexOf('base64,') != -1) {
                    file = file.substring(file.indexOf('base64,') + 7);
                }
                let randomFilename = new Date().getTime() + filename;
                let distpath = path.resolve(ctrl.service.CONFIG.uploadDir + '/' + randomFilename);

                fs.writeFile(distpath, new Buffer(file, 'base64'), (err) => {
                    err ? resolve(false) : resolve('/upload/' + randomFilename);
                });
            })
        }
        let url = await uploadFile(base64, req.body.filename || 'test.png');
        res.json({ ok: true, data: this.service.CONFIG.IP + url });

    }

    /**
     * 
     * @param req 
     * @param res 
     * @param next 
     */
    async getList(req, res, next) {
        var model: mongoose.Model<mongoose.Document>;
        model = this.service.db[req.params.modelName + 'Model'];

        if (model) {
            let datas = await model.find().exec();
            res.json({
                ok: true,
                data: datas
            });
        } else {
            res.json({
                ok: false,
                data: '数据模型不存在'
            })
        }
    }

    async getDetail(req, res, next) {
        var model: mongoose.Model<mongoose.Document>;
        model = this.service.db[req.params.modelName + 'Model'];

        if (model) {
            let data = await model.findById(req.params._id).exec();
            res.json({
                ok: true,
                data: data
            });
        } else {
            res.json({ ok: false, data: '该数据模型不存在' })
        }
    }
    /**
     * 添加一条数据
     * method post
     *  /:modelName
     */
    async postOne(req, res, next) {
        var model: mongoose.Model<mongoose.Document>;
        model = this.service.db[req.params.modelName + 'Model'];
        if (model) {

            let newData = await new model(req.body).save();
            res.json({
                ok: true,
                data: newData
            });
        } else {
            res.json({ ok: true, data: '该数据模型不存在' });
        }

    }
    /**
     * 删除一条数据
     * /:modelName/:_id
     */
    async deleteOne(req, res, next) {
        var model: mongoose.Model<mongoose.Document>;
        model = this.service.db[req.params.modelName + 'Model'];
        if (model) {
            let action = model.findByIdAndRemove(req.params._id).exec();
            res.json({
                ok: true,
                data: action
            })
        } else {
            res.json({
                ok: false,
                data: '数据模型不存在'
            });
        }
    }
}