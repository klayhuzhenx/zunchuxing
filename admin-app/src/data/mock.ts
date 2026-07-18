import type {
  User, Enterprise, Lead, QuotaChange, ConsumptionRecord,
  Order, DriverOrder, Driver, Transaction,
  Invoice, Payment,
  DashboardStats, TodoItem, TrendData,
  Vehicle, DaySchedule,
  BenefitTag, PointsConfig, PlatformTimeoutConfig, OpsCity, ServiceAgreement, FeeType,
  DiscountConfig,
} from '../types';

// ===== 当前登录用户 =====
export const currentUser: User = {
  id: 'U001', account: 'admin', name: '张管理', role: 'super_admin',
  roleLabel: '超级管理员', phone: '13800000001',
};

// ===== 线索客户（§3.2）=====
export const leads: Lead[] = [
  { id: 'L001', name: '成都新希望集团有限公司', creditCode: '915101006740801234', contactName: '陈静', contactPhone: '13900006006', source: 'miniapp', status: 'pending', createdAt: '2026-06-16 08:20' },
  { id: 'L002', name: '南京苏宁易购电子商务有限公司', creditCode: '913201007985012345', contactName: '周杰', contactPhone: '13900007007', source: 'miniapp', status: 'pending', createdAt: '2026-06-17 13:10' },
  { id: 'L003', name: '武汉东风汽车集团有限公司', creditCode: '914201007985067890', contactName: '吴敏', contactPhone: '13900008008', source: 'h5', status: 'pending', createdAt: '2026-06-15 15:30' },
  { id: 'L004', name: '北京小米科技有限责任公司', creditCode: '911101085514412345', contactName: '郑宇', contactPhone: '13900010001', source: 'miniapp', status: 'converted', createdAt: '2026-06-10 09:00', convertedEnterpriseId: 'E010', convertedAt: '2026-06-12 10:30' },
  { id: 'L005', name: '深圳大疆创新科技有限公司', creditCode: '914403007985055432', contactName: '林峰', contactPhone: '13900011002', source: 'miniapp', status: 'invalid', createdAt: '2026-06-05 11:00', invalidReason: '电话无法接通，多次联系未果' },
];

// ===== 正式客户（§3.4）=====
export const enterprises: Enterprise[] = [
  { id: 'E001', code: 'ENT20260001', name: '深圳腾讯科技有限公司', creditCode: '914403001922038216', contactName: '李明', contactPhone: '13900001001', employeeCount: 120, totalQuota: 200000, usedAmount: 87650, remainingQuota: 112350, status: 'active', source: 'miniapp', createdAt: '2026-01-15 10:30', adminName: '李明', adminPhone: '13900001001' },
  { id: 'E002', code: 'ENT20260002', name: '北京字节跳动网络技术有限公司', creditCode: '911101085514439488', contactName: '王芳', contactPhone: '13900002002', employeeCount: 85, totalQuota: 150000, usedAmount: 120300, remainingQuota: 29700, status: 'active', source: 'backend', createdAt: '2026-02-20 14:00', adminName: '王芳', adminPhone: '13900002002', remark: '线下签约大客户' },
  { id: 'E003', code: 'ENT20260003', name: '上海华为技术有限公司', creditCode: '91310115671155143X', contactName: '张伟', contactPhone: '13900003003', employeeCount: 200, totalQuota: 500000, usedAmount: 325000, remainingQuota: 175000, status: 'active', source: 'miniapp', createdAt: '2026-03-05 09:15', adminName: '张伟', adminPhone: '13900003003' },
  { id: 'E004', code: 'ENT20260004', name: '广州网易计算机系统有限公司', creditCode: '914401017285149867', contactName: '赵丽', contactPhone: '13900004004', employeeCount: 45, totalQuota: 80000, usedAmount: 79200, remainingQuota: 800, status: 'active', source: 'miniapp', createdAt: '2026-03-18 16:45', adminName: '赵丽', adminPhone: '13900004004' },
  { id: 'E005', code: 'ENT20260005', name: '杭州阿里巴巴集团控股有限公司', creditCode: '913301007990542515', contactName: '刘强', contactPhone: '13900005005', employeeCount: 300, totalQuota: 800000, usedAmount: 456000, remainingQuota: 344000, status: 'active', source: 'backend', createdAt: '2026-01-08 11:00', adminName: '刘强', adminPhone: '13900005005', remark: '年度框架协议客户' },
  { id: 'E009', code: 'ENT20260009', name: '厦门美图网科技有限公司', creditCode: '913502007985098765', contactName: '黄磊', contactPhone: '13900009009', employeeCount: 30, totalQuota: 50000, usedAmount: 48900, remainingQuota: 1100, status: 'disabled', source: 'miniapp', createdAt: '2026-04-10 10:00', disableReason: '长期欠费未结' },
  { id: 'E010', code: 'ENT20260010', name: '北京小米科技有限责任公司', creditCode: '911101085514412345', contactName: '郑宇', contactPhone: '13900010001', employeeCount: 80, totalQuota: 100000, usedAmount: 12000, remainingQuota: 88000, status: 'active', source: 'miniapp', createdAt: '2026-06-12 10:30', adminName: '郑宇', adminPhone: '13900010001' },
];

export const quotaChanges: QuotaChange[] = [
  { id: 'Q001', enterpriseId: 'E001', type: 'increase', amount: 200000, reason: '初始额度充值', operator: '张管理', createdAt: '2026-01-15 10:35' },
  { id: 'Q002', enterpriseId: 'E002', type: 'increase', amount: 150000, reason: '线下签约初始额度', operator: '张管理', createdAt: '2026-02-20 14:05' },
  { id: 'Q003', enterpriseId: 'E003', type: 'increase', amount: 500000, reason: '初始额度充值', operator: '张管理', createdAt: '2026-03-05 09:20' },
  { id: 'Q004', enterpriseId: 'E004', type: 'increase', amount: 80000, reason: '初始额度充值', operator: '张管理', createdAt: '2026-03-18 16:50' },
  { id: 'Q005', enterpriseId: 'E001', type: 'decrease', amount: 10000, reason: '记账纠错', operator: '李运营', createdAt: '2026-04-20 11:00' },
  { id: 'Q006', enterpriseId: 'E001', type: 'increase', amount: 50000, reason: '线下打款 ¥50,000', operator: '张管理', createdAt: '2026-05-10 09:30' },
];

export const consumptionRecords: ConsumptionRecord[] = [
  { id: 'C001', orderNo: 'ZC20260601-0001', type: 'consume', amount: 2088, employeeName: '赵晓明', scene: 'charter', createdAt: '2026-06-01 08:00' },
  { id: 'C002', orderNo: 'ZC20260601-0002', type: 'consume', amount: 4176, employeeName: '钱丽华', scene: 'charter', createdAt: '2026-06-01 09:30' },
  { id: 'C003', orderNo: 'ZC20260602-0003', type: 'consume', amount: 1500, employeeName: '孙建国', scene: 'rental', createdAt: '2026-06-02 10:00' },
  { id: 'C004', orderNo: 'ZC20260603-0004', type: 'consume', amount: 6264, employeeName: '李思远', scene: 'charter', createdAt: '2026-06-03 07:00' },
  { id: 'C005', orderNo: 'ZC20260603-0005', type: 'refund', amount: 500, employeeName: '周文博', scene: 'rental', createdAt: '2026-06-03 14:00' },
  { id: 'C006', orderNo: 'ZC20260604-0006', type: 'consume', amount: 3000, employeeName: '吴志强', scene: 'rental', createdAt: '2026-06-04 11:20' },
  { id: 'C007', orderNo: 'ZC20260605-0007', type: 'consume', amount: 10440, employeeName: '郑海峰', scene: 'charter', createdAt: '2026-06-05 06:30' },
  { id: 'C008', orderNo: 'ZC20260606-0008', type: 'consume', amount: 2088, employeeName: '王雪梅', scene: 'charter', createdAt: '2026-06-06 08:15' },
];

