// ===== 司机 =====
export interface Driver {
  id: string; code: string; name: string; phone: string;
  idCard: string; licenseType: string; licenseExpiry: string;
  gender: 'male' | 'female'; birthDate?: string;
  avatar?: string; gpsLocation?: string; gpsUpdatedAt?: string;
  serviceCount: number; serviceHours: number; rating: number;
  onTimeRate: number; goodReviewRate: number;
  boundVehicles: BoundVehicle[];
}

export interface BoundVehicle {
  plateNo: string; carModel: string; boundAt: string;
}

// ===== 出车单 =====
export type TripStatus = 'not_started' | 'in_progress' | 'pending_settlement' | 'completed' | 'cancelled';

export interface ExtraFeeItem {
  type: 'overtime' | 'excess_mileage' | 'other';
  category: string;
  amount: number;
  startTime?: string; endTime?: string;
  baseDuration?: string; overtimeDuration?: string;
  startMileage?: number; endMileage?: number;
  baseMileage?: number; excessMileage?: number;
  description?: string;
}

export interface Trip {
  id: string; driverOrderNo: string; orderNo: string;
  type: 'charter' | 'rental';
  plateNo: string; carModel: string;
  passengerName: string; passengerPhone: string;
  tripDate: string; plannedTimeRange: string;
  pickupAddress: string; dropoffAddress: string;
  passengerCount?: number; luggage?: string;
  actualStartTime?: string; actualEndTime?: string;
  actualPickupTime?: string; actualDropoffTime?: string;
  startMileage?: number; endMileage?: number;
  duration?: number; mileage?: number;
  extraFeeItems?: ExtraFeeItem[];
  totalExtraFee?: number;
  status: TripStatus; dispatchTime: string;
  review?: TripReview;
}

export interface TripReview {
  driverRating: number; vehicleRating: number; serviceRating: number;
  comment?: string;
}

// ===== 工作台 =====
export interface DashboardData {
  todayTrips: number; todayCompleted: number;
  pendingTrips: Trip[];
  weeklyOrders: number; weeklyHours: number;
  monthlyIncome: number; rating: number;
}

// ===== 登录 =====
export interface LoginForm {
  phone: string; code: string;
}
