import express = require('express');
import service = require('./services');


export namespace Middleware {
    export type Request = express.Request;
    export type Response = express.Response;
    export type RequestHandler = express.RequestHandler;

    export interface IMiddleware {
        buildMiddlewares(): RequestHandler[];
    }

    export abstract class BaseMiddleware implements IMiddleware {
        service = service;
        abstract buildMiddlewares(): RequestHandler[];
    }

    export class MiddlewareBuilder {
        static buildMiddleware(middlewareClass: new () => BaseMiddleware): RequestHandler[] {
            let middle = new middlewareClass();
            return middle.buildMiddlewares();
        }
    }

}