export type RoleName = 'ADMIN' | 'GUARD' | 'USER';

export type User = {
  id: string;
  email: string;
  role?: RoleName;
  role_name?: RoleName;
  fullName?: string;
  full_name?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  hasDisability?: boolean;
  totalVehicles?: number;
  [key: string]: unknown;
};

export type AuthSession = { accessToken: string; refreshToken: string; user: User };
export type ApiEnvelope<T> = { success: boolean; message: string; data: T; error?: { code: string; details?: unknown } };

export type Vehicle = {
  id: string;
  plate?: string;
  licensePlate?: string;
  brand?: string;
  model?: string;
  color?: string;
  vehicleType?: 'AUTO' | 'MOTO';
  vehicle_type?: 'AUTO' | 'MOTO';
  isActive?: boolean;
  [key: string]: unknown;
};

export type ParkingSpace = {
  id?: string;
  code: string;
  number?: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'DISABLED' | string;
  space_type?: 'AUTO' | 'MOTO' | 'DISABILITY' | string;
  type?: string;
  plate?: string;
  vehiclePlate?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  [key: string]: unknown;
};

export type NotificationItem = { id: string; title?: string; message?: string; isRead?: boolean; is_read?: boolean; createdAt?: string; created_at?: string; [key: string]: unknown };
export type Reservation = { id: string; status?: string; requestedDate?: string; startTime?: string; endTime?: string; reason?: string; [key: string]: unknown };
export type Incident = { id: string; title?: string; description?: string; status?: string; severity?: string; createdAt?: string; created_at?: string; [key: string]: unknown };
export type DashboardSummary = Record<string, unknown>;
