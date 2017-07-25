"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
/*
    /* {
"openid": "OPENID",
"nickname": "NICKNAME",
"sex": "1",
"province": "PROVINCE"
"city": "CITY",
"country": "COUNTRY",
"headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
"privilege": [
  "PRIVILEGE1"
  "PRIVILEGE2"
]
}
*/
exports.userModel = mongoose.model('User', new mongoose.Schema({
    //微信数据
    nickname: String,
    openid: String,
    avatar: String,
    sex: Number,
    city: String,
    language: String,
    province: String,
    country: String,
    headimgurl: String,
    privilege: [String],
    // access_token
    accessToken: String,
    // 师傅
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
    // 注册日期
    createDt: { type: Date, default: Date.now },
    //余额
    totalMoney: { type: Number, default: 0.00 },
    // 今日盈利
    todayMoney: { type: Number, default: 0 },
    historyMoney: { type: Number, default: 0 },
    todayStudent: { type: Number, default: 0 },
    totalStudent: { type: Number, default: 0 },
    visitTasks: { type: [mongoose.Schema.Types.ObjectId], ref: 'Task' },
    //详细信息
    qq: { type: String, default: '' },
    phone: { type: String, default: '' },
    weixinId: { type: String, default: '' },
    isFinish: { type: Boolean, default: false }
}));
