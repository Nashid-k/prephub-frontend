import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlobalLoader from './GlobalLoader';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <GlobalLoader fullScreen />;
    }

    // DEV_BYPASS only works in development AND when explicitly enabled
    // This prevents accidentally deploying with auth disabled
    const isDev = import.meta.env.DEV;
    const devBypassEnabled = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

    if (!user && !(isDev && devBypassEnabled)) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
