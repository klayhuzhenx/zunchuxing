// ===== 员工 =====
export type EmployeeRole = 'employee' | 'finance' | 'admin';
export type EmployeeStatus = 'active' | 'resigned';

export interface Employee {
  id: string; name: string; phone: string;
  role: EmployeeRole; roleLabel: string;
  monthlyConsumption: number; totalConsumption: number;
  status: EmployeeStatus; joinedAt: string;
}

// ===== 订单 =====
export type OrderType = 'charter' | 'rental';
export type OrderStatus = 'unpaid' | 'pending_dispatch' | 'pending_start' | 'ongoing' | 'completed' | 'cancelled' | 'pending_extra';

export interface DaySchedule {
  date: string; timeRange: string;
  vehiclePlate?: string; vehicleModel?: string;
  driverName?: string; driverPhone?: string;
  status: 'ongoing' | 'not_started' | 'completed';
}

export interface Order {
  id: string; orderNo: string; type: OrderType; status: OrderStatus; subStatus?: string;
  passengerName: string; passengerPhone: string;
  passengerRole?: string;
  // 包车
  startTime?: string; endTime?: string; days?: number;
  pickupAddress?: string; dropoffAddress?: string;
  passengerCount?: number; luggage?: string;
  schedules?: DaySchedule[];
  // 租车
  rentalStart?: string; rentalEnd?: string;
  pickupAddr?: string; returnAddr?: string;
  deliveryDriver?: string; deliveryDriverPhone?: string;
  pickupDriver?: string; pickupDriverPhone?: string;
  driverLicense?: string;
  // 通用
  driverName?: string; driverPhone?: string;
  plateNo?: string; carModel?: string;
  baseFee: number; overtimeFee: number; overmileageFee: number;
  paidAmount: number; refundAmount: number;
  cancelReason?: string;
  createdAt: string; paymentTime?: string;
}

// ===== 额度与消费 =====
export interface ConsumptionRecord {
  id: string; time: string; type: 'consume' | 'refund';
  amount: number; orderNo: string; passengerName: string; description: string;
}

export interface QuotaChangeRecord {
  id: string; time: string; type: 'increase' | 'decrease';
  amount: number; operator: string; reason: string;
}

// ===== 账单 =====
export type SettlementStatus = 'pending' | 'partial' | 'settled';

export interface Bill {
  id: string; billNo: string; month: string;
  consumption: number; refund: number;
  pendingAmount: number; settledAmount: number;
  status: SettlementStatus;
}

export interface BillDetailItem {
  date: string; orderNo: string; type: string; passenger: string; amount: number;
}

export interface BillRefundItem {
  date: string; refundNo: string; orderNo: string; amount: number; reason: string;
}

export interface SettlementRecord {
  operator: string; time: string; amount: number; voucherUrl?: string;
}

// ===== 发票 =====
export type InvoiceStatus = 'pending_approval' | 'rejected' | 'issued' | 'cancelled';

export interface Invoice {
  id: string; invoiceNo: string; type: string;
  relatedOrders: string; amount: number;
  applicant: string; appliedAt: string; issuedAt?: string;
  status: InvoiceStatus;
  companyName: string; taxId: string; email: string;
  rejectReason?: string;
}

// ===== 企业信息 =====
export interface EnterpriseInfo {
  name: string; creditCode: string;
  contactName: string; contactPhone: string;
  totalQuota: number; usedQuota: number; remainingQuota: number;
}

// ===== 用户 =====
export interface EnterpriseUser {
  name: string; phone: string; role: EmployeeRole;
  enterpriseName: string; account: string;
}

// ===== 工作台 =====
export interface DashboardData {
  remainingQuota: number; monthConsumption: number;
  monthOrders: number; activeEmployees: number;
  recentOrders: Order[];
}
