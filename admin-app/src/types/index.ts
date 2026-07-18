// ===== 通用类型 =====

export type Role = 'super_admin' | 'ops_admin' | 'finance_admin' | 'cs_admin';

export interface User {
  id: string; account: string; name: string; role: Role; roleLabel: string; phone: string; avatar?: string;
}

// ===== 企业客户 =====
// 线索客户状态（§3.2）
export type LeadStatus = 'pending' | 'converted' | 'invalid';
// 正式客户状态（§3.4）
export type EnterpriseStatus = 'active' | 'disabled';
export type EnterpriseSource = 'miniapp' | 'h5' | 'backend';

// 线索客户（§3.2）
export interface Lead {
  id: string; name: string; creditCode: string;
  contactName: string; contactPhone: string;
  source: EnterpriseSource; status: LeadStatus;
  createdAt: string;
  /** 标记无效时的原因 */
  invalidReason?: string;
  /** 转为正式客户的关联企业 ID */
  convertedEnterpriseId?: string;
  /** 转为正式客户的时间 */
  convertedAt?: string;
}

// 正式客户（§3.4）
export interface Enterprise {
  id: string; code: string; name: string; creditCode: string;
  contactName: string; contactPhone: string; employeeCount: number;
  totalQuota: number; usedAmount: number; remainingQuota: number;
  status: EnterpriseStatus; source: EnterpriseSource; createdAt: string;
  adminName?: string; adminPhone?: string;
  licenseImage?: string; remark?: string;
  /** 禁用原因 */
  disableReason?: string;
}

export interface QuotaChange {
  id: string; enterpriseId: string; type: 'increase' | 'decrease';
  amount: number; reason: string; operator: string; createdAt: string;
}

export interface ConsumptionRecord {
  id: string; orderNo: string; type: 'consume' | 'refund';
  amount: number; employeeName: string; scene: 'charter' | 'rental'; createdAt: string;
}

// ===== 订单管理 =====

export type OrderType = 'charter' | 'rental';
export type OrderStatus = 'unpaid' | 'pending_dispatch' | 'pending_start' | 'pending_enroute' | 'ongoing' | 'pending_extra' | 'completed' | 'cancelled';
export type PaymentMethod = 'enterprise_credit' | 'alipay' | 'wechat';

// 退款记录：手工退款（运营发起）/ 订单退款（系统按规则自动）
export interface RefundRecord {
  id: string;
  type: 'manual' | 'order';           // 手工退款 / 订单退款
  time: string;                        // 退款时间
  amount: number;                      // 退款金额
  operator?: string;                   // 手工退款：操作人
  reason?: string;                     // 手工退款：原因
  orderRefundType?: 'early_end' | 'cancel';  // 订单退款：提前结束 / 取消订单
}

export interface Order {
  id: string; orderNo: string; type: OrderType; status: OrderStatus;
  subStatus?: string; passengerName: string; passengerPhone: string;
  paymentMethod: PaymentMethod; enterpriseName?: string;
  startTime?: string; endTime?: string;
  days: number; pickupAddress: string; dropoffAddress: string;
  rentalStart?: string; rentalEnd?: string;
  userIdentity?: "personal" | "enterprise_employee"; passengerCount?: number; luggage?: string;
  enterpriseOrderName?: string;
  driverName?: string; driverPhone?: string;
  plateNo?: string; carModel?: string;
  // 租车送车/收车司机
  deliveryDriver?: string; deliveryDriverPhone?: string;
  pickupDriver?: string; pickupDriverPhone?: string;
  baseFee: number; overtimeFee: number; overmileageFee: number;
  /** 积分抵扣：已使用的积分数（0 或 undefined 表示未使用积分） */
  pointsUsed?: number;
  /** 远调费明细：包车 = 接/送 距离+费用；租车 = 取/还 距离+费用 */
  remoteDispatchDetail?: {
    pickupKm: number;    // 包车-接 或 租车-取 的远调距离 km
    dropoffKm: number;   // 包车-送 或 租车-还 的远调距离 km
    pickupFee: number;   // 包车-接 或 租车-取 对应的费用
    dropoffFee: number;  // 包车-送 或 租车-还 对应的费用
  };
  discount: number; paidAmount: number; refundAmount: number;
  /** 退款记录明细（手工退款 + 订单退款） */
  refundRecords?: RefundRecord[];
  paymentTime?: string; passengerNote?: string; internalNote?: string;
  createdAt: string;
  schedules?: DaySchedule[];
  /** 租车押金（仅租车订单） */
  // 车辆押金（预计 7 日内退还）
  depositVehicle?: number;
  depositVehiclePaidAt?: string;
  depositVehicleRefunded?: boolean;
  depositVehicleRefundedAt?: string;
  depositVehicleRefundReason?: string;
  depositVehicleDeduct?: number;
  // 违章押金（预计 30 日内退还）
  depositViolation?: number;
  depositViolationPaidAt?: string;
  depositViolationRefunded?: boolean;
  depositViolationRefundedAt?: string;
  depositViolationRefundReason?: string;
  depositViolationDeduct?: number;
}

