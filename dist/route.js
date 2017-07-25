"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service = require("./services");
var VIEWPATH = Symbol('VIEWPATH');
function clone(origin) {
    let originProto = Object.getPrototypeOf(origin);
    return Object.assign(Object.create(originProto), origin);
}
var Route;
(function (Route) {
    class BaseRoute extends Object {
        constructor() {
            super();
            this.GET = 'get';
            this.POST = 'post';
            this.DELETE = 'delete';
            this.PUT = 'put';
            this.service = service;
            this.db = service.db;
            this.CONFIG = service.CONFIG;
        }
        doAction(action, method, next) {
            return next;
        }
    }
    Route.BaseRoute = BaseRoute;
    /**
     *
     * 装饰器
     * 如 @Views('project-manage-admin')
     * 在 ProjectManageAdmin上后,调用 this.render('index')自动渲染视图文件夹views下的project-manage-admin/index.html
     *
     *
     */
    function Views(path) {
        return (target) => {
            target.prototype[VIEWPATH] = path;
        };
    }
    Route.Views = Views;
    class RouteBuilder {
        /**
         *
         * 构建路由
         */
        static buildRoute(routeClass) {
            var route = new routeClass();
            var ctrl = {
                service: service,
                CONFIG: service.CONFIG,
                db: service.db,
                GET: 'get',
                POST: 'POST',
            };
            return [
                //before
                (req, res, next) => {
                    let temp = Object.assign({}, ctrl, { req, res, next, render: (filename, data) => res.render(`${route[VIEWPATH]}/${filename}`, data) });
                    route.before.bind(temp)(req, res, next);
                },
                (req, res, next) => {
                    let temp = Object.assign({}, ctrl, { req, res, next, render: (filename, data) => res.render(`${route[VIEWPATH]}/${filename}`, data) });
                    route.doAction(req.params.action, req.method.toLowerCase(), next).bind(temp)(req, res, next);
                }, (req, res, next) => {
                    let temp = Object.assign({}, ctrl, { req, res, next, render: (filename, data) => res.render(`${route[VIEWPATH]}/${filename}`, data) });
                    route.after.bind(temp)(req, res, next);
                }
            ];
        }
        static buildMiddle() {
            return;
        }
    }
    Route.RouteBuilder = RouteBuilder;
})(Route = exports.Route || (exports.Route = {}));
