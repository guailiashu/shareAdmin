"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const config_1 = require("../config");
var wechat = require('wechat');
var youquRouter = express.Router();
exports.youquRouter = youquRouter;
youquRouter.get('/wechat', wechat(config_1.CONFIG, (req, res, next) => {
    var message = req.weixin;
    res.reply('hehe');
}));
