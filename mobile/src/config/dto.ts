export const VEHICLE_TYPES = ['AUTO', 'MOTO'] as const;
export const INCIDENT_STATUSES = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'] as const;
export const RESERVATION_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'] as const;

export type VehicleType = typeof VEHICLE_TYPES[number];
export type IncidentStatus = typeof INCIDENT_STATUSES[number];
export type ReservationStatus = typeof RESERVATION_STATUSES[number];

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  consentAccepted: boolean;
};
export type VehiclePayload = {
  plate: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  color: string;
  year: number;
};
export type ReservationPayload = {
  vehicleId: string;
  requestedStartAt: string;
  requestedEndAt: string;
};
export type IncidentPayload = {
  incidentType: string;
  description: string;
};