// ===== 乘客订单 (新版 §4.2) =====
export const orders: Order[] = [
  // --- 包车订单 ---
  {
    id: 'O001', orderNo: 'ZC20260601-0001', type: 'charter', status: 'completed',
    passengerName: '赵晓明', passengerPhone: '13800010001',
    userIdentity: 'enterprise_employee',
    paymentMethod: 'enterprise_credit', enterpriseName: '深圳腾讯科技有限公司',
    startTime: '2026-06-01 08:00', endTime: '2026-06-01 18:00', days: 1,
    pickupAddress: '深圳市南山区科技园腾讯大厦', dropoffAddress: '深圳市福田区会展中心',
    driverName: '王师傅', driverPhone: '13811110001', plateNo: '粤B12345', carModel: '奔驰V260L',
    baseFee: 2088, overtimeFee: 0, overmileageFee: 0,
    remoteDispatchDetail: {
      pickupKm: 3.5, dropoffKm: 4.2,
      pickupFee: 100, dropoffFee: 100,
    },
    discount: 0,
    paidAmount: 2288, refundAmount: 0,
    paymentTime: '2026-05-31 20:00', createdAt: '2026-05-31 19:30',
    schedules: [{ date: '2026-06-01', timeRange: '08:00-18:00', vehiclePlate: '粤B12345', vehicleModel: '奔驰V260L', driverName: '王师傅', driverPhone: '13811110001' }],
  },
  {
    id: 'O001B', orderNo: 'ZC20260611-0001', type: 'charter', status: 'pending_enroute',
    passengerName: '赵先生', passengerPhone: '13900030003',
    userIdentity: 'personal',
    paymentMethod: 'wechat',
    startTime: '2026-06-11 09:00', endTime: '2026-06-11 18:00', days: 1,
    pickupAddress: '合肥南站', dropoffAddress: '天鹅湖大酒店',
    driverName: '王师傅', driverPhone: '1390008888', plateNo: '沪B88888', carModel: '增程星辉行政版',
    baseFee: 2088, overtimeFee: 0, overmileageFee: 0,
    remoteDispatchDetail: { pickupKm: 0, dropoffKm: 0, pickupFee: 0, dropoffFee: 0 },
    discount: 0,
    paidAmount: 2088, refundAmount: 0,
    paymentTime: '2026-06-11 07:35', createdAt: '2026-06-11 07:30',
    schedules: [{ date: '2026-06-11', timeRange: '09:00-18:00', vehiclePlate: '沪B88888', vehicleModel: '增程星辉行政版', driverName: '王师傅', driverPhone: '1390008888' }],
  },
  {
    id: 'O002', orderNo: 'ZC20260601-0002', type: 'charter', status: 'ongoing',
    passengerName: '钱丽华', passengerPhone: '13800020002',
    userIdentity: 'personal',
    paymentMethod: 'alipay',
    startTime: '2026-06-01 09:00', endTime: '2026-06-03 18:00', days: 3,
    pickupAddress: '深圳市宝安区西乡街道', dropoffAddress: '深圳市龙岗区坂田街道',
    driverName: '李师傅', driverPhone: '13811110002', plateNo: '粤B67890', carModel: '别克GL8',
    baseFee: 6264, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 6264, refundAmount: 0,
    paymentTime: '2026-05-31 21:00', createdAt: '2026-05-31 20:00',
    schedules: [
      { date: '2026-06-01', timeRange: '09:00-18:00', vehiclePlate: '粤B67890', vehicleModel: '别克GL8', driverName: '李师傅', driverPhone: '13811110002' },
      { date: '2026-06-02', timeRange: '09:00-18:00', vehiclePlate: '粤B67890', vehicleModel: '别克GL8', driverName: '李师傅', driverPhone: '13811110002' },
      { date: '2026-06-03', timeRange: '09:00-18:00', vehiclePlate: '粤B67890', vehicleModel: '别克GL8', driverName: '李师傅', driverPhone: '13811110002' },
    ],
  },
  {
    id: 'O005', orderNo: 'ZC20260606-0008', type: 'charter', status: 'pending_dispatch',
    passengerName: '王雪梅', passengerPhone: '13800080008',
    userIdentity: 'personal',
    paymentMethod: 'wechat',
    startTime: '2026-06-08 07:00', endTime: '2026-06-08 19:00', days: 1,
    pickupAddress: '深圳市南山区深圳湾科技生态园', dropoffAddress: '深圳市盐田区大梅沙',
    baseFee: 2088, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 2088, refundAmount: 0,
    paymentTime: '2026-06-05 16:00', createdAt: '2026-06-05 15:00',
    passengerNote: '需要儿童安全座椅',
  },
  {
    id: 'O007', orderNo: 'ZC20260607-0010', type: 'charter', status: 'pending_start',
    passengerName: '林小红', passengerPhone: '13800100010',
    userIdentity: 'personal',
    paymentMethod: 'wechat',
    startTime: '2026-06-08 09:00', endTime: '2026-06-09 18:00', days: 2,
    pickupAddress: '深圳市福田区华强北', dropoffAddress: '深圳市南山区华侨城',
    driverName: '陈师傅', driverPhone: '13811110010', plateNo: '粤B56789', carModel: '奔驰V260L',
    baseFee: 4176, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 4176, refundAmount: 0,
    paymentTime: '2026-06-07 10:00', createdAt: '2026-06-07 09:00',
    schedules: [
      { date: '2026-06-08', timeRange: '09:00-18:00', vehiclePlate: '粤B56789', vehicleModel: '奔驰V260L', driverName: '陈师傅', driverPhone: '13811110010' },
      { date: '2026-06-09', timeRange: '09:00-18:00', vehiclePlate: '粤B12345', vehicleModel: '奔驰V260L', driverName: '王师傅', driverPhone: '13811110001' },
    ],
  },
  {
    id: 'O009', orderNo: 'ZC20260603-0012', type: 'charter', status: 'pending_extra',
    passengerName: '吕芳芳', passengerPhone: '13800120012',
    userIdentity: 'personal',
    paymentMethod: 'alipay',
    startTime: '2026-06-03 08:00', endTime: '2026-06-04 18:00', days: 2,
    pickupAddress: '深圳市罗湖区东门', dropoffAddress: '广州市天河区珠江新城',
    driverName: '黄师傅', driverPhone: '13811110012', plateNo: '粤B99999', carModel: '别克GL8',
    baseFee: 4176, overtimeFee: 300, overmileageFee: 200, discount: 0,
    paidAmount: 4176, refundAmount: 0,
    paymentTime: '2026-06-02 20:00', createdAt: '2026-06-02 19:00',
    schedules: [
      { date: '2026-06-03', timeRange: '08:00-18:00', vehiclePlate: '粤B99999', vehicleModel: '别克GL8', driverName: '黄师傅', driverPhone: '13811110012' },
      { date: '2026-06-04', timeRange: '08:00-18:00', vehiclePlate: '粤B99999', vehicleModel: '别克GL8', driverName: '黄师傅', driverPhone: '13811110012' },
    ],
  },
  {
    id: 'O011', orderNo: 'ZC20260605-0014', type: 'charter', status: 'cancelled',
    passengerName: '唐小雪', passengerPhone: '13800140014',
    userIdentity: 'personal',
    paymentMethod: 'alipay',
    startTime: '2026-06-06 08:00', endTime: '2026-06-06 18:00', days: 1,
    pickupAddress: '深圳市南山区科技园', dropoffAddress: '深圳市龙华区深圳北站',
    baseFee: 2088, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 2088, refundAmount: 2088,
    refundRecords: [
      { id: 'RF1', type: 'order', time: '2026-06-04 12:30', amount: 2088, orderRefundType: 'cancel' },
    ],
    paymentTime: '2026-06-04 12:00', createdAt: '2026-06-04 11:00',
  },
  {
    id: 'O013', orderNo: 'ZC20260608-0016', type: 'charter', status: 'unpaid',
    passengerName: '蔡明辉', passengerPhone: '13800160016',
    userIdentity: 'personal',
    paymentMethod: 'wechat',
    startTime: '2026-06-09 08:00', endTime: '2026-06-09 18:00', days: 1,
    pickupAddress: '深圳市南山区前海', dropoffAddress: '深圳市坪山区比亚迪路',
    baseFee: 2088, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 0, refundAmount: 0,
    createdAt: '2026-06-08 10:30',
  },
  // --- 租车订单 ---
  {
    id: 'O003', orderNo: 'ZC20260602-0003', type: 'rental', status: 'completed',
    passengerName: '孙建国', passengerPhone: '13800030003',
    userIdentity: 'personal',
    paymentMethod: 'alipay',
    rentalStart: '2026-06-02 10:00', rentalEnd: '2026-06-02 18:00', days: 1,
    pickupAddress: '深圳宝安国际机场T3', dropoffAddress: '深圳市南山区海岸城',
    deliveryDriver: '赵师傅', deliveryDriverPhone: '13811110003', pickupDriver: '钱师傅', pickupDriverPhone: '13811110004', plateNo: '粤B34567', carModel: '奥迪A6L',
    baseFee: 1500, overtimeFee: 0, overmileageFee: 0,
    remoteDispatchDetail: {
      pickupKm: 0, dropoffKm: 0,
      pickupFee: 0, dropoffFee: 0,
    },
    discount: 0,
    paidAmount: 1500, refundAmount: 0,
    // 车辆押金已退（扣¥200）+ 违章押金已退
    depositVehicle: 3000, depositVehiclePaidAt: '2026-06-01 15:00', depositVehicleRefunded: true, depositVehicleRefundedAt: '2026-06-02 19:00', depositVehicleRefundReason: '已还车，左前门划痕修复', depositVehicleDeduct: 200,
    depositViolation: 2000, depositViolationPaidAt: '2026-06-01 15:00', depositViolationRefunded: true, depositViolationRefundedAt: '2026-06-02 19:00',
    paymentTime: '2026-06-01 15:00', createdAt: '2026-06-01 14:30',
    schedules: [{ date: '2026-06-02', timeRange: '10:00-22:00', vehiclePlate: '粤B34567', vehicleModel: '奥迪A6L', driverName: '赵师傅', driverPhone: '13811110003' }],
  },
  {
    id: 'O006', orderNo: 'ZC20260606-0009', type: 'rental', status: 'pending_dispatch',
    passengerName: '马建国', passengerPhone: '13800090009',
    userIdentity: 'enterprise_employee',
    paymentMethod: 'enterprise_credit', enterpriseName: '北京字节跳动网络技术有限公司',
    rentalStart: '2026-06-08 09:00', rentalEnd: '2026-06-08 21:00', days: 1,
    pickupAddress: '北京市海淀区中关村软件园', dropoffAddress: '北京市朝阳区三里屯',
    baseFee: 1500, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 1500, refundAmount: 0,
    depositVehicle: 3000, depositVehiclePaidAt: '2026-06-06 09:00', depositVehicleRefunded: false,
    depositViolation: 2000, depositViolationPaidAt: '2026-06-06 09:00', depositViolationRefunded: false,
    paymentTime: '2026-06-06 09:00', createdAt: '2026-06-06 08:30',
  },
  {
    id: 'O008', orderNo: 'ZC20260607-0011', type: 'rental', status: 'pending_start',
    passengerName: '何志远', passengerPhone: '13800110011',
    userIdentity: 'enterprise_employee',
    paymentMethod: 'enterprise_credit', enterpriseName: '上海华为技术有限公司',
    rentalStart: '2026-06-08 08:00', rentalEnd: '2026-06-10 20:00', days: 3,
    pickupAddress: '上海市浦东新区张江高科技园区', dropoffAddress: '上海市静安区南京西路',
    driverName: '刘师傅', driverPhone: '13811110011', plateNo: '沪A11111', carModel: '奥迪A6L',
    deliveryDriver: '刘师傅', deliveryDriverPhone: '13811110011', pickupDriver: '陈师傅', pickupDriverPhone: '13811110010',
    baseFee: 4500, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 4500, refundAmount: 0,
    depositVehicle: 5000, depositVehiclePaidAt: '2026-06-07 14:00', depositVehicleRefunded: false,
    depositViolation: 3000, depositViolationPaidAt: '2026-06-07 14:00', depositViolationRefunded: false,
    paymentTime: '2026-06-07 14:00', createdAt: '2026-06-07 13:00',
    schedules: Array.from({ length: 3 }, (_, i) => ({
      date: `2026-06-0${8 + i}`, timeRange: '08:00-20:00',
      vehiclePlate: '沪A11111', vehicleModel: '奥迪A6L', driverName: '刘师傅', driverPhone: '13811110011',
    })),
  },
  {
    id: 'O010', orderNo: 'ZC20260604-0013', type: 'rental', status: 'pending_extra',
    passengerName: '高大鹏', passengerPhone: '13800130013',
    userIdentity: 'enterprise_employee',
    paymentMethod: 'enterprise_credit', enterpriseName: '广州网易计算机系统有限公司',
    rentalStart: '2026-06-04 06:00', rentalEnd: '2026-06-04 22:00', days: 1,
    pickupAddress: '广州市天河区网易大厦', dropoffAddress: '广州市白云区白云机场T1',
    driverName: '周师傅', driverPhone: '13811110013', plateNo: '粤A22222', carModel: '奔驰E300L',
    deliveryDriver: '周师傅', deliveryDriverPhone: '13811110013', pickupDriver: '赵师傅', pickupDriverPhone: '13811110003',
    baseFee: 1500, overtimeFee: 150, overmileageFee: 0, discount: 0,
    paidAmount: 1500, refundAmount: 0,
    depositVehicle: 2000, depositVehiclePaidAt: '2026-06-03 18:00', depositVehicleRefunded: false,
    depositViolation: 1000, depositViolationPaidAt: '2026-06-03 18:00', depositViolationRefunded: false,
    paymentTime: '2026-06-03 18:00', createdAt: '2026-06-03 17:00',
    schedules: [{ date: '2026-06-04', timeRange: '06:00-22:00', vehiclePlate: '粤A22222', vehicleModel: '奔驰E300L', driverName: '周师傅', driverPhone: '13811110013' }],
  },
  {
    id: 'O012', orderNo: 'ZC20260605-0015', type: 'rental', status: 'cancelled',
    passengerName: '韩冰', passengerPhone: '13800150015',
    userIdentity: 'personal',
    paymentMethod: 'alipay',
    rentalStart: '2026-06-05 14:00', rentalEnd: '2026-06-05 22:00', days: 1,
    pickupAddress: '北京市朝阳区国贸', dropoffAddress: '北京市大兴区北京大兴国际机场',
    baseFee: 1500, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 1500, refundAmount: 1000,
    depositVehicle: 2000, depositVehiclePaidAt: '2026-06-04 20:00', depositVehicleRefunded: true, depositVehicleRefundedAt: '2026-06-04 20:30', depositVehicleRefundReason: '订单取消自动退还', depositVehicleDeduct: 0,
    depositViolation: 1000, depositViolationPaidAt: '2026-06-04 20:00', depositViolationRefunded: false,
    refundRecords: [
      { id: 'RF2', type: 'order', time: '2026-06-04 20:30', amount: 1000, orderRefundType: 'cancel' },
    ],
    paymentTime: '2026-06-04 20:00', createdAt: '2026-06-04 19:00',
    internalNote: '乘客提前2小时取消，按规则扣500违约金',
  },
  {
    // 已完成 · 押金未退：行程已结束，等待运营核验车况后退还押金
    id: 'O014', orderNo: 'ZC20260612-0017', type: 'rental', status: 'completed',
    passengerName: '林晓芸', passengerPhone: '13800170017',
    userIdentity: 'personal',
    paymentMethod: 'wechat',
    rentalStart: '2026-06-12 09:00', rentalEnd: '2026-06-14 18:00', days: 3,
    pickupAddress: '深圳市南山区前海', dropoffAddress: '深圳市坪山区比亚迪路',
    deliveryDriver: '黄师傅', deliveryDriverPhone: '13811110012', pickupDriver: '陈师傅', pickupDriverPhone: '13811110010', plateNo: '粤B99999', carModel: '别克GL8',
    baseFee: 1500, overtimeFee: 200, overmileageFee: 100,
    pointsUsed: 5000,
    remoteDispatchDetail: {
      pickupKm: 0, dropoffKm: 0,
      pickupFee: 0, dropoffFee: 0,
    },
    discount: 0,
    paidAmount: 4800, refundAmount: 0,
    depositVehicle: 3000, depositVehiclePaidAt: '2026-06-11 16:00', depositVehicleRefunded: false,
    depositViolation: 2000, depositViolationPaidAt: '2026-06-11 16:00', depositViolationRefunded: false,
    paymentTime: '2026-06-11 16:00', createdAt: '2026-06-11 15:30',
    schedules: [{ date: '2026-06-12', timeRange: '09:00-21:00', vehiclePlate: '粤B99999', vehicleModel: '别克GL8', driverName: '黄师傅', driverPhone: '13811110012' }],
  },
  {
    id: 'O015', orderNo: 'ZC20260615-0019', type: 'charter', status: 'completed',
    passengerName: '王雪梅', passengerPhone: '13800080008',
    userIdentity: 'enterprise_employee',
    paymentMethod: 'enterprise_credit', enterpriseName: '深圳腾讯科技有限公司',
    startTime: '2026-06-15 08:00', endTime: '2026-06-15 18:00', days: 1,
    pickupAddress: '深圳市南山区科技园', dropoffAddress: '深圳市宝安国际机场',
    driverName: '王师傅', driverPhone: '13811110001', plateNo: '粤B12345', carModel: '奔驰V260L',
    baseFee: 2088, overtimeFee: 0, overmileageFee: 0,
    remoteDispatchDetail: { pickupKm: 0, dropoffKm: 0, pickupFee: 0, dropoffFee: 0 },
    discount: 0, paidAmount: 2088, refundAmount: 0,
    paymentTime: '2026-06-14 20:00', createdAt: '2026-06-14 19:30',
    schedules: [{ date: '2026-06-15', timeRange: '08:00-18:00', vehiclePlate: '粤B12345', vehicleModel: '奔驰V260L', driverName: '王师傅', driverPhone: '13811110001' }],
  },
  {
    id: 'O016', orderNo: 'ZC20260616-0020', type: 'rental', status: 'completed',
    passengerName: '陈伟霆', passengerPhone: '13800180018',
    userIdentity: 'enterprise_employee',
    paymentMethod: 'enterprise_credit', enterpriseName: '杭州阿里巴巴集团控股有限公司',
    rentalStart: '2026-06-16 09:00', rentalEnd: '2026-06-17 18:00', days: 2,
    pickupAddress: '杭州市余杭区阿里巴巴西溪园区', dropoffAddress: '杭州市上城区湖滨银泰',
    deliveryDriver: '杨师傅', deliveryDriverPhone: '13811110016', pickupDriver: '吴师傅', pickupDriverPhone: '13811110017', plateNo: '浙A12345', carModel: '奔驰V260L',
    baseFee: 3000, overtimeFee: 0, overmileageFee: 0,
    remoteDispatchDetail: { pickupKm: 0, dropoffKm: 0, pickupFee: 0, dropoffFee: 0 },
    discount: 0, paidAmount: 3000, refundAmount: 0,
    paymentTime: '2026-06-15 20:00', createdAt: '2026-06-15 19:00',
    schedules: [{ date: '2026-06-16', timeRange: '09:00-18:00', vehiclePlate: '浙A12345', vehicleModel: '奔驰V260L', driverName: '杨师傅', driverPhone: '13811110016' }],
  },
];

