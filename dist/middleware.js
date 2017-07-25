"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service = require("./services");
var Middleware;
(function (Middleware) {
    class BaseMiddleware {
        constructor() {
            this.service = service;
        }
    }
    Middleware.BaseMiddleware = BaseMiddleware;
    class MiddlewareBuilder {
        static buildMiddleware(middlewareClass) {
            let middle = new middlewareClass();
            return middle.buildMiddlewares();
        }
    }
    Middleware.MiddlewareBuilder = MiddlewareBuilder;
})(Middleware = exports.Middleware || (exports.Middleware = {}));
