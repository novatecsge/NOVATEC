const normalize = (value?: string) =>
  String(value || '')
    .trim()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_')
    .toUpperCase();

export const roleLabel = (role?: string) => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    GUARD: 'Guardia',
    USER: 'Usuario'
  };

  return labels[normalize(role)] || 'Usuario';
};

export const reservationStatusLabel = (status?: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    CANCELLED: 'Cancelada',
    CANCELED: 'Cancelada',
    COMPLETED: 'Completada'
  };

  return labels[normalize(status)] || 'Pendiente';
};

export const incidentStatusLabel = (status?: string) => {
  const labels: Record<string, string> = {
    OPEN: 'Abierta',
    IN_REVIEW: 'En revisión',
    REVIEW: 'En revisión',
    RESOLVED: 'Resuelta',
    CLOSED: 'Cerrada'
  };

  return labels[normalize(status)] || 'Abierta';
};

export const incidentTypeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    ACCIDENTE: 'Accidente',
    ROBO: 'Robo',
    DAÑO: 'Daño',
    DANO: 'Daño',
    OBSTRUCCION: 'Obstrucción',
    SEGURIDAD: 'Seguridad',
    REPORTE_MOVIL: 'Reporte móvil',
    OTRO: 'Otro'
  };

  return labels[normalize(type)] || 'Otro';
};

export const vehicleTypeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    AUTO: 'Automóvil',
    CAR: 'Automóvil',
    COCHE: 'Automóvil',
    VEHICLE: 'Automóvil',
    MOTO: 'Motocicleta',
    MOTORCYCLE: 'Motocicleta'
  };

  return labels[normalize(type)] || 'Vehículo';
};

export const formatDateTime = (value?: string) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (value?: string) => {
  if (!value) return 'No disponible';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};