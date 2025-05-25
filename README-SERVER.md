# AingDesk Server - Node.js Backend

这是AingDesk的纯Node.js后端服务版本，已移除所有Electron相关组件，可作为独立的后端服务运行。

## 主要变更

### 移除的组件
- ✅ Electron主进程和渲染进程
- ✅ Electron窗口管理
- ✅ Electron对话框（文件选择、消息框等）
- ✅ Electron托盘功能
- ✅ Electron自动更新
- ✅ Electron通知系统
- ✅ 所有Electron相关依赖

### 保留的功能
- ✅ HTTP API服务器
- ✅ Socket.IO实时通信
- ✅ 所有业务逻辑控制器
- ✅ RAG（检索增强生成）功能
- ✅ 模型引擎支持
- ✅ 搜索引擎功能
- ✅ 聊天服务
- ✅ 文件处理功能
- ✅ 数据管理功能

### 新增功能
- ✅ Express.js HTTP服务器
- ✅ CORS支持
- ✅ 环境变量配置
- ✅ 改进的错误处理
- ✅ 系统信息API
- ✅ 文件系统操作API

## 快速开始

### 1. 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 2. 安装和启动

#### 方法一：使用启动脚本（推荐）
```bash
./start-server.sh
```

#### 方法二：手动安装和启动
```bash
# 安装依赖
npm install

# 复制环境配置文件
cp .env.example .env

# 编辑环境变量（可选）
nano .env

# 构建项目
npm run build

# 启动服务器
npm start
```

### 3. 开发模式
```bash
# 开发模式（自动重启）
npm run dev
```

## 配置

### 环境变量
在`.env`文件中配置以下变量：

```env
# 服务器配置
HOST=0.0.0.0
PORT=7071
SOCKET_PORT=7070

# 环境
NODE_ENV=development

# 日志级别
LOG_LEVEL=INFO
```

### 服务器配置
服务器配置位于 `electron/config/config.server.ts`

## API 端点

### HTTP API
- `GET /health` - 健康检查
- `GET /api/version` - 获取版本信息
- `GET /api/languages` - 获取支持的语言列表
- `POST /api/language` - 设置语言

### Socket.IO 事件
所有原有的Socket.IO事件都已保留，包括：
- `get_version` - 获取版本
- `get_languages` - 获取语言列表
- `set_language` - 设置语言
- `chat_send` - 发送聊天消息
- 以及其他所有业务相关事件

## 目录结构

```
aing-test/
├── server.ts                 # 主服务器文件
├── electron/                 # 业务逻辑（原Electron代码）
│   ├── controller/           # 控制器
│   ├── service/             # 服务层
│   ├── config/              # 配置文件
│   ├── rag/                 # RAG功能
│   ├── model_engines/       # 模型引擎
│   └── search_engines/      # 搜索引擎
├── frontend/                # 前端代码
├── public/                  # 静态文件
├── dist/                    # 编译输出
├── .env                     # 环境变量
└── start-server.sh          # 启动脚本
```

## 部署

### 生产环境部署
```bash
# 设置生产环境
export NODE_ENV=production

# 构建项目
npm run build

# 启动生产服务器
npm run start:prod
```

### Docker 部署
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 7071

CMD ["npm", "run", "start:prod"]
```

### PM2 部署
```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start dist/server.js --name "aingdesk-server"

# 查看状态
pm2 status

# 查看日志
pm2 logs aingdesk-server
```

## 迁移指南

### 从Electron版本迁移
1. 所有业务逻辑保持不变
2. 前端需要更新API调用方式（如果有直接调用Electron API的地方）
3. 文件选择等功能需要通过前端实现
4. 系统通知需要使用Web Notification API

### 前端适配
- 移除Electron特定的API调用
- 使用标准的HTTP API和Socket.IO
- 文件上传使用标准的HTML5 File API
- 系统通知使用Web Notification API

## 性能优化

### 内存优化
- 移除Electron减少了内存占用
- 可以通过PM2进行集群部署
- 支持负载均衡

### 网络优化
- 启用gzip压缩
- 静态文件缓存
- CDN支持

## 故障排除

### 常见问题
1. **端口被占用**：修改`.env`文件中的PORT配置
2. **依赖安装失败**：删除`node_modules`和`package-lock.json`重新安装
3. **构建失败**：检查TypeScript配置和依赖版本

### 日志查看
```bash
# 查看应用日志
tail -f logs/aingdesk-server.log

# 查看错误日志
tail -f logs/ee-error.log
```

## 开发

### 添加新的API端点
1. 在相应的控制器中添加方法
2. 在`server.ts`中添加路由或Socket事件处理
3. 更新API文档

### 调试
```bash
# 启用调试模式
DEBUG=* npm run dev
```

## 许可证
MIT License

## 支持
如有问题，请提交Issue或联系开发团队。