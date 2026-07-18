# 尊出行 · 乘客端 uniApp 架构文档

> 基于 HTML 原型 `系统原型设计/passenger-app.html` 还原，uniApp 3.0 + Vue 3 + SCSS
> 最后更新：2026-06-09

---

## 1. 项目结构

```
passenger-app/src/
├── App.vue                    # 全局样式 + Material Symbols + typography class
├── uni.scss                   # 设计 token (颜色/字体/间距/圆角/阴影)
├── pages.json                 # 路由注册
├── components/                # 公共组件
│   ├── navbar.vue             # 导航栏 (light/dark/transparent 主题)
│   ├── tab-bar.vue            # 底部 2tab 导航 (服务/我的)
│   ├── bottom-sheet.vue       # 通用底部抽屉 (v-model + mask + footer)
│   └── m-icon.vue             # Material Symbols 图标封装
├── pages/
│   ├── index/index.vue        # 首页
│   ├── login/index.vue        # 验证码登录
│   ├── charter/               # 包车出行 ✅
│   │   ├── index.vue          # 起终点+车型tab+套餐sheet+日期时间sheet
│   │   ├── confirm.vue        # 确认订单(行程/乘车人/支付/备注/协议)
│   │   ├── pay.vue            # 聚合支付页(支持source=charter|rental)
│   │   ├── fee.vue            # 费用明细
│   │   └── success.vue        # 下单成功(paid/pending两态+倒计时)
│   ├── rental/                # 租车出行 ✅
│   │   ├── index.vue          # 取还车+车型tab+服务说明+日期sheet
│   │   ├── confirm.vue        # 确认订单(驾驶人切换+驾驶证+尊享权益+支付)
│   │   ├── fee.vue            # 费用明细(日租费/超里程/远调费)
│   │   └── success.vue        # 下单成功(paid/pending两态)
│   ├── address/               # 地址选址
│   │   ├── search.vue         # 搜索+历史+地图选点入口
│   │   └── map.vue            # CSS模拟地图+附近候选+确认
│   ├── enterprise/            # 企业入驻
│   │   ├── register.vue       # 企业入驻表单+专属权益卡
│   │   └── status.vue         # 入驻审核状态
│   └── profile/               # 我的 ✅
│       ├── index.vue          # 用户信息+身份切换sheet+功能grid+权益+设置
│       ├── settings.vue       # 头像/手机/邮箱 + 清单/共享/导出/权限 + 退出
│       ├── collection.vue     # 个人信息收集清单
│       ├── share.vue          # 第三方信息共享清单
│       └── permission.vue     # 个人信息权限管理(toggle开关)
```

---

## 2. 已完成的完整链路

### 2.1 包车出行
home → charter/index → 选套餐sheet → charter/confirm → pay/success

### 2.2 租车出行
home → rental/index → 选车型日期sheet → rental/confirm → pay/success

### 2.3 认证 + 我的
login → home | 企业入驻 → enterprise/register → status
我的 → 身份切换sheet + 设置 → 收集清单/三方共享/权限管理

---

## 3. 公共组件 API

### 3.1 navbar
| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| title | string | '' | 标题 |
| showBack | boolean | false | 返回按钮 |
| theme | light/dark/transparent | light | 配色 |
| align | left/center | left | 标题对齐 |

### 3.2 tab-bar
| Prop | 类型 | 说明 |
|---|---|---|
| current | home/profile | 当前激活tab |

### 3.3 bottom-sheet
| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| modelValue | boolean | — | 支持v-model |
| title | string | '' | 标题 |
| maxHeight | string | 85vh | 最大高度 |
| closable | boolean | true | 关闭按钮 |
| showHandle | boolean | true | 顶部把手 |

Slot: default / header / footer

### 3.4 m-icon
| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| name | string | — | 图标名 |
| size | number/string | 24 | 大小 |
| color | string | '' | 颜色 |
| fill | boolean | false | FILL=1变体 |

---

## 4. 布局规范（⭐ 必读，禁止再犯）

### 4.1 有固定 footer 的页面（如详情页、确认页）

```scss
.root { height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
.header { flex-shrink: 0; /* paddingTop 加在这里 */ }
.body { flex: 1; overflow-y: auto; }   /* ← view + overflow，绝不用 scroll-view */
.footer { flex-shrink: 0; }            /* ← flex 子元素，绝不用 position:fixed */
```

### 4.2 无固定 footer 的页面（如设置页、列表页）

