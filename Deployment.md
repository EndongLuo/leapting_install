# 代码部署

```bash
# 进入前端文件夹
cd client

# 安装依赖
npm install 

# 打包系统
npm run build

# 运行系统（调试才执行）
npm run serve

-----------------------------------------------

# 进入后端文件夹
cd server

# 安装依赖
npm install 

# 运行后端
npm start

-----------------------------------------------

# 在终端执行
# 启动Nginx
sudo service nginx start

# 重启Nginx
sudo service nginx reload

# 停止Nginx
sudo service nginx stop

# 查看Nginx状态
sudo service nginx status

# 国内镜像
npm config set registry https://registry.npmmirror.com
```