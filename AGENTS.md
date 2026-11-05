# AGENTS.md（PC 端 Web）

> 本文件是本项目与 AI 协作的强制规范。生成或修改任何代码前，先满足以下全部条目。
> 落地时重命名为 `AGENTS.md`，放项目根目录。

## 技术栈

| 类别 | 选型 |
|---|---|
| 框架 / 语言 | React 19 + TypeScript |
| 构建 | Vite |
| 样式 | Tailwind CSS |
| 组件库 | Ant Design 5（`Table` 用于表格，禁止手写 `table` 或 div 拼） |
| 图表 | ECharts |

---

## 一、通用约束

### 组件

1. 写代码前先输出「页面 → 区块 → 组件」三层清单，确认后再实现。
2. 同一个 UI 出现 2 次及以上，抽成组件放 `src/components/`；表格配置重复 2 次以上抽成业务表格组件。
3. 组件 props 必须有 TS 类型定义，**禁止 `any`**；禁止直接修改 props。
4. 单文件不超过 200 行；组件只负责渲染与交互，数据获取提到上层或自定义 Hooks。

### 设计规范（只从原型自建）

5. 从原型提取色值、字体、字号、间距、圆角、阴影，归并为 `src/styles/tokens.css` 的 CSS 变量。
6. 禁止套用其他项目的规范或品牌色板；原型没有的值在主色调基础上派生，并标注「原型已有 / 派生」。
7. **禁止裸写 hex**（token 文件除外）、禁止 Tailwind 任意值（如 `bg-[#0E6FDA]`）、禁止用内联 style 承载色值。
8. Tailwind 主题扩展写进 `tailwind.config` 并引用 token；深色模式复用同一套变量切换。

### 数据与接口

9. 字段命名与后端一致（camelCase），禁止前端做字段映射改名。
10. 所有返回按「可能为空」处理：列表可能空数组，对象可能 null，数值可能 0。
11. Mock 结构必须与后端确认过的字段一致；接真接口时只换数据源，不改结构。
12. 每个数据区块都要有四种状态：正常 / 空数据 / 加载中 / 加载失败（失败必须给重试入口）。

### 代码风格

13. 单个函数不超过 50 行；JSX 里不写复杂表达式。
14. 注释只写「为什么」。
15. 禁止遗留 `console.log`、调试代码、硬编码密钥（密钥走 `.env` 且进 `.gitignore`）。

---

## 二、PC 端 UI 规范

### 布局

16. 设计基准画布 1920×1080，适配区间 1280-1920；低于 1280 允许横向滚动，但不许崩。
17. 内容区按页面类型分流，不许一刀切：

    | 页面类型 | 宽度 |
    |---|---|
    | 看板 / 列表 / 表格 / 图表 | 流式铺满，左右留 24-32px，**不设最大宽** |
    | 表单 / 详情 / 文档 / 设置 | 定宽 1200px 居中 |

    确需统一上限时取 `max-width: 1600px`（不要用 1440——1920 屏会白扔两侧各 240px）。
18. 侧边导航固定，主内容区独立滚动；布局走栅格，1920 下不少于 12 列；禁止绝对定位拼页面、禁止写死像素宽度。

### 字体与排版

19. 字体栈统一为 `--font-sans`（放进 tokens.css，禁止在组件里重复声明）：

    ```
    -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei",
    "Source Han Sans SC", "Noto Sans SC", "Noto Sans CJK SC", "Source Han Sans CN",
    sans-serif
    ```

    命中结果固定：**Windows → 微软雅黑**（`Microsoft YaHei` 必须排在思源之前、不可省略，否则回退宋体）／**苹果 → 苹方**／**Android、Linux → 思源黑体**。不引入任何字体文件。
20. 需要 100% 统一字形时才走 `@font-face`：用可商用开源字体子集化 + `font-display: swap` + preload。禁止中文 webfont 整包，禁止把商业字体文件打包进项目。
21. 字号走 `--font-size-*` token，组件内禁止写死 px。按 2px 步进（12 / 14 / 16 / 18 / 20 / 24 / 28 / 32…）取档，起点为：辅助 12、正文 14、区块标题 16、页面标题 20-24、大屏指标 24-32。硬边界：正文不小于 12px，单页不超过 5 级。
22. 行高：正文 1.5、表格 1.4、标题 1.3。字重只用 400 / 500 / 600，禁止大面积 700。
23. **所有数值、金额、指标必须 `font-variant-numeric: tabular-nums`**；数字列右对齐 + 千分位，单位写进表头（如「金额（万元）」），不逐格重复。
24. 长文本用 CSS 省略 + Tooltip，**禁止用 JS 截字符串**；禁止用 `letter-spacing` 拉中文间距。
25. 标题层级一页最多三级：页面标题 → 区块标题 → 卡片标题。

### 交互与可达性

26. 可点击元素必须有 hover 反馈；Tab 可遍历、Enter 可触发、焦点有可见轮廓。
27. 危险操作（删除、覆盖）必须二次确认，弹窗要说明后果。

### 数据密度

28. 表格行高 40-48px；同页共存时图表高 240-320px；信息过载优先分 Tab，不做超长滚动。
29. 宽屏下单个卡片不许独占整行，超过 900px 宽改栅格并列或加 `max-width`。

