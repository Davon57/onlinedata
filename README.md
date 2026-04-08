# onlinedata

跨设备在线数据同步工具，支持通过房间口令在多端之间实时同步文本、JSON 和接口参数内容。

## 功能特性

- 实时同步：基于 Socket.IO 的房间广播机制，消息秒级同步
- 房间隔离：不同房间口令互不影响，支持快速加入
- 历史回放：进入房间可获取最近消息历史（服务端内存缓存）
- 时间展示：消息时间展示到年月日时分秒
- 最新优先：消息按时间倒序展示，最近消息在最上方
- 极简交互：支持移动端与桌面端协同粘贴和查看长文本
- 前后端一体开发：Vite 前端 + Express/Socket.IO 后端

## 技术栈

- 前端：React 18 + TypeScript + Vite + Tailwind CSS
- 后端：Express + Socket.IO + TypeScript（tsx/nodemon）
- 工具链：pnpm + ESLint + TypeScript

## 快速开始

### 1) 安装依赖

```bash
pnpm install
```

### 2) 启动开发环境（前后端同时启动）

```bash
pnpm dev
```

启动后默认访问：

- 前端：http://localhost:5173
- 后端健康检查：http://localhost:3001/api/health

### 3) 常用脚本

```bash
pnpm dev        # 同时启动前端与后端开发服务
pnpm client:dev # 仅启动前端
pnpm server:dev # 仅启动后端（nodemon + tsx）
pnpm build      # 生产构建前端
pnpm preview    # 预览构建产物
pnpm lint       # ESLint 检查
pnpm check      # TypeScript 类型检查
```

## 目录结构

```text
.
├─ src/                 # 前端源码
│  ├─ pages/            # 页面（Home、Room）
│  ├─ components/       # 组件
│  └─ hooks/            # 自定义 Hook
├─ api/                 # 后端源码
│  ├─ routes/           # HTTP 路由
│  ├─ app.ts            # Express 应用
│  ├─ socket.ts         # Socket.IO 事件
│  └─ server.ts         # HTTP + Socket 启动入口
├─ public/              # 静态资源
└─ vite.config.ts       # Vite 配置（含 /api 与 /socket.io 代理）
```

## Socket 事件约定

- 客户端 -> 服务端
  - `join_room`: 加入房间并获取历史
  - `new_message`: 发送新消息 `{ roomId, content }`
- 服务端 -> 客户端
  - `history`: 当前房间历史消息
  - `new_message`: 房间广播新消息

## API 说明

- `GET /api/health`：服务健康检查
- `POST /api/auth/register`：注册接口占位（待实现）
- `POST /api/auth/login`：登录接口占位（待实现）
- `POST /api/auth/logout`：登出接口占位（待实现）

## 部署说明（宝塔/Nginx）

推荐单域名部署：

1. 前端执行 `pnpm build`，将 `dist` 作为站点静态目录
2. 后端使用 PM2 启动 Node 服务（例如端口 `3001`）
3. Nginx 反向代理：
   - `/api` -> `http://127.0.0.1:3001`
   - `/socket.io` -> `http://127.0.0.1:3001`（开启 WebSocket）

确保 Nginx 已开启 WebSocket 转发头（`Upgrade` / `Connection`）。

## 当前限制

- 服务端消息历史使用内存存储，重启后会清空
- `auth` 路由目前为占位实现，未接入真实鉴权

## 预览

### 首页

![首页预览](./public/preview-home.svg)

### 房间页

![房间页预览](./public/preview-room.svg)

## License

MIT
