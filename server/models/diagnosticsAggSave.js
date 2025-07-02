const { DiagnosticsAggSave } = require('../schema/index');
const { sequelize } = require("../config/db");
const { Op } = require("sequelize");
class DiagnosticsAggSaveModel {

    /**
     * @description 获取 诊断信息存储表 开机次数数组和对应时间段
     * @returns array
     */
    static async getBootsNumList(){
        try {
            const results = await DiagnosticsAggSave.findAll({
            attributes: [
                'boots_number',
                [sequelize.fn('MIN', sequelize.col('create_time')), 'minTime'], 
                [sequelize.fn('MAX', sequelize.col('create_time')), 'maxTime']
            ],
            group: ['boots_number'],
            order: [['boots_number', 'ASC']] // 按 num 升序排序
            });

            return results.map(item => ({
                num: item.boots_number,
                minTime: item.getDataValue('minTime'),
                maxTime: item.getDataValue('maxTime')
            }));
        } catch (error) {
            console.error('查询诊断信息储存表-开机次数数组失败:', error);
            throw error;
        }
    }

    /**
     * @description 获取选定时间段内的数据
     * @param {*} bootsNumber 开机次数
     * @param {*} selectdTime 选定时间段
     */
    static async getMessages(bootsNumber, selectdTime){
        try{
            const records = await DiagnosticsAggSave.findAll({
                attributes: ['message', 'create_time'],
                where: {
                    'boots_number': bootsNumber,
                    'create_time': { [Op.between]: selectdTime }
                },
                order: [['create_time', 'ASC']] // 按时间顺序排列
            });
            return records;
        } catch (error) {
            console.error('查询诊断信息储存表-选择时间段内msg失败:', error);
            throw error;
        }
    }

}

module.exports = DiagnosticsAggSaveModel;