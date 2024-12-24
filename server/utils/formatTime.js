function formatTime(time, format = 'yyyy-mm-dd hh:mm:ss') {
  let date = null;

  // 判断输入的 time 类型
  if (time instanceof Date) {
      date = time;
  } else if (typeof time === 'number') {
      // 检查是毫秒还是秒
      if (time.toString().length <= 10) {
          time *= 1000; // 转换为毫秒
      }
      date = new Date(time);
  } else if (typeof time === 'string') {
      date = new Date(time);
      if (isNaN(date.getTime())) {
          throw new Error('Invalid date string');
      }
  } else {
      throw new Error('Invalid time input');
  }

  // 获取年月日时分秒
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  // 根据 format 参数返回相应格式的时间
  switch (format.toLowerCase()) {
      case 'iso':
          return date.toISOString();
      case 'yyyy-mm-dd':
          return `${year}-${month}-${day}`;
      case 'yyyy/mm/dd':
          return `${year}/${month}/${day}`;
      case 'yyyy-mm-dd hh:mm:ss':
          return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      case 'yyyy/mm/dd hh:mm:ss':
          return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
      case 'hh:mm:ss':
          return `${hour}:${minute}:${second}`;
      case 'hh:mm':
          return `${hour}:${minute}`;
      case 'timestamp':
          return date.getTime();
      case 'timestamp-seconds':
          return Math.floor(date.getTime() / 1000);
      default:
          throw new Error('Unsupported format');
  }
}


module.exports = formatTime;
// // 示例用法
// console.log(formatTime(new Date(), 'iso')); // ISO 8601 格式
// console.log(formatTime(new Date(), 'yyyy-mm-dd')); // 年-月-日
// console.log(formatTime(new Date(), 'yyyy-mm-dd hh:mm:ss')); // 年-月-日 时:分:秒
// console.log(formatTime(1672531200, 'yyyy-mm-dd hh:mm:ss')); // 从秒时间戳转换
// console.log(formatTime(1672531200000, 'yyyy-mm-dd hh:mm:ss')); // 从毫秒时间戳转换
// console.log(formatTime('2023-01-01T00:00:00Z', 'yyyy-mm-dd hh:mm:ss')); // 从字符串转换