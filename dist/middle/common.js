"use strict";
const service = require("../services");
const fs = require("fs");
const path = require("path");
var wx = require('wechat-jssdk');
// wx.initialize(service.CONFIG.jssdk);
var wechat = require('wechat');
var OAuth = require('wechat-oauth');
var client = new OAuth(service.CONFIG.wechat.appid, service.CONFIG.wechat.appsecret);
module.exports = {
    /**
     * 404 Not Found 默认页面
     */
    notFound: (req, res, next) => {
        var err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    },
    crossDomain: (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        /让options请求快速返回/;
        req.method == 'OPTIONS' ? res.send(200) : next();
    },
    /**
     * 微信授权登录,重定向到 /?openid=${openid}
     *
     */
    wechatOauth: (req, res) => {
        var code = req.query.code;
        var parent = req.query.parent;
        var taskId = req.query.taskId;
        // console.log(req.query, code);
        client.getAccessToken(code, (err, result) => {
            // console.dir(err);
            // console.dir(result);
            var accessToken = result.data.access_token;
            var openid = result.data.openid;
            // console.log('token=' + accessToken);
            req.session.accessToken = accessToken;
            res.locals.accessToken = accessToken;
            console.log('openid=' + openid);
            client.getUser(openid, async function (err, result) {
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
                    res.redirect('/task/' + taskId);
                }
                else {
                    res.redirect('/share/?openid=' + openid);
                }
            });
        });
    },
    /**
     *  微信授权登陆
     * 两种方式进入
     * ?参数有 parent 则是重定向到oauth并附带parent 进行拜师注册
     * 没有parent 则重定向 oauth   并注册
     * 已注册的则自动登陆
     */
    replyAuthUrl: wechat(service.CONFIG.wechat, (req, res, next) => {
        var parent = req.query.parent;
        var url = client.getAuthorizeURL(`${service.CONFIG.domain}/wechat/oauth` + (parent ? '?parent=' + parent : ''), '', 'snsapi_userinfo');
        res.reply({ content: url, type: 'text' });
    }),
    /**
     * 上传文件 测试接口
     */
    uploadBase64: async (req, res, next) => {
        let base64 = req.body.base64;
        function uploadFile(file, filename) {
            return new Promise((resolve, reject) => {
                if (file.indexOf('base64,') != -1) {
                    file = file.substring(file.indexOf('base64,') + 7);
                }
                let randomFilename = new Date().getTime() + filename;
                let distpath = path.resolve(__dirname, '../../public/upload/' + randomFilename);
                fs.writeFile(distpath, new Buffer(file, 'base64'), (err) => {
                    err ? resolve(false) : resolve('/upload/' + randomFilename);
                });
            });
        }
        let url = await uploadFile(base64, req.body.filename || 'test.png');
        res.json({ ok: true, data: service.CONFIG.IP + url });
    },
    /**错误显示的页面  */
    errorHandler: (err, req, res, next) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        console.log(err);
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    },
    storeUser: (req, res, next) => {
        if (req.session.user) {
            // console.log('session user:', req.session.user);
            res.locals.user = req.session.user;
        }
        if (req.session.accessToken) {
            res.locals.accessToken = req.session.accessToken;
        }
        next();
    },
    /**
     * jssdk
     */
    getJSSDKSignature: function (req, res) {
        wx.jssdk.getSignatureByURL(req.query.url, function (signatureData) {
            res.json(signatureData);
        });
    }
};
