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
    id: 'o3b', orderNo: 'ZC20260611-001', type: 'charter', status: 'pending_enroute',
    passengerName: '赵先生', passengerPhone: '139****3333', passengerRole: '员工', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    startTime: '2026-06-11 09:00', endTime: '2026-06-11 18:00', days: 1,
    pickupAddress: '合肥南站', dropoffAddress: '天鹅湖大酒店',
    passengerCount: 1, luggage: '1件',
    driverName: '王师傅', driverPhone: '139****8888', plateNo: '沪B88888', carModel: '增程星辉行政版',
    paymentMethod: 'wechat', baseFee: 2088, overtimeFee: 0, overmileageFee: 0, paidAmount: 2088, refundAmount: 0,
    createdAt: '2026-06-11 07:30', paymentTime: '2026-06-11 07:35',
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
    rentalStart: '2026-06-03 10:00', rentalEnd: '2026-06-05 18:00',
    pickupAddress: '政务中心停车场', dropoffAddress: '翡翠路88号',
    pickupAddr: '政务中心停车场', returnAddr: '翡翠路88号',
    deliveryDriver: '赵师傅', deliveryDriverPhone: '138****8888',
    pickupDriver: '赵师傅', pickupDriverPhone: '138****8888',
    driverLicense: 'C1',
    driverName: '赵师傅', driverPhone: '138****8888', plateNo: '京A34567', carModel: '奥迪A6L',
    paymentMethod: 'wechat', baseFee: 4500, overtimeFee: 0, overmileageFee: 0,
    remoteDispatchDetail: { pickupKm: 0, dropoffKm: 0, pickupFee: 0, dropoffFee: 0 },
    paidAmount: 4500, refundAmount: 0,
    depositVehicle: 3000, depositVehiclePaidAt: '2026-06-02 14:10', depositVehicleRefunded: true, depositVehicleRefundedAt: '2026-06-05 18:00', depositVehicleRefundReason: '已还车，车况良好', depositVehicleDeduct: 0,
    depositViolation: 2000, depositViolationPaidAt: '2026-06-02 14:10', depositViolationRefunded: true, depositViolationRefundedAt: '2026-06-05 18:00',
    createdAt: '2026-06-02 14:00', paymentTime: '2026-06-02 14:10',
  },
  {
    id: 'o6', orderNo: 'ZC20260607-001', type: 'rental', status: 'pending_dispatch',
    passengerName: '刘女士', passengerPhone: '134****5555', passengerRole: '员工', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    rentalStart: '2026-06-12 08:00', rentalEnd: '2026-06-13 20:00',
    pickupAddress: '滨湖万达广场', dropoffAddress: '南京南站',
    pickupAddr: '滨湖万达广场', returnAddr: '南京南站',
    paymentMethod: 'enterprise_credit', baseFee: 3000, overtimeFee: 0, overmileageFee: 0, paidAmount: 3000, refundAmount: 0,
    depositVehicle: 2000, depositVehiclePaidAt: '2026-06-07 09:15', depositVehicleRefunded: false,
    depositViolation: 1000, depositViolationPaidAt: '2026-06-07 09:15', depositViolationRefunded: false,
    createdAt: '2026-06-07 09:00', paymentTime: '2026-06-07 09:15',
  },
  {
    id: 'o8', orderNo: 'ZC20260608-002', type: 'rental', status: 'pending_start',
    passengerName: '何先生', passengerPhone: '138****1234', passengerRole: '员工', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    rentalStart: '2026-06-08 08:00', rentalEnd: '2026-06-10 20:00',
    pickupAddress: '上海市浦东新区张江高科技园区', dropoffAddress: '上海市静安区南京西路',
    pickupAddr: '上海市浦东新区张江高科技园区', returnAddr: '上海市静安区南京西路',
    driverLicense: 'C1',
    driverName: '刘师傅', driverPhone: '138****1111', plateNo: '沪A11111', carModel: '奥迪A6L',
    deliveryDriver: '刘师傅', deliveryDriverPhone: '138****1111',
    pickupDriver: '陈师傅', pickupDriverPhone: '138****1010',
    paymentMethod: 'enterprise_credit', baseFee: 4500, overtimeFee: 0, overmileageFee: 0,
    remoteDispatchDetail: { pickupKm: 0, dropoffKm: 0, pickupFee: 0, dropoffFee: 0 },
    paidAmount: 4500, refundAmount: 0,
    depositVehicle: 5000, depositVehiclePaidAt: '2026-06-08 07:00', depositVehicleRefunded: false,
    depositViolation: 3000, depositViolationPaidAt: '2026-06-08 07:00', depositViolationRefunded: false,
    createdAt: '2026-06-07 13:00', paymentTime: '2026-06-07 14:00',
    schedules: Array.from({ length: 3 }, (_, i) => ({
      date: `2026-06-0${8 + i}`, timeRange: '08:00-20:00',
      vehiclePlate: '沪A11111', vehicleModel: '奥迪A6L', driverName: '刘师傅', driverPhone: '138****1111',
      status: 'not_started' as const,
    })),
  },
  {
    id: 'o9', orderNo: 'ZC20260604-002', type: 'rental', status: 'pending_extra',
    passengerName: '高先生', passengerPhone: '138****2345', passengerRole: '员工', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    rentalStart: '2026-06-04 06:00', rentalEnd: '2026-06-04 22:00',
    pickupAddress: '广州市天河区网易大厦', dropoffAddress: '广州市白云区白云机场T1',
    pickupAddr: '广州市天河区网易大厦', returnAddr: '广州市白云区白云机场T1',
    driverLicense: 'C1',
    driverName: '周师傅', driverPhone: '138****1313', plateNo: '粤A22222', carModel: '奔驰E300L',
    deliveryDriver: '周师傅', deliveryDriverPhone: '138****1313',
    pickupDriver: '赵师傅', pickupDriverPhone: '138****8888',
    paymentMethod: 'enterprise_credit', baseFee: 1500, overtimeFee: 150, overmileageFee: 0,
    remoteDispatchDetail: { pickupKm: 0, dropoffKm: 0, pickupFee: 0, dropoffFee: 0 },
    paidAmount: 1500, refundAmount: 0,
    depositVehicle: 2000, depositVehiclePaidAt: '2026-06-03 18:00', depositVehicleRefunded: false,
    depositViolation: 1000, depositViolationPaidAt: '2026-06-03 18:00', depositViolationRefunded: false,
    createdAt: '2026-06-03 17:00', paymentTime: '2026-06-03 18:00',
    schedules: [{ date: '2026-06-04', timeRange: '06:00-22:00', vehiclePlate: '粤A22222', vehicleModel: '奔驰E300L', driverName: '周师傅', driverPhone: '138****1313', status: 'completed' }],
  },
  {
    id: 'o10', orderNo: 'ZC20260612-002', type: 'rental', status: 'completed',
    passengerName: '林女士', passengerPhone: '139****3456', passengerRole: '员工', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    rentalStart: '2026-06-12 09:00', rentalEnd: '2026-06-14 18:00',
    pickupAddress: '深圳市南山区前海', dropoffAddress: '深圳市坪山区比亚迪路',
    pickupAddr: '深圳市南山区前海', returnAddr: '深圳市坪山区比亚迪路',
    driverLicense: 'C1',
    driverName: '黄师傅', driverPhone: '138****1212', plateNo: '粤B99999', carModel: '别克GL8',
    deliveryDriver: '黄师傅', deliveryDriverPhone: '138****1212',
    pickupDriver: '陈师傅', pickupDriverPhone: '138****1010',
    paymentMethod: 'wechat', baseFee: 1500, overtimeFee: 200, overmileageFee: 100,
    pointsUsed: 5000,
    remoteDispatchDetail: { pickupKm: 0, dropoffKm: 0, pickupFee: 0, dropoffFee: 0 },
    paidAmount: 4800, refundAmount: 0,
    depositVehicle: 3000, depositVehiclePaidAt: '2026-06-11 16:00', depositVehicleRefunded: false,
    depositViolation: 2000, depositViolationPaidAt: '2026-06-11 16:00', depositViolationRefunded: false,
    createdAt: '2026-06-11 15:30', paymentTime: '2026-06-11 16:00',
    schedules: [{ date: '2026-06-12', timeRange: '09:00-21:00', vehiclePlate: '粤B99999', vehicleModel: '别克GL8', driverName: '黄师傅', driverPhone: '138****1212', status: 'completed' }],
  },
  {
    id: 'o11', orderNo: 'ZC20260605-002', type: 'rental', status: 'cancelled',
    passengerName: '韩女士', passengerPhone: '138****3456', passengerRole: '员工', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    rentalStart: '2026-06-05 14:00', rentalEnd: '2026-06-05 22:00',
    pickupAddress: '北京市朝阳区国贸', dropoffAddress: '北京市大兴区北京大兴国际机场',
    pickupAddr: '北京市朝阳区国贸', returnAddr: '北京市大兴区北京大兴国际机场',
    driverLicense: 'C1',
    paymentMethod: 'alipay', baseFee: 1500, overtimeFee: 0, overmileageFee: 0,
    paidAmount: 1500, refundAmount: 1000,
    refundRecords: [{ id: 'rf1', type: 'order', time: '2026-06-04 20:30', amount: 1000, orderRefundType: 'cancel' }],
    depositVehicle: 2000, depositVehiclePaidAt: '2026-06-04 20:00', depositVehicleRefunded: true, depositVehicleRefundedAt: '2026-06-04 20:30', depositVehicleRefundReason: '订单取消自动退还', depositVehicleDeduct: 0,
    depositViolation: 1000, depositViolationPaidAt: '2026-06-04 20:00', depositViolationRefunded: false,
    cancelReason: '行程变更',
    createdAt: '2026-06-04 19:00', paymentTime: '2026-06-04 20:00',
  },
  {
    id: 'o7', orderNo: 'ZC20260528-001', type: 'charter', status: 'cancelled',
    passengerName: '陈先生', passengerPhone: '135****4444', passengerRole: '员工', userIdentity: 'enterprise_employee', enterpriseName: '腾讯科技',
    startTime: '2026-05-28 07:00', endTime: '2026-05-28 18:00', days: 1,
    pickupAddress: '滨湖新区', dropoffAddress: '南京南站',
    passengerCount: 2, luggage: '2件',
    baseFee: 4176, overtimeFee: 0, overmileageFee: 0, paidAmount: 4176, refundAmount: 2088,
    refundRecords: [
      { id: 'RF1', type: 'order', time: '2026-05-28 11:00', amount: 2088, orderRefundType: 'cancel' },
    ],
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
  { id: 'inv1', applyNo: 'FP20260606-0001', type: '普通发票', relatedOrders: 'ZC20260605-001', amount: 3980, applicant: '李女士', appliedAt: '2026-06-06 10:00', issuedAt: '2026-06-07 14:00', status: 'issued', title: '腾讯科技', companyName: '腾讯科技', taxId: '91110108551491491M', email: 'finance@tencent.com', attachment: '/mock/invoice/inv1.pdf',
    operationLogs: [{ time: '2026-06-06 10:00', action: '提交开票申请', operator: '李女士' }, { time: '2026-06-07 14:00', action: '开票完成', operator: '系统' }] },
  { id: 'inv2', applyNo: 'FP20260609-0002', type: '专用发票', relatedOrders: 'ZC20260608-001, ZC20260610-001', amount: 10440, applicant: '张先生', appliedAt: '2026-06-09 11:00', status: 'issuing', title: '腾讯科技', companyName: '腾讯科技', taxId: '91110108551491491M', address: '深圳市南山区科技园', bankName: '招商银行深圳分行', bankAccount: '6225880123456789', companyPhone: '0755-12345678', email: 'admin@tencent.com', remark: '请尽快开具',
    operationLogs: [{ time: '2026-06-09 11:00', action: '提交开票申请', operator: '张先生' }] },
  { id: 'inv3', applyNo: 'FP20260529-0003', type: '普通发票', relatedOrders: 'ZC20260528-001', amount: 4176, applicant: '陈先生', appliedAt: '2026-05-29 09:00', status: 'cancelled', title: '腾讯科技', companyName: '腾讯科技', taxId: '91110108551491491M', email: 'chen@tencent.com', rejectReason: '发票信息有误',
    operationLogs: [{ time: '2026-05-29 09:00', action: '提交开票申请', operator: '陈先生' }, { time: '2026-05-30 10:00', action: '取消申请', operator: '陈先生' }] },
  { id: 'inv4', applyNo: 'FP20260610-0004', type: '普通发票', relatedOrders: 'ZC20260609-001', amount: 3480, applicant: '王先生', appliedAt: '2026-06-10 14:00', status: 'rejected', title: '腾讯科技', companyName: '腾讯科技', taxId: '91110108551491491M', email: 'wang@tencent.com', rejectReason: '发票抬头信息有误，请核实后重新提交', rejectedAt: '2026-06-10 16:00',
    operationLogs: [{ time: '2026-06-10 14:00', action: '提交开票申请', operator: '王先生' }, { time: '2026-06-10 16:00', action: '驳回开票', operator: '运营', remark: '发票抬头信息有误' }] },
];

