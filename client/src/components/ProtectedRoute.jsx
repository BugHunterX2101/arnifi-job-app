import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function ProtectedRoute({ children }) {
  const { user } = useSelector((s) => s.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export function RoleGuard({ children, role }) {
  const { user } = useSelector((s) => s.auth);

  if (!user || user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
