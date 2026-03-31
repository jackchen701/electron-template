# agent.md — Electron Template

> 本文档供 AI agent 在后续会话中快速理解项目上下文，直接开始工作，无需重新探索。

---

## 项目定位

这是一个 **Electron + Vue 3 + Vite + Element Plus** 的桌面应用模板，用于快速启动新项目。
裁剪自 `electron-vue-vite` 官方模板，布局风格参考 `douyin-video-free`，打包风格参考 `llm-balance-monitor`。

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 桌面容器 | Electron 29 |
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 构建工具 | Vite 5 + `vite-plugin-electron/simple` |
| UI 组件库 | Element Plus 2.x（中文 locale，全局图标注册） |
| 样式语言 | CSS (全局) + LESS (组件 `<style lang="less">`) |
| 状态管理 | Pinia |
| 类型检查 | TypeScript 5 + `vue-tsc` |
| 打包工具 | electron-builder 24（YAML 配置） |
| 持久化存储 | electron-store（可选，已在 dependencies） |

---

## 目录结构

```
electron-template/
├── resources/                  # electron-builder 图标资源
│   ├── icon.icns               # macOS 图标 (必须)
│   ├── icon.ico                # Windows 图标 (必须)
│   └── icon.png                # Linux 图标 (必须)
├── electron/
│   ├── main/index.ts           # 主进程：BrowserWindow 创建、IPC 注册
│   └── preload/index.ts        # 预加载：contextBridge 暴露 ipcRenderer + 加载动画
├── scripts/
│   └── tar.mjs                 # 纯 Node.js 跨平台 tar.gz 打包脚本
├── src/
│   ├── App.vue                 # 应用壳：titlebar + main 区域
│   ├── main.ts                 # Vue 入口：挂载 ElementPlus、Pinia
│   ├── style.css               # 全局样式：CSS 变量、卡片系统、Element Plus 覆盖
│   ├── assets/                 # 静态资源（SVG、图片）
│   └── components/             # 业务组件（初始为空）
├── public/
│   └── logo.svg                # 应用图标（dev 模式 favicon）
├── electron-builder.yml        # 打包配置（主配置，YAML 格式）
├── Makefile                    # 开发者命令入口
├── package.json                # 脚本、依赖
├── vite.config.ts              # Vite 构建配置
├── tsconfig.json               # 渲染进程 TS 配置
├── tsconfig.node.json          # 主进程 + vite.config TS 配置
└── index.html                  # HTML 入口
```

---

## 常用命令

```bash
# 开发
make dev                  # 启动开发服务器（等价于 npm run dev）

# 构建
make build                # 构建当前平台
make build-mac            # 构建 macOS（必须在 macOS 上运行）
make build-win            # 构建 Windows x64
make build-linux          # 构建 Linux AppImage

# 打包为 tar.gz（先执行对应 build）
make tar-mac              # → release/<version>/<Product>-<version>-mac.tar.gz
make tar-win              # → release/<version>/<Product>-<version>-win.tar.gz
make tar-linux            # → release/<version>/<Product>-<version>-linux.tar.gz

# 代码质量
make format               # Prettier 格式化
make lint                 # ESLint 检查
make lint-fix             # ESLint 自动修复

# 安装依赖
make install              # npm install
```

---

## 全局样式系统 (`src/style.css`)

### CSS 变量（`--` 前缀，定义在 `:root`）

| 变量 | 用途 |
|------|------|
| `--el-color-primary` | Element Plus 主色 `#4080ff` |
| `--page-padding-x/y` | 页面内边距 `16px / 12px` |
| `--card-radius` | 卡片圆角 `10px` |
| `--card-shadow` | 卡片阴影 |
| `--card-border` | 卡片边框色 `#ebeef5` |

### 全局类

| 类名 | 用途 |
|------|------|
| `.card` | 白色卡片（背景、圆角、阴影、边框） |
| `.card-header` | 卡片标题区（浅灰背景、底边框） |
| `.card-body` | 卡片内容区（内边距） |
| `.page-container` | 页面容器（padding + flex column + gap） |
| `.section-header` | 区块分隔标题 |
| `.flex-center` | `display:flex; align-items:center; justify-content:center` |
| `.flex-between` | `display:flex; align-items:center; justify-content:space-between` |
| `.text-muted` | 次级文字色 `#909399` |
| `.text-primary` | 主色文字 |

