import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'VIEWER' | 'OPERATOR' | 'ADMIN' | 'SUPERADMIN';
}

/**
 * Guards a route. Unauthenticated users are redirected to /login. When a
 * required role is supplied it is enforced via the backend-issued session user.
 */
function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, isInitializing, hasRole } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-500">Memuat sesi…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireRole && !hasRole(requireRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;