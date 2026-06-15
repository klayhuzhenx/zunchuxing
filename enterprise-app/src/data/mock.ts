import type { Employee, Order, ConsumptionRecord, QuotaChangeRecord, Bill, BillDetailItem, BillRefundItem, SettlementRecord, Invoice, EnterpriseInfo, EnterpriseUser, DashboardData } from '../types';

export const currentUser: EnterpriseUser = {
  name: '张先生', phone: '138****0000', role: 'admin', account: '13800000000',
  enterpriseName: '腾讯科技',
};

export const mockEnterprise: EnterpriseInfo = {
  name: '腾讯科技', creditCode: '91110108551491491M',
  contactName: '张先生', contactPhone: '13800000000',
  totalQuota: 200000, usedQuota: 87650, remainingQuota: 112350,
};

// ===== 员工 =====
export const mockEmployees: Employee[] = [
  { id: '1', name: '张先生', phone: '138****0000', role: 'admin', roleLabel: '企业管理员', monthlyConsumption: 6500, totalConsumption: 45000, status: 'active', joinedAt: '2026-01-15' },
  { id: '2', name: '李女士', phone: '139****1111', role: 'finance', roleLabel: '财务', monthlyConsumption: 4200, totalConsumption: 28000, status: 'active', joinedAt: '2026-02-20' },
  { id: '3', name: '王先生', phone: '137****2222', role: 'employee', roleLabel: '员工', monthlyConsumption: 0, totalConsumption: 12000, status: 'active', joinedAt: '2026-03-10' },
  { id: '4', name: '赵女士', phone: '136****3333', role: 'employee', roleLabel: '员工', monthlyConsumption: 3200, totalConsumption: 18500, status: 'active', joinedAt: '2026-04-01' },
  { id: '5', name: '陈先生', phone: '135****4444', role: 'employee', roleLabel: '员工', monthlyConsumption: 0, totalConsumption: 8500, status: 'resigned', joinedAt: '2026-01-20' },
  { id: '6', name: '刘女士', phone: '134****5555', role: 'employee', roleLabel: '员工', monthlyConsumption: 1800, totalConsumption: 5200, status: 'active', joinedAt: '2026-05-08' },
];

