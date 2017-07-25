"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
var wechat = require('wechat');
var OAuth = require('wechat-oauth');
var client = new OAuth(config_1.CONFIG.wechat.appid, config_1.CONFIG.wechat.appsecret);
exports.wechatMiddle = {
    replyAuthUrl: wechat(config_1.CONFIG.wechat, (req, res, next) => {
        var url = client.getAuthorizeURL(`http://wq8.youqulexiang.com/wechat/oauth`, '', 'snsapi_userinfo');
        res.reply({
            content: url,
            type: 'text'
        });
    }),
};
