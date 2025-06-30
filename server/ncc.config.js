const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// const distPath = path.join(__dirname, '../dist');
// if (fs.existsSync(distPath)) {
//   fs.rmSync(distPath, { recursive: true });
// }

// 打包入口文件
console.log('开始打包...');
execSync('ncc build bin/www -m -o ../dist', { stdio: 'inherit' });

fs.cpSync('views', 'dist/views', { recursive: true });
fs.cpSync('public', 'dist/public', { recursive: true });

console.log('打包完成！');

// const path = require('path');

// // 在打包后的环境下获得运行目录
// const rootDir = path.dirname(require.main.filename);

// // 示例：设置模板目录
// app.set('views', path.join(rootDir, 'views'));