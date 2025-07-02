  
  const DiagnosticsAggSaveModel = require('../models/diagnosticsAggSave')

  class DiagnosticsAggSaveController{
    
    /**
     * 获取 诊断信息储存表 开机次数
     * @param {*} ctx 
     */
    static async getBootsNumList(ctx) {
        try {
        var res = await DiagnosticsAggSaveModel.getBootsNumList();
        if (res) {
            console.log('获取 诊断信息储存表-开机次数数组 成功');
            ctx.body = { code: 200, msg: '获取 诊断信息储存表-开机次数数组 成功', data: res };
        } else {
            ctx.body = { code: 400, msg: '获取 诊断信息储存表-开机次数数组 失败' };
        }
        } catch (error) {
            console.error('获取 诊断信息储存表-开机次数数组 错误', error);
            ctx.body = { code: 500, msg: '获取 诊断信息储存表-开机次数数组 错误' };
        }
    }

    /**
     * @description 获取 诊断信息储存表-选择时间段内msg
     * @param {*} ctx 
     */
    static async getMessages(ctx) {
        try {
            const { bootsNumber, selectdTime } = ctx.request.body;
            
            console.log(ctx.query);
            
            var res = await DiagnosticsAggSaveModel.getMessages(bootsNumber, selectdTime);
            if (res) {
                console.log('获取 诊断信息储存表-选择时间段内msg 成功');
                ctx.body = { code: 200, msg: '获取 诊断信息储存表-选择时间段内msg 成功', data: res };
            } else {
                ctx.body = { code: 400, msg: '获取 诊断信息储存表-选择时间段内msg 失败' };
            }
        } catch (error) {
            console.error('获取 诊断信息储存表-选择时间段内msg 错误', error);
            ctx.body = { code: 500, msg: '获取 诊断信息储存表-选择时间段内msg 错误' };
        }
    }
  }

  module.exports = DiagnosticsAggSaveController;
  