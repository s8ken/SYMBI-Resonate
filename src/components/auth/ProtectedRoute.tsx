import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthService, UserRole } from '../../lib/auth/auth-service';
import { LoadingState } from '../ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  authService: AuthService;
  requiredRole?: UserRole;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  authService,
  requiredRole,
  requiredPermission,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const user = await authService.getCurrentUser();

      if (!user) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Check role if required
      if (requiredRole) {
        const userRole = await authService.getUserRole(user.id);
        if (userRole !== requiredRole && userRole !== 'admin') {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }
      }

      // Check permission if required
      if (requiredPermission) {
        const hasPermission = await authService.hasPermission(user.id, requiredPermission);
        if (!hasPermission) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Authorization check failed:', error);
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState title="Checking authorization..." />;
  }

  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};