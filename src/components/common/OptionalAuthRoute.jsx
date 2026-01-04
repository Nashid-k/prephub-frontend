import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * OptionalAuthRoute - Allows access but tracks auth state
 * Used for content pages that should be viewable but with auth prompts
 * 
 * Features:
 * - Renders children regardless of auth state
 * - Provides isAuthenticated prop to children
 * - Can show login prompt for specific actions
 */
const OptionalAuthRoute = ({ children, showPromptFor = [] }) => {
    const { user, loading } = useAuth();

    // Generate a stable session ID for anonymous users
    const getSessionId = () => {
        let sessionId = sessionStorage.getItem('prephub_session_id');
        if (!sessionId) {
            sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('prephub_session_id', sessionId);
        }
        return sessionId;
    };

    const authContext = {
        isAuthenticated: !!user,
        user,
        loading,
        sessionId: user?._id || getSessionId(),
        // Actions that require login
        requiresAuth: showPromptFor
    };

    // Clone children and pass auth context
    return React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, { authContext });
        }
        return child;
    });
};

export default OptionalAuthRoute;
