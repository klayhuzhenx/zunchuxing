/**
 * 包车出行 mock 数据 — 模拟运营后台 §8.2 车型管理 / §8.1.1 计费规则的返回。
 *
 * 实际接入后台后，此模块整体替换为 API 拉取的数据；页面无需感知。
 *
 * 关联 spec：乘客端需求规格说明 §4 包车出行
 *   - §4.2 车型展示
 *   - §4.3 套餐选择 / 费用说明 / 套餐权益标签
 *   - §4.4 费用明细
 *   - §4.7 取消规则
 */

export type CharterPkgDuration = 'half' | 'full';

export interface CharterPkg {
  id: string;
  tier: string;            // 套餐档位：尊享基础 / 尊荣高级 / 尊御顶级
  spec: string;            // 套餐规格：「半日租 · 4h/50km」/「日租 · 8h/100km」
  price: number;           // 该「车型 + 套餐 + 档位」单价
  duration: CharterPkgDuration;
}

export interface CharterAmenity {
  icon: string;            // material-symbols icon name
  text: string;
  /** 命中的套餐档位，命中即展示。空数组 = 所有档位 */
  tiers: string[];
}

export interface CharterCarFeature {
  icon: string;
  text: string;
}

/** 车型维度的费率（§8.1.1 计费规则中按「车型」配置的统一费率） */
export interface CharterFeeRule {
  /** 超时长费 ¥/小时 */
  overtimePerHour: number;
  /** 超公里费 ¥/公里 */
  overKmPerKm: number;
  /** 等待免费时长（分钟） */
  freeWaitMinutes: number;
  /** 等待费 ¥/分钟（超出免费时长） */
  waitPerMinute: number;
  /** 远调费梯度（按里程区间收取固定金额） */
  remoteDispatchTiers?: { fromKm: number; toKm: number; amount: number }[];
}

export interface CharterCar {
  id: string;
  name1: string;           // 车型名称首行（用于 tab）
  name2: string;
  fullName: string;
  tagText: string;         // hero 区品牌标签
  tagline: string;         // 副标题（乘客端卡片大字展示）
  seats: number;           // 座位数（来自运营后台车型管理配置）
  imageGradient: string;   // 临时占位（后续替换为运营后台车型图片）
  features: CharterCarFeature[];
  packages: CharterPkg[];
  amenities: CharterAmenity[];
  feeRule: CharterFeeRule;
}

/** 运营城市（§8.5 运营区域设置） */
export const operatingCities = ['上海', '合肥'];

/** 运营区域多边形围栏（§8.5）— 仅 mock，实际由运营后台返回 GeoJSON-like 多边形 */
export interface OperatingZone {
  id: string;
  city: string;
  name: string;
  /** 多边形顶点经纬度 [lng, lat] */
  polygon: Array<[number, number]>;
  /** 地图中心点 [lng, lat] */
  center: [number, number];
  /** 半透明色块 */
  fillColor: string;
}

export const operatingZones: OperatingZone[] = [
  {
    id: 'sh-puxi',
    city: '上海',
    name: '上海浦西核心区',
    center: [121.473, 31.230],
    polygon: [
      [121.420, 31.270],
      [121.520, 31.270],
      [121.530, 31.180],
      [121.410, 31.180],
    ],
    fillColor: 'rgba(0, 87, 255, 0.18)',
  },
  {
    id: 'sh-pudong',
    city: '上海',
    name: '上海浦东核心区',
    center: [121.540, 31.230],
    polygon: [
      [121.500, 31.270],
      [121.620, 31.270],
      [121.620, 31.180],
      [121.500, 31.180],
    ],
    fillColor: 'rgba(212, 175, 55, 0.20)',
  },
  {
    id: 'hf-luyang',
    city: '合肥',
    name: '合肥市辖区',
    center: [117.283, 31.866],
    polygon: [
      [117.230, 31.910],
      [117.340, 31.910],
      [117.340, 31.820],
      [117.230, 31.820],
    ],
    fillColor: 'rgba(0, 87, 255, 0.18)',
  },
];

