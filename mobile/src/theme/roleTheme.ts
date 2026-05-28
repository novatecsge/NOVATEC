import { RoleName } from '@/types/api';

export const roleTheme = {
  ADMIN: {
    accent: '#2563eb',
    soft: '#dbeafe',
    title: 'Administrador'
  },
  GUARD: {
    accent: '#f59e0b',
    soft: '#fef3c7',
    title: 'Guardia'
  },
  USER: {
    accent: '#16a34a',
    soft: '#dcfce7',
    title: 'Usuario'
  }
} as const;

export const getRoleTheme = (role?: RoleName | null) => {
  if (role === 'ADMIN' || role === 'GUARD' || role === 'USER') return roleTheme[role];
  return roleTheme.USER;
};
