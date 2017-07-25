"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var userRouter = express.Router();
exports.userRouter = userRouter;
/* GET users listing. */
userRouter.get('/', function (req, res, next) {
    res.json({ ok: true });
});
