"use strict";
const config_1 = require("./config");
const models_1 = require("../models");
const wechat = require("./wechat");
const tools = require("./tools");
const dbDo = require("./dbDo");
module.exports = {
    CONFIG: config_1.CONFIG,
    db: models_1.db,
    wechat,
    tools,
    dbDo
};
