
import express = require('express');
import service = require('./services');
var VIEWPATH = Symbol('VIEWPATH');
export type Request = express.Request;
export type Response = express.Response;
export type RequestHandler = express.RequestHandler;

function clone(origin) {
    let originProto = Object.getPrototypeOf(origin);
    return Object.assign(Object.create(originProto), origin);
}


export namespace Route {
    export type Request = express.Request;
    export type Response = express.Response;
    export type RequestHandler = express.RequestHandler;

    export interface IRoute {
        req: Request;
        res: Response;

        /**
         * 请求之前的中间件
         */
        before: RequestHandler;
        /**
         * 请求之后的中间件
         */
        after: RequestHandler;
        doAction: (action: string, method: string, next: RequestHandler) => RequestHandler;
    }


    export class BaseRoute extends Object {
        GET = 'get';
        POST = 'post';
        DELETE = 'delete';
        PUT = 'put';
        isGet: boolean;
        isPost: boolean;
        public service = service;
        public db = service.db;
        public CONFIG = service.CONFIG;
        res: Response;
        req: Request;
        next: express.NextFunction;
        render: (filename: string, data?: any) => void;
        doAction(action, method, next) {
            return next;
        }

        constructor() {
            super();
        }

    }


    /**
     * 
     * 装饰器
     * 如 @Views('project-manage-admin')　
     * 在 ProjectManageAdmin上后,调用 this.render('index')自动渲染视图文件夹views下的project-manage-admin/index.html
     * 
     * 
     */
    export function Views(path: string) {
        return (target: new () => BaseRoute) => {
            target.prototype[VIEWPATH] = path;
        };
    }


    export class RouteBuilder {
        /** 
         * 
         * 构建路由
         */
        static buildRoute(routeClass: new () => BaseRoute & IRoute): RequestHandler[] {
            var route = new routeClass();
            var ctrl = {
                service: service,
                CONFIG: service.CONFIG,
                db: service.db,
                GET: 'get',
                POST: 'POST',
            }

            return [
                //before
                (req, res, next) => {
                    let temp = Object.assign({}, ctrl, { req, res, next, render: (filename, data) => res.render(`${route[VIEWPATH]}/${filename}`, data) });
                    route.before.bind(temp)(req, res, next)
                },
                (req: Request, res: Response, next: RequestHandler) => {
                    let temp = Object.assign({}, ctrl, { req, res, next, render: (filename, data) => res.render(`${route[VIEWPATH]}/${filename}`, data) });
                    route.doAction(req.params.action, req.method.toLowerCase(), next).bind(temp)(req, res, next);
                }, (req, res, next) => {
                    let temp = Object.assign({}, ctrl, { req, res, next, render: (filename, data) => res.render(`${route[VIEWPATH]}/${filename}`, data) });
                    route.after.bind(temp)(req, res, next);
                }];
        }
        static buildMiddle(): RequestHandler[] {
            return;

        }

    }
}