// ===== 司机出车单 (新版 §4.3) =====
export const driverOrders: DriverOrder[] = [
  {
    id: 'D001', driverOrderNo: 'DR20260601-0001', orderId: 'O001', orderNo: 'ZC20260601-0001',
    type: 'charter', driverName: '王师傅', driverPhone: '13811110001',
    plateNo: '粤B12345', carModel: '奔驰V260L',
    passengerName: '赵晓明', passengerPhone: '13800010001',
    tripDate: '2026-06-01', plannedTimeRange: '08:00-18:00',
    actualStartTime: '2026-06-01 07:50', actualEndTime: '2026-06-01 18:10',
    duration: 620, mileage: 85, extraFee: 115,
    extraFeeItems: [
      { type: 'other', category: '路桥费', amount: 85, description: '广深高速通行费' },
      { type: 'other', category: '停车费', amount: 30, description: '会展中心停车场' },
    ],
    status: 'completed', dispatchTime: '2026-06-01 00:05',
    pickupAddress: '科技园腾讯大厦', dropoffAddress: '福田区会展中心',
    actualPickupAddress: '科技园腾讯大厦B座正门', actualDropoffAddress: '福田区会展中心北门',
    plannedPickupTime: '2026-06-01 08:30',
  },
  {
    id: 'D002', driverOrderNo: 'DR20260601-0002', orderId: 'O002', orderNo: 'ZC20260601-0002',
    type: 'charter', driverName: '李师傅', driverPhone: '13811110002',
    plateNo: '粤B67890', carModel: '别克GL8',
    passengerName: '钱丽华', passengerPhone: '13800020002',
    tripDate: '2026-06-01', plannedTimeRange: '09:00-18:00',
    actualStartTime: '2026-06-01 08:55',
    status: 'in_progress', dispatchTime: '2026-06-01 00:00',
    pickupAddress: '宝安区西乡街道', dropoffAddress: '龙岗区坂田街道',
    actualPickupAddress: '西乡街道宝安大道88号', actualDropoffAddress: '坂田街道华为基地',
    plannedPickupTime: '2026-06-01 09:00',
  },
  {
    id: 'D002b', driverOrderNo: 'DR20260602-0002', orderId: 'O002', orderNo: 'ZC20260601-0002',
    type: 'charter', driverName: '李师傅', driverPhone: '13811110002',
    plateNo: '粤B67890', carModel: '别克GL8',
    passengerName: '钱丽华', passengerPhone: '13800020002',
    tripDate: '2026-06-02', plannedTimeRange: '09:00-18:00',
    status: 'not_started', dispatchTime: '2026-06-01 00:00',
    pickupAddress: '宝安区西乡街道', dropoffAddress: '龙岗区坂田街道',
  },
  {
    id: 'D003', driverOrderNo: 'DR20260608-0010a', orderId: 'O007', orderNo: 'ZC20260607-0010',
    type: 'charter', driverName: '陈师傅', driverPhone: '13811110010',
    plateNo: '粤B56789', carModel: '奔驰V260L',
    passengerName: '林小红', passengerPhone: '13800100010',
    tripDate: '2026-06-08', plannedTimeRange: '09:00-18:00',
    status: 'not_started', dispatchTime: '2026-06-07 10:30',
    pickupAddress: '福田区华强北', dropoffAddress: '南山区华侨城',
  },
  {
    id: 'D003b', driverOrderNo: 'DR20260609-0010b', orderId: 'O007', orderNo: 'ZC20260607-0010',
    type: 'charter', driverName: '王师傅', driverPhone: '13811110001',
    plateNo: '粤B12345', carModel: '奔驰V260L',
    passengerName: '林小红', passengerPhone: '13800100010',
    tripDate: '2026-06-09', plannedTimeRange: '09:00-18:00',
    status: 'not_started', dispatchTime: '2026-06-07 10:30',
    pickupAddress: '福田区华强北', dropoffAddress: '南山区华侨城',
  },
  {
    id: 'D004', driverOrderNo: 'DR20260603-0012a', orderId: 'O009', orderNo: 'ZC20260603-0012',
    type: 'charter', driverName: '黄师傅', driverPhone: '13811110012',
    plateNo: '粤B99999', carModel: '别克GL8',
    passengerName: '吕芳芳', passengerPhone: '13800120012',
    tripDate: '2026-06-03', plannedTimeRange: '08:00-18:00',
    actualStartTime: '2026-06-03 08:05', actualEndTime: '2026-06-03 19:30',
    duration: 685, mileage: 180, extraFee: 615,
    extraFeeItems: [
      { type: 'overtime', category: '超时费', amount: 300, startTime: '2026-06-03 08:05', endTime: '2026-06-03 19:30', baseDuration: '10h', overtimeDuration: '1.5h', voucherImage: '/mock/voucher_overtime_001.jpg', voucherTime: '2026-06-03 19:30:00' },
      { type: 'excess_mileage', category: '超里程费', amount: 200, startMileage: 0, endMileage: 180, baseMileage: 100, excessMileage: 80, voucherImage: '/mock/voucher_mileage_001.jpg', voucherTime: '2026-06-03 19:30:00' },
      { type: 'other', category: '路桥费', amount: 85, description: '沪宁高速通行费' },
      { type: 'other', category: '停车费', amount: 30, description: '目的地停车场' },
    ],
    status: 'pending_settlement', dispatchTime: '2026-06-02 22:00',
    pickupAddress: '罗湖区东门', dropoffAddress: '天河区珠江新城',
  },
  {
    id: 'D005', driverOrderNo: 'DR20260604-0013a', orderId: 'O010', orderNo: 'ZC20260604-0013',
    type: 'rental', driverName: '周师傅', driverPhone: '13811110013',
    plateNo: '粤A22222', carModel: '奔驰E300L',
    passengerName: '高大鹏', passengerPhone: '13800130013',
    tripDate: '2026-06-04', plannedTimeRange: '06:00-22:00',
    actualStartTime: '2026-06-04 06:10', actualEndTime: '2026-06-04 23:00',
    duration: 1010, mileage: 120, extraFee: 150,
    extraFeeItems: [
      { type: 'overtime', category: '超时费', amount: 150, startTime: '2026-06-04 06:10', endTime: '2026-06-04 23:00', baseDuration: '16h', overtimeDuration: '1h', voucherImage: '/mock/voucher_overtime_002.jpg', voucherTime: '2026-06-04 23:00:00' },
    ],
    status: 'pending_settlement', dispatchTime: '2026-06-03 20:00',
    pickupAddress: '天河区网易大厦', dropoffAddress: '白云机场T1',
  },
  {
    id: 'D006', driverOrderNo: 'DR20260608-0011a', orderId: 'O008', orderNo: 'ZC20260607-0011',
    type: 'rental', driverName: '刘师傅', driverPhone: '13811110011',
    plateNo: '沪A11111', carModel: '奥迪A6L',
    passengerName: '何志远', passengerPhone: '13800110011',
    tripDate: '2026-06-08', plannedTimeRange: '08:00-20:00',
    status: 'not_started', dispatchTime: '2026-06-07 15:00',
    pickupAddress: '张江高科技园区', dropoffAddress: '静安区南京西路',
  },
];

