"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route_1 = require("../route");
class CommonRoute extends route_1.Route.BaseRoute {
    doAction(action, method) {
        return this.wechat;
    }
    wechat(req, res) {
    }
}
exports.CommonRoute = CommonRoute;