// ===== 订单 =====
export const mockOrders: Order[] = [
  // 包车订单
  {
    id: 'o1', orderNo: 'ZC20260608-001', type: 'charter', status: 'ongoing',
    passengerName: '张先生', passengerPhone: '138****0000', passengerRole: '企业管理员', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    startTime: '2026-06-08 07:00', endTime: '2026-06-09 18:00', days: 2,
    pickupAddress: '合肥南站东广场', dropoffAddress: '经开区石门路188号',
    passengerCount: 2, luggage: '2件',
    schedules: [
      { date: '06-08', timeRange: '08:00-18:00', vehiclePlate: '京A12345', vehicleModel: '奔驰V260L', driverName: '李师傅', driverPhone: '138****6666', status: 'ongoing' },
      { date: '06-09', timeRange: '08:00-18:00', vehiclePlate: '京A12345', vehicleModel: '奔驰V260L', driverName: '李师傅', driverPhone: '138****6666', status: 'not_started' },
    ],
    driverName: '李师傅', driverPhone: '138****6666', plateNo: '京A12345', carModel: '奔驰V260L',
    paymentMethod: 'enterprise_credit', baseFee: 4176, overtimeFee: 0, overmileageFee: 0, paidAmount: 4176, refundAmount: 0,
    createdAt: '2026-06-07 15:30', paymentTime: '2026-06-07 15:35',
  },
  {
    id: 'o2', orderNo: 'ZC20260605-001', type: 'charter', status: 'completed',
    passengerName: '李女士', passengerPhone: '139****1111', passengerRole: '财务', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    startTime: '2026-06-05 09:00', endTime: '2026-06-05 18:00', days: 1,
    pickupAddress: '半岛酒店', dropoffAddress: '浦东机场T2',
    passengerCount: 1, luggage: '1件',
    driverName: '张师傅', driverPhone: '137****7777', plateNo: '沪B67890', carModel: '奥迪A8L',
    paymentMethod: 'enterprise_credit', baseFee: 3480, overtimeFee: 500, overmileageFee: 0,
    pointsUsed: 3000,
    remoteDispatchDetail: { pickupKm: 3.5, dropoffKm: 4.2, pickupFee: 100, dropoffFee: 100 },
    paidAmount: 4050, refundAmount: 0,
    feeExtraDetail: {
      overtimeDetails: [{ date: '2026-06-05', actualStart: '2026-06-05 09:00', actualEnd: '2026-06-05 19:00', totalMinutes: 600, packageMinutes: 540, excessMinutes: 60, rate: 100, amount: 100 }],
      excessMileageDetails: [{ date: '2026-06-05', startMileage: 28500, endMileage: 28700, totalKm: 200, packageKm: 100, excessKm: 100, rate: 5, amount: 500 }],
    },
    createdAt: '2026-06-04 10:00', paymentTime: '2026-06-04 10:05',
  },
  {
    id: 'o3', orderNo: 'ZC20260610-001', type: 'charter', status: 'pending_dispatch',
    passengerName: '王先生', passengerPhone: '137****2222', passengerRole: '员工', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    startTime: '2026-06-10 08:00', endTime: '2026-06-12 18:00', days: 3,
    pickupAddress: '天鹅湖万达', dropoffAddress: '骆岗公园南门',
    passengerCount: 3, luggage: '3件',
    paymentMethod: 'alipay', baseFee: 6264, overtimeFee: 0, overmileageFee: 0, paidAmount: 6264, refundAmount: 0,
    createdAt: '2026-06-09 08:30', paymentTime: '2026-06-09 08:35',
  },
  {
    id: 'o4', orderNo: 'ZC20260601-001', type: 'charter', status: 'completed',
    passengerName: '张先生', passengerPhone: '138****0000', passengerRole: '企业管理员', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    startTime: '2026-06-01 08:00', endTime: '2026-06-01 18:00', days: 1,
    pickupAddress: '政务中心', dropoffAddress: '会展中心',
    passengerCount: 1, luggage: '0件',
    driverName: '李师傅', driverPhone: '138****6666', plateNo: '京A12345', carModel: '奔驰V260L',
    paymentMethod: 'enterprise_credit', baseFee: 2088, overtimeFee: 0, overmileageFee: 0,
    remoteDispatchDetail: { pickupKm: 0, dropoffKm: 0, pickupFee: 0, dropoffFee: 0 },
    paidAmount: 2088, refundAmount: 0,
    createdAt: '2026-05-31 16:00', paymentTime: '2026-05-31 16:10',
  },
  // 租车订单
  {
    id: 'o5', orderNo: 'ZC20260603-001', type: 'rental', status: 'completed',
    passengerName: '赵女士', passengerPhone: '136****3333', passengerRole: '员工', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    rentalStart: '2026-06-03', rentalEnd: '2026-06-05',
    pickupAddress: '政务中心停车场', dropoffAddress: '翡翠路88号',
    pickupAddr: '政务中心停车场', returnAddr: '翡翠路88号',
    deliveryDriver: '赵师傅', deliveryDriverPhone: '138****8888',
    pickupDriver: '赵师傅', pickupDriverPhone: '138****8888',
    driverLicense: 'C1',
    driverName: '赵师傅', driverPhone: '138****8888', plateNo: '京A34567', carModel: '奥迪A6L',
    paymentMethod: 'wechat', baseFee: 4500, overtimeFee: 0, overmileageFee: 0,
    remoteDispatchDetail: { pickupKm: 0, dropoffKm: 0, pickupFee: 0, dropoffFee: 0 },
    paidAmount: 4500, refundAmount: 0,
    createdAt: '2026-06-02 14:00', paymentTime: '2026-06-02 14:10',
  },
  {
    id: 'o6', orderNo: 'ZC20260607-001', type: 'rental', status: 'pending_dispatch',
    passengerName: '刘女士', passengerPhone: '134****5555', passengerRole: '员工', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    rentalStart: '2026-06-12', rentalEnd: '2026-06-13',
    pickupAddress: '滨湖万达广场', dropoffAddress: '南京南站',
    pickupAddr: '滨湖万达广场', returnAddr: '南京南站',
    paymentMethod: 'enterprise_credit', baseFee: 3000, overtimeFee: 0, overmileageFee: 0, paidAmount: 3000, refundAmount: 0,
    createdAt: '2026-06-07 09:00', paymentTime: '2026-06-07 09:15',
  },
  {
    id: 'o7', orderNo: 'ZC20260528-001', type: 'charter', status: 'cancelled',
    passengerName: '陈先生', passengerPhone: '135****4444', passengerRole: '员工', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    startTime: '2026-05-28 07:00', endTime: '2026-05-28 18:00', days: 1,
    pickupAddress: '滨湖新区', dropoffAddress: '南京南站',
    passengerCount: 2, luggage: '2件',
    baseFee: 4176, overtimeFee: 0, overmileageFee: 0, paidAmount: 4176, refundAmount: 2088,
    paymentMethod: 'wechat', cancelReason: '行程变更',
    createdAt: '2026-05-27 10:00', paymentTime: '2026-05-27 10:05',
  },
  {
    id: 'o8', orderNo: 'ZC20260609-001', type: 'charter', status: 'pending_extra', subStatus: '待补款',
    passengerName: '李女士', passengerPhone: '139****1111', passengerRole: '财务', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    startTime: '2026-06-09 08:00', endTime: '2026-06-09 18:00', days: 1,
    pickupAddress: '半岛酒店', dropoffAddress: '浦东机场',
    passengerCount: 1, luggage: '1件',
    driverName: '王师傅', driverPhone: '139****9999', plateNo: '沪C11111', carModel: '宝马7系',
    paymentMethod: 'alipay', baseFee: 3480, overtimeFee: 500, overmileageFee: 200, paidAmount: 3480, refundAmount: 0,
    feeExtraDetail: {
      waitFee: { driverArriveTime: '2026-06-09 07:45', driverArriveAddr: '浦东机场T2到达层', passengerPickupTime: '2026-06-09 08:15', waitMinutes: 30, freeMinutes: 15, excessMinutes: 15, rate: 1, amount: 15 },
      overtimeDetails: [
        { date: '2026-06-09', actualStart: '2026-06-09 08:15', actualEnd: '2026-06-09 19:00', totalMinutes: 645, packageMinutes: 600, excessMinutes: 45, rate: 100, amount: 75 },
      ],
      excessMileageDetails: [
        { date: '2026-06-09', startMileage: 28500, endMileage: 28700, totalKm: 200, packageKm: 100, excessKm: 100, rate: 5, amount: 500 },
      ],
      otherFees: [
        { id: 'of1', type: '高速费', amount: 50, voucherTime: '2026-06-09 10:30' },
        { id: 'of2', type: '停车费', amount: 30, voucherTime: '2026-06-09 14:00' },
      ],
    },
    createdAt: '2026-06-08 20:00', paymentTime: '2026-06-08 20:10',
  },
];

