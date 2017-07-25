"use strict";
const express = require("express");
const path = require("path");
var favicon = require('serve-favicon');
const nunjucks = require("nunjucks");
const service = require("./services");
const route_1 = require("./route");
const middleware_1 = require("./middleware");
const moment = require("moment");
const middle_1 = require("./middle");
var app = express();
var njk = nunjucks.configure(path.resolve(__dirname, '../views'), {
    autoescape: true,
    express: app,
    noCache: true,
});
//
njk.addFilter('time', function (obj) {
    return moment(obj).format('YYYY-MM-DD');
});
njk.addFilter('json', function (obj) {
    return JSON.stringify(obj);
});
njk.addFilter('money', function (money) {
    return money.toFixed(2);
});
njk.addFilter('boolean', function (ok) {
    return !!ok;
});
njk.addFilter('myFault', function (ok) {
    return !ok;
});
// app.set('trust proxy', 1) // trust first proxy 
app.use(middleware_1.Middleware.MiddlewareBuilder.buildMiddleware(middle_1.CommonMiddle))
    .set('view engine', 'html')
    .all('/', service.wechat.wechat(service.CONFIG.wechat, (req, res, next) => {
    var parent = req.query.parent;
    console.log(req.query);
    var url = service.wechat.client.getAuthorizeURL(`${service.CONFIG.domain}/wechat/oauth` + (parent ? '?parent=' + parent : ''), '', 'snsapi_userinfo');
    res.reply({ content: url, type: 'text' });
}))
    .use('/wechat/:action', route_1.Route.RouteBuilder.buildRoute(middle_1.WechatRoute))
    .use('/api/:action', route_1.Route.RouteBuilder.buildRoute(middle_1.ApiRoute))
    .use('/share-admin/:action', route_1.Route.RouteBuilder.buildRoute(middle_1.ShareAdminRoute))
    .use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    console.log(err);
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
module.exports = app;
