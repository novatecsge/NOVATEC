export const API_ROUTES = {
  health: '/health',
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    me: '/auth/me',
    changePassword: '/auth/password'
  },
  users: {
    profile: '/users/profile',
    list: '/users',
    status: (id: string) => `/users/${id}/status`
  },
  vehicles: {
    list: '/vehicles',
    create: '/vehicles',
    update: (id: string) => `/vehicles/${id}`,
    remove: (id: string) => `/vehicles/${id}`
  },
  qr: {
    byVehicle: (vehicleId: string) => `/qr/vehicle/${vehicleId}`,
    generate: (vehicleId: string) => `/qr/vehicle/${vehicleId}/generate`,
    revoke: (qrId: string) => `/qr/${qrId}/revoke`
  },
  access: { scan: '/access/scan' },
  reservations: {
    create: '/reservations',
    my: '/reservations/my',
    pending: '/reservations/pending',
    approve: (id: string) => `/reservations/${id}/approve`,
    reject: (id: string) => `/reservations/${id}/reject`,
    cancel: (id: string) => `/reservations/${id}/cancel`
  },
  parking: {
    spaces: '/parking',
    map: '/parking/map'
  },
  notifications: {
    list: '/notifications',
    readAll: '/notifications/read-all',
    read: (id: string) => `/notifications/${id}/read`,
    remove: (id: string) => `/notifications/${id}`
  },
  incidents: {
    create: '/incidents',
    list: '/incidents',
    status: (id: string) => `/incidents/${id}/status`
  },
  dashboard: { summary: '/dashboard/summary' },
  reports: {
    summary: '/reports/summary',
    monthly: '/reports/monthly'
  }
} as const;

export const SOCKET_EVENTS = {
  connect: 'connect',
  disconnect: 'disconnect',
  spaceUpdate: 'space:update',
  reservationNew: 'reservation:new',
  accessEntry: 'access:entry',
  accessExit: 'access:exit',
  notificationNew: 'notification:new',
  incidentNew: 'incident:new',
  dashboardUpdate: 'dashboard:update'
} as const;
