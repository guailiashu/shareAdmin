"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uploader_1 = require("./uploader");
const wechat_1 = require("./wechat");
exports.middleware = {
    uploader: uploader_1.uploader,
    wechatMiddle: wechat_1.wechatMiddle
};
