import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

const Home = React.lazy(() => import('./pages/Home'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TopicPage = React.lazy(() => import('./pages/TopicPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const SectionPage = React.lazy(() => import('./pages/SectionPage'));
const CompilerPage = React.lazy(() => import('./pages/CompilerPage'));
const ProgressPage = React.lazy(() => import('./pages/ProgressPage'));
const BookmarksPage = React.lazy(() => import('./pages/BookmarksPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const ShareCodePage = React.lazy(() => import('./pages/ShareCodePage'));
const ReviewQueuePage = React.lazy(() => import('./pages/ReviewQueuePage'));
const DSAPage = React.lazy(() => import('./pages/DSAPage'));
const CSFundamentalsPage = React.lazy(() => import('./pages/CSFundamentalsPage'));
const SystemDesignPage = React.lazy(() => import('./pages/SystemDesignPage'));
const EngineeringPracticesPage = React.lazy(() => import('./pages/EngineeringPracticesPage'));
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import createAppTheme from './theme';
import './App.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { initAnalytics, trackPageView } from './services/analytics';
import { useLocation } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
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
                            <React.Suspense fallback={<LoadingSpinner message="Loading page..." />}>
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
                                    <Route
                                        path="/dsa"
                                        element={
                                            <ProtectedRoute>
                                                <DSAPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/cs-fundamentals"
                                        element={
                                            <ProtectedRoute>
                                                <CSFundamentalsPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/system-design"
                                        element={
                                            <ProtectedRoute>
                                                <SystemDesignPage />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/engineering-practices"
                                        element={
                                            <ProtectedRoute>
                                                <EngineeringPracticesPage />
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
                                    <Route path="/share" element={<ShareCodePage />} />
                                    <Route path="/reviews" element={<ReviewQueuePage />} />
                                </Routes>
                            </React.Suspense>
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