// ===== 车辆 =====
export const vehicles: Vehicle[] = [
  { id: 'V001', code: 'CAR20260001', plateNo: '粤B12345', type: 'MPV', brand: '奔驰', model: 'V260L', seats: 7, color: '黑色', vin: 'LSG12345678901234', engineNo: 'ENG20260001', regDate: '2026-01-10', initialMileage: 0, photos: ['/mock/vehicles/v001_01.jpg'], licenseFront: '/mock/license/v001_front.jpg', licenseBack: '/mock/license/v001_back.jpg', driverBindings: [{ driverName: '王师傅', driverPhone: '13811110001', boundAt: '2026-01-15' }], docStatus: 'complete', status: 'in_use', areaIds: ['CT001'], createdAt: '2026-01-10' },
  { id: 'V002', code: 'CAR20260002', plateNo: '粤B67890', type: 'MPV', brand: '别克', model: 'GL8', seats: 7, color: '白色', vin: 'LSG12345678901235', engineNo: 'ENG20260002', regDate: '2026-02-15', initialMileage: 0, licenseFront: '/mock/license/v002_front.jpg', licenseBack: '/mock/license/v002_back.jpg', driverBindings: [{ driverName: '李师傅', driverPhone: '13811110002', boundAt: '2026-02-20' }], docStatus: 'complete', status: 'in_use', areaIds: ['CT001'], createdAt: '2026-02-15' },
  { id: 'V003', code: 'CAR20260003', plateNo: '粤B34567', type: '轿车', brand: '奥迪', model: 'A6L', seats: 5, color: '黑色', vin: 'LSG12345678901236', engineNo: 'ENG20260003', regDate: '2026-03-01', initialMileage: 0, driverBindings: [{ driverName: '赵师傅', driverPhone: '13811110003', boundAt: '2026-03-05' }], docStatus: 'complete', status: 'in_use', areaIds: ['CT001'], createdAt: '2026-03-01' },
  { id: 'V004', code: 'CAR20260004', plateNo: '粤B56789', type: 'MPV', brand: '奔驰', model: 'V260L', seats: 7, color: '银色', vin: 'LSG12345678901237', engineNo: 'ENG20260004', regDate: '2026-03-20', initialMileage: 0, driverBindings: [{ driverName: '陈师傅', driverPhone: '13811110010', boundAt: '2026-03-25' }], docStatus: 'complete', status: 'in_use', areaIds: ['CT001'], createdAt: '2026-03-20' },
  { id: 'V005', code: 'CAR20260005', plateNo: '粤B99999', type: 'MPV', brand: '别克', model: 'GL8', seats: 7, color: '金色', vin: 'LSG12345678901238', engineNo: 'ENG20260005', regDate: '2026-04-05', initialMileage: 0, driverBindings: [{ driverName: '黄师傅', driverPhone: '13811110012', boundAt: '2026-04-10' }], docStatus: 'complete', status: 'in_use', areaIds: ['CT001'], createdAt: '2026-04-05' },
  { id: 'V006', code: 'CAR20260006', plateNo: '粤A22222', type: '轿车', brand: '奔驰', model: 'E300L', seats: 5, color: '黑色', vin: 'LSG12345678901239', engineNo: 'ENG20260006', regDate: '2026-04-15', initialMileage: 0, driverBindings: [{ driverName: '周师傅', driverPhone: '13811110013', boundAt: '2026-04-20' }], docStatus: 'complete', status: 'in_use', areaIds: ['CT003'], createdAt: '2026-04-15' },
  { id: 'V007', code: 'CAR20260007', plateNo: '沪A11111', type: '轿车', brand: '奥迪', model: 'A6L', seats: 5, color: '黑色', vin: 'LSG12345678901240', engineNo: 'ENG20260007', regDate: '2026-05-01', initialMileage: 0, driverBindings: [{ driverName: '刘师傅', driverPhone: '13811110011', boundAt: '2026-05-05' }], docStatus: 'complete', status: 'in_use', areaIds: ['CT002'], createdAt: '2026-05-01' },
  { id: 'V008', code: 'CAR20260008', plateNo: '粤C33333', type: 'MPV', brand: '别克', model: 'GL8', seats: 7, color: '深蓝', vin: 'LSG12345678901241', engineNo: 'ENG20260008', regDate: '2026-03-10', initialMileage: 15000, docStatus: 'complete', status: 'decommissioned', areaIds: ['CT001'], createdAt: '2026-03-10', statusChangeRecords: [{ type: 'disable', reason: '车辆转让', operator: '张运营', time: '2026-05-15 14:30' }] },
];


