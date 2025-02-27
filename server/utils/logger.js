const fs = require('fs');
const path = require('path');
const log4js = require('koa-log4');
// 定义日志目录
const logDir = path.join(process.cwd(), 'log');
// 如果目录不存在，则创建
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

log4js.configure({
  // 日志的输出
  appenders: {
    access: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log', //生成文件的规则
      alwaysIncludePattern: true, // 文件名始终以日期区分
      encoding: 'utf-8',
      filename: path.join(logDir, 'access.log'), //生成文件名,
      layout: {
        type: "pattern",
        pattern: "[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c - %m"
      }
    },
    application: {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      encoding: 'utf-8',
      filename: path.join(logDir, 'application.log'),
      layout: {
        type: "pattern",
        pattern: "[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c - %m"
      }
    },
    console: {
      type: 'console', // 使用控制台类型
      layout: {
        type: 'pattern',
        pattern: "[%d{yyyy-MM-dd hh:mm:ss}] %-5p %m %n" // 控制台输出格式
      }
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
    access: { appenders: ['access'], level: 'info' },
    application: { appenders: ['application'], level: 'all' }
  }
});

// getLogger 传参指定的是类型
exports.accessLogger = () => log4js.koaLogger(log4js.getLogger('access')); // 记录所有访问级别的日志
exports.consoleLogger = () => log4js.koaLogger(log4js.getLogger('console')); // 记录所有访问级别的日志
exports.logger = log4js.getLogger('application');