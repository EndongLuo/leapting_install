//通过mockjs模块实现模拟数据
import Mock from 'mockjs';

//模拟的数据需要引入进来
// import banner from './json/banner.json';
// import floor from './json/floor.json';
import tableData from './json/tableData.json';
import device from './json/device.json';
import behavior_list from './json/behavior_list.json';
import flexbe_site from './json//flexbe_site.json';
import roscfg from './json//roscfg.json';


//通过Mock对象模拟出虚拟数据
//路径当中出现/api 真实接口    /mock 模拟数据
// Mock.mock("/mock/banner",{code:200,data:banner});
// Mock.mock('/mock/floor',{code:200,data:floor});
Mock.mock("/mock/tableData", { code: 200, data: tableData });
Mock.mock("/mock/device", { code: 200, data: device });
Mock.mock("/mock/behavior_list", { code: 200, data: behavior_list });
Mock.mock("/mock/flexbe_site", { code: 200, data: flexbe_site });
Mock.mock("/mock/roscfg", { code: 200, data: roscfg });


