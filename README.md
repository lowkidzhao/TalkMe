# TalkMe - Electron 跨平台桌面应用

[![Electron Version](https://img.shields.io/badge/Electron-34.2.0-blue.svg)](https://electronjs.org/)
[![Vue Version](https://img.shields.io/badge/Vue-3.5.13-brightgreen.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

基于 Electron + Vue 3 的现代化桌面应用模板，集成 electron-vite 构建系统。

![应用截图](public/screenshot.png)

## 核心架构

```plaintext
talk_me/
├── electron.vite.config.mjs   # Electron-Vite 主构建配置
├── electron-builder.yml       # 多平台打包配置
├── src/
│   ├── main/                  # 主进程代码
│   │   └── index.mjs          # 主进程入口（IPC通信/窗口管理）
│   ├── preload/               # 预加载脚本
│   │   └── index.mjs          # 安全隔离上下文
│   └── renderer/              # 渲染进程
│       ├── src/
│       │   ├── App.vue        # 根组件
│       │   ├── main.js        # 渲染进程入口（Vue初始化）
│       │   ├── assets/        # 静态资源
│       │   ├── components/    # Vue 组件
│       │   ├── router/        # 路由配置
│       │   ├── store/         # Pinia 状态管理
│       │   ├── socket/        # Socket.io 通信模块
│       │   ├── utility/       # 工具库
│       │   │   ├── toast.js   # 通知工具
│       │   │   └── webrtc.js  # WebRTC 工具
│       │   └── view/          # 页面组件
│       └────── public/        # 公共资源
├── build/                     # 打包资源配置
│   ├── entitlements.mac.plist # macOS 签名配置
│   └── icon.icns              # 应用图标
├── resources/                 # 安装程序资源
└── package.json               # 项目核心配置
```

## 主要特性

- 🚀 基于 electron-vite 的极速构建
- 💡 Vue 3 组合式 API 开发体验
- 🎨 PrimeVue UI 库
- 🔒 严格的主进程/渲染进程隔离
- 📦 预配置的 electron-builder 打包方案
- 🔧 内置 ESLint + Prettier 代码规范
- ⚡ 原生模块自动重建支持

## 快速开始

### 前置要求

- Node.js 18+
- pnpm 8+

### 安装

```bash
# 克隆仓库
git clone https://github.com/lowkidzhao/talk_me.git

# 安装依赖
cd talk_me && pnpm install

```

### Development

```bash
# 启动应用
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux

$ pnpm build:unpack
```

```bash
使用socket.io进行通信
```

### 页面

```1c
# 连接页

连接服务器 ---- 连接服务器
登录 ---- 登录
注册 ---- 注册

# 主页面

用户 ---- 显示所有用户
房间 ---- 显示所有房间/创建房间/加入房间
```

### 组件

```markdown
#功能组件化拆分

标题栏 ---- 替代原生标题栏以实现更多功能
在线---- 通过信令服务器获取登录用户状态
设置 ---- 配置信令服务器，应用设置信息
房间 ---- 已加入的信令服务器的房间，包含房间名与现有用户名，可点击用户操作！1.调整音量
一对一 ---- 可传输视频流，因为 Mesh 架构对用户端要求高
聊天 ---- 以房间为单位，信息同步在服务器（使用信令服务器，不使用 webrtc）
```
