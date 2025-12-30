import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TopicPage from './pages/TopicPage';
import CategoryPage from './pages/CategoryPage';
import SectionPage from './pages/SectionPage';
import CompilerPage from './pages/CompilerPage';
import ProgressPage from './pages/ProgressPage';
import BookmarksPage from './pages/BookmarksPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import createAppTheme from './theme';
import './App.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { initAnalytics, trackPageView } from './services/analytics';
import { useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

function AppContent() {
    const { theme } = useTheme();
    const muiTheme = React.useMemo(() => createAppTheme(theme), [theme]);

    React.useEffect(() => {
        initAnalytics();
    }, []);

    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <ErrorBoundary>
                <AuthProvider>
                    <Router>
                        <AnalyticsWrapper />
                        <div className="App">
                            <Navbar />
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/topic/:slug" element={<TopicPage />} />
                                <Route path="/topic/:topicSlug/category/:categorySlug" element={<CategoryPage />} />
                                <Route path="/topic/:topicSlug/category/:categorySlug/section/:sectionSlug" element={<SectionPage />} />
                                <Route
                                    path="/progress"
                                    element={
                                        <ProtectedRoute>
                                            <ProgressPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/compiler" element={<CompilerPage />} />
                                <Route
                                    path="/bookmarks"
                                    element={
                                        <ProtectedRoute>
                                            <BookmarksPage />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 4000,
                                    style: {
                                        background: '#363636',
                                        color: '#fff',
                                        borderRadius: '10px',
                                    },
                                    success: {
                                        iconTheme: {
                                            primary: '#10b981',
                                            secondary: '#fff',
                                        },
                                    },
                                    error: {
                                        iconTheme: {
                                            primary: '#ef4444',
                                            secondary: '#fff',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </Router>
                </AuthProvider>
            </ErrorBoundary>
        </MuiThemeProvider>
    );
}

function AnalyticsWrapper() {
    const location = useLocation();

    React.useEffect(() => {
        trackPageView(location.pathname + location.search);
    }, [location]);

    return (
        <>
            <Analytics />
            <SpeedInsights />
        </>
    );
}

export default App;