### 表格（Ant Design）

30. `rowKey` 必须是稳定 ID，禁止数组下标；`columns` 用 `ColumnsType<T>` 定义。
31. 列宽只给需要固定的列；**开 `virtual` 时所有列必须有 `width`，且 `scroll.x` / `scroll.y` 必须都是数字**。
32. 表头固定用 `sticky` 或 `scroll={{ y }}`；超过 8 列支持列显隐或横向滚动，不许截断内容。
33. 一律服务端分页（显示 `total`、默认 20、开 `showSizeChanger`）；排序筛选走 `onChange` 传回后端，禁止前端对当前页假排序。
34. 跨页多选必须配 `preserveSelectedRowKeys`。
35. 超过 100 行开 `virtual`，50-100 行走分页；`columns` 与 `rowSelection` 用 `useMemo` 包裹。
36. 单元格：数字右对齐 + tabular-nums + 千分位，状态用 `Tag`，操作列 `fixed: 'right'`；**禁止在单元格里塞表单、弹窗、下拉**，抽到抽屉或独立页。
37. 默认只留横向分隔线，不启用斑马纹。
38. 表格主题与字体走 `ConfigProvider` 的 `components.Table.*` token；主题色指向本项目 token，不留 antd 默认蓝 `#1677ff`。

### 图表（ECharts）

39. 封装成 React 组件：`useEffect` 里初始化，卸载时 `dispose()`，容器用 ref 取，不用 `getElementById`。
40. 数据更新只改 option，尺寸变化只调 `resize()`，禁止重建实例。
41. 坐标轴标签重叠时旋转或省略，不做默认处理。

### 性能

42. 路由懒加载（`React.lazy` + `Suspense`）；超过 50 条用虚拟滚动或分页；图表超过 100 个数据点先采样或聚合。

---

## 三、React 工程规范

43. 一律函数组件 + Hooks，禁止 class 组件；文件名与组件名一致，PascalCase。
44. 列表渲染必须带稳定 `key`（用 ID，不用下标）。
45. 状态就近：能放组件内不提升到父级，能放父级不进全局；跨页面共享统一进状态库，**禁止自搭 event bus**；持久化走统一方案，禁止各处手写 `localStorage`。
46. 路由懒加载；跳转走路由 API，禁止 `location.href`；需登录的路由在配置里标记，由守卫统一处理。
47. 样式优先用 Tailwind 工具类；禁止全局 CSS 选择器污染其他页面，覆盖第三方样式必须限定作用域。
48. antd：根节点包 `ConfigProvider` + `App`，注入 theme token 与 `zh_CN` 语言包，开 `cssVar: true`；主题只改 token，**禁止覆盖 `.ant-` 类名、禁止改 Less 变量**。
49. 反馈组件（message / notification / Modal.confirm）一律用 `App.useApp()`，不用静态方法——静态方法不继承主题与语言包。
50. **Tailwind preflight 与 antd 的样式冲突**：先保证 preflight 生效，变形处用 antd token 修正；禁止用 `!important` 或覆盖 `.ant-` 压过去。
51. 优先用 antd 组件，禁止手写下拉框、日期选择器、弹窗、分页器、Tabs；禁止引入第二套组件库；依赖统一走 npm，禁止 CDN。

### 目录结构

```
src/
  api/          接口请求，按模块分文件
  assets/       静态资源
  components/   可复用组件
  hooks/        自定义 Hooks，useXxx 命名
  pages/        页面组件
  router/       路由配置
  stores/       全局状态
  styles/       tokens.css 等全局样式
  utils/        工具函数
```

---

## 四、交付前自查

逐页检查，逐项给出结果。**禁止只回答「已完成」。**

- [ ] 无原型残留（照搬的 HTML 结构、内联 style、全局 CSS 选择器、CDN 引入）
- [ ] 同一 UI 无重复实现；色值全部走 token，无裸写 hex、无 Tailwind 任意值
- [ ] 四种状态齐全，失败有重试入口
- [ ] 1920 下看板/表格页铺满无大片留白，表单/详情页定宽 1200 居中，无写死像素宽度
- [ ] 字体栈走 `--font-sans`，`Microsoft YaHei` 在思源之前且未省略；字号均引用 token，无写死 px
- [ ] 数值已启用 `tabular-nums`；长文本用 CSS 省略，未用 JS 截字符串
- [ ] 表格：`rowKey` 为稳定 ID、服务端分页、超 100 行开 virtual、主题走 token 无默认蓝残留
- [ ] antd：`ConfigProvider` + `App` + 中文包已配，反馈走 `App.useApp()`，无 `!important` / `.ant-` 覆盖
- [ ] ECharts 卸载已 `dispose()`；无 `console.log`、调试代码、硬编码密钥

---

## 维护约定

1. 新增规则必须可验证：写「同一 UI 出现 2 次必须抽成组件」，不写「代码要优雅」。
2. 越靠前的条目 AI 遵循度越高。文件膨胀比缺失更危险——超过 50 条时先想合并删减，再想加。
3. 改完新开一个对话问 AI「本项目有哪些开发规范」，让它复述；漏掉的部分就是写得不够显眼。
4. 本文件放项目根目录才会自动生效；放 `docs/` 子目录多数工具读不到。
