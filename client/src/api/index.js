// import requests from '@/utils/Ajax';
import mockRequests from '@/utils/mockAjax';



// mock虚拟信息
export const reqTableData = () => mockRequests.get('/tableData');
export const reqDevice = () => mockRequests.get('/device');
export const reqBehaviorList = () => mockRequests.get('/behavior_list');
export const reqFlexbeSite = () => mockRequests.get('/flexbe_site');
export const reqRoscfg = () => mockRequests.get('/roscfg');
// export const reqBannerList = () => mockRequests.get('/banner');
// export const reqFloorList = () => mockRequests.get('/floor');

// 搜索信息
// export const reqSearchInfo = data => requests.post('/list', data);
// 三级联动接口
// /api/product/getBaseCategoryList get请求 无参数
// export const reqCategoryList = () =>
//   requests.get('/product/getBaseCategoryList');