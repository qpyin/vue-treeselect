# Vue-Treeselect Vue 3 升级说明

## 升级概述

已成功将 vue-treeselect 从 Vue 2 升级到 Vue 3，确保可以正常编译打包。

## 主要变更

### 1. 依赖更新
- Vue: 2.x → 3.4.x
- Vue Loader: 15.x → 17.x
- Webpack: 4.x → 5.x
- Babel: 更新到最新版本
- 其他相关依赖同步更新

### 2. 组件文件格式变更
由于 Vue 3 的 SFC (单文件组件) 不再支持在 `<script>` 标签内直接使用 JSX 语法，所有组件已从 `.vue` 格式转换为 `.jsx` 格式：

- `Treeselect.vue` → `Treeselect.jsx`
- `Menu.vue` → `Menu.jsx`
- `Option.vue` → `Option.jsx`
- `Control.vue` → `Control.jsx`
- `Input.vue` → `Input.jsx`
- `Placeholder.vue` → `Placeholder.jsx`
- `SingleValue.vue` → `SingleValue.jsx`
- `MultiValue.vue` → `MultiValue.jsx`
- `MultiValueItem.vue` → `MultiValueItem.jsx`
- `HiddenFields.vue` → `HiddenFields.jsx`
- `MenuPortal.vue` → `MenuPortal.jsx`
- `Tip.vue` → `Tip.jsx`

### 3. 生命周期钩子更新
- `destroyed` → `unmounted`
- `beforeDestroy` → `beforeUnmount`

### 4. API 变更
- `$scopedSlots` → `$slots` (Vue 3 中统一使用 `$slots`)
- `$set` / `$delete` → 直接赋值 (Vue 3 使用 Proxy，不再需要这些 API)
- `new Vue()` → `createApp()` (MenuPortal 组件中)

### 5. 渲染函数更新
- 使用 `defineComponent` 定义组件
- 使用 `h()` 函数替代 JSX (在 `.jsx` 文件中)
- Transition 组件的使用方式更新

### 6. Webpack 配置更新
- 使用 `webpack-merge` 的新 API (`merge` 函数)
- 更新 `vue-loader` 配置
- 添加 `.jsx` 文件支持
- 更新 CSS 提取插件配置

## 构建输出

构建成功生成以下文件：

```
dist/
├── vue-treeselect.cjs.js          # CommonJS 格式
├── vue-treeselect.cjs.min.js      # CommonJS 压缩版
├── vue-treeselect.umd.js          # UMD 格式
├── vue-treeselect.umd.min.js      # UMD 压缩版
├── vue-treeselect.css             # 样式文件
└── vue-treeselect.min.css         # 样式压缩版
```

## 使用方法

### 安装依赖
```bash
npm install
```

### 构建库
```bash
npm run build-library
```

### 使用组件
```javascript
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  components: { Treeselect },
  // ...
}
```

## 注意事项

1. 此版本仅支持 Vue 3.x，不再兼容 Vue 2.x
2. 确保你的项目使用 Vue 3 的 `createApp` API
3. 如果使用 TypeScript，可能需要额外的类型定义

## 已知问题

- 构建过程中有一些 deprecation warnings，来自 webpack 插件，不影响功能
- 建议后续迁移到 Vite 以获得更好的开发体验