export const getZonesByCity = (city: string): OperatingZone[] =>
  operatingZones.filter((z) => z.city === city);

/** 取消规则（§4.7）。乘客端展示用；实际计费在订单维度由后端裁定。 */
export const cancellationRule =
  '下单 20 分钟内或距出发 ≥4h 免费取消；<4h 扣 25%；<2h 扣 50%';

/** 夜间附加规则（§4.4 费用明细 — 夜间附加，待运营后台配置化） */
export const nightSurchargeConfig = {
  startHour: 0,
  endHour: 5,
  rate: 0.2,
  cap: 500,
};

/** 包车支付超时（§8.1.6 平台级超时规则，待运营后台配置化） */
export const payTimeoutSeconds = 20 * 60;

const baseAmenities: CharterAmenity[] = [
  { icon: 'layers', text: '纸巾湿巾', tiers: [] },
  { icon: 'restaurant', text: '精致茶点', tiers: ['尊荣高级', '尊御顶级'] },
  { icon: 'celebration', text: '香槟礼遇', tiers: ['尊御顶级'] },
  { icon: 'face', text: '专属管家', tiers: [] },
];

const standardFeeRule: CharterFeeRule = {
  overtimePerHour: 100,
  overKmPerKm: 5,
  freeWaitMinutes: 15,
  waitPerMinute: 1,
  remoteDispatchTiers: [
    { fromKm: 0,  toKm: 5,  amount: 100 },
    { fromKm: 5,  toKm: 10, amount: 200 },
    { fromKm: 10, toKm: 30, amount: 400 },
    { fromKm: 30, toKm: -1, amount: 1000 },
  ],
};

