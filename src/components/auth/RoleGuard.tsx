import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types/hutRi';

interface RoleGuardProps {
  children: ReactNode;
  roles: Role[];
  fallback?: ReactNode;
}

/**
 * Conditionally renders children only when the current user has one of the
 * allowed roles. Otherwise renders the fallback (or nothing).
 */
function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { user, hasRole } = useAuth();
  if (!user) return <>{fallback}</>;
  const allowed = roles.some((role) => hasRole(role));
  return <>{allowed ? children : fallback}</>;
}

export default RoleGuard;