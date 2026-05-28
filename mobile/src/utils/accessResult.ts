export type AccessResultType = 'ENTRY' | 'EXIT' | 'UNKNOWN';

export const getAccessType = (value: unknown): AccessResultType => {
  const raw = value as any;
  const candidates = [
    raw?.access?.access_type,
    raw?.access?.accessType,
    raw?.access_type,
    raw?.accessType,
    raw?.type,
    raw?.data?.access?.access_type,
    raw?.data?.access?.accessType,
    raw?.data?.access_type,
    raw?.data?.accessType
  ];
  const found = candidates.find((item) => typeof item === 'string')?.toUpperCase();
  if (found === 'ENTRY' || found === 'ENTRADA') return 'ENTRY';
  if (found === 'EXIT' || found === 'SALIDA') return 'EXIT';
  return 'UNKNOWN';
};

export const getAccessMessage = (value: unknown): string => {
  const type = getAccessType(value);
  if (type === 'ENTRY') return 'ENTRADA REGISTRADA';
  if (type === 'EXIT') return 'SALIDA REGISTRADA';
  return 'ACCESO PROCESADO';
};

export const getAccessDetails = (value: unknown): { plate?: string; space?: string; user?: string } => {
  const raw = value as any;
  const access = raw?.access ?? raw?.data?.access ?? raw?.data ?? raw ?? {};
  return {
    plate: access?.plate ?? access?.vehicle?.plate ?? access?.vehiclePlate ?? access?.vehicle_plate,
    space: access?.space_code ?? access?.spaceCode ?? access?.space?.code,
    user: access?.full_name ?? access?.fullName ?? access?.user?.full_name ?? access?.user?.fullName
  };
};