// ===== 消费明细 =====
export const mockConsumption: ConsumptionRecord[] = [
  { id: 'c1', time: '2026-06-08 07:30', type: 'consume', amount: 4176, orderNo: 'ZC20260608-001', passengerName: '张先生', description: '包车出行 2天' },
  { id: 'c2', time: '2026-06-05 09:30', type: 'consume', amount: 3980, orderNo: 'ZC20260605-001', passengerName: '李女士', description: '包车出行 1天（含超时费）' },
  { id: 'c3', time: '2026-06-03 15:00', type: 'consume', amount: 4500, orderNo: 'ZC20260603-001', passengerName: '赵女士', description: '租车出行 3天' },
  { id: 'c4', time: '2026-06-01 08:30', type: 'consume', amount: 2088, orderNo: 'ZC20260601-001', passengerName: '张先生', description: '包车出行 1天' },
  { id: 'c5', time: '2026-05-28 11:00', type: 'refund', amount: 2088, orderNo: 'ZC20260528-001', passengerName: '陈先生', description: '取消订单退款（50%）' },
  { id: 'c6', time: '2026-06-09 10:00', type: 'consume', amount: 6264, orderNo: 'ZC20260610-001', passengerName: '王先生', description: '包车出行 3天' },
];

// ===== 额度变动记录 =====
export const mockQuotaChanges: QuotaChangeRecord[] = [
  { id: 'q1', time: '2026-06-01 09:00', type: 'increase', amount: 50000, operator: '运营李', reason: '线下打款 ¥50,000' },
  { id: 'q2', time: '2026-05-01 09:00', type: 'increase', amount: 100000, operator: '运营张', reason: '初始额度开通' },
  { id: 'q3', time: '2026-04-15 14:30', type: 'increase', amount: 50000, operator: '运营李', reason: '赠送试用额度' },
];

