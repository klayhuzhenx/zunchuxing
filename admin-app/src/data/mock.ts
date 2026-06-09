import type {
  User, Enterprise, QuotaChange, ConsumptionRecord,
  Order, DriverOrder, Driver, EnterpriseBill, BillOrderItem, BillRefundItem, Transaction,
  DashboardStats, TodoItem, TrendData,
  Vehicle, DaySchedule,
} from '../types';

// ===== 当前登录用户 =====
export const currentUser: User = {
  id: 'U001', account: 'admin', name: '张管理', role: 'super_admin',
  roleLabel: '超级管理员', phone: '13800000001',
};

// ===== 企业客户 =====
export const enterprises: Enterprise[] = [
  { id: 'E001', code: 'ENT20260001', name: '深圳腾讯科技有限公司', creditCode: '914403001922038216', contactName: '李明', contactPhone: '13900001001', employeeCount: 120, totalQuota: 200000, usedAmount: 87650, remainingQuota: 112350, status: 'approved', source: 'miniapp', createdAt: '2026-01-15 10:30', adminName: '李明', adminPhone: '13900001001' },
  { id: 'E002', code: 'ENT20260002', name: '北京字节跳动网络技术有限公司', creditCode: '911101085514439488', contactName: '王芳', contactPhone: '13900002002', employeeCount: 85, totalQuota: 150000, usedAmount: 120300, remainingQuota: 29700, status: 'approved', source: 'backend', createdAt: '2026-02-20 14:00', adminName: '王芳', adminPhone: '13900002002', remark: '线下签约大客户' },
  { id: 'E003', code: 'ENT20260003', name: '上海华为技术有限公司', creditCode: '91310115671155143X', contactName: '张伟', contactPhone: '13900003003', employeeCount: 200, totalQuota: 500000, usedAmount: 325000, remainingQuota: 175000, status: 'approved', source: 'miniapp', createdAt: '2026-03-05 09:15', adminName: '张伟', adminPhone: '13900003003' },
  { id: 'E004', code: 'ENT20260004', name: '广州网易计算机系统有限公司', creditCode: '914401017285149867', contactName: '赵丽', contactPhone: '13900004004', employeeCount: 45, totalQuota: 80000, usedAmount: 79200, remainingQuota: 800, status: 'approved', source: 'miniapp', createdAt: '2026-03-18 16:45', adminName: '赵丽', adminPhone: '13900004004' },
  { id: 'E005', code: 'ENT20260005', name: '杭州阿里巴巴集团控股有限公司', creditCode: '913301007990542515', contactName: '刘强', contactPhone: '13900005005', employeeCount: 300, totalQuota: 800000, usedAmount: 456000, remainingQuota: 344000, status: 'approved', source: 'backend', createdAt: '2026-01-08 11:00', adminName: '刘强', adminPhone: '13900005005', remark: '年度框架协议客户' },
  { id: 'E006', code: 'ENT20260006', name: '成都新希望集团有限公司', creditCode: '915101006740801234', contactName: '陈静', contactPhone: '13900006006', employeeCount: 60, totalQuota: 0, usedAmount: 0, remainingQuota: 0, status: 'pending', source: 'miniapp', createdAt: '2026-06-01 08:20' },
  { id: 'E007', code: 'ENT20260007', name: '南京苏宁易购电子商务有限公司', creditCode: '913201007985012345', contactName: '周杰', contactPhone: '13900007007', employeeCount: 0, totalQuota: 0, usedAmount: 0, remainingQuota: 0, status: 'pending', source: 'miniapp', createdAt: '2026-06-03 13:10' },
  { id: 'E008', code: 'ENT20260008', name: '武汉东风汽车集团有限公司', creditCode: '914201007985067890', contactName: '吴敏', contactPhone: '13900008008', employeeCount: 0, totalQuota: 100000, usedAmount: 0, remainingQuota: 100000, status: 'rejected', source: 'miniapp', createdAt: '2026-05-20 15:30', rejectReason: '营业执照信息不清晰' },
  { id: 'E009', code: 'ENT20260009', name: '厦门美图网科技有限公司', creditCode: '913502007985098765', contactName: '黄磊', contactPhone: '13900009009', employeeCount: 30, totalQuota: 50000, usedAmount: 48900, remainingQuota: 1100, status: 'disabled', source: 'miniapp', createdAt: '2026-04-10 10:00' },
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
    baseFee: 2088, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 2088, refundAmount: 0,
    paymentTime: '2026-05-31 20:00', createdAt: '2026-05-31 19:30',
    review: { driverRating: 5, vehicleRating: 5, serviceRating: 4, comment: '王师傅服务非常好，车辆整洁干净，准时到达。非常满意！' },
    schedules: [{ date: '2026-06-01', timeRange: '08:00-18:00', vehiclePlate: '粤B12345', vehicleModel: '奔驰V260L', driverName: '王师傅', driverPhone: '13811110001' }],
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
    rentalStart: '2026-06-02', rentalEnd: '2026-06-02', days: 1,
    pickupAddress: '深圳宝安国际机场T3', dropoffAddress: '深圳市南山区海岸城',
    deliveryDriver: '赵师傅', deliveryDriverPhone: '13811110003', pickupDriver: '钱师傅', pickupDriverPhone: '13811110004', plateNo: '粤B34567', carModel: '奥迪A6L',
    baseFee: 1500, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 1500, refundAmount: 0,
    paymentTime: '2026-06-01 15:00', createdAt: '2026-06-01 14:30',
    review: { driverRating: 4, vehicleRating: 5, serviceRating: 4, comment: '送车准时，车辆状态良好，还车方便快捷。' },
    schedules: [{ date: '2026-06-02', timeRange: '10:00-22:00', vehiclePlate: '粤B34567', vehicleModel: '奥迪A6L', driverName: '赵师傅', driverPhone: '13811110003' }],
  },
  {
    id: 'O006', orderNo: 'ZC20260606-0009', type: 'rental', status: 'pending_dispatch',
    passengerName: '马建国', passengerPhone: '13800090009',
    userIdentity: 'enterprise_employee',
    paymentMethod: 'enterprise_credit', enterpriseName: '北京字节跳动网络技术有限公司',
    rentalStart: '2026-06-08', rentalEnd: '2026-06-08', days: 1,
    pickupAddress: '北京市海淀区中关村软件园', dropoffAddress: '北京市朝阳区三里屯',
    baseFee: 1500, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 1500, refundAmount: 0,
    paymentTime: '2026-06-06 09:00', createdAt: '2026-06-06 08:30',
  },
  {
    id: 'O008', orderNo: 'ZC20260607-0011', type: 'rental', status: 'pending_start',
    passengerName: '何志远', passengerPhone: '13800110011',
    userIdentity: 'enterprise_employee',
    paymentMethod: 'enterprise_credit', enterpriseName: '上海华为技术有限公司',
    rentalStart: '2026-06-08', rentalEnd: '2026-06-10', days: 3,
    pickupAddress: '上海市浦东新区张江高科技园区', dropoffAddress: '上海市静安区南京西路',
    driverName: '刘师傅', driverPhone: '13811110011', plateNo: '沪A11111', carModel: '奥迪A6L',
    deliveryDriver: '刘师傅', deliveryDriverPhone: '13811110011', pickupDriver: '陈师傅', pickupDriverPhone: '13811110010',
    baseFee: 4500, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 4500, refundAmount: 0,
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
    rentalStart: '2026-06-04', rentalEnd: '2026-06-04', days: 1,
    pickupAddress: '广州市天河区网易大厦', dropoffAddress: '广州市白云区白云机场T1',
    driverName: '周师傅', driverPhone: '13811110013', plateNo: '粤A22222', carModel: '奔驰E300L',
    deliveryDriver: '周师傅', deliveryDriverPhone: '13811110013', pickupDriver: '赵师傅', pickupDriverPhone: '13811110003',
    baseFee: 1500, overtimeFee: 150, overmileageFee: 0, discount: 0,
    paidAmount: 1500, refundAmount: 0,
    paymentTime: '2026-06-03 18:00', createdAt: '2026-06-03 17:00',
    schedules: [{ date: '2026-06-04', timeRange: '06:00-22:00', vehiclePlate: '粤A22222', vehicleModel: '奔驰E300L', driverName: '周师傅', driverPhone: '13811110013' }],
  },
  {
    id: 'O012', orderNo: 'ZC20260605-0015', type: 'rental', status: 'cancelled',
    passengerName: '韩冰', passengerPhone: '13800150015',
    userIdentity: 'personal',
    paymentMethod: 'alipay',
    rentalStart: '2026-06-05', rentalEnd: '2026-06-05', days: 1,
    pickupAddress: '北京市朝阳区国贸', dropoffAddress: '北京市大兴区北京大兴国际机场',
    baseFee: 1500, overtimeFee: 0, overmileageFee: 0, discount: 0,
    paidAmount: 1500, refundAmount: 1000,
    paymentTime: '2026-06-04 20:00', createdAt: '2026-06-04 19:00',
    internalNote: '乘客提前2小时取消，按规则扣500违约金',
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
    duration: 620, mileage: 85, extraFee: 0,
    status: 'completed', dispatchTime: '2026-06-01 00:05',
    pickupAddress: '科技园腾讯大厦', dropoffAddress: '福田区会展中心',
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
    duration: 685, mileage: 180, extraFee: 1000,
    extraFeeItems: [
      { type: 'overtime', category: '超时费', amount: 300, startTime: '2026-06-03 08:05', endTime: '2026-06-03 19:30', baseDuration: '10h', overtimeDuration: '1.5h', voucherImage: '/mock/voucher_overtime_001.jpg', voucherTime: '2026-06-03 19:30:00' },
      { type: 'excess_mileage', category: '超里程费', amount: 200, startMileage: 0, endMileage: 180, baseMileage: 100, excessMileage: 80, voucherImage: '/mock/voucher_mileage_001.jpg', voucherTime: '2026-06-03 19:30:00' },
      { type: 'other', category: '过夜费', amount: 500, description: '在上海过夜', voucherImage: '/mock/voucher_overnight_001.jpg', voucherTime: '2026-06-04 08:30:00' },
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
  { id: 'V001', code: 'CAR20260001', plateNo: '粤B12345', type: 'MPV', brand: '奔驰', model: 'V260L', seats: 7, color: '黑色', vin: 'LSG12345678901234', engineNo: 'ENG20260001', regDate: '2026-01-10', initialMileage: 0, photos: ['/mock/vehicles/v001_01.jpg'], licenseFront: '/mock/license/v001_front.jpg', licenseBack: '/mock/license/v001_back.jpg', driverBindings: [{ driverName: '王师傅', driverPhone: '13811110001', boundAt: '2026-01-15' }], docStatus: 'complete', status: 'in_use', createdAt: '2026-01-10' },
  { id: 'V002', code: 'CAR20260002', plateNo: '粤B67890', type: 'MPV', brand: '别克', model: 'GL8', seats: 7, color: '白色', vin: 'LSG12345678901235', engineNo: 'ENG20260002', regDate: '2026-02-15', initialMileage: 0, licenseFront: '/mock/license/v002_front.jpg', licenseBack: '/mock/license/v002_back.jpg', driverBindings: [{ driverName: '李师傅', driverPhone: '13811110002', boundAt: '2026-02-20' }], docStatus: 'complete', status: 'in_use', createdAt: '2026-02-15' },
  { id: 'V003', code: 'CAR20260003', plateNo: '粤B34567', type: '轿车', brand: '奥迪', model: 'A6L', seats: 5, color: '黑色', vin: 'LSG12345678901236', engineNo: 'ENG20260003', regDate: '2026-03-01', initialMileage: 0, driverBindings: [{ driverName: '赵师傅', driverPhone: '13811110003', boundAt: '2026-03-05' }], docStatus: 'complete', status: 'in_use', createdAt: '2026-03-01' },
  { id: 'V004', code: 'CAR20260004', plateNo: '粤B56789', type: 'MPV', brand: '奔驰', model: 'V260L', seats: 7, color: '银色', vin: 'LSG12345678901237', engineNo: 'ENG20260004', regDate: '2026-03-20', initialMileage: 0, driverBindings: [{ driverName: '陈师傅', driverPhone: '13811110010', boundAt: '2026-03-25' }], docStatus: 'complete', status: 'in_use', createdAt: '2026-03-20' },
  { id: 'V005', code: 'CAR20260005', plateNo: '粤B99999', type: 'MPV', brand: '别克', model: 'GL8', seats: 7, color: '金色', vin: 'LSG12345678901238', engineNo: 'ENG20260005', regDate: '2026-04-05', initialMileage: 0, driverBindings: [{ driverName: '黄师傅', driverPhone: '13811110012', boundAt: '2026-04-10' }], docStatus: 'complete', status: 'in_use', createdAt: '2026-04-05' },
  { id: 'V006', code: 'CAR20260006', plateNo: '粤A22222', type: '轿车', brand: '奔驰', model: 'E300L', seats: 5, color: '黑色', vin: 'LSG12345678901239', engineNo: 'ENG20260006', regDate: '2026-04-15', initialMileage: 0, driverBindings: [{ driverName: '周师傅', driverPhone: '13811110013', boundAt: '2026-04-20' }], docStatus: 'complete', status: 'in_use', createdAt: '2026-04-15' },
  { id: 'V007', code: 'CAR20260007', plateNo: '沪A11111', type: '轿车', brand: '奥迪', model: 'A6L', seats: 5, color: '黑色', vin: 'LSG12345678901240', engineNo: 'ENG20260007', regDate: '2026-05-01', initialMileage: 0, driverBindings: [{ driverName: '刘师傅', driverPhone: '13811110011', boundAt: '2026-05-05' }], docStatus: 'complete', status: 'in_use', createdAt: '2026-05-01' },
  { id: 'V008', code: 'CAR20260008', plateNo: '粤C33333', type: 'MPV', brand: '别克', model: 'GL8', seats: 7, color: '深蓝', vin: 'LSG12345678901241', engineNo: 'ENG20260008', regDate: '2026-03-10', initialMileage: 15000, docStatus: 'complete', status: 'decommissioned', createdAt: '2026-03-10', statusChangeRecords: [{ type: 'disable', reason: '车辆转让', operator: '张运营', time: '2026-05-15 14:30' }] },
];


// ===== 司机 =====
export const drivers: Driver[] = [
  { id: 'DRV001', code: 'DRV20260001', name: '王师傅', phone: '13811110001', idCard: '440301199001011234', licenseNo: '441900199001011234', licenseType: 'A1', licenseExpiry: '2030-05-15', gender: 'male', birthDate: '1990-01-01', gpsLocation: '深圳市南山区科技园', gpsUpdatedAt: '2026-06-08 10:30:00', serviceCount: 128, serviceHours: 1024, rating: 4.9, onTimeRate: 0.97, goodReviewRate: 0.99, boundVehicles: [{ plateNo: '粤B12345', carModel: '奔驰V260L', boundAt: '2026-01-15' }], bindingRecords: [{ plateNo: '粤B12345', boundAt: '2026-01-15', operator: '张运营' }], status: 'active', createdAt: '2026-01-10' },
  { id: 'DRV002', code: 'DRV20260002', name: '李师傅', phone: '13811110002', idCard: '440301199002021234', licenseNo: '441900199002021234', licenseType: 'B1', licenseExpiry: '2029-08-20', gender: 'male', birthDate: '1990-02-02', gpsLocation: '深圳市宝安区西乡', gpsUpdatedAt: '2026-06-08 09:45:00', serviceCount: 95, serviceHours: 760, rating: 4.8, onTimeRate: 0.95, goodReviewRate: 0.97, boundVehicles: [{ plateNo: '粤B67890', carModel: '别克GL8', boundAt: '2026-02-20' }], status: 'active', createdAt: '2026-02-15' },
  { id: 'DRV003', code: 'DRV20260003', name: '赵师傅', phone: '13811110003', idCard: '440301199003031234', licenseNo: '441900199003031234', licenseType: 'C1', licenseExpiry: '2031-03-10', gender: 'male', birthDate: '1990-03-03', gpsLocation: '深圳市福田区华强北', gpsUpdatedAt: '2026-06-08 11:00:00', serviceCount: 76, serviceHours: 608, rating: 4.7, onTimeRate: 0.93, goodReviewRate: 0.95, boundVehicles: [{ plateNo: '粤B34567', carModel: '奥迪A6L', boundAt: '2026-03-05' }], status: 'active', createdAt: '2026-03-01' },
  { id: 'DRV004', code: 'DRV20260004', name: '陈师傅', phone: '13811110010', idCard: '440301199004041234', licenseNo: '441900199004041234', licenseType: 'A2', licenseExpiry: '2028-12-25', gender: 'male', birthDate: '1990-04-04', serviceCount: 52, serviceHours: 416, rating: 4.6, onTimeRate: 0.90, goodReviewRate: 0.92, boundVehicles: [{ plateNo: '粤B56789', carModel: '奔驰V260L', boundAt: '2026-03-25' }], status: 'active', createdAt: '2026-03-20' },
  { id: 'DRV005', code: 'DRV20260005', name: '黄师傅', phone: '13811110012', idCard: '440301199005051234', licenseNo: '441900199005051234', licenseType: 'B2', licenseExpiry: '2027-06-30', gender: 'male', birthDate: '1990-05-05', gpsLocation: '深圳市罗湖区东门', gpsUpdatedAt: '2026-06-08 08:15:00', serviceCount: 40, serviceHours: 320, rating: 4.5, onTimeRate: 0.88, goodReviewRate: 0.90, boundVehicles: [{ plateNo: '粤B99999', carModel: '别克GL8', boundAt: '2026-04-10' }], status: 'active', createdAt: '2026-04-05' },
  { id: 'DRV006', code: 'DRV20260006', name: '周师傅', phone: '13811110013', idCard: '440301199006061234', licenseNo: '441900199006061234', licenseType: 'C1', licenseExpiry: '2032-01-15', gender: 'male', birthDate: '1990-06-06', gpsLocation: '广州市天河区网易大厦', gpsUpdatedAt: '2026-06-08 10:00:00', serviceCount: 35, serviceHours: 280, rating: 4.4, onTimeRate: 0.86, goodReviewRate: 0.88, boundVehicles: [{ plateNo: '粤A22222', carModel: '奔驰E300L', boundAt: '2026-04-20' }], status: 'active', createdAt: '2026-04-15' },
  { id: 'DRV007', code: 'DRV20260007', name: '刘师傅', phone: '13811110011', idCard: '440301199007071234', licenseNo: '441900199007071234', licenseType: 'B1', licenseExpiry: '2029-09-20', gender: 'male', birthDate: '1990-07-07', serviceCount: 20, serviceHours: 160, rating: 4.3, onTimeRate: 0.85, goodReviewRate: 0.87, boundVehicles: [{ plateNo: '沪A11111', carModel: '奥迪A6L', boundAt: '2026-05-05' }], status: 'active', createdAt: '2026-05-01' },
  { id: 'DRV008', code: 'DRV20260008', name: '钱师傅', phone: '13811110015', idCard: '440301199008081234', licenseNo: '441900199008081234', licenseType: 'A1', licenseExpiry: '2031-11-10', gender: 'female', birthDate: '1990-08-08', serviceCount: 0, serviceHours: 0, rating: 0, onTimeRate: 0, goodReviewRate: 0, boundVehicles: [{ plateNo: '粤C33333', carModel: '别克GL8', boundAt: '2026-02-05' }], bindingRecords: [{ plateNo: '粤C33333', boundAt: '2026-02-05', unboundAt: '2026-05-15', operator: '张运营' }], statusChangeRecords: [{ type: 'disable', reason: '离职', operator: '张运营', time: '2026-05-15 10:00' }], status: 'decommissioned', createdAt: '2026-02-01' },
];

// ===== 工作台 =====

// ===== 财务管理 =====
export const enterpriseBills: EnterpriseBill[] = [
  { id: 'B001', billNo: 'BILL202606-0001', enterpriseId: 'E001', enterpriseName: '腾讯科技', month: '2026-06', consumption: 7600, refund: 0, pendingAmount: 7600, settledAmount: 0, status: 'pending' },
  { id: 'B002', billNo: 'BILL202606-0002', enterpriseId: 'E002', enterpriseName: '华为技术', month: '2026-06', consumption: 4000, refund: 500, pendingAmount: 3500, settledAmount: 0, status: 'pending' },
  { id: 'B003', billNo: 'BILL202605-0001', enterpriseId: 'E001', enterpriseName: '腾讯科技', month: '2026-05', consumption: 12500, refund: 1200, pendingAmount: 0, settledAmount: 11300, status: 'settled' },
  { id: 'B004', billNo: 'BILL202605-0002', enterpriseId: 'E002', enterpriseName: '华为技术', month: '2026-05', consumption: 8900, refund: 3000, pendingAmount: 2000, settledAmount: 3900, status: 'partial' },
  { id: 'B005', billNo: 'BILL202604-0001', enterpriseId: 'E001', enterpriseName: '腾讯科技', month: '2026-04', consumption: 9800, refund: 0, pendingAmount: 0, settledAmount: 9800, status: 'settled' },
];

export const billOrderItems: BillOrderItem[] = [
  { date: '2026-06-01', orderNo: 'ZC20260601-0001', type: 'charter', passenger: '赵晓明', amount: 2800, settled: false },
  { date: '2026-06-01', orderNo: 'ZC20260601-0002', type: 'charter', passenger: '钱丽华', amount: 4800, settled: false },
  { date: '2026-06-05', orderNo: 'ZC20260605-0003', type: 'rental', passenger: '孙磊', amount: 4000, settled: false },
  { date: '2026-05-15', orderNo: 'ZC20260515-0005', type: 'charter', passenger: '赵晓明', amount: 5600, settled: true },
  { date: '2026-05-20', orderNo: 'ZC20260520-0006', type: 'charter', passenger: '钱丽华', amount: 6900, settled: true },
];

export const billRefundItems: BillRefundItem[] = [
  { date: '2026-06-02', refundNo: 'REF20260602-0001', orderNo: 'ZC20260601-0003', amount: 500, reason: '乘客取消' },
  { date: '2026-05-18', refundNo: 'REF20260518-0002', orderNo: 'ZC20260515-0007', amount: 1200, reason: '提前结束' },
  { date: '2026-05-22', refundNo: 'REF20260522-0003', orderNo: 'ZC20260520-0008', amount: 3000, reason: '乘客取消多日订单' },
];

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

export const dashboardStats: DashboardStats = {
  todayOrders: 48, todayOrdersChange: 12.5,
  todayRevenue: 86720, todayRevenueChange: -3.2,
  pendingDispatch: 2, pendingExtra: 2,
  onlineDrivers: 35, totalDrivers: 42,
};

export const todos: TodoItem[] = [
  { id: 'T1', type: 'dispatch', title: '待派车订单', count: 2, subtitle: '最近出发：06-08 07:00 王雪梅', priority: 'urgent', link: '/orders?tab=pending_dispatch' },
  { id: 'T2', type: 'dispatch_urgent', title: '调度临近超时（≤2.5h）', count: 1, priority: 'urgent', link: '/orders?tab=pending_dispatch' },
  { id: 'T3', type: 'doc_audit', title: '待审核证件', count: 0, priority: 'normal', link: '/drivers' },
  { id: 'T4', type: 'enterprise_audit', title: '待审核企业入驻', count: 2, priority: 'important', link: '/enterprise?status=pending' },
  { id: 'T5', type: 'refund', title: '退款待执行', count: 1, priority: 'important', link: '/finance' },
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
  super_admin: ['dashboard', 'enterprise', 'orders', 'driver-orders', 'vehicles', 'drivers', 'invoices', 'finance', 'config', 'analytics', 'system'],
  ops_admin: ['dashboard', 'enterprise', 'orders', 'driver-orders', 'vehicles', 'drivers'],
  finance_admin: ['dashboard', 'invoices', 'finance'],
  cs_admin: ['dashboard', 'orders'],
};
