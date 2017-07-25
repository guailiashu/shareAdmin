"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const service = require("../services");
const route_1 = require("../route");
let WechatRoute = class WechatRoute extends route_1.Route.BaseRoute {
    constructor() {
        super();
        // console.log('Wechat Service', service);
    }
    doAction(action, method, next) {
        console.log(action);
        switch (action) {
            case 'oauth':
                console.log('返回oauth');
                return this.oauth;
            case 'jssdk':
                return this.getJSSDKSignature;
            default:
                return this.notFound;
        }
    }
    after() { }
    before() { }
    oauth(req, res) {
        var code = req.query.code;
        var parent = req.query.parent;
        var taskId = req.query.taskId;
        // console.log(req.query, code);
        console.log('services', service);
        this.service.wechat.client.getAccessToken(code, (err, result) => {
            // console.dir(err);
            // console.dir(result); 
            var accessToken = result.data.access_token;
            var openid = result.data.openid;
            // console.log('token=' + accessToken);
            req.session.accessToken = accessToken;
            res.locals.accessToken = accessToken;
            console.log('openid=' + openid);
            service.wechat.client.getUser(openid, async function (err, result) {
                let user = await service.db.userModel.findOne({ openid }).exec();
                if (user) {
                    await user.update({ accessToken }).exec();
                }
                else {
                    result.accessToken = accessToken;
                    if (parent) {
                        result.parent = parent;
                        console.log('新用户的师傅是' + parent);
                        await service.db.userModel.findByIdAndUpdate(parent, { $inc: { todayStudent: 1, totalStudent: 1 } }).exec();
                    }
                    else {
                        console.log('新用户没有师傅');
                    }
                    user = await new service.db.userModel(result).save();
                }
                req.session.user = user;
                res.locals.user = user;
                // console.log('session user', req.session.user);
                if (taskId) {
                    res.redirect('/share/index');
                    // res.redirect('/task/' + taskId)
                }
                else {
                    res.redirect('/share/index?openid=' + openid);
                }
            });
        });
    }
    notFound(req, res) {
        res.render('error');
    }
    getJSSDKSignature(req, res) {
        service.wechat.wx.jssdk.getSignatureByURL(req.query.url, function (signatureData) {
            res.json(signatureData);
        });
    }
};
WechatRoute = __decorate([
    route_1.Route.Views('wechat')
], WechatRoute);
exports.WechatRoute = WechatRoute;