// ===== 司机 =====
export const drivers: Driver[] = [
  { id: 'DRV001', code: 'DRV20260001', name: '王师傅', phone: '13811110001', idCard: '440301199001011234', licenseNo: '441900199001011234', licenseType: 'A1', licenseExpiry: '2030-05-15', gender: 'male', birthDate: '1990-01-01', gpsLocation: '深圳市南山区科技园', gpsUpdatedAt: '2026-06-08 10:30:00', serviceCount: 128, serviceHours: 1024, rating: 4.9, onTimeRate: 0.97, goodReviewRate: 0.99, boundVehicles: [{ plateNo: '粤B12345', carModel: '奔驰V260L', boundAt: '2026-01-15' }], bindingRecords: [{ plateNo: '粤B12345', boundAt: '2026-01-15', operator: '张运营' }], status: 'active', areaIds: ['CT001'], createdAt: '2026-01-10' },
  { id: 'DRV002', code: 'DRV20260002', name: '李师傅', phone: '13811110002', idCard: '440301199002021234', licenseNo: '441900199002021234', licenseType: 'B1', licenseExpiry: '2029-08-20', gender: 'male', birthDate: '1990-02-02', gpsLocation: '深圳市宝安区西乡', gpsUpdatedAt: '2026-06-08 09:45:00', serviceCount: 95, serviceHours: 760, rating: 4.8, onTimeRate: 0.95, goodReviewRate: 0.97, boundVehicles: [{ plateNo: '粤B67890', carModel: '别克GL8', boundAt: '2026-02-20' }], status: 'active', areaIds: ['CT001'], createdAt: '2026-02-15' },
  { id: 'DRV003', code: 'DRV20260003', name: '赵师傅', phone: '13811110003', idCard: '440301199003031234', licenseNo: '441900199003031234', licenseType: 'C1', licenseExpiry: '2031-03-10', gender: 'male', birthDate: '1990-03-03', gpsLocation: '深圳市福田区华强北', gpsUpdatedAt: '2026-06-08 11:00:00', serviceCount: 76, serviceHours: 608, rating: 4.7, onTimeRate: 0.93, goodReviewRate: 0.95, boundVehicles: [{ plateNo: '粤B34567', carModel: '奥迪A6L', boundAt: '2026-03-05' }], status: 'active', areaIds: ['CT001'], createdAt: '2026-03-01' },
  { id: 'DRV004', code: 'DRV20260004', name: '陈师傅', phone: '13811110010', idCard: '440301199004041234', licenseNo: '441900199004041234', licenseType: 'A2', licenseExpiry: '2028-12-25', gender: 'male', birthDate: '1990-04-04', serviceCount: 52, serviceHours: 416, rating: 4.6, onTimeRate: 0.90, goodReviewRate: 0.92, boundVehicles: [{ plateNo: '粤B56789', carModel: '奔驰V260L', boundAt: '2026-03-25' }], status: 'active', areaIds: ['CT001'], createdAt: '2026-03-20' },
  { id: 'DRV005', code: 'DRV20260005', name: '黄师傅', phone: '13811110012', idCard: '440301199005051234', licenseNo: '441900199005051234', licenseType: 'B2', licenseExpiry: '2027-06-30', gender: 'male', birthDate: '1990-05-05', gpsLocation: '深圳市罗湖区东门', gpsUpdatedAt: '2026-06-08 08:15:00', serviceCount: 40, serviceHours: 320, rating: 4.5, onTimeRate: 0.88, goodReviewRate: 0.90, boundVehicles: [{ plateNo: '粤B99999', carModel: '别克GL8', boundAt: '2026-04-10' }], status: 'active', areaIds: ['CT001'], createdAt: '2026-04-05' },
  { id: 'DRV006', code: 'DRV20260006', name: '周师傅', phone: '13811110013', idCard: '440301199006061234', licenseNo: '441900199006061234', licenseType: 'C1', licenseExpiry: '2032-01-15', gender: 'male', birthDate: '1990-06-06', gpsLocation: '广州市天河区网易大厦', gpsUpdatedAt: '2026-06-08 10:00:00', serviceCount: 35, serviceHours: 280, rating: 4.4, onTimeRate: 0.86, goodReviewRate: 0.88, boundVehicles: [{ plateNo: '粤A22222', carModel: '奔驰E300L', boundAt: '2026-04-20' }], status: 'active', areaIds: ['CT003'], createdAt: '2026-04-15' },
  { id: 'DRV007', code: 'DRV20260007', name: '刘师傅', phone: '13811110011', idCard: '440301199007071234', licenseNo: '441900199007071234', licenseType: 'B1', licenseExpiry: '2029-09-20', gender: 'male', birthDate: '1990-07-07', serviceCount: 20, serviceHours: 160, rating: 4.3, onTimeRate: 0.85, goodReviewRate: 0.87, boundVehicles: [{ plateNo: '沪A11111', carModel: '奥迪A6L', boundAt: '2026-05-05' }], status: 'active', areaIds: ['CT002'], createdAt: '2026-05-01' },
  { id: 'DRV008', code: 'DRV20260008', name: '钱师傅', phone: '13811110015', idCard: '440301199008081234', licenseNo: '441900199008081234', licenseType: 'A1', licenseExpiry: '2031-11-10', gender: 'female', birthDate: '1990-08-08', serviceCount: 0, serviceHours: 0, rating: 0, onTimeRate: 0, goodReviewRate: 0, boundVehicles: [{ plateNo: '粤C33333', carModel: '别克GL8', boundAt: '2026-02-05' }], bindingRecords: [{ plateNo: '粤C33333', boundAt: '2026-02-05', unboundAt: '2026-05-15', operator: '张运营' }], statusChangeRecords: [{ type: 'disable', reason: '离职', operator: '张运营', time: '2026-05-15 10:00' }], status: 'decommissioned', areaIds: ['CT001'], createdAt: '2026-02-01' },
];

// ===== 工作台 =====

// ===== 财务管理 =====
export const transactions: Transaction[] = [
  { id: 'T001', txnNo: 'TXN20260601-0001', orderNo: 'ZC20260601-0001', type: 'payment', paymentMethod: 'enterprise_credit', amount: 2800, party: '赵晓明 / 腾讯科技', time: '2026-06-01 08:30:00', status: 'success' },
  { id: 'T002', txnNo: 'TXN20260601-0002', orderNo: 'ZC20260601-0002', type: 'payment', paymentMethod: 'alipay', amount: 4800, party: '钱丽华', time: '2026-06-01 09:15:00', status: 'success' },
  { id: 'T003', txnNo: 'TXN20260602-0001', orderNo: 'ZC20260601-0003', type: 'refund', paymentMethod: 'wechat', amount: -500, party: '孙磊', time: '2026-06-02 14:20:00', status: 'success' },
  { id: 'T004', txnNo: 'TXN20260603-0001', orderNo: 'ZC20260603-0012', type: 'payment', paymentMethod: 'enterprise_credit', amount: 4500, party: '吕芳芳 / 华为技术', time: '2026-06-03 10:00:00', status: 'success' },
  { id: 'T005', txnNo: 'TXN20260604-0001', orderNo: 'ZC20260604-0013', type: 'extra_payment', paymentMethod: 'wechat', amount: 150, party: '高大鹏', time: '2026-06-04 23:30:00', status: 'success' },
  { id: 'T006', txnNo: 'TXN20260605-0001', orderNo: 'ZC20260605-0003', type: 'payment', paymentMethod: 'enterprise_credit', amount: 4000, party: '孙磊 / 华为技术', time: '2026-06-05 07:45:00', status: 'success' },
  { id: 'T007', txnNo: 'TXN20260607-0001', orderNo: 'ZC20260607-0010', type: 'payment', paymentMethod: 'alipay', amount: 12000, party: '林小红', time: '2026-06-07 16:00:00', status: 'processing' },
  { id: 'T008', txnNo: 'TXN20260607-0002', orderNo: 'ZC20260607-0011', type: 'payment', paymentMethod: 'enterprise_credit', amount: 9500, party: '何志远 / 华为技术', time: '2026-06-07 17:30:00', status: 'success' },
];

