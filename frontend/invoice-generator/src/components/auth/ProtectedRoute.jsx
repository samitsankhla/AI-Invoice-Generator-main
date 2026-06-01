import { Navigate, Outlet, useLocation } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isProfileComplete } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Optionally replace with a spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if profile is complete, but allow access to profile page itself
  if (!isProfileComplete() && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return (
    <DashboardLayout>
      {children ? children : <Outlet />}
    </DashboardLayout>
  );
};

export default ProtectedRoute;