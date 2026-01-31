

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, hasPermission } = useAuth();
  const location = useLocation();
  
 
  const currentPath = location.pathname.replace("/", "") || "dashboard";

  console.log("ProtectedRoute check:", { 
    hasUser: !!user, 
    isLoading, 
    currentPath,
    pathname: location.pathname 
  });

 
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

 
  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasPermission(currentPath)) {
    console.log(`No permission for ${currentPath}, redirecting to unauthorized`);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log(`Access granted to ${currentPath}`);
  return <>{children}</>;
};