import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [totalVisitors, setTotalVisitors] = useState(0);

    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    // Remove /api if present for socket connection which usually connects to root
    const baseUrl = SOCKET_URL.endsWith('/api') ? SOCKET_URL.slice(0, -4) : SOCKET_URL;

    useEffect(() => {
        // Init socket
        const newSocket = io(baseUrl, {
            auth: {
                token: token
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Listen for stats
        newSocket.on('stats:update', (data) => {
            setOnlineUsers(data.activeUsers);
            setTotalVisitors(data.totalVisitors);
        });

        setSocket(newSocket);

        // Cleanup
        return () => {
            newSocket.disconnect();
        };
    }, [token, baseUrl]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, totalVisitors }}>
            {children}
        </SocketContext.Provider>
    );
};