// ===== 发票管理（§7.1） =====
export const invoices: Invoice[] = [
  {
    id: 'IV001', applyNo: 'FP20260601-0001', channel: 'enterprise_backend',
    applicantName: '李财务', applicantPhone: '13900001111',
    enterpriseId: 'E001', enterpriseName: '深圳腾讯科技有限公司',
    subject: 'enterprise', invoiceType: 'general', title: '深圳腾讯科技有限公司',
    orderNos: ['ZC20260601-0001'], amount: 2288, applyTime: '2026-06-01 10:00',
    status: 'issued',
    attachment: '/mock/invoice/iv001_invoice.pdf', attachmentName: '腾讯_普通发票.pdf',
    uploadTime: '2026-06-02 14:30', operator: '王财务',
    operationLogs: [
      { time: '2026-06-01 10:00', action: '提交开票申请', operator: '李财务', remark: '关联 1 笔订单' },
      { time: '2026-06-02 14:30', action: '上传发票附件', operator: '王财务' },
      { time: '2026-06-02 14:30', action: '开票完成', operator: '系统' },
    ],
  },
  {
    id: 'IV002', applyNo: 'FP20260603-0002', channel: 'miniapp',
    applicantName: '赵晓明', applicantPhone: '13800010001',
    subject: 'personal', invoiceType: 'general', title: '赵晓明',
    orderNos: ['ZC20260603-0012'], amount: 4176, applyTime: '2026-06-03 09:20',
    status: 'issuing',
    operationLogs: [
      { time: '2026-06-03 09:20', action: '提交开票申请', operator: '赵晓明', remark: '关联 2 笔订单' },
    ],
  },
  {
    id: 'IV003', applyNo: 'FP20260605-0004', channel: 'harmony',
    applicantName: '钱丽华', applicantPhone: '13800020002',
    subject: 'personal', invoiceType: 'general', title: '钱丽华',
    orderNos: ['ZC20260602-0003'], amount: 1500, applyTime: '2026-06-05 08:00',
    status: 'cancelled',
    operationLogs: [
      { time: '2026-06-05 08:00', action: '提交开票申请', operator: '钱丽华', remark: '关联 1 笔订单' },
      { time: '2026-06-05 10:30', action: '取消申请', operator: '钱丽华', remark: '关联订单已释放' },
    ],
  },
  {
    id: 'IV004', applyNo: 'FP20260607-0006', channel: 'enterprise_backend',
    applicantName: '张财务', applicantPhone: '13900006666',
    enterpriseId: 'E003', enterpriseName: '广州网易计算机系统有限公司',
    subject: 'enterprise', invoiceType: 'general', title: '广州网易计算机系统有限公司',
    orderNos: ['ZC20260604-0013'], amount: 1650, applyTime: '2026-06-07 09:00',
    status: 'issued',
    attachment: '/mock/invoice/iv004_invoice.pdf', attachmentName: '网易_普通发票.pdf',
    uploadTime: '2026-06-07 16:00', operator: '王财务',
    operationLogs: [
      { time: '2026-06-07 09:00', action: '提交开票申请', operator: '张财务', remark: '关联 1 笔订单' },
      { time: '2026-06-07 16:00', action: '上传发票附件', operator: '王财务' },
      { time: '2026-06-07 16:00', action: '开票完成', operator: '系统' },
    ],
  },
  {
    id: 'IV005', applyNo: 'FP20260606-0005', channel: 'enterprise_backend',
    applicantName: '陈财务', applicantPhone: '13900005555',
    enterpriseId: 'E002', enterpriseName: '上海华为技术有限公司',
    subject: 'enterprise', invoiceType: 'general', title: '上海华为技术有限公司',
    orderNos: ['ZC20260607-0011'], amount: 4500, applyTime: '2026-06-06 15:00',
    status: 'issuing',
    operationLogs: [
      { time: '2026-06-06 15:00', action: '提交开票申请', operator: '陈财务', remark: '关联 1 笔订单' },
    ],
  },
];

// ===== 回款管理（§7.2） =====
export const payments: Payment[] = [
  {
    id: 'PM001', paymentNo: 'HK20260602-0001', invoiceId: 'IV001', invoiceApplyNo: 'FP20260601-0001',
    enterpriseId: 'E001', enterpriseName: '深圳腾讯科技有限公司', amount: 2288,
    status: 'completed', voucherUploader: '李财务', createdAt: '2026-06-02 14:35',
    voucher: '/mock/payment/pm001_voucher.jpg', voucherName: '银行回款凭证.jpg', voucherUploadTime: '2026-06-03 09:00',
    verifyResult: '通过', verifyOperator: '王财务', verifyTime: '2026-06-03 10:30',
    operationLogs: [
      { time: '2026-06-02 14:35', action: '回款任务已生成', operator: '系统', remark: '发票 FP20260601-0001 开票完成自动生成' },
      { time: '2026-06-03 09:00', action: '上传支付凭证', operator: '李财务' },
      { time: '2026-06-03 10:30', action: '核实通过', operator: '王财务', remark: '回款完成' },
    ],
  },
  {
    id: 'PM002', paymentNo: 'HK20260605-0003', invoiceId: 'IV-HIST-01', invoiceApplyNo: 'FP20260520-0098',
    enterpriseId: 'E005', enterpriseName: '杭州阿里巴巴集团控股有限公司', amount: 9800,
    status: 'pending', createdAt: '2026-06-05 11:00',
    operationLogs: [
      { time: '2026-06-05 11:00', action: '回款任务已生成', operator: '系统', remark: '发票 FP20260520-0098 开票完成自动生成' },
    ],
  },
];

export const dashboardStats: DashboardStats = {
  todayOrders: 48, todayOrdersChange: 12.5,
  todayCompletedOrders: 32, todayCompletedOrdersChange: 8.3,
  todayRevenue: 86720, todayRevenueChange: -3.2,
  pendingDispatch: 2, pendingExtra: 2,
  onlineDrivers: 35, totalDrivers: 42,
};

export const todos: TodoItem[] = [
  { id: 'T1', type: 'dispatch', title: '待派车订单', count: 2, subtitle: '最近出发：06-08 07:00 王雪梅', priority: 'urgent', link: '/orders?tab=pending_dispatch' },
  { id: 'T2', type: 'dispatch_urgent', title: '调度临近超时（≤2.5h）', count: 1, priority: 'urgent', link: '/orders?tab=pending_dispatch' },
  { id: 'T3', type: 'doc_audit', title: '待审核证件', count: 0, priority: 'normal', link: '/drivers' },
  { id: 'T4', type: 'enterprise_audit', title: '待审核企业入驻', count: 2, priority: 'important', link: '/enterprise?status=pending' },
  { id: 'T5', type: 'refund', title: '退款待执行', count: 1, priority: 'important', link: '/finance/bills' },
  { id: 'T6', type: 'quota_alert', title: '额度告急企业', count: 2, subtitle: '剩余额度低于 ¥2,000', priority: 'important', link: '/enterprise?quota=low' },
];

export const trendData: TrendData[] = [
  { date: '06-02', orders: 35, revenue: 6.2 },
  { date: '06-03', orders: 42, revenue: 7.8 },
  { date: '06-04', orders: 38, revenue: 6.9 },
  { date: '06-05', orders: 55, revenue: 9.5 },
  { date: '06-06', orders: 45, revenue: 8.1 },
  { date: '06-07', orders: 50, revenue: 8.8 },
  { date: '06-08', orders: 48, revenue: 8.67 },
];

// ===== 角色权限 =====
export const roleMenus: Record<string, string[]> = {
  super_admin: ['dashboard', 'enterprise', 'orders', 'driver-orders', 'vehicles', 'drivers', 'finance-invoices', 'finance-payments', 'finance-transactions', 'config', 'analytics', 'system'],
  ops_admin: ['dashboard', 'enterprise', 'orders', 'driver-orders', 'vehicles', 'drivers'],
  finance_admin: ['dashboard', 'finance-invoices', 'finance-payments', 'finance-transactions'],
  cs_admin: ['dashboard', 'orders'],
};

