# 尊出行 · 乘客端 uniApp 架构文档

> 基于 HTML 原型 `系统原型设计/passenger-app.html` 还原，uniApp 3.0 + Vue 3 + SCSS

---

## 1. 项目结构

```
passenger-app/src/
├── App.vue                    # 全局样式 + Material Symbols + typography 工具类
├── uni.scss                   # 设计 token 系统 (颜色/字体/间距/圆角/阴影)
├── pages.json                 # 路由注册 (无 tabBar，自定义组件实现)
├── manifest.json              # uniApp 多端打包配置
├── components/                # 公共组件
│   ├── navbar.vue             # 导航栏 (浅色/深色/透明 三主题，左标题/居中)
│   ├── tab-bar.vue            # 底部 2tab 自定义导航 (服务/我的)
│   ├── bottom-sheet.vue       # 通用底部抽屉 (mask+body+footer，支持 v-model)
│   └── m-icon.vue             # Material Symbols 图标封装 (size/color/fill/weight)
├── pages/
│   ├── index/                 # 首页 (服务入口)
│   │   └── index.vue
│   ├── login/                 # 验证码登录
│   │   └── index.vue
│   ├── charter/               # 包车出行模块
│   │   ├── index.vue          # 起终点 + 车型 tab + 尊崇礼遇 + 套餐 sheet + 日期 sheet
│   │   ├── confirm.vue        # 确认订单 (行程/乘车人/支付/备注/协议)
│   │   ├── pay.vue            # 微信/支付宝聚合支付独立页
│   │   ├── fee.vue            # 费用明细 (计时费/附加费/说明)
│   │   └── success.vue        # 下单成功 (paid/pending 两态 + 倒计时)
│   ├── rental/                # 租车出行模块
│   │   ├── index.vue          # 取还车 + 车型 tab + 服务说明 + 取还车日期 sheet
│   │   ├── confirm.vue        # 确认订单 (取还车/驾驶人/驾驶证/尊享权益/支付)
│   │   ├── fee.vue            # 费用明细
│   │   └── success.vue        # 下单成功 (paid/pending 两态)
│   ├── address/               # 地址选址
│   │   ├── search.vue         # 搜索地址 + 历史记录 + 地图选点入口
│   │   └── map.vue            # 地图选点 (CSS 模拟地图 + 附近候选 + 确认)
│   ├── enterprise/            # 企业入驻
│   │   ├── register.vue       # 企业入驻表单 + 专属权益卡
│   │   └── status.vue         # 入驻审核状态
│   ├── trips/                 # 行程列表 (待建)
│   └── profile/               # 我的 (待建)
```

---

## 2. 设计 Token 系统

位置: `src/uni.scss`，与原型 `tailwind.config.theme` 对齐。

| 类别 | 变量 | 值 | 用途 |
|---|---|---|---|
| **品牌黑** | `$color-obsidian-deep` | `#000000` | 主按钮、黑卡背景 |
| **品牌金** | `$color-heritage-gold` | `#D4AF37` | 会员标签、金色点缀 |
| **品牌蓝** | `$color-premium-blue` | `#0057FF` | 链接、费用明细入口 |
| **表面色** | `$color-surface` | `#F9F9F9` | 页面背景 |
| **卡片白** | `$color-surface-container-lowest` | `#FFFFFF` | 信息卡、输入区背景 |
| **文字主色** | `$color-text-primary` | `#1A1C1C` | 标题、正文 |
| **文字辅色** | `$color-text-secondary` | `#86868B` | 描述、提示 |
| **排版** | `$font-display-lg-mobile-size` | `28px / 36px / 700` | 大标题 |
| | `$font-headline-sm-mobile-size` | `20px / 28px / 600` | 卡片标题 |
| | `$font-body-lg-size` | `17px / 26px / 400` | 正文 |
| | `$font-label-md-size` | `13px / 18px / 500` | 标签 |
| **圆角** | `$radius-card` | `32px` | 信息卡 |
| | `$radius-xl` | `24px` | 输入框/按钮 |
| **间距** | `$spacing-container-margin` | `24px` | 全局左右边距 |

---

## 3. 公共组件 API

### 3.1 navbar

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `title` | string | `''` | 标题文字 |
| `showBack` | boolean | `false` | 是否显示返回按钮 |
| `theme` | `'light'`\|`'dark'`\|`'transparent'` | `'light'` | 配色主题 |
| `align` | `'left'`\|`'center'` | `'left'` | 标题对齐方式 |
| `sticky` | boolean | `false` | 是否 sticky 定位 |
| `bgColor` | string | `''` | 自定义背景色 |
| `fallbackUrl` | string | `'/pages/index/index'` | 无返回栈时跳转 |

