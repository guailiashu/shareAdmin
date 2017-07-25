"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const middleware_1 = require("../middleware");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const logger = require("morgan");
class CommonMiddle extends middleware_1.Middleware.BaseMiddleware {
    buildMiddlewares() {
        var middlewares = [];
        for (var dir of this.service.CONFIG.publicDirs) {
            middlewares.push(this.staticServer(dir));
        }
        middlewares.push(logger('dev'));
        middlewares.push(bodyParser.json({ limit: '50mb' }));
        middlewares.push(bodyParser.urlencoded({ extended: false }));
        middlewares.push(session({
            secret: 'keyboard cat',
            // resave: false,
            // saveUninitialized: true,
            cookie: { maxAge: 60 * 60 * 24 * 1000 }
        }));
        middlewares.push(cookieParser());
        middlewares.push(this.storeUser);
        return middlewares;
    }
    constructor() {
        super();
    }
    crossDomain(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        /让options请求快速返回/;
        req.method == 'OPTIONS' ? res.send(200) : next();
    }
    /**
     *
     * 静态文件服务器
     */
    staticServer(aboPath) {
        return express.static(aboPath);
    }
    /**
     * 本地缓存用户数据
     * @param req
     * @param res
     * @param next
     */
    storeUser(req, res, next) {
        if (req.session.user) {
            // console.log('session user:', req.session.user);
            res.locals.user = req.session.user;
        }
        if (req.session.accessToken) {
            res.locals.accessToken = req.session.accessToken;
        }
        if (req.session.admin) {
            res.locals.admin = req.session.admin;
        }
        req.session.path = res.locals.path = req.path;
        console.log(req.path);
        next();
    }
    errorHandle(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        console.log(err);
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    }
    replyAuthUrl() {
        return this.service.wechat.wechat(this.service.CONFIG.wechat, (req, res, next) => {
            var parent = req.query.parent;
            var url = this.service.wechat.client.getAuthorizeURL(`${this.service.CONFIG.domain}/wechat/oauth` + (parent ? '?parent=' + parent : ''), '', 'snsapi_userinfo');
            res.reply({ content: url, type: 'text' });
        });
    }
}
exports.CommonMiddle = CommonMiddle;
