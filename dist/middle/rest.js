"use strict";
const service = require("../services");
module.exports = {
    /**
     * 获取列表
     * url  :modelName
     */
    getList: async (req, res, next) => {
        var model;
        model = service.db[req.params.modelName + 'Model'];
        if (model) {
            let datas = await model.find().exec();
            res.json({
                ok: true,
                data: datas
            });
        }
        else {
            res.json({
                ok: false,
                data: '数据模型不存在'
            });
        }
    },
    getDetail: async (req, res, next) => {
        var model;
        model = service.db[req.params.modelName + 'Model'];
        if (model) {
            let data = await model.findById(req.params._id).exec();
            res.json({
                ok: true,
                data: data
            });
        }
        else {
            res.json({ ok: false, data: '该数据模型不存在' });
        }
    },
    /**
     * 添加一条数据
     * method post
     *  /:modelName
     */
    postOne: async (req, res, next) => {
        var model;
        model = service.db[req.params.modelName + 'Model'];
        if (model) {
            let newData = await new model(req.body).save();
            res.json({
                ok: true,
                data: newData
            });
        }
        else {
            res.json({ ok: true, data: '该数据模型不存在' });
        }
    },
    /**
     * 删除一条数据
     * /:modelName/:_id
     */
    deleteOne: async (req, res, next) => {
        var model;
        model = service.db[req.params.modelName + 'Model'];
        if (model) {
            let action = model.findByIdAndRemove(req.params._id).exec();
            res.json({
                ok: true,
                data: action
            });
        }
        else {
            res.json({
                ok: false,
                data: '数据模型不存在'
            });
        }
    }
};
