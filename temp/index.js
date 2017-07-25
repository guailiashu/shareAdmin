var keystone = require('keystone'),
    middleware = require('./middleware/middleware'),
    wechatMiddle = require('./middleware/wechat'),
    wechat = require('wechat'),
    importRoutes = keystone.importer(__dirname); //generate 
var path = require('path');
var multer = require('multer');
var bodyParser = require('body-parser');
var Player = keystone.list('Player');
var fs = require('fs');
var config = {
    token: 'hehe',
    appid: 'wxc6f660195bab5574',
    EncodingAESKey: "mEUlvRuyzxUEKC2fzWg9JoGTtqAGbADuTyD7hbUw6lS",
    checkSignature: true // 可选，默认为true。由于微信公众平台接口调试工具在明文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
};
var Payment = require('wechat-pay').Payment;
var initConfig = {
    partnerKey: "qidaiai8qidaiai8qidaiai8qidaiai8",
    appId: config.appid,
    mchId: "1452622302",
    notifyUrl: "http://www.lianai.name/weixin/pay",
    pfx: fs.readFileSync(__dirname + '/wechat/apiclient_cert.p12')
};
var payment = new Payment(initConfig);
var payMiddleware = require('wechat-pay').middleware;



//公众号支付密钥  1ca1f6cb0e77f41518bcdc250ec606e3
var OAuth = require('wechat-oauth');
var client = new OAuth(config.appid, 'ff7de2684bea1e184a448b399b95e8cc');


// common  middleware
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);


// 404 Error Handle
keystone.set('404', function(err, req, res, next) {
    var title, message;
    if (err instanceof Error) {
        message = err.message;
        err = err.stack;
    }
    res.err(err, title, message);
});


// load routes 
var routes = {
    views: importRoutes('./views')
};

exports = module.exports = function(app) {
    app.use(bodyParser({
        limit: '50mb'
    }));
    // app.use(bodyParser.json({
    // limit: '50mb'
    // }));
    bodyParser.urlencoded({
        limit: '50mb',
        extended: true
    })



    app.use((req, res, next) => {
        res.locals.player = req.session.player || {};
        next();
    })
    app.all('/weixin/pay', payMiddleware(initConfig).getNotify().done(async function(message, req, res, next) {
        var openid = message.openid;
        var order_id = message.out_trade_no;
        var attach = {};
        try {
            attach = JSON.parse(message.attach);
        } catch (e) {};
        console.log(message);
        console.log(message.openid);
        var player = await Player.model.update({ openid: message.openid }, {
            isPay: true
        }).exec();

        /**
         * 查询订单，在自己系统里把订单标为已处理
         * 如果订单之前已经处理过了直接返回成功
         */
        res.reply('success');

        /**
         * 有错误返回错误，不然微信会在一段时间里以一定频次请求你
         * res.reply(new Error('...'))
         */
    }));


    app.all('/', wechat(config, (req, res, next) => {
        var url = client.getAuthorizeURL("http://www.lianai.name/weixin/callback/", '', 'snsapi_userinfo');
        console.log(url);
        res.reply({
            content: url,
            type: 'text'
        });
    }));
    app.use('/weixin/callback', (req, res) => {
        console.log('----weixin callback -----')
        var code = req.query.code;
        console.log(code);
        //   var User = req.model.UserModel;


        client.getAccessToken(code, async function(err, result) {
            console.dir(err);
            console.dir(result);

            var accessToken = result.data.access_token;
            var openid = result.data.openid;

            console.log('token=' + accessToken);
            console.log('openid=' + openid);
            var player = await Player.model.findOne({
                openid
            }).exec();
            if (player) {
                req.session.player = player;
                console.log('重定向player到' + player);
                res.redirect('/player');
            } else {
                /**
         * {
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
}*/
                client.getUser(openid, async function(err, result) {
                    var player = await new Player.model({
                        name: result.nickname,
                        city: result.city,
                        country: result.country,
                        avatar: result.headimgurl,
                        openid: result.openid
                    }).save();
                    console.log('保存用过户');
                    req.session.player = player;
                    res.redirect('/player');
                });
            }
        });
    });

    app.get('/player', async(req, res, next) => {

        var order = {
            body: '参加活动付费1元',
            attach: '{"活动":"费用"}',
            out_trade_no: 'kfc' + (+new Date),
            total_fee: 100,
            spbill_create_ip: req.ip,
            openid: req.session.player.openid,
            trade_type: 'JSAPI'
        };
        payment.getBrandWCPayRequestParams(order, function(err, payargs) {
            req.params.payargs = payargs;
            console.log(payargs);
            next()
        });

    }, routes.views.player.index);
    app.get('/join', routes.views.player.join);
    app.use('/wxpay/native/callback', function(msg, req, res, next) {
        // msg: 微信回调发送的数据 
        console.log('msg:' + msg);
    });
    app.get('/signup', routes.views.signup.index);
    app.post('/signup', routes.views.signup.post);
    app.get('/player/isPay', routes.views.player.isPay);
    app.post('/qrcode', async(req, res, next) => {
        console.log(req.files, req.body);
        var base64Data = req.body.imageData.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(base64Data, 'base64');
        fs.writeFile("out.png", dataBuffer, function(err) {
            if (err) {
                res.send(err);
            } else {
                res.send("保存成功！");
            }
        });
    });
    app.post('/player/scret', async(req, res, next) => {
        var action = await Player.model.findByIdAndUpdate(req.session.player._id, {
            scret: req.body.scret
        });
        res.json({ ok: true, data: action });


    })
    app.get('/person', async(req, res, next) => {
        var player = req.session.player;
        res.render('person', { player, })
    });
    app.post('/person', async(req, res, next) => {
        var player = req.body;
        var action = await Player.model.findByIdAndUpdate(req.body._id, player);
        res.redirect('/player');
    });
    app.get('/info', async(req, res, next) => {
        res.render('info', {
            player: req.session.player
        });
    })

};
// app.post('/signup', routes.views.signup.post);
// app.get('/words', routes.views.words.get);