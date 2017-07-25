"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("../route");
class UserRoute extends route_1.BaseRoute {
    doAction(action, method) {
        switch (action) {
            default:
                return method == this.GET ? this.index : this.index;
        }
    }
    index(req, res) {
        res.header('x-response-time', new Date().getTime() + 'ms');
        this.loop(req, res);
    }
    loop(req, res) {
        res.end('hello23');
    }
}
exports.UserRoute = UserRoute;
