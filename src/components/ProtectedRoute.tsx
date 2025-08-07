import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  requiredRole?: User['role']; // Keep for backward compatibility
  requireStatus?: User['status'][];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  requiredRole = undefined,
  requireStatus = [] 
}) => {
  const { user, isLoading } = useAuth();

  console.log('ProtectedRoute - user:', user?.username, 'role:', user?.role, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c2341] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Handle backward compatibility with requiredRole
  const rolesToCheck = requiredRole ? [requiredRole] : allowedRoles;

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(user.role)) {
    console.log('ProtectedRoute - User role not allowed:', user.role, 'allowed:', rolesToCheck);
    return <Navigate to="/dashboard" replace />;
  }

  if (requireStatus.length > 0 && !requireStatus.includes(user.status)) {
    console.log('ProtectedRoute - User status not allowed:', user.status, 'required:', requireStatus);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;