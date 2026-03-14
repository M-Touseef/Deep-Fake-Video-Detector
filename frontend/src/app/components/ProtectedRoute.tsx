import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Role-based blocking
  if (allowedRole && user?.role !== allowedRole) {
    return user?.role === 'admin'
      ? <Navigate to="/admin" replace />
      : <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
