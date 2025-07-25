import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: string;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredModule, 
  requiredPermission = 'read' 
}) => {
  const { user, isLoading, hasPermission, canAccess } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check module-specific permissions if required
  if (requiredModule) {
    const hasModuleAccess = canAccess(requiredModule);
    const hasRequiredPermission = hasPermission(requiredModule, requiredPermission);

    if (!hasModuleAccess || !hasRequiredPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Access Denied</p>
                  <p>
                    You don't have permission to access this module. 
                    Contact your administrator if you believe this is an error.
                  </p>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>Required: {requiredModule} - {requiredPermission}</p>
                    <p>Your role: {user.role}</p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;