const router = require('koa-router')()
const SiteMapController = require('../controllers/siteMap');

router.prefix('/api/siteMap')  // 路由器前缀

/**
 * @swagger
 * /api/siteMap/setSiteMap:
 *   post:
 *     summary: 创建场地与地图
 *     description: 创建场地与地图
 *     tags:
 *       - SiteMap
 *     parameters:
 *       - name: sitename
 *         in: query
 *         required: false
 *         description: 场地名称
 *         type: string
 *       - name: address
 *         in: query
 *         required: false
 *         description: 地址
 *         type: string
 *       - name: latlng
 *         in: query
 *         required: false
 *         description: 经纬度
 *         type: string
 *       - name: map
 *         in: query
 *         required: false
 *         description: 地图
 *         type: string
 *       - name: center
 *         in: query
 *         required: false
 *         description: 中心点
 *         type: string
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 */
router.post('/setSiteMap', SiteMapController.setSiteMap);


/**
 * @swagger
 * /api/siteMap/getSiteName:
 *   get:
 *     summary: 获取所有场地名称
 *     description: 获取所有场地名称
 *     tags:
 *       - SiteMap
 *     parameters:
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 */
router.post('/getSiteName', SiteMapController.getSiteName);

/**
 * @swagger
 * /api/siteMap/getSiteName:
 *   get:
 *     summary: 只获取场地名称
 *     description: 只获取场地名称
 *     tags:
 *       - SiteMap
 *     parameters:
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 */
router.post('/getSiteNameAll', SiteMapController.getSiteNameAll);
/**
 * @swagger
 * /api/siteMap/getSiteName:
 *   get:
 *     summary: 只获取场地名称
 *     description: 只获取场地名称
 *     tags:
 *       - SiteMap
 *     parameters:
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 */
router.post('/getSiteNameById', SiteMapController.getSiteNameById);

/**
 * @swagger
 * /api/siteMap/getSiteName:
 *   get:
 *     summary: 获取场地下的多个设备
 *     description: 获取场地下的多个设备
 *     tags:
 *       - SiteMap
 *     parameters:
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 */
router.post('/getMultiRobot', SiteMapController.getMultiRobot);

/**
 * @swagger
 * /api/siteMap/getSiteName:
 *   get:
 *     summary: 只获取场地名称
 *     description: 只获取场地名称
 *     tags:
 *       - SiteMap
 *     parameters:
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 */
router.post('/getSiteById', SiteMapController.getSiteById);
/**
 * @swagger
 * /api/siteMap/getSiteInfo:
 *   post:
 *     summary: 获取场地详细信息
 *     description: 获取场地详细信息
 *     tags:
 *       - SiteMap
 *     parameters:
 *       - name: siteID
 *         in: query
 *         required: false
 *         description: 场地ID
 *         type: string
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 */
router.post('/getSiteInfo', SiteMapController.getSiteInfo);

/**
 * @swagger
 * /api/siteMap/getSiteInfo:
 *   post:
 *     summary: 获取场地详细信息
 *     description: 获取场地详细信息
 *     tags:
 *       - SiteMap
 *     parameters:
 *       - name: sitename
 *         in: query
 *         required: false
 *         description: 场地名称
 *         type: string
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 */
router.post('/getMapTree', SiteMapController.getMapTree);

router.post('/getMapBlock', SiteMapController.getMapBlock);


router.post('/getUprightColumn', SiteMapController.getUprightColumn);

/**
 * @swagger
 * /api/siteMap/getMapDot:
 *   post:
 *     summary: 获取任务的点位
 *     description: 获取场地详细信息
 *     tags:
 *       - SiteMap
 *     parameters:
 *       - name: sitename
 *         in: query
 *         required: false
 *         description: 场地名称
 *         type: string
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 */
router.post('/getMapDot', SiteMapController.getMapDot);


/**
 * @swagger
 * /api/siteMap/updateSite:
 *   post:
 *     summary: 更新场地信息
 *     description: 更新场地信息
 *     tags:
 *       - SiteMap
 *     parameters:
 *       - name: sitename
 *         in: query
 *         required: false
 *         description: 场地名称
 *         type: string
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 */
router.put('/updateSite', SiteMapController.updateSite);


/**
 * @swagger
 * /api/siteMap/setSiteRobot:
 *   post:
 *     summary: 创建关联关系:场地与机器人
 *     description: 创建关联关系:场地与机器人
 *     tags:
 *       - SiteMap
 *     parameters:
 *       - name: siteId
 *         in: query
 *         required: false
 *         description: 场地ID
 *         type: string
 *       - name: robotIds
 *         in: query
 *         required: false
 *         description: 设备ID
 *         type: string
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 */
router.post('/setSiteRobot', SiteMapController.setSiteRobot);

/**
 * @swagger
 * /api/siteMap/getWindLog:
 *   post:
 *     summary: 获取风速日志
 *     description: 获取风速日志
 *     tags:
 *       - SiteMap
 *     parameters:
 *       - name: id
 *         in: query
 *         required: false
 *         description: 场地ID
 *         type: string
 *       - name: time
 *         in: query
 *         required: false
 *         description: 时间
 *         type: string
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 * */
router.post('/getWindLog', SiteMapController.getWindLog);

/**
 * @swagger
 * /api/siteMap/setWindLog:
 *   post:
 *     summary: 设置风速日志
 *     description: 设置风速日志
 *     tags:
 *       - SiteMap
 *     parameters:
 *       - name: data
 *         in: query
 *         required: false
 *         description: 数据
 *         type: string
 *     responses:
 *       200:
 *         description: 成功获取
 *       400:
 *         description: 获取失败
 * */
router.post('/setWindLog', SiteMapController.setWindLog);

module.exports = router