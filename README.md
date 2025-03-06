# TalkMe - Electron 跨平台桌面应用

[![Electron Version](https://img.shields.io/badge/Electron-34.2.0-blue.svg)](https://electronjs.org/)
[![Vue Version](https://img.shields.io/badge/Vue-3.5.13-brightgreen.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

基于 Electron + Vue 3 的现代化桌面应用模板，集成 electron-vite 构建系统。

![应用截图](public/screenshot.png) <!-- 建议添加实际截图 -->

## 主要特性

- 🚀 基于 electron-vite 的极速构建
- 💡 Vue 3 组合式 API 开发体验
- 🔒 严格的主进程/渲染进程隔离
- 📦 预配置的 electron-builder 打包方案
- 🔧 内置 ESLint + Prettier 代码规范
- ⚡ 原生模块自动重建支持

## 快速开始

### 前置要求

- Node.js 18+
- pnpm 8+
- Python 3.10+ (仅 Windows 原生模块编译需要)

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-repo/talk_me.git

# 安装依赖
cd talk_me && pnpm install

```

### Development

```bash
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
```
