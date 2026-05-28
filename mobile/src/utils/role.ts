import { RoleName, User } from '@/types/api';

export const getUserRole = (user?: User | null): RoleName | null => {
  const role = user?.role_name ?? user?.role;
  return role === 'ADMIN' || role === 'GUARD' || role === 'USER' ? role : null;
};