export const charterCars: CharterCar[] = [
  {
    id: 'star-shine-luxury',
    name1: '增程星辉',
    name2: '尊享版',
    fullName: '增程星辉尊享版',
    tagText: '极致尊贵',
    tagline: '极致尊贵 · 宽适空间',
    seats: 7,
    imageGradient: 'linear-gradient(135deg, #2c2c2e 0%, #1a1a1c 50%, #0a0a0c 100%)',
    features: [
      { icon: 'airline_seat_recline_extra', text: '头等舱座椅' },
      { icon: 'wifi', text: '5G车载WiFi' },
      { icon: 'coffee', text: '高端饮用水' },
    ],
    packages: [
      { id: 'a-h-base', tier: '尊享基础', spec: '半日租 · 4h/50km', price: 988, duration: 'half' },
      { id: 'a-h-pro', tier: '尊荣高级', spec: '半日租 · 4h/50km', price: 1188, duration: 'half' },
      { id: 'a-h-top', tier: '尊御顶级', spec: '半日租 · 4h/50km', price: 1588, duration: 'half' },
      { id: 'a-f-base', tier: '尊享基础', spec: '日租 · 8h/100km', price: 1888, duration: 'full' },
      { id: 'a-f-pro', tier: '尊荣高级', spec: '日租 · 8h/100km', price: 2088, duration: 'full' },
      { id: 'a-f-top', tier: '尊御顶级', spec: '日租 · 8h/100km', price: 2688, duration: 'full' },
    ],
    amenities: baseAmenities,
    feeRule: standardFeeRule,
  },
  {
    id: 'star-shine-exec',
    name1: '增程星辉',
    name2: '行政版',
    fullName: '增程星辉行政版',
    tagText: '商务出行',
    tagline: '商务出行 · 稳健效率',
    seats: 7,
    imageGradient: 'linear-gradient(135deg, #3a3a3c 0%, #1f1f21 50%, #0d0d0f 100%)',
    features: [
      { icon: 'airline_seat_recline_extra', text: '行政座椅' },
      { icon: 'wifi', text: '5G车载WiFi' },
      { icon: 'ac_unit', text: '分区空调' },
    ],
    packages: [
      { id: 'b-h-base', tier: '尊享基础', spec: '半日租 · 4h/50km', price: 1088, duration: 'half' },
      { id: 'b-h-pro', tier: '尊荣高级', spec: '半日租 · 4h/50km', price: 1288, duration: 'half' },
      { id: 'b-h-top', tier: '尊御顶级', spec: '半日租 · 4h/50km', price: 1688, duration: 'half' },
      { id: 'b-f-base', tier: '尊享基础', spec: '日租 · 8h/100km', price: 1988, duration: 'full' },
      { id: 'b-f-pro', tier: '尊荣高级', spec: '日租 · 8h/100km', price: 2288, duration: 'full' },
      { id: 'b-f-top', tier: '尊御顶级', spec: '日租 · 8h/100km', price: 2888, duration: 'full' },
    ],
    amenities: baseAmenities,
    feeRule: standardFeeRule,
  },
  {
    id: 'star-radiance-exec',
    name1: '增程星耀',
    name2: '行政版',
    fullName: '增程星耀行政版',
    tagText: '旗舰豪华',
    tagline: '旗舰豪华 · 尊荣体验',
    seats: 5,
    imageGradient: 'linear-gradient(135deg, #4a4a4c 0%, #252527 50%, #101012 100%)',
    features: [
      { icon: 'airline_seat_recline_extra', text: '按摩座椅' },
      { icon: 'wine_bar', text: '车载冷柜' },
      { icon: 'privacy_tip', text: '隐私玻璃' },
    ],
    packages: [
      { id: 'c-h-base', tier: '尊享基础', spec: '半日租 · 4h/50km', price: 1288, duration: 'half' },
      { id: 'c-h-pro', tier: '尊荣高级', spec: '半日租 · 4h/50km', price: 1588, duration: 'half' },
      { id: 'c-h-top', tier: '尊御顶级', spec: '半日租 · 4h/50km', price: 1888, duration: 'half' },
      { id: 'c-f-base', tier: '尊享基础', spec: '日租 · 8h/100km', price: 2288, duration: 'full' },
      { id: 'c-f-pro', tier: '尊荣高级', spec: '日租 · 8h/100km', price: 2688, duration: 'full' },
      { id: 'c-f-top', tier: '尊御顶级', spec: '日租 · 8h/100km', price: 3288, duration: 'full' },
    ],
    amenities: baseAmenities,
    feeRule: standardFeeRule,
  },
];

/** 通过 carIdx 取车型；越界回落到第一辆 */
export const getCarByIdx = (idx: number): CharterCar =>
  charterCars[idx] ?? charterCars[0];

/** 通过 pkgId 反查车型与套餐 */
export const findPkgById = (
  pkgId: string,
): { car: CharterCar; pkg: CharterPkg } | null => {
  for (const car of charterCars) {
    const pkg = car.packages.find((p) => p.id === pkgId);
    if (pkg) return { car, pkg };
  }
  return null;
};

/** 计算夜间附加 */
export const calcNightSurcharge = (subtotal: number, departTime: string): number => {
  const hh = parseInt(departTime.split(':')[0] || '0', 10);
  if (hh < nightSurchargeConfig.startHour || hh >= nightSurchargeConfig.endHour) {
    return 0;
  }
  return Math.min(
    Math.round(subtotal * nightSurchargeConfig.rate),
    nightSurchargeConfig.cap,
  );
};

export const isInOperatingCity = (address: string): boolean => {
  if (!address) return false;
  const m = address.match(/(北京|上海|天津|重庆|香港|澳门)/);
  if (m) return operatingCities.includes(m[1]);
  const m2 = address.match(/([一-龥]{2,6}?)(?:市|地区|自治州)/);
  return !!m2 && operatingCities.includes(m2[1]);
};