// ===== 付款管理 =====
export const mockPayments: Payment[] = [
  { id: 'pm1', paymentNo: 'HK20260603-0001', invoiceId: 'inv1', invoiceApplyNo: 'FP20260606-0001', amount: 3980, status: 'paid', createdAt: '2026-06-07 14:30',
    voucher: '/mock/payment/pm1.jpg', voucherName: '银行转账凭证.jpg', voucherUploader: '李女士', voucherUploadTime: '2026-06-08 09:00',
    verifyResult: '通过', verifyOperator: '张财务', verifyTime: '2026-06-08 10:30',
    operationLogs: [{ time: '2026-06-07 14:30', action: '付款任务已生成', operator: '系统' }, { time: '2026-06-08 09:00', action: '上传支付凭证', operator: '李女士' }, { time: '2026-06-08 10:30', action: '核实通过', operator: '张财务' }] },
  { id: 'pm2', paymentNo: 'HK20260609-0002', invoiceId: 'inv2', invoiceApplyNo: 'FP20260609-0002', amount: 10440, status: 'verifying', createdAt: '2026-06-09 11:05',
    voucher: '/mock/payment/pm2.jpg', voucherName: '转账凭证.jpg', voucherUploader: '张先生', voucherUploadTime: '2026-06-10 08:00',
    operationLogs: [{ time: '2026-06-09 11:05', action: '付款任务已生成', operator: '系统' }, { time: '2026-06-10 08:00', action: '上传支付凭证', operator: '张先生' }] },
  { id: 'pm3', paymentNo: 'HK20260610-0003', invoiceId: 'inv4', invoiceApplyNo: 'FP20260610-0004', amount: 3480, status: 'pending', createdAt: '2026-06-10 16:05',
    operationLogs: [{ time: '2026-06-10 16:05', action: '付款任务已生成', operator: '系统' }] },
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