// ===== 运营配置 Mock =====
export const vehicleModels: VehicleModel[] = [
  { id: 'VM001', name: '增程星辉尊享版', brand: '尊界', seats: 7, category: 'MPV', vehicleCount: 3, status: 'active' },
  { id: 'VM002', name: '增程星辉行政版', brand: '尊界', seats: 7, category: 'MPV', vehicleCount: 2, status: 'active' },
  { id: 'VM003', name: '增程星耀行政版', brand: '尊界', seats: 5, category: '豪华轿车', vehicleCount: 2, status: 'active' },

];

// 默认远调费梯度（与示例一致）：>0~5km=¥100，>5~10km=¥200，>10~30km=¥400，>30km=¥1000
const defaultRemoteDispatchTiers = [
  { fromKm: 0,  toKm: 5,   amount: 100 },
  { fromKm: 5,  toKm: 10,  amount: 200 },
  { fromKm: 10, toKm: 30,  amount: 400 },
  { fromKm: 30, toKm: -1,  amount: 1000 },
];

// 梯度折扣配置：包车、租车各自一套，按下单天数递进让利
// ≥1 且 <2 天 9.8 折 | ≥2 且 <6 天 9.5 折 | ≥6 天 9 折
export const discountConfig: DiscountConfig = {
  charter: [
    { fromDays: 1, toDays: 2,  coefficient: 0.98 },
    { fromDays: 2, toDays: 6,  coefficient: 0.95 },
    { fromDays: 6, toDays: -1, coefficient: 0.90 },
  ],
  rental: [
    { fromDays: 1, toDays: 2,  coefficient: 0.98 },
    { fromDays: 2, toDays: 6,  coefficient: 0.95 },
    { fromDays: 6, toDays: -1, coefficient: 0.90 },
  ],
};

export const pricingRules: PricingRule[] = [
  { id: 'PR001', modelId: 'VM001', modelName: '增程星辉尊享版', tier: '尊享基础', halfDayPrice: 988, dayPrice: 1888, serviceContent: '4h/50km 半日 | 8h/100km 日租 · 含司机燃油', cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 25, cancelHighPct: 50, overtimeRate: 200, halfDayOvertimeRate: 100, extraMileageRate: 10, remoteDispatchTiers: defaultRemoteDispatchTiers, status: 'active' },
  { id: 'PR002', modelId: 'VM001', modelName: '增程星辉尊享版', tier: '尊荣高级', halfDayPrice: 1188, dayPrice: 2088, serviceContent: '4h/50km 半日 | 8h/100km 日租 · 金牌管家司机', cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 25, cancelHighPct: 50, overtimeRate: 200, halfDayOvertimeRate: 100, extraMileageRate: 10, remoteDispatchTiers: defaultRemoteDispatchTiers, status: 'active' },
  { id: 'PR003', modelId: 'VM001', modelName: '增程星辉尊享版', tier: '尊御顶级', halfDayPrice: 1588, dayPrice: 2688, serviceContent: '4h/50km 半日 | 8h/100km 日租 · 至尊礼遇 | 含饮品简餐', cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 20, cancelHighPct: 40, overtimeRate: 200, halfDayOvertimeRate: 100, extraMileageRate: 10, remoteDispatchTiers: defaultRemoteDispatchTiers, status: 'active' },
  { id: 'PR004', modelId: 'VM002', modelName: '增程星辉行政版', tier: '尊享基础', halfDayPrice: 1088, dayPrice: 1988, serviceContent: '4h/50km 半日 | 8h/100km 日租 · 含司机燃油', cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 25, cancelHighPct: 50, overtimeRate: 250, halfDayOvertimeRate: 120, extraMileageRate: 12, remoteDispatchTiers: defaultRemoteDispatchTiers, status: 'active' },
  { id: 'PR005', modelId: 'VM002', modelName: '增程星辉行政版', tier: '尊荣高级', halfDayPrice: 1288, dayPrice: 2288, serviceContent: '4h/50km 半日 | 8h/100km 日租 · 金牌管家司机', cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 25, cancelHighPct: 50, overtimeRate: 250, halfDayOvertimeRate: 120, extraMileageRate: 12, remoteDispatchTiers: defaultRemoteDispatchTiers, status: 'active' },
  { id: 'PR006', modelId: 'VM002', modelName: '增程星辉行政版', tier: '尊御顶级', halfDayPrice: 1688, dayPrice: 2888, serviceContent: '4h/50km 半日 | 8h/100km 日租 · 至尊礼遇 | 含饮品简餐', cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 20, cancelHighPct: 40, overtimeRate: 250, halfDayOvertimeRate: 120, extraMileageRate: 12, remoteDispatchTiers: defaultRemoteDispatchTiers, status: 'active' },
  { id: 'PR007', modelId: 'VM003', modelName: '增程星耀行政版', tier: '尊享基础', halfDayPrice: 1288, dayPrice: 2288, serviceContent: '4h/50km 半日 | 8h/100km 日租 · 含司机燃油', cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 25, cancelHighPct: 50, overtimeRate: 300, halfDayOvertimeRate: 150, extraMileageRate: 15, remoteDispatchTiers: defaultRemoteDispatchTiers, status: 'active' },
  { id: 'PR008', modelId: 'VM003', modelName: '增程星耀行政版', tier: '尊荣高级', halfDayPrice: 1588, dayPrice: 2688, serviceContent: '4h/50km 半日 | 8h/100km 日租 · 金牌管家司机', cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 25, cancelHighPct: 50, overtimeRate: 300, halfDayOvertimeRate: 150, extraMileageRate: 15, remoteDispatchTiers: defaultRemoteDispatchTiers, status: 'active' },
  { id: 'PR009', modelId: 'VM003', modelName: '增程星耀行政版', tier: '尊御顶级', halfDayPrice: 1888, dayPrice: 3288, serviceContent: '4h/50km 半日 | 8h/100km 日租 · 至尊礼遇 | 含饮品简餐', cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 20, cancelHighPct: 40, overtimeRate: 300, halfDayOvertimeRate: 150, extraMileageRate: 15, remoteDispatchTiers: defaultRemoteDispatchTiers, status: 'active' },
  { id: 'PR010', modelId: 'VM001', modelName: '增程星辉尊享版', dayPrice: 1500, cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 25, cancelHighPct: 50, overtimeRate: 200, extraMileageRate: 10, status: 'active', remoteDispatchTiers: defaultRemoteDispatchTiers, remark: '日租含 8h/100km' },
  { id: 'PR011', modelId: 'VM002', modelName: '增程星辉行政版', dayPrice: 1800, cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 25, cancelHighPct: 50, overtimeRate: 250, extraMileageRate: 12, status: 'active', remoteDispatchTiers: defaultRemoteDispatchTiers, remark: '日租含 8h/100km' },
  { id: 'PR012', modelId: 'VM003', modelName: '增程星耀行政版', dayPrice: 2200, cancelFreeMins: 20, cancelFreeHours: 4, cancelMidHigh: 4, cancelMidLow: 2, cancelMidPct: 25, cancelHighPct: 50, overtimeRate: 300, extraMileageRate: 15, status: 'active', remoteDispatchTiers: defaultRemoteDispatchTiers, remark: '日租含 8h/100km' },
];

export const benefitTemplates: BenefitTemplate[] = [
  { id: 'B001', code: 'BEN20260001', name: '尊界 S800 年度权益', type: '综合权益', totalCount: 12, totalAmount: 50000, singleLimit: 10000, validMonths: 12, applicableModels: ['尊界S800'], status: 'active' },
  { id: 'B002', code: 'BEN20260002', name: '尊界全系包车权益', type: '包车权益', totalCount: 6, totalAmount: 20000, validMonths: 12, applicableModels: ['增程星辉尊享版', '增程星辉行政版', '增程星耀行政版'], status: 'active' },
  { id: 'B003', code: 'BEN20260003', name: '租车体验权益', type: '租车权益', totalCount: 3, totalAmount: 6000, singleLimit: 2000, validMonths: 6, applicableModels: [], status: 'active' },
];

export const quotaAlertConfig: QuotaAlertConfig = { threshold: 10000, frequency: '每日 1 次' };

// ===== 数据分析 Mock =====
export const overviewMetrics: OverviewMetric[] = [
  { label: '订单总量', value: '1,256', change: 8.5, changeLabel: '较上月' },
  { label: '营收总额', value: '¥386,720', change: 12.3, changeLabel: '较上月' },
  { label: '客单价', value: '¥308', change: 3.5, changeLabel: '较上月' },
  { label: '退款金额', value: '¥12,480', change: -5.2, changeLabel: '较上月' },
];

export const analyticsTrendData: TrendPoint[] = [
  { date: '06-01', charter: 28, rental: 12, revenue: 82000, avgPrice: 310 },
  { date: '06-02', charter: 32, rental: 15, revenue: 95000, avgPrice: 285 },
  { date: '06-03', charter: 25, rental: 18, revenue: 78000, avgPrice: 330 },
  { date: '06-04', charter: 35, rental: 20, revenue: 105000, avgPrice: 295 },
  { date: '06-05', charter: 30, rental: 14, revenue: 88000, avgPrice: 310 },
  { date: '06-06', charter: 40, rental: 10, revenue: 110000, avgPrice: 350 },
  { date: '06-07', charter: 22, rental: 22, revenue: 72000, avgPrice: 300 },
  { date: '06-08', charter: 38, rental: 16, revenue: 102000, avgPrice: 320 },
];

