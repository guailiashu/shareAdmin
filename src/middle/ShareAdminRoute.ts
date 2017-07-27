import service = require('../services');
import { Route } from '../route';

@Route.Views('wechat')
export class WechatRoute extends Route.BaseRoute implements Route.IRoute {
    doAction(action: string, method: string, next: Route.RequestHandler) {
        console.log(action);
        switch (action) {
            case 'oauth':
                console.log('返回oauth')
                return this.oauth;
            case 'jssdk':
                return this.getJSSDKSignature;
            default:
                return this.notFound;
        }
    }

    after() { }
    before() { }

    constructor() {
        super();
        // console.log('Wechat Service', service);
    }

    oauth(req: Route.Request, res: Route.Response) {
        var code = req.query.code;
        var parent = req.query.parent;
        var taskId = req.query.taskId;
        // console.log(req.query, code);
        console.log('services', service);
        this.service.wechat.client.getAccessToken(code, (err, result) => {
            // console.dir(err);
            // console.dir(result); 
            var accessToken = result.data.access_token;
            var openid = result.data.openid;
            // console.log('token=' + accessToken);
            req.session.accessToken = accessToken;
            res.locals.accessToken = accessToken;

            console.log('openid=' + openid);
            service.wechat.client.getUser(openid, async function (err, result) {
                let user = await service.db.userModel.findOne({ openid }).exec();
                if (user) {
                    await user.update({ accessToken }).exec();
                } else {
                    result.accessToken = accessToken;
                    if (parent) {
                        result.parent = parent;
                        console.log('新用户的师傅是' + parent);
                        await service.db.userModel.findByIdAndUpdate(parent, { $inc: { todayStudent: 1, totalStudent: 1 } }).exec();
                    } else {
                        console.log('新用户没有师傅')
                    }
                    user = await new service.db.userModel(result).save();
                }
                req.session.user = user;
                res.locals.user = user;
                // console.log('session user', req.session.user);
                if (taskId) {
                    res.redirect('/share/index')
                    // res.redirect('/task/' + taskId)
                } else {
                    res.redirect('/share/index?openid=' + openid);
                }
            });
        });
    }
    notFound(req, res) {
        res.render('error')
    }

    getJSSDKSignature(req, res) {
        service.wechat.wx.jssdk.getSignatureByURL(req.query.url, function (signatureData) {
            res.json(signatureData);
        });
    }

}
