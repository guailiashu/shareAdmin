import { db } from '../../models';
import { TaskRecord } from '../../models/TaskRecord';
export ={
    /**
     * 返还佣金
     * money 任务的奖金
     * 添加一份订单
     */
    returnMoney: async (orders: { task: string, userId: string, money: number }[], totalFee: number) => {
        for (var order of orders) {
            await db.userModel.findById(order.userId).update({ $inc: { todayMoney: order.money, totalMoney: order.money, historyMoney: order.money } }).exec();
        }
        var shareDetail = orders.map(order => { return { user: order.userId, money: order.money } });
        // 每次插入一个订单
        let taskRecord: TaskRecord = { task: order.task, shareDetail: shareDetail, totalFee: totalFee };
        // console.log(taskRecord);
        await new db.taskRecordModel(taskRecord).save();
    }
}