Slot: `left`, `right` — 自定义左右插槽

Event: `@back` — 点返回时触发

### 3.2 tab-bar

| Prop | 类型 | 说明 |
|---|---|---|
| `current` | `'home'`\|`'profile'` | 当前激活 tab |

点击非当前 tab → `uni.redirectTo` 切换

### 3.3 bottom-sheet

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `modelValue` | boolean | — | 开关(支持 v-model) |
| `title` | string | `''` | 标题 |
| `closable` | boolean | `true` | 是否显示关闭按钮 |
| `showHandle` | boolean | `true` | 是否显示顶部把手 |
| `maxHeight` | string | `'85vh'` | 最大高度 |
| `closeOnMask` | boolean | `true` | 点击遮罩是否关闭 |

Slot: `default` — 内容区 | `header` — 自定义标题栏 | `footer` — 底部固定区

Event: `@close`

### 3.4 m-icon

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `name` | string | — | Material Symbols 图标名 |
| `size` | number/string | `24` | 图标大小(不含单位时视为 px) |
| `color` | string | `''` | 填充颜色 |
| `fill` | boolean | `false` | 图标变体 FILL=1 |
| `weight` | number | `400` | 字重 |

---

## 4. 页面路由表 (pages.json)

| path | navStyle | 说明 |
|---|---|---|
| `pages/index/index` | custom | 首页 |
| `pages/profile/index` | custom | 我的 (待建) |
| `pages/login/index` | custom | 验证码登录 |
| `pages/enterprise/register` | custom | 企业入驻表单 |
| `pages/enterprise/status` | custom | 入驻审核状态 |
| `pages/charter/index` | custom | 包车出行 |
| `pages/charter/confirm` | custom | 包车确认订单 |
| `pages/charter/pay` | custom | 聚合支付页 |
| `pages/charter/fee` | custom | 包车费用明细 |
| `pages/charter/success` | custom | 包车下单成功 |
| `pages/rental/index` | custom | 租车出行 |
| `pages/rental/confirm` | custom | 租车确认订单 |
| `pages/rental/fee` | custom | 租车费用明细 |
| `pages/rental/success` | custom | 租车下单成功 |
| `pages/address/search` | custom | 地址搜索 |
| `pages/address/map` | custom | 地图选点 |
| `pages/trips/index` | custom | 行程列表 (待建) |
| `pages/enterprise/index` | custom | 企业管理 (待建) |
| `pages/invoice/index` | custom | 电子发票 (待建) |
| `pages/messages/index` | custom | 消息中心 (待建) |

---

## 5. 跨页面数据流

### 5.1 地址选址 (storage 通信)

```
包车/租车页        →    地址搜索页       →     地图选点页
 (setStorageSync)       (navigateTo)           (navigateBack delta:2)
                                                      ↓
包车/租车页 onShow ←    写入 'address-pick-result'   + 清除 key
 (读+回填+删除)
```

`address-pick-field` 区分来源: `origin` / `destination` / `rental-pickup` / `rental-return`

### 5.2 支付流程 (URL params 贯穿)

```
确认订单页 → [企业] showModal 确认/取消 → success?status=paid|pending
          → [微信/支付宝] navigateTo pay.vue
                              ↓ 确认支付 → success?status=paid
                              ↓ 点关闭 → 确认离开? → success?status=pending
```

### 5.3 套餐车型参数传递

```
charter/index (sheet) → confirm — url params:
  carIdx / pkgId / days / dateIso / time / origin / destination

rental/index (sheet) → confirm — url params:
  carIdx / days / pickup / return / pickupDate / returnDate
```

---

## 6. 导航流程

### 6.1 包车出行完整链路

```
home → charter/index
       ├─ 起终点 (点→address/search → address/map)
       ├─ 3 车型 tab (切换车型→默认选该车型第5个套餐)
       ├─ 尊崇礼遇 (黑卡展示)
       └─ [选择套餐] → bottom-sheet
            ├─ 3 车型 tab
            ├─ 3×2 套餐 grid (半日租/日租 × 尊享基础/尊荣高级/尊御顶级)
            ├─ 包含权益 chips (基础→基础 / 高级→+茶点 / 顶级→+茶点+香槟)
            ├─ 日期+时间 (日期grid 4×3 + 时间 picker-view 滚轮)
            ├─ 包车天数 stepper
            ├─ 预估总额 + 费用明细 → [下一步]
            └─ → charter/confirm
                 ├─ 车型 hero
                 ├─ 行程信息 (起终点 + 日期 + 车型套餐)
                 ├─ 乘车人 [切换] → bottom-sheet (本人/列表/添加)
                 ├─ 支付方式 (微信/支付宝/企业)
                 ├─ 备注 textarea
                 ├─ 协议 checkbox
                 └─ [确认下单]
                      ├─ 企业 → showModal → success(paid|pending)
                      └─ 微信/支付宝 → charter/pay
                           ├─ [确认支付] → success(paid)
                           └─ [返回] → showModal→离开→success(pending)

charter/success
├─ status=paid:   绿色 check_circle + "下单成功" + 匹配司机 dots + "查看订单详情"
└─ status=pending: 橙色 schedule + "订单待支付" + 30分钟倒计时胶囊 + "立即支付"按钮
     └─ [立即支付] → 企业→showModal / 微信支付宝→pay.vue
```

