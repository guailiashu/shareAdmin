"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
var adminRouter = express.Router();
exports.adminRouter = adminRouter;
adminRouter.get('/', function (req, res, next) {
    res.json({ ok: true });
});