---

## 应用壳布局 (`src/App.vue`)

```
┌─────────────────────────────────────────────┐
│  .app-titlebar  (40px, -webkit-app-region:drag) │
├─────────────────────────────────────────────┤
│  .app-main  (flex:1, overflow:hidden)       │
│  └─ .page-container                         │
│     └─ <router-view /> 或业务组件            │
└─────────────────────────────────────────────┘
```

- titlebar 支持拖拽移动窗口（CSS `-webkit-app-region: drag`）
- 若需无边框窗口，在 `electron/main/index.ts` 取消注释 `frame: false`

---

## Electron 主进程关键点 (`electron/main/index.ts`)

- 窗口尺寸：`1280×800`，最小 `960×600`
- 单实例锁：已启用（`app.requestSingleInstanceLock()`）
- 外链处理：`https://` 链接用系统浏览器打开
- IPC 注册：在文件末尾的注释位置添加 `ipcMain.handle(...)` 处理器
- 开发模式：自动开启 DevTools，加载 Vite dev server
- 生产模式：加载 `dist/index.html`

---

## Preload (`electron/preload/index.ts`)

通过 `contextBridge.exposeInMainWorld('ipcRenderer', {...})` 暴露以下方法：
- `window.ipcRenderer.on(channel, listener)`
- `window.ipcRenderer.off(channel, ...)`
- `window.ipcRenderer.send(channel, ...)`
- `window.ipcRenderer.invoke(channel, ...)`

同时注入加载动画（白色 3D 旋转方块，深色背景），Vue 挂载后自动移除。

---

## 打包配置 (`electron-builder.yml`)

| 平台 | 格式 | 产物命名 |
|------|------|----------|
| macOS | DMG | `<Product>-Mac-<version>-Installer.dmg` |
| Windows | NSIS exe | `<Product>-Windows-<version>-Setup.exe` |
| Linux | AppImage | `<Product>-Linux-<version>.AppImage` |

产物输出目录：`release/<version>/`

**NSIS 配置：** 非一键安装，允许选择安装目录，卸载时清除数据。

**图标：** 需在 `build/` 目录放置 `icon.icns`（macOS）、`icon.ico`（Windows）、`icon.png`（Linux）。

---

## tar.gz 打包 (`scripts/tar.mjs`)

纯 Node.js ESM 实现，无需系统 `tar` 命令，跨平台可用。

打包内容（按平台）：

| 平台 | 打包内容 |
|------|----------|
| mac | `.dmg` + `mac/` 或 `mac-arm64/`（支持 Apple Silicon） |
| win | `-Setup.exe` + `win-unpacked/` |
| linux | `.AppImage` + `linux-unpacked/` |

---

## 新项目快速使用步骤

1. 复制本仓库
2. 修改 `package.json`：`name`、`version`、`productName`、`author`
3. 修改 `electron-builder.yml`：`appId`、`productName`、`copyright`
4. 替换 `resources/icon.icns`、`resources/icon.ico`、`resources/icon.png` 为应用图标
5. 修改 `index.html` 中的 `<title>`
6. 修改 `electron/main/index.ts` 中的窗口 `title`
7. 修改 `src/App.vue` 中的 `appTitle`
8. 运行 `make install && make dev`

---

## 扩展指引

### 添加 Vue Router

```ts
// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', component: () => import('../pages/Home.vue') }],
})
export default router
```

在 `src/main.ts` 中 `app.use(router)`，在 `App.vue` 中将占位内容替换为 `<router-view />`。

### 添加 IPC 通道

**主进程** (`electron/main/index.ts`):
```ts
ipcMain.handle('my-channel', async (event, arg) => {
  return { result: 'ok' }
})
```

**渲染进程**:
```ts
const result = await window.ipcRenderer.invoke('my-channel', payload)
```

### 添加 electron-store 持久化

```ts
// electron/main/store.ts
import Store from 'electron-store'
export const store = new Store<{ theme: string }>({
  defaults: { theme: 'light' },
})
```

在 `vite.config.ts` 的 `rollupOptions.external` 中已自动排除（通过读取 `dependencies`）。