### 6.2 租车出行完整链路

```
home → rental/index
       ├─ 取还车 (点→address/search)
       ├─ 3 车型 tab (每车型含 dayPrice/kmPerDay/features)
       ├─ 服务说明卡 (3 项)
       └─ [选择车型与日期] → bottom-sheet
            ├─ 3 车型 tab + 车型图 + 单价标签
            ├─ 取车日期 + 还车日期 (各自独立 bottom-sheet : grid 4×3+天)
            │   └─ 还车日期不可早于取车日期
            ├─ 租车天数 (自动计算 = 还车-取车)
            ├─ 超里程提示
            ├─ 预估总额 + 费用明细 → [下一步]
            └─ → rental/confirm
                 ├─ 车型 hero (含 "尊界车主专享" 标签)
                 ├─ 取还车信息 (绿色/红色圆点 + 日期 + 天数)
                 ├─ 驾驶人 [切换] → bottom-sheet (本人/他人+表单)
                 ├─ 驾驶证上传 (正页/副页 虚线卡片占位)
                 ├─ 尊享权益 (黑色渐变卡 + "使用权益"按钮)
                 ├─ 支付方式 (微信/支付宝/企业)
                 ├─ 备注 textarea
                 ├─ 协议 checkbox
                 └─ [确认下单] → 同包车支付链 → success(paid|pending)

rental/success
├─ status=paid:   绿色 + "下单成功" + "订单已生成，等待派车..." + Awaiting Vehicle Dispatch
└─ status=pending: 橙色 + "订单待支付" + 30分钟倒计时 + "立即支付"按钮
```

### 6.3 认证链路

```
login (验证码登录 + 微信快捷登录 + 企业入口)
  ├─ 登录成功 → home
  └─ 企业入驻 → enterprise/register (表单 + 验证码 + 专属权益卡)
       └─ 提交成功 → enterprise/status (审核中 + 预计反馈时间 + 返回登录/客服)
```

---

## 7. 重复使用模式

### 7.1 车型数据模型

所有车型页面共用以下结构：

```ts
type Car = {
  id: string;
  name1: string;       // 第一行tab文字
  name2: string;       // 第二行tab文字
  fullName: string;    // 完整车名
  tagline: string;     // 一句话描述
  imageGradient: string; // 渐变占位图 (实际用 <image> 替换)
  features: { icon: string; text: string }[];
};
```

包车扩展: `packages: Pkg[] (tier / spec / price / duration)`
租车扩展: `dayPrice: number / kmPerDay: number`

### 7.2 价格/套餐面板

包车: `pkg.price × days`
租车: `dayPrice × totalDays` (totalDays = 还车日期 - 取车日期)

结算公式均在 sheet footer 中，通过 `computed` 计算。

### 7.3 支付面板

统一入口: `charter/pay.vue` 和 `rental/pay.vue` (可考虑合并为一个 `pages/pay/index.vue`，通过 `source=charter|rental` 参数区分返回路径)

---

## 8. 待建页面清单

| 模块 | 页面 | 状态 |
|---|---|---|
| 租车 | rental/confirm.vue | ⬜ 待建 |
| 租车 | rental/fee.vue | ⬜ 待建 |
| 租车 | rental/success.vue | ⬜ 待建 |
| 行程 | trips/index.vue | ⬜ 待建 |
| 我的 | profile/index.vue | ⬜ 待建 |
| 用车 | booking 预约用车 + confirm + fee + success | ⬜ 待建 |
| 用车 | 途经点弹窗 / 时间选择器 | ⬜ 待建 |
| 设置 | settings/index.vue | ⬜ 待建 |
| 消息 | messages/index.vue + detail | ⬜ 待建 |
| 发票 | invoice/* | ⬜ 待建 |
| 订单详情 | trip-detail-charter / trip-detail-rental | ⬜ 待建 |
| 行程追踪 | trip-tracking.vue | ⬜ 待建 |
| 车主认证 | owner-cert.vue | ⬜ 待建 |
