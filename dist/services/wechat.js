"use strict";
const config_1 = require("./config");
const WechatAPI = require('wechat-api');
var wechat = require('wechat');
const crypto = require("crypto");
var OAuth = require('wechat-oauth');
var api = new WechatAPI(config_1.CONFIG.wechat.appid, config_1.CONFIG.wechat.appsecret);
var client = new OAuth(config_1.CONFIG.wechat.appid, config_1.CONFIG.wechat.appsecret);
var wx = require('wechat-jssdk');
var Payment = require('wechat-pay').Payment;
var payment = new Payment(config_1.CONFIG.wechatPay);
class WeChatService {
    constructor() {
        this.wx = wx;
        this.client = client;
        this.wechat = wechat;
        this.payment = payment;
    }
    /**
     * 微信公众平台支付接口
     * 参数订单数据
     *
     *  {
            body: '参加活动付费1元',
            attach: '{"活动":"费用"}',
            out_trade_no: 'kfc' + (+new Date),
            total_fee: 100,
            spbill_create_ip: req.ip,
            openid: req.session.player.openid,
            trade_type: 'JSAPI'
        };
     * 返回订单json
     */
    wechatPay(order) {
        return new Promise((resovle, reject) => {
            payment.getBrandWCPayRequestParams(order, function (err, payargs) {
                if (err)
                    console.error(err);
                resovle(payargs);
            });
        });
    }
    getSDKParams(param) {
        var param = param || {
            debug: false,
            jsApiList: ['checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'onMenuShareQZone',
                'hideMenuItems',
                'showMenuItems',
                'hideAllNonBaseMenuItem',
                'showAllNonBaseMenuItem',
                'translateVoice',
                'startRecord',
                'stopRecord',
                'onVoiceRecordEnd',
                'playVoice',
                'onVoicePlayEnd',
                'pauseVoice',
                'stopVoice',
                'uploadVoice',
                'downloadVoice',
                'chooseImage',
                'previewImage',
                'uploadImage',
                'downloadImage',
                'getNetworkType',
                'openLocation',
                'getLocation',
                'hideOptionMenu',
                'showOptionMenu',
                'closeWindow',
                'scanQRCode',
                'chooseWXPay',
                'openProductSpecificView',
                'addCard',
                'chooseCard',
                'openCard'],
            url: 'http://wq8.youqulexiang.com'
        };
        return new Promise((resolve, reject) => {
            api.getJsConfig(param, (err, data) => {
                if (err)
                    console.log(err);
                resolve(data);
            });
        });
    }
    getSignature(opt) {
        return new Promise((resolve, reject) => {
            api.getTicket((err, result) => {
                if (err)
                    console.error(err);
                console.log(result, opt.url);
                var str = '';
                str += 'jsapi_ticket=' + result.ticket;
                str += '&noncestr=' + opt.noncestr;
                str += '&timestamp=' + opt.timestamp;
                str += '&url=' + opt.url;
                var sha1 = crypto.createHash('sha1');
                var signatrue = sha1.update(str).digest('hex');
                console.log(str);
                console.log(signatrue);
                resolve(signatrue);
            });
        });
    }
    async getJSSDKApiParams(opt) {
        let params = await this.getSDKParams();
        var signature = await this.getSignature({ noncestr: params['nonceStr'], timestamp: params['timestamp'], url: opt.url });
        params['signature'] = signature;
        return params;
    }
    async getAuthorizeURL(query) {
        var queryStr = `?`;
        queryStr += query.parent ? 'parent=' + query.parent : '';
        queryStr += query.taskId ? "&taskId=" + query.taskId : '';
        return client.getAuthorizeURL(`${config_1.CONFIG.domain}${config_1.CONFIG.oauthPath}${queryStr}`, '', 'snsapi_userinfo');
    }
}
module.exports = new WeChatService();
