"use strict";
const service = require("../services");
module.exports = {
    /**
     * 分享赚钱的首页
     */
    index: async (req, res) => {
        let { taskTag, openid } = req.query;
        taskTag = taskTag ? taskTag : false;
        let user = req.session.user;
        console.log('user', user);
        if (openid) {
            console.log('openid :', openid);
            user = await service.db.userModel.findOne({ openid }).exec();
        }
        let taskTags = await service.db.taskTagModel.find().exec();
        let tasks = [];
        if (taskTag) {
            tasks = await service.db.taskModel.find({ taskTag }).limit(100).exec();
        }
        else {
            tasks = await service.db.taskModel.find().limit(100).exec();
        }
        await res.render('share/index', { taskTag, tasks, taskTags, user });
    },
    recruitStudent: async (req, res) => {
        var user = req.session.user;
        var authUrl = await service.wechat.getAuthorizeURL({ parent: req.session.user._id.toString() });
        await res.render('share/recruit-student', { authUrl, user });
    },
    /**个人中心 */
    personCenter: async (req, res) => {
        let user = req.session.user;
        user = await service.db.userModel.findById(user._id.toString()).exec();
        console.log(user);
        res.render('share/person-center', {
            user
        });
    },
    /**完善信息 */
    fullInfoPage: (req, res) => {
        res.render('share/full-info');
    },
    fixFullInfo: async (req, res) => {
        let { qq, phone, weixinId } = req.body;
        await service.db.userModel.findById(req.session.user._id.toString()).update({ qq, phone, weixinId, isFinish: true }).exec();
        res.redirect('/share/person-center');
    },
    /**文章详情页面 */
    detail: (req, res) => {
        res.render('share/detail');
    },
    publishPage: async (req, res) => {
        let taskTags = await service.db.taskTagModel.find().exec();
        res.render('share/publish', { taskTags });
    },
    /**商户中心 */
    shopCenter: async (req, res) => {
        var tasks = await service.db.taskModel.find({ publisher: req.session.user._id.toString() }).exec();
        let activeNum = tasks.filter(task => task.active).length;
        var totalClickNum = 0;
        var totalFee = 0;
        tasks.forEach(task => {
            totalClickNum += task.clickNum || 0;
            totalFee += task.totalMoney || 0;
        });
        res.render('share/shop-center', {
            user: req.session.user,
            allTaskNum: tasks.length,
            activeNum,
            totalClickNum,
            totalFee
        });
    },
    /**
     * 检查openid是否存在,若用户已经存在,则登陆,若用户不存在,则创建新用户
     * 若有上级parentId存在则作为用户的师傅
     */
    checkOpenIdExisit: (req, res) => {
    },
    publishTask: async (req, res) => {
        let { title, content, imageUrl, taskTag, shareMoney, totalMoney, websiteUrl } = req.body;
        let newTask = await new service.db.taskModel({ title, taskTag, content, imageUrl, totalMoney, fee: totalMoney, shareMoney, websiteUrl, publisher: req.session.user._id.toString(), active: true, msg: '审核通过' }).save();
        res.redirect('/share');
    },
    payTaskMoney: async (req, res) => {
        let ip = req.ip.indexOf('::ffff:') == 0 ? req.ip.substring(req.ip.indexOf('::ffff:') + 7) : req.ip;
        console.log(ip);
        var payargs = await service.wechat.wechatPay({
            body: '支付活动费用',
            spbill_create_ip: ip,
            openid: req.session.user.openid,
            trade_type: 'JSAPI',
            total_fee: req.body.totalMoney * 100, attach: '任务费用', out_trade_no: 'kfc' + (+new Date)
        });
        res.json({ ok: true, data: payargs });
    },
    taskDetail: async (req, res) => {
        var taskId = req.params._id;
        // 如果是
        var user = req.session.user;
        // 若不是注册的用户 , 则跳转到登陆页面, 并转载parent,taskId, 该用户会自动注册,拜师,然后返回这个任务做任务
        if (!user) {
            var url = await service.wechat.getAuthorizeURL({ parent: req.query._id, taskId: req.params._id });
            res.redirect(url);
        }
        else {
            var params = await service.wechat.getJSSDKApiParams({ url: 'http://' + req.hostname + req.originalUrl });
            var userId = req.session.user._id.toString();
            let task = await service.db.taskModel.findById(taskId).exec();
            // let user = await service.db.userModel.findById(userId).populate('parent').exec();;
            var isHaveVisited = task.users.some(visitedUser => {
                return user._id.toString() == visitedUser;
            });
            // 新的观看的人 
            if (!isHaveVisited) {
                // 任务算新点击一次
                await task.update({ $inc: { clickNum: 1 } }).exec();
                user = await service.db.userModel.findById(req.session.user._id).exec();
                // 任务 增加点击数量,ip访问数量,任务消耗数量, 
                /**
                 *
                 *
                 * 钱不够的情况下,不会有任何奖励,并且取消任务的活跃状态
                 */
                if (task.totalMoney - task.shareMoney < 0) {
                    await task.update({ $set: { active: false } }).exec();
                }
                else {
                    task.update({ $inc: { clickNum: 1 }, $push: { users: user._id.toString() }, $set: { totalMoney: task.totalMoney - task.shareMoney } }).exec();
                    //发布任务的人获得奖金 上级 5%   上上级 10% 上上上级 15%
                    var taskAllMoney = task.shareMoney;
                    if (user) {
                        var parents = [];
                        /**
                         * 有师傅
                         */
                        if (user.parent) {
                            // 有师傅
                            user.populate('parent').execPopulate();
                            console.log('第一位师傅id:', user.parent);
                            parents.push(user.parent);
                            if (user.parent.parent) {
                                parents.push(user.parent.parent);
                                await user.parent.populate('parent').execPopulate();
                                console.log('第二级师傅id:', user.parent.parent);
                                if (user.parent.parent.parent) {
                                    console.log('第三为师傅id:', user.parent.parent);
                                    parents.push(user.parent.parent.parent);
                                }
                            }
                            console.log(parents.length + '位师傅');
                            switch (parents.length) {
                                // 一个师傅都没有
                                case 0:
                                    console.log('一个师傅都没有');
                                    // await user.update({ $inc: { totalMoney: taskAllMoney, todayMoney: taskAllMoney, historyMoney: taskAllMoney } }).exec();
                                    await service.dbDo.returnMoney([{ userId: req.session.user._id.toString(), money: taskAllMoney, task: req.params._id }]);
                                    break;
                                case 1://5%
                                    console.log('一位师傅开始返利');
                                    let firstParent = parents[0];
                                    //第一个人
                                    let firstMoney = taskAllMoney * 0.05;
                                    // 余额
                                    taskAllMoney = taskAllMoney * 0.95;
                                    // 
                                    await service.db.userModel.findById(firstParent).update({ $inc: { totalMoney: firstMoney, todayMoney: firstMoney, historyMoney: firstMoney } }).exec();
                                    // await user.update({ $inc: { todayMoney: taskAllMoney, totalMoneyMoney: taskAllMoney, historyMoney: taskAllMoney } }).exec();
                                    await service.dbDo.returnMoney([
                                        { userId: firstParent, money: firstMoney, task: taskId },
                                        { userId: userId, money: taskAllMoney, task: taskId }
                                    ]);
                                    break;
                                //两个师傅  5% 10%     本人 85%
                                case 2:
                                    let oneParent = parents[0];
                                    let twoParent = parents[1];
                                    let oneMoney = 0.05 * taskAllMoney;
                                    let twoMoney = 0.10 * taskAllMoney;
                                    // 余额
                                    taskAllMoney *= 0.85;
                                    // await service.db.userModel.findByIdAndUpdate(oneParent._id.toString(), { $inc: { totalMoney: oneMoney, todayMoney: oneMoney, historyMoney: oneMoney } }).exec();
                                    // await service.db.userModel.findByIdAndUpdate(twoParent._id.toString(), { $inc: { totalMoney: twoMoney, todayMoney: twoMoney, historyMoney: twoMoney } }).exec();
                                    // await user.update({ $inc: { totalMoney: taskAllMoney, todayMoney: taskAllMoney, historyMoney: taskAllMoney } }).exec();
                                    await service.dbDo.returnMoney([
                                        { money: oneMoney, task: taskId, userId: oneParent },
                                        { money: twoMoney, task: taskId, userId: twoParent },
                                        { money: taskAllMoney, task: taskId, userId: userId }
                                    ]);
                                    break;
                                case 3:
                                    let iParent = parents[0];
                                    let iiParent = parents[1];
                                    let iiiParent = parents[2];
                                    let iMoney = 0.05 * taskAllMoney;
                                    let iiMoney = 0.10 * taskAllMoney;
                                    let iiiMoney = 0.15 * taskAllMoney;
                                    // 余额
                                    taskAllMoney *= 0.70;
                                    // await service.db.userModel.findByIdAndUpdate(iParent._id.toString(), { $inc: { totalMoney: iMoney, todayMoney: iMoney, historyMoney: iMoney } }).exec();
                                    // await service.db.userModel.findByIdAndUpdate(iiParent._id.toString(), { $inc: { totalMoney: iiMoney, todayMoney: iiMoney, historyMoney: iiMoney } }).exec();
                                    // await service.db.userModel.findByIdAndUpdate(iiiParent._id.toString(), { $inc: { totalMoney: iiiMoney, todayMoney: iiiMoney, historyMoney: iiiMoney } }).exec();
                                    // await service.db.userModel.findByIdAndUpdate(user._id.toString(), { $inc: { totalMoney: taskAllMoney, todayMoney: taskAllMoney, historyMoney: taskAllMoney } }).exec();
                                    await service.dbDo.returnMoney([
                                        { task: taskId, userId: iParent, money: iMoney },
                                        { task: taskId, userId: iiParent, money: iiMoney },
                                        { task: taskId, userId: iiiParent, money: iiiMoney },
                                        { task: taskId, userId, money: taskAllMoney }
                                    ]);
                                    break;
                            }
                        }
                    }
                }
            }
            else {
                console.log('已经访问过了');
            }
            /**
             * 若有推广人
             */
            await res.render('share/detail', { task, params });
        }
    },
    studentMoney: async (req, res) => {
        var user = req.session.user;
        res.render('share/student-money', {
            user
        });
    },
    myMoney: async (req, res) => {
        res.render('share/myMoney', {});
    },
    getMoney: async (req, res) => {
        res.render('share/getMoney', { user: req.session.user });
    },
    guide: async (req, res) => {
        res.render('share/guide', {});
    },
    taskList: async (req, res) => {
        var active = !req.query.active;
        let tasks = [];
        if (active) {
            tasks = await service.db.taskModel.find({ publisher: req.session.user._id.toString() }).exec();
        }
        else {
            tasks = await service.db.taskModel.find({ publisher: req.session.user._id.toString(), active: true }).exec();
        }
        res.render('share/task-list', { tasks });
    },
    /**钱的记录 */
    getMoneyRecord: (req, res) => {
        res.render('share/get-money-record', { user: req.session.user });
    },
    fansMoney: async (req, res) => {
        res.render('share/fans-money', { user: req.session.user, });
    },
    moneyLog: async (req, res) => {
        res.render('share/money-log', {});
    }
};