export interface DaySchedule {
  date: string; timeRange: string;
  vehiclePlate?: string; vehicleModel?: string;
  driverName?: string; driverPhone?: string;
}

export type DriverOrderStatus = 'not_started' | 'in_progress' | 'pending_settlement' | 'completed' | 'cancelled';

// 出车单额外费用明细
export interface ExtraFeeItem {
  type: 'overtime' | 'excess_mileage' | 'other';
  category: string;   // 超时费 / 超里程费 / 过路费 / 停车费 / 过夜费...
  amount: number;
  // 超时费
  startTime?: string;        // 实际开始时间
  endTime?: string;          // 实际结束时间
  baseDuration?: string;     // 基础时长
  overtimeDuration?: string; // 超时长
  // 超里程费
  startMileage?: number;     // 开始里程
  endMileage?: number;       // 结束里程
  baseMileage?: number;      // 基础里程
  excessMileage?: number;    // 超里程数
  // 通用
  description?: string;      // 说明
  voucherImage?: string;     // 凭证图片
  voucherTime?: string;      // 凭证消费时间 YYYY-MM-DD HH:mm:ss
}

export interface DriverOrder {
  id: string; driverOrderNo: string; orderId: string; orderNo: string;
  type: OrderType; driverName: string; driverPhone: string;
  plateNo: string; carModel: string;
  passengerName: string; passengerPhone: string;
  tripDate: string; plannedTimeRange: string;
  actualStartTime?: string; actualEndTime?: string;
  duration?: number; mileage?: number; extraFee?: number; extraFeeDetail?: string; extraFeeItems?: ExtraFeeItem[];
  status: DriverOrderStatus; dispatchTime?: string;
  pickupAddress?: string; dropoffAddress?: string;
  /** 实际上车点 */
  actualPickupAddress?: string;
  /** 实际下车点 */
  actualDropoffAddress?: string;
  /** 预计上车时间 */
  plannedPickupTime?: string;
}

// ===== 车辆管理 =====

export type VehicleStatus = 'in_use' | 'decommissioned';
export type DocStatus = 'complete' | 'incomplete' | 'expiring';

export interface DriverBinding {
  driverName: string; driverPhone: string; boundAt: string; unboundAt?: string;
}

export interface Vehicle {
  id: string; code: string; plateNo: string; type: string;
  brand: string; model: string; seats: number; color: string;
  vin?: string; engineNo?: string; regDate?: string; initialMileage?: number;
  photos?: string[];
  driverBindings?: DriverBinding[];
  licenseFront?: string; licenseBack?: string;
  docStatus: DocStatus; status: VehicleStatus; createdAt: string;
  /** 运营区域 ID 列表（多选） */
  areaIds?: string[];
}

// ===== 司机管理 =====

export type DriverStatus = 'active' | 'decommissioned';

export interface Driver {
  id: string; code: string; name: string; phone: string;
  idCard: string; licenseNo?: string; licenseType: string;
  licenseImage?: string;
  licenseImages?: string[];
  licenseExpiry: string; gender: 'male' | 'female'; birthDate?: string;
  photo?: string; remark?: string;
  gpsLocation?: string; gpsUpdatedAt?: string;
  serviceCount: number; serviceHours: number; rating: number;
  onTimeRate: number; goodReviewRate: number;
  boundVehicles?: { plateNo: string; carModel: string; boundAt: string }[];
  bindingRecords?: { plateNo: string; boundAt: string; unboundAt?: string; operator: string }[];
  statusChangeRecords?: { type: 'disable' | 'enable'; reason: string; operator: string; time: string }[];
  status: DriverStatus; createdAt: string;
  /** 运营区域 ID 列表（多选） */
  areaIds?: string[];
}

// ===== 财务管理 =====

export type TransactionType = 'payment' | 'refund' | 'extra_payment';
export type TransactionStatus = 'success' | 'failed' | 'processing';