// ===== 账单 =====
const junDetails: BillDetailItem[] = [
  { date: '2026-06-08', orderNo: 'ZC20260608-001', type: '包车出行', passenger: '张先生', amount: 4176 },
  { date: '2026-06-05', orderNo: 'ZC20260605-001', type: '包车出行', passenger: '李女士', amount: 3980 },
  { date: '2026-06-03', orderNo: 'ZC20260603-001', type: '租车出行', passenger: '赵女士', amount: 4500 },
  { date: '2026-06-01', orderNo: 'ZC20260601-001', type: '包车出行', passenger: '张先生', amount: 2088 },
];
const junRefunds: BillRefundItem[] = [];
const junSettlements: SettlementRecord[] = [];

const mayDetails: BillDetailItem[] = [
  { date: '2026-05-28', orderNo: 'ZC20260528-001', type: '包车出行', passenger: '陈先生', amount: 4176 },
  { date: '2026-05-25', orderNo: 'ZC20260525-001', type: '租车出行', passenger: '李女士', amount: 3600 },
  { date: '2026-05-20', orderNo: 'ZC20260520-001', type: '包车出行', passenger: '张先生', amount: 2088 },
];
const mayRefunds: BillRefundItem[] = [
  { date: '2026-05-28', refundNo: 'RF20260528-001', orderNo: 'ZC20260528-001', amount: 2088, reason: '取消退款' },
];
const maySettlements: SettlementRecord[] = [
  { operator: '运营张', time: '2026-06-05 10:00', amount: 7776, voucherUrl: '' },
];

export const mockBills: Bill[] = [
  { id: 'b1', billNo: 'BILL202606-0001', month: '2026-06', consumption: 14744, refund: 0, pendingAmount: 14744, settledAmount: 0, status: 'pending' },
  { id: 'b2', billNo: 'BILL202605-0001', month: '2026-05', consumption: 9864, refund: 2088, pendingAmount: 0, settledAmount: 7776, status: 'settled' },
];

export function getBillDetails(month: string): { details: BillDetailItem[]; refunds: BillRefundItem[]; settlements: SettlementRecord[] } {
  if (month === '2026-06') return { details: junDetails, refunds: junRefunds, settlements: junSettlements };
  return { details: mayDetails, refunds: mayRefunds, settlements: maySettlements };
}

// ===== 发票 =====
export const mockInvoices: Invoice[] = [
  { id: 'inv1', invoiceNo: 'INV202606-0001', type: 'general', relatedOrders: 'ZC20260605-001', amount: 3980, applicant: '李女士', appliedAt: '2026-06-06 10:00', issuedAt: '2026-06-07 14:00', status: 'issued', companyName: '腾讯科技', taxId: '91110108551491491M', email: 'finance@tencent.com' },
  { id: 'inv2', invoiceNo: 'INV202606-0002', type: 'special', relatedOrders: 'ZC20260608-001, ZC20260610-001', amount: 10440, applicant: '张先生', appliedAt: '2026-06-09 11:00', status: 'processing', companyName: '腾讯科技', taxId: '91110108551491491M', email: 'admin@tencent.com' },
  { id: 'inv3', invoiceNo: 'INV202605-0001', type: 'general', relatedOrders: 'ZC20260528-001', amount: 4176, applicant: '陈先生', appliedAt: '2026-05-29 09:00', status: 'cancelled', companyName: '腾讯科技', taxId: '91110108551491491M', email: 'chen@tencent.com', rejectReason: '发票信息有误，请核对后重新提交' },
];

