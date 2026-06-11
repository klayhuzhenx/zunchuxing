// ===== 通用类型 =====

export type Role = 'super_admin' | 'ops_admin' | 'finance_admin' | 'cs_admin';

export interface User {
  id: string; account: string; name: string; role: Role; roleLabel: string; phone: string; avatar?: string;
}

// ===== 企业客户 =====

export type EnterpriseStatus = 'pending' | 'approved' | 'rejected' | 'disabled';
export type EnterpriseSource = 'miniapp' | 'backend';

export interface Enterprise {
  id: string; code: string; name: string; creditCode: string;
  contactName: string; contactPhone: string; employeeCount: number;
  totalQuota: number; usedAmount: number; remainingQuota: number;
  status: EnterpriseStatus; source: EnterpriseSource; createdAt: string;
  rejectReason?: string; adminName?: string; adminPhone?: string;
  licenseImage?: string; remark?: string;
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
export type OrderStatus = 'unpaid' | 'pending_dispatch' | 'pending_start' | 'ongoing' | 'pending_extra' | 'completed' | 'cancelled';
export type PaymentMethod = 'enterprise_credit' | 'alipay' | 'wechat';

export interface Order {
  id: string; orderNo: string; type: OrderType; status: OrderStatus;
  subStatus?: string; passengerName: string; passengerPhone: string;
  paymentMethod: PaymentMethod; enterpriseName?: string;
  startTime?: string; endTime?: string;
  days: number; pickupAddress: string; dropoffAddress: string;
  rentalStart?: string; rentalEnd?: string;
  userIdentity?: "personal" | "enterprise_employee"; passengerCount?: number; luggage?: string;
  enterpriseOrderName?: string; review?: OrderReview;
  driverName?: string; driverPhone?: string;
  plateNo?: string; carModel?: string;
  // 租车送车/收车司机
  deliveryDriver?: string; deliveryDriverPhone?: string;
  pickupDriver?: string; pickupDriverPhone?: string;
  baseFee: number; overtimeFee: number; overmileageFee: number;
  discount: number; paidAmount: number; refundAmount: number;
  paymentTime?: string; passengerNote?: string; internalNote?: string;
  createdAt: string;
  schedules?: DaySchedule[];
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
}

// ===== 财务管理 =====

export type SettlementStatus = 'pending' | 'partial' | 'settled';

export interface EnterpriseBill {
  id: string; billNo: string; enterpriseId: string; enterpriseName: string;
  month: string;  // YYYY-MM
  consumption: number; refund: number;
  pendingAmount: number; settledAmount: number;
  status: SettlementStatus;
}

export interface BillOrderItem {
  date: string; orderNo: string; type: 'charter' | 'rental';
  passenger: string; amount: number; settled: boolean;
}

export interface BillRefundItem {
  date: string; refundNo: string; orderNo: string; amount: number; reason: string;
}

export type TransactionType = 'payment' | 'refund' | 'extra_payment';
export type TransactionStatus = 'success' | 'failed' | 'processing';

export interface Transaction {
  id: string; txnNo: string; orderNo: string;
  type: TransactionType; paymentMethod: string;
  amount: number; party: string;
  time: string; status: TransactionStatus;
}

// ===== 用户评价 =====

export interface OrderReview {
  driverRating: number; vehicleRating: number; serviceRating: number;
  comment?: string;
}

// ===== 工作台 =====

export interface DashboardStats {
  todayOrders: number; todayOrdersChange: number;
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
  waitFreeMins?: number; waitRate?: number;
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

export interface PlatformTimeoutConfig {
  paymentTimeoutMinutes: number;  // 默认 20 分钟
  dispatchTimeoutHours: number;   // 默认 2 小时
}

export interface OpsCity {
  id: string; name: string; regionCount: number; status: 'active' | 'inactive';
}

export interface OpsRegion {
  id: string; name: string; city: string; vehicleIds: string[];
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
