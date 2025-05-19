import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface UnauthRouteProps {
  children: React.ReactNode;
}

const UnauthRoute: React.FC<UnauthRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore(state => ({
    user: state.user,
    loading: state.loading
  }));
  
  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
    );
  }
  
  // Redirect to dashboard if authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default UnauthRoute;