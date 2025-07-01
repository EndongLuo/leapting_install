const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const DIST = path.join(ROOT, '../dist');
const NCC_CACHE = path.join(ROOT, 'node_modules/.cache/ncc');

function clean() {
  // if (fs.existsSync(DIST)) {
  //   fs.rmSync(DIST, { recursive: true, force: true });
  //   console.log('Cleared dist directory');
  // }
  // fs.mkdirSync(DIST, { recursive: true });

  if (fs.existsSync(NCC_CACHE)) {
    fs.rmSync(NCC_CACHE, { recursive: true, force: true });
    console.log('Cleared ncc cache');
  }
}

// 执行 ncc 打包
function build(label, entry, outDir, externals = []) {
  const extFlags = externals.map(e => `-e ${e}`).join(' ');
  const cmd = `ncc build ${entry} ${extFlags} --no-cache -m -o ${outDir}`;
  console.log(`[${label}] ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT });
  console.log(`[${label}] build to ${outDir}`);
}

function copyStatic(src, dest) {
  const srcPath = path.join(ROOT, src);
  const destPath = path.join(ROOT, dest);
  if (fs.existsSync(srcPath)) {
    fs.cpSync(srcPath, destPath, { recursive: true });
    console.log(`Copied ${src} -> ${dest}`);
  }
}

function main() {
  clean();

  const tasks = [
    {
      label: 'server',
      entry: 'bin/www',
      out: '../dist',
      externals: ['log']
    },
  ];

  tasks.forEach(t => build(t.label, t.entry, t.out, t.externals));

  const staticList = [
    { src: 'views', dest: '../dist/views' },
    { src: 'public', dest: '../dist/public' },
  ];
  staticList.forEach(({ src, dest }) => copyStatic(src, dest));

  console.log('All builds completed!');
}

main();


// const { execSync } = require('child_process');
// const fs = require('fs');
// const path = require('path');

// // const distPath = path.join(__dirname, '../dist');
// // if (fs.existsSync(distPath)) {
// //   fs.rmSync(distPath, { recursive: true });
// // }

// console.log('开始打包...');
// execSync('ncc build bin/www -m -o ../dist', { stdio: 'inherit' });

// fs.cpSync('views', 'dist/views', { recursive: true });
// fs.cpSync('public', 'dist/public', { recursive: true });

// console.log('打包完成！');

// // const path = require('path');

// // const rootDir = path.dirname(require.main.filename);
// // app.set('views', path.join(rootDir, 'views'));