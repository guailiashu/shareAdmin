"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const express = require("express");
var restRouter = express.Router();
exports.restRouter = restRouter;
//获取列表
restRouter.get('/:modelName', async (req, res, next) => {
    var model;
    model = models_1.db[req.params.modelName + 'Model'];
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
});
// 获取详细信息
restRouter.get('/:modelName/:_id', async (req, res, next) => {
    var model;
    model = models_1.db[req.params.modelName + 'Model'];
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
});
// 添加一条数据
restRouter.post('/:modelName', async (req, res, next) => {
    var model;
    model = models_1.db[req.params.modelName + 'Model'];
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
});
//删除一条数据
restRouter.delete('/:modelName/:_id', async (req, res, next) => {
    var model;
    model = models_1.db[req.params.modelName + 'Model'];
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
});
