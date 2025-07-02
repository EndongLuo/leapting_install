const router = require('koa-router')()
const DiagnosticsAggSaveController = require('../controllers/diagnosticsAggSave');

router.prefix('/api/log')  // 路由器前缀

// 获取 开机次数
router.get('/getBootsNumList', DiagnosticsAggSaveController.getBootsNumList);
// 获取 诊断msg
router.post('/getMessages', DiagnosticsAggSaveController.getMessages);

module.exports = router;