```scss
.root { min-height: 100vh; /* 自然滚动，不锁高度 */ }
```

### 4.3 三大铁律

| # | 规则 | 原因 |
|---|---|---|
| 1 | **H5 绝不用 `scroll-view`** | uni-app scroll-view 在 H5 不遵守 flex:1，会按内容撑开溢出 |
| 2 | **`paddingTop` 绝不加在 `height:100vh` 的容器上** | 100vh + paddingTop > 100%，必然溢出 |
| 3 | **fixed footer 改为 flex 子元素** | fixed 脱离文档流，body 需要手动算 paddingBottom 容易出错 |

---

## 5. 跨页面数据流

### 5.1 地址选址 (storage)
```
页面 setStorageSync('address-pick-field', 'xxx')
  → address/search?field=xxx → onPickItem 写入 address-pick-result
  → 页面 onShow 读取回填 + 删除
```
field 支持: `origin` / `destination` / `rental-pickup` / `rental-return`

### 5.2 支付流程 (URL params)
```
confirm → [企业] showModal → success?status=paid|pending
       → [微信/支付宝] navigateTo pay.vue?source=charter|rental
           ├─ 确认支付 → success?status=paid
           └─ X关闭 → 确认离开 → success?status=pending
```

---

## 6. 路由表

| path | 状态 |
|---|---|
| pages/index/index | ✅ |
| pages/profile/index | ✅ |
| pages/profile/settings | ✅ |
| pages/profile/collection | ✅ |
| pages/profile/share | ✅ |
| pages/profile/permission | ✅ |
| pages/login/index | ✅ |
| pages/enterprise/register | ✅ |
| pages/enterprise/status | ✅ |
| pages/charter/index | ✅ |
| pages/charter/confirm | ✅ |
| pages/charter/pay | ✅ |
| pages/charter/fee | ✅ |
| pages/charter/success | ✅ |
| pages/rental/index | ✅ |
| pages/rental/confirm | ✅ |
| pages/rental/fee | ✅ |
| pages/rental/success | ✅ |
| pages/address/search | ✅ |
| pages/address/map | ✅ |
| pages/trips/index | ⬜ 待建 |
| pages/enterprise/index | ⬜ 待建 |
| pages/invoice/index | ⬜ 待建 |
| pages/messages/index | ⬜ 待建 |

---

## 7. 待处理事项

### 高优先级

| # | 事项 | 原型位置 | 说明 |
|---|---|---|---|
| 1 | **预约用车 booking** | SCREEN: BOOKING (line 339-743) | index + confirm + fee + success 四个页面，含途经点、时间选择器、乘车人切换 |
| 2 | **行程列表 trips** | SCREEN: 我的行程列表 (line 1367) | 包车/租车订单卡片列表，tab 切换状态筛选 |
| 3 | **行程详情 trip-detail** | SCREEN: 包车订单详情 (line 1653) / 租车订单详情 (line 1795) | 订单信息展示 + 行程追踪入口 |

### 中优先级

| # | 事项 | 原型位置 | 说明 |
|---|---|---|---|
| 4 | **消息中心 messages** | SCREEN: 消息中心列表 (line 2580) + 消息详情 (line 2624) | 消息列表 + 详情页 |
| 5 | **电子发票 invoice** | SCREEN: 电子发票列表 (line 2394) + 选择开票订单 (line 2462) + 填写发票信息 (line 2487) + 发票详情 (line 2524) | 4 个页面 |
| 6 | **企业管理 enterprise** | SCREEN: 企业管理首页 (line 2644) + 员工管理 (line 2673) + 添加员工 (line 2703) + 额度消费记录 (line 2720) | 4 个页面 |
| 7 | **车主认证 owner-cert** | SCREEN: OWNER CERTIFICATION (line 2836) | 尊界车主身份认证表单 |

### 低优先级

| # | 事项 | 说明 |
|---|---|---|
| 8 | 行程追踪 trip-tracking | 实时地图 + 司机信息 + 行程进度 |
| 9 | 驾驶证上传 (租车) | 当前为占位 toast，需接入真实上传 |
| 10 | 支付确认页 pay-confirm | 原型 SCREEN: 支付确认 (line 1907) |
| 11 | 实名认证/个人身份认证 | 原型身份切换弹窗中"个人身份"对应的认证流程 |

---

## 8. 已删除页面

| 页面 | 原因 |
|---|---|
| pages/profile/info.vue | 用户要求删除，信息合并到 settings 页（加了邮箱字段） |