export const topEnterprises: TopItem[] = [
  { name: '腾讯科技', value: 285, extra: '¥86,200' },
  { name: '华为技术', value: 210, extra: '¥65,400' },
  { name: '字节跳动', value: 168, extra: '¥48,900' },
  { name: '平安集团', value: 145, extra: '¥42,100' },
  { name: '万科地产', value: 98, extra: '¥28,600' },
];

// ===== 系统管理 Mock =====
export const topDrivers: TopItem[] = [
  { name: '王师傅', value: 48, extra: '4.9' },
  { name: '李师傅', value: 42, extra: '4.8' },
  { name: '周师傅', value: 38, extra: '4.9' },
  { name: '赵师傅', value: 35, extra: '4.7' },
  { name: '刘师傅', value: 32, extra: '4.8' },
  { name: '陈师傅', value: 28, extra: '4.6' },
  { name: '杨师傅', value: 25, extra: '4.9' },
  { name: '黄师傅', value: 22, extra: '4.5' },
  { name: '吴师傅', value: 20, extra: '4.7' },
  { name: '郑师傅', value: 18, extra: '4.6' },
];

export const operatorAccounts: OperatorAccount[] = [
  { id: 'A001', username: 'zhangyunying', name: '张运营', phone: '13800001001', role: 'super_admin', status: 'active', createdAt: '2025-10-01 09:00', lastLogin: '2026-06-09 08:30', lastIp: '192.168.1.100' },
  { id: 'A002', username: 'liyunying', name: '李运营', phone: '13800001002', role: 'ops_admin', areas: ['南山区核心商圈'], status: 'active', createdAt: '2025-10-15 14:00', lastLogin: '2026-06-09 09:15', lastIp: '192.168.1.101' },
  { id: 'A003', username: 'wangcaiwu', name: '王财务', phone: '13800001003', role: 'finance_admin', status: 'active', createdAt: '2025-11-01 10:00', lastLogin: '2026-06-08 16:45', lastIp: '192.168.1.102' },
  { id: 'A004', username: 'zhaokefu', name: '赵客服', phone: '13800001004', role: 'cs_admin', status: 'active', createdAt: '2025-11-15 11:00', lastLogin: '2026-06-09 07:00', lastIp: '192.168.1.103' },
  { id: 'A005', username: 'sunyunwei', name: '孙运维', phone: '13800001005', role: 'ops_admin', status: 'disabled', createdAt: '2025-12-01 09:00', lastLogin: '2026-04-15 10:30', lastIp: '192.168.1.104' },
];

export const loginLogs: LoginLog[] = [
  { id: 'LL001', username: 'zhangyunying', name: '张运营', time: '2026-06-09 08:30:15', ip: '192.168.1.100', device: 'Chrome 120 / macOS', result: 'success' },
  { id: 'LL002', username: 'liyunying', name: '李运营', time: '2026-06-09 09:15:42', ip: '192.168.1.101', device: 'Chrome 120 / Windows', result: 'success' },
  { id: 'LL003', username: 'zhaokefu', name: '赵客服', time: '2026-06-09 07:00:08', ip: '192.168.1.103', device: 'Safari / macOS', result: 'success' },
  { id: 'LL004', username: 'unknown', name: '', time: '2026-06-09 03:22:11', ip: '10.0.0.55', device: 'Chrome 120 / Windows', result: 'failed', failReason: '密码错误' },
  { id: 'LL005', username: 'sunyunwei', name: '孙运维', time: '2026-06-09 06:45:33', ip: '192.168.1.105', device: 'Firefox / Linux', result: 'failed', failReason: '账号已停用' },
];

export const operationLogs: OperationLog[] = [
  { id: 'OL001', time: '2026-06-09 09:30:00', operator: 'zhangyunying / 张运营', module: '订单管理', type: '派车', target: 'ZC20260608-0010', detail: '分配司机 王师傅 · 车牌 粤B12345', ip: '192.168.1.100' },
  { id: 'OL002', time: '2026-06-09 09:00:00', operator: 'wangcaiwu / 王财务', module: '财务管理', type: '开票完成', target: 'FP20260601-0001', detail: '上传发票附件，开票完成 ¥2,288', ip: '192.168.1.102' },
  { id: 'OL003', time: '2026-06-08 16:30:00', operator: 'zhangyunying / 张运营', module: '企业客户', type: '调整额度', target: '腾讯科技', detail: '额度 200,000 → 250,000，原因：线下打款', ip: '192.168.1.100' },
  { id: 'OL004', time: '2026-06-08 15:00:00', operator: 'liyunying / 李运营', module: '司机管理', type: '停用', target: '钱师傅 (13811110015)', detail: '原因：离职', ip: '192.168.1.101' },
  { id: 'OL005', time: '2026-06-08 14:00:00', operator: 'zhangyunying / 张运营', module: '配置', type: '配置修改', target: '包车计费规则', detail: '超时费 150→200 元/小时', ip: '192.168.1.100' },
];

export const onlineUsers: OnlineUser[] = [
  { id: 'OU001', username: 'zhangyunying', name: '张运营', role: 'super_admin', loginTime: '2026-06-09 08:30', ip: '192.168.1.100', device: 'Chrome / macOS', duration: '2h 15m' },
  { id: 'OU002', username: 'liyunying', name: '李运营', role: 'ops_admin', loginTime: '2026-06-09 09:15', ip: '192.168.1.101', device: 'Chrome / Windows', duration: '1h 30m' },
  { id: 'OU003', username: 'wangcaiwu', name: '王财务', role: 'finance_admin', loginTime: '2026-06-08 16:45', ip: '192.168.1.102', device: 'Edge / Windows', duration: '18h 0m' },
];

// ===== 车型标签库（与权益标签独立）=====
export const vehicleTags: BenefitTag[] = [
  { id: 'VT001', name: '头等舱座椅', icon: '💺', status: 'active', order: 1 },
  { id: 'VT002', name: '5G车载WiFi', icon: '📶', status: 'active', order: 2 },
  { id: 'VT003', name: '分区空调', icon: '❄️', status: 'active', order: 3 },
  { id: 'VT004', name: '行政座椅', icon: '🪑', status: 'active', order: 4 },
];

// ===== 权益标签库（C8-04） =====
export const benefitTags: BenefitTag[] = [
  { id: 'BT001', name: '免费饮品', icon: '🥤', status: 'active', order: 1 },
  { id: 'BT002', name: 'WiFi', icon: '📶', status: 'active', order: 2 },
  { id: 'BT003', name: '儿童座椅', icon: '🪑', status: 'active', order: 3 },
  { id: 'BT004', name: '尊享迎宾', icon: '✨', status: 'active', order: 4 },
  { id: 'BT005', name: '商务接待', icon: '💼', status: 'active', order: 5 },
];

// ===== 积分权益（§8.3） =====
export const pointsConfig: PointsConfig = {
  exchangeRate: 100,
  maxDeductionLimit: undefined,
  minPoints: 100,
};

// ===== 平台级超时（C8-05） =====
export const platformTimeoutConfig: PlatformTimeoutConfig = {
  paymentTimeoutMinutes: 20,
  dispatchTimeoutHours: 2,
};

// ===== 城市管理（C8-12） =====
export const opsCities: OpsCity[] = [
  { id: 'CT001', name: '深圳', regionCount: 2, status: 'active' },
  { id: 'CT002', name: '上海', regionCount: 1, status: 'active' },
  { id: 'CT003', name: '广州', regionCount: 0, status: 'active' },
  { id: 'CT004', name: '北京', regionCount: 0, status: 'inactive' },
];

// ===== 协议管理（C8-14） =====
export const serviceAgreements: ServiceAgreement[] = [
  { id: 'AG001', name: '尊出行用户服务协议', type: 'service', version: 'V2.1', content: '<h2>第一条 总则</h2><p>欢迎使用尊出行平台...</p>', status: 'published', updatedAt: '2026-05-01 10:00', operator: '张运营',
    history: [
      { version: 'V2.0', updatedAt: '2025-12-01 09:00', operator: '张运营', content: '<p>V2.0 内容...</p>' },
      { version: 'V1.0', updatedAt: '2025-06-01 09:00', operator: '李运营', content: '<p>V1.0 内容...</p>' },
    ] },
  { id: 'AG002', name: '隐私政策', type: 'privacy', version: 'V1.3', content: '<h2>个人信息收集</h2><p>我们承诺...</p>', status: 'published', updatedAt: '2026-04-15 14:30', operator: '张运营' },
  { id: 'AG003', name: '包车服务条款', type: 'business', version: 'V1.0', content: '<h2>包车服务说明</h2>', status: 'draft', updatedAt: '2026-06-08 11:00', operator: '李运营' },
];

// ===== 费用类型（C8-15） =====
export const feeTypes: FeeType[] = [
  { id: 'FT001', name: '高速费', remark: '高速公路通行费用', status: 'active' },
  { id: 'FT002', name: '停车费', remark: '行程中产生的停车费用', status: 'active' },
  { id: 'FT003', name: '洗车费', remark: '行程结束后的车辆清洁费', status: 'active' },
  { id: 'FT004', name: '桥梁通行费', remark: '过桥过隧费用', status: 'active' },
  { id: 'FT005', name: '过夜费', remark: '司机异地过夜补贴', status: 'inactive' },
];