// ===== 工作台 =====
export const mockDashboard: DashboardData = {
  remainingQuota: 112350, monthConsumption: 14744, monthOrders: 4, activeEmployees: 5,
  recentOrders: mockOrders.filter(o => o.createdAt >= '2026-06-01').slice(0, 5),
};

// ===== 7日趋势 =====
export const mockWeekTrend = [
  { date: '06-03', orders: 3 },
  { date: '06-04', orders: 2 },
  { date: '06-05', orders: 4 },
  { date: '06-06', orders: 1 },
  { date: '06-07', orders: 5 },
  { date: '06-08', orders: 3 },
  { date: '06-09', orders: 4 },
];

// ===== 30日趋势 =====
export const mockMonthTrend = [
  { date: '05-11', orders: 2 }, { date: '05-12', orders: 4 }, { date: '05-13', orders: 3 },
  { date: '05-14', orders: 5 }, { date: '05-15', orders: 2 }, { date: '05-16', orders: 6 },
  { date: '05-17', orders: 4 }, { date: '05-18', orders: 3 }, { date: '05-19', orders: 7 },
  { date: '05-20', orders: 5 }, { date: '05-21', orders: 3 }, { date: '05-22', orders: 4 },
  { date: '05-23', orders: 2 }, { date: '05-24', orders: 6 }, { date: '05-25', orders: 5 },
  { date: '05-26', orders: 4 }, { date: '05-27', orders: 3 }, { date: '05-28', orders: 5 },
  { date: '05-29', orders: 2 }, { date: '05-30', orders: 4 }, { date: '05-31', orders: 3 },
  { date: '06-01', orders: 2 }, { date: '06-02', orders: 3 }, { date: '06-03', orders: 5 },
  { date: '06-04', orders: 2 }, { date: '06-05', orders: 4 }, { date: '06-06', orders: 1 },
  { date: '06-07', orders: 5 }, { date: '06-08', orders: 3 }, { date: '06-09', orders: 4 },
];

// ===== 关联出车单（企业视角） =====
export const driverOrdersForEnterprise = [
  { id: 'do1', driverOrderNo: 'DR20260608-001', orderNo: 'ZC20260608-001', driverName: '李师傅', driverPhone: '138****6666', plateNo: '京A12345', carModel: '奔驰V260L', tripDate: '2026-06-08', plannedTimeRange: '08:00-18:00', status: 'completed' },
  { id: 'do2', driverOrderNo: 'DR20260609-002', orderNo: 'ZC20260608-001', driverName: '李师傅', driverPhone: '138****6666', plateNo: '京A12345', carModel: '奔驰V260L', tripDate: '2026-06-09', plannedTimeRange: '08:00-18:00', status: 'in_progress' },
  { id: 'do3', driverOrderNo: 'DR20260605-001', orderNo: 'ZC20260605-001', driverName: '张师傅', driverPhone: '137****7777', plateNo: '沪B67890', carModel: '奥迪A8L', tripDate: '2026-06-05', plannedTimeRange: '09:00-18:00', status: 'completed' },
  { id: 'do4', driverOrderNo: 'DR20260603-001', orderNo: 'ZC20260603-001', driverName: '赵师傅', driverPhone: '138****8888', plateNo: '京A34567', carModel: '奥迪A6L', tripDate: '2026-06-03', plannedTimeRange: '09:00-09:30', status: 'completed' },
  { id: 'do5', driverOrderNo: 'DR20260609-003', orderNo: 'ZC20260609-001', driverName: '王师傅', driverPhone: '139****9999', plateNo: '沪C11111', carModel: '宝马7系', tripDate: '2026-06-09', plannedTimeRange: '08:00-18:00', status: 'pending_settlement' },
  { id: 'do6', driverOrderNo: 'DR20260601-001', orderNo: 'ZC20260601-001', driverName: '李师傅', driverPhone: '138****6666', plateNo: '京A12345', carModel: '奔驰V260L', tripDate: '2026-06-01', plannedTimeRange: '08:00-18:00', status: 'completed' },
];
