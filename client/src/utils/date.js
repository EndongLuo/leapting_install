export const date = (t) => {
  // console.log(t,Date.now());

  var date = new Date(Number(t) * 1000);
  // console.log(date);

  var sign2 = ':';
  var year = date.getFullYear(); // 年
  var month = date.getMonth() + 1; // 月
  var day = date.getDate(); // 日
  var hour = date.getHours(); // 时
  var minutes = date.getMinutes(); // 分
  var seconds = date.getSeconds(); //秒
  var weekArr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  var week = weekArr[date.getDay()];

  month = month < 10 ? '0' + month : month;
  day = day < 10 ? '0' + day : day;
  hour = hour < 10 ? '0' + hour : hour;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  // var nowTime = year + '-' + month + '-' + day + ' ' + hour + sign2 + minutes + sign2 + seconds + ' ' + week;
  var nowTime = year + '-' + month + '-' + day + ' ' + hour + sign2 + minutes + sign2 + seconds;
  return nowTime
}