export interface Transaction {
  id: string; txnNo: string; orderNo: string;
  type: TransactionType; paymentMethod: string;
  amount: number; party: string;
  time: string; status: TransactionStatus;
}

// 操作日志（发票/回款共用）
export interface OperationLogEntry {
  time: string;
  action: string;
  operator: string;
  remark?: string;
}

// ===== 发票管理（§7.1） =====
export type InvoiceStatus = 'issuing' | 'issued' | 'rejected' | 'cancelled';
// 开票中(蓝) / 已开票(绿) / 已驳回(红) / 已取消(灰)
export type InvoiceChannel = 'ops_backend' | 'enterprise_backend' | 'miniapp' | 'harmony';
// 运营后台 / 企业后台 / 乘客小程序 / 鸿蒙APP
export type InvoiceSubject = 'personal' | 'enterprise';   // 开票主体
export type InvoiceType = 'general' | 'special';          // 普通发票 / 专用发票（仅企业）

export interface Invoice {
  id: string;
  applyNo: string;             // 申请编号 FP
  channel: InvoiceChannel;
  applicantName: string;
  applicantPhone: string;
  enterpriseId?: string;
  enterpriseName?: string;     // 申请企业（主体=企业时）
  subject: InvoiceSubject;
  invoiceType: InvoiceType;
  title: string;               // 发票抬头
  // 专用发票字段（仅 subject=enterprise && invoiceType=special）
  taxNo?: string;
  companyAddress?: string;
  bankName?: string;
  bankAccount?: string;
  companyPhone?: string;
  remark?: string;
  orderNos: string[];          // 关联订单号列表
  amount: number;              // 开票金额
  applyTime: string;
  status: InvoiceStatus;
  attachment?: string;         // 发票附件（base64 或 url）
  attachmentName?: string;
  uploadTime?: string;
  operator?: string;           // 开票操作人
  rejectReason?: string;
  rejectTime?: string;
  rejectOperator?: string;
  operationLogs: OperationLogEntry[];
}

// ===== 回款管理（§7.2） =====
export type PaymentStatus = 'pending' | 'verifying' | 'completed';
// 待回款(琥珀) / 回款核实(蓝) / 已完成(绿)；驳回回退到 pending

export interface Payment {
  id: string;
  paymentNo: string;           // 回款单号 HK
  invoiceId: string;
  invoiceApplyNo: string;      // 关联发票申请编号
  enterpriseId: string;
  enterpriseName: string;
  amount: number;              // 回款金额
  status: PaymentStatus;
  voucherUploader?: string;    // 凭证上传人
  createdAt: string;
  voucher?: string;            // 支付凭证（base64 或 url）
  voucherName?: string;
  voucherUploadTime?: string;
  verifyResult?: string;       // 核实结果
  verifyRemark?: string;       // 核实备注
  verifyOperator?: string;     // 核实人
  verifyTime?: string;
  rejectReason?: string;       // 最近一次驳回原因
  operationLogs: OperationLogEntry[];
}

// ===== 工作台 =====

export interface DashboardStats {
  todayOrders: number; todayOrdersChange: number;
  todayCompletedOrders: number; todayCompletedOrdersChange: number;
  todayRevenue: number; todayRevenueChange: number;
  pendingDispatch: number; pendingExtra: number;
  onlineDrivers: number; totalDrivers: number;
}

export interface TodoItem {
  id: string; type: string; title: string; count: number;
  subtitle?: string; priority: 'urgent' | 'important' | 'normal'; link: string;
}

export interface TrendData { date: string; orders: number; revenue: number; }

// ===== 运营配置 =====
// 取消规则梯度：每档完全自定义时间区间和扣费比例
export interface CancelTier {
  fromHours: number;  // 距出发 ≥ X 小时
  toHours: number;    // 距出发 < X 小时
  pct: number;        // 扣费比例 1-100
}

// 远调费梯度：按里程区间收取固定金额
export interface RemoteDispatchTier {
  fromKm: number;
  toKm: number;       // -1 表示无上限
  amount: number;
}

// 梯度折扣：按下单天数区间设置折扣系数（按包车/租车维度全局配置）
export interface DiscountTier {
  fromDays: number;   // ≥ X 天
  toDays: number;     // < Y 天；-1 表示无上限
  coefficient: number; // 折扣系数，如 0.95 表示 95 折
}

// 梯度折扣配置：包车、租车各自一套
export interface DiscountConfig {
  charter: DiscountTier[];
  rental: DiscountTier[];
}

export interface PricingRule {
  id: string; modelId: string; modelName: string;
  tier?: string; // package name for charter, undefined for rental
  halfDayPrice?: number; dayPrice: number;
  serviceContent?: string;
  // 新取消规则：免费阈值 + 自定义梯度数组 + 超时档
  cancelFreeHours: number;
  cancelTiers?: CancelTier[];   // 自定义梯度（多档）
  cancelOverduePct?: number;    // 超时档比例
  // 旧字段保留兼容
  cancelFreeMins: number;
  cancelTier1Pct?: number;
  cancelTier2Pct?: number;
  cancelTier3Pct?: number;
  cancelMidHigh: number; cancelMidLow: number;
  cancelMidPct: number; cancelHighPct: number;
  overtimeRate: number; extraMileageRate: number;
  // 包车：半日超时费率（仅包车有，与整日 overtimeRate 区分；列表展示 "半日/整日"）
  halfDayOvertimeRate?: number;
  waitFreeMins?: number; waitRate?: number;
  remoteDispatchTiers?: RemoteDispatchTier[];
  depositVehicle?: number;    // 车辆押金（仅租车，预计 7 日内退还）
  depositViolation?: number;  // 违章押金（仅租车，预计 30 日内退还）
  benefitTagIds?: string[];
  remark?: string;
  status: 'active' | 'inactive';
}

export interface VehicleModel {
  id: string; name: string; brand: string; seats: number; category: string;
  displayName?: string;     // 说明名字（乘客端展示）
  image?: string;
  tagIds?: string[];        // 车型标签
  vehicleCount: number; status: 'active' | 'inactive';
}

export interface BenefitTag {
  id: string; name: string; icon: string; status: 'active' | 'inactive'; order?: number;
}

export interface BenefitTemplate {
  id: string; code: string; name: string; type: string;
  totalCount: number; totalAmount: number; singleLimit?: number;
  validMonths: number; applicableModels: string[];
  remark?: string; status: 'active' | 'inactive';
}

export interface QuotaAlertConfig { threshold: number; frequency: string; }

// ===== 积分权益配置（§8.3） =====
export interface PointsConfig {
  /** 积分兑换比例：N 积分 = ¥1 */
  exchangeRate: number;
  /** 单次抵扣上限（元），0 表示不限制 */
  maxDeductionLimit?: number;
  /** 最低抵扣积分：单次最低使用积分数 */
  minPoints?: number;
}

export interface PlatformTimeoutConfig {
  paymentTimeoutMinutes: number;  // 默认 20 分钟
  dispatchTimeoutHours: number;   // 默认 2 小时
}

export interface OpsCity {
  id: string; name: string; regionCount: number; status: 'active' | 'inactive';
}

export interface OpsRegion {
  id: string; name: string; city: string;
  status: 'active' | 'inactive'; updatedAt: string;
}

export interface ServiceAgreement {
  id: string; name: string; type: 'service' | 'privacy' | 'business';
  version: string; content: string;
  status: 'published' | 'draft';
  updatedAt: string; operator: string;
  history?: { version: string; updatedAt: string; operator: string; content: string }[];
}

export interface FeeType {
  id: string; name: string; remark?: string; status: 'active' | 'inactive';
}

// ===== 数据分析 =====
export interface OverviewMetric {
  label: string; value: string; change?: number; changeLabel?: string;
}
export interface TrendPoint { date: string; charter: number; rental: number; revenue: number; avgPrice: number; }
export interface TopItem { name: string; value: number; extra?: string; }

// ===== 系统管理 =====
export type AccountRole = 'super_admin' | 'ops_admin' | 'finance_admin' | 'cs_admin';
export type AccountStatus = 'active' | 'disabled';

export interface OperatorAccount {
  id: string; username: string; name: string; phone: string;
  role: AccountRole; areas?: string[]; status: AccountStatus;
  createdAt: string; lastLogin?: string; lastIp?: string;
}

export interface LoginLog {
  id: string; username: string; name: string; time: string;
  ip: string; device: string; result: 'success' | 'failed';
  failReason?: string;
}

export interface OperationLog {
  id: string; time: string; operator: string; module: string;
  type: string; target: string; detail: string; ip: string;
}

export interface OnlineUser {
  id: string; username: string; name: string; role: AccountRole;
  loginTime: string; ip: string; device: string; duration: string;
}
