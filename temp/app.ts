import express = require('express');
import path = require('path');
var favicon = require('serve-favicon');
import logger = require('morgan');
import cookieParser = require('cookie-parser');
import session = require('express-session');
import bodyParser = require('body-parser');
import middle = require('./middle');
import nunjucks = require('nunjucks');
import service = require('./services');
import { Route } from './route';
import { Middleware } from './middleware';

import moment = require('moment');

import { ShareRoute, CommonMiddle, WechatRoute, ApiRoute } from './middle';



var app = express();

var njk = nunjucks.configure(path.resolve(__dirname, '../views'), { // 设置模板文件的目录，为views
    autoescape: true,
    express: app,
    noCache: true,
})
//
njk.addFilter('time', function (obj: Date) {
    return moment(obj).format('YYYY-MM-DD');
})
njk.addFilter('json', function (obj) {
    return JSON.stringify(obj)
})
njk.addFilter('money', function (money: number) {
    return money.toFixed(2);
})
njk.addFilter('boolean', function (ok) {
    return !!ok;
});

// app.set('trust proxy', 1) // trust first proxy 

app.use(Middleware.MiddlewareBuilder.buildMiddleware(CommonMiddle))
    // .use(express.static(path.resolve(__dirname, '../public')))
    .set('view engine', 'html')
    //app.use(favicon(path.resolve(__dirname, '../public', 'favicon.ico')));
    // .use(logger('dev'))
    // .use(bodyParser.json({ limit: '50mb' }))
    // .use(bodyParser.urlencoded({ extended: false }))
    // .use(cookieParser())
    // .use(session({
    // secret: 'keyboard cat',
    // resave: false,
    // saveUninitialized: true,
    // cookie: { maxAge: 60 * 60 * 24 * 1000 }
    // }))

    // 下面是路由
    // .use('/wechat/oauth', middle.common.wechatOauth)
    // .use('/payment', (req, res, next) => { })
    // .get('/', (req, res) => res.redirect('/share'))
    // .get('/share', middle.share.index)
    .all('/', service.wechat.wechat(service.CONFIG.wechat, (req, res, next) => {
        var parent = req.query.parent;
        console.log(req.query)
        var url = service.wechat.client.getAuthorizeURL(`${service.CONFIG.domain}/wechat/oauth` + (parent ? '?parent=' + parent : ''), '', 'snsapi_userinfo');
        res.reply({ content: url, type: 'text' });
    }))
    .use('/wechat/:action', Route.RouteBuilder.buildRoute(WechatRoute))
    .use('/share/:action', Route.RouteBuilder.buildRoute(ShareRoute))
    .use('/api/:action', Route.RouteBuilder.buildRoute(ApiRoute))

    .use((err, req, res, next) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
        console.log(err);
        // render the error page
        res.status(err.status || 500);
        res.render('error');

    });
export =app;  