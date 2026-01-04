import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/layout/Navbar';
import GlobalLoader from './components/common/GlobalLoader';
import PageTransition from './components/layout/PageTransition';
import { AnimatePresence } from 'framer-motion';

const Home = React.lazy(() => import('./pages/Home'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TopicPage = React.lazy(() => import('./pages/TopicPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const SectionPage = React.lazy(() => import('./pages/SectionPage'));

const ProgressPage = React.lazy(() => import('./pages/ProgressPage'));
const BookmarksPage = React.lazy(() => import('./pages/BookmarksPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const ShareCodePage = React.lazy(() => import('./pages/ShareCodePage'));
const ReviewQueuePage = React.lazy(() => import('./pages/ReviewQueuePage'));
const DSAPage = React.lazy(() => import('./pages/DSAPage'));
const CSFundamentalsPage = React.lazy(() => import('./pages/CSFundamentalsPage'));
const SystemDesignPage = React.lazy(() => import('./pages/SystemDesignPage'));
const EngineeringPracticesPage = React.lazy(() => import('./pages/EngineeringPracticesPage'));
const YjsCollaborative = React.lazy(() => import('./pages/YjsCollaborative'));
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import createAppTheme from './theme';
import './App.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { initAnalytics, trackPageView } from './services/analytics';
// useLocation imported above

import { AuthProvider } from './context/AuthContext';
import { LoaderProvider } from './context/LoaderContext';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <Router>
                    <AppContent />
                </Router>
            </LanguageProvider>
        </ThemeProvider>
    );
}

import useJourneyStore from './stores/useJourneyStore';

import { SocketProvider } from './context/SocketContext'; // Import SocketProvider

function AppContent() {
    const { theme } = useTheme();
    const muiTheme = React.useMemo(() => createAppTheme(theme), [theme]);
    const location = useLocation();

    React.useEffect(() => {
        initAnalytics();
        // Initialize local-first data layer (Dexie + Zustand)
        useJourneyStore.getState().init();
    }, []);

    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <ErrorBoundary>
                <LoaderProvider>
                    <AuthProvider>
                        <SocketProvider>
                            <AnalyticsWrapper />
                            <div className="App">
                                <Navbar />
                                <React.Suspense fallback={<GlobalLoader fullScreen />}>
                                    <AnimatePresence mode="wait">
                                        <Routes location={location} key={location.pathname}>
                                            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                                            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
                                            <Route
                                                path="/dashboard"
                                                element={
                                                    <ProtectedRoute>
                                                        <PageTransition><Dashboard /></PageTransition>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/dsa"
                                                element={
                                                    <ProtectedRoute>
                                                        <PageTransition><DSAPage /></PageTransition>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/cs-fundamentals"
                                                element={
                                                    <ProtectedRoute>
                                                        <PageTransition><CSFundamentalsPage /></PageTransition>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/system-design"
                                                element={
                                                    <ProtectedRoute>
                                                        <PageTransition><SystemDesignPage /></PageTransition>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route
                                                path="/engineering-practices"
                                                element={
                                                    <ProtectedRoute>
                                                        <PageTransition><EngineeringPracticesPage /></PageTransition>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route path="/topic/:slug" element={<PageTransition><TopicPage /></PageTransition>} />
                                            <Route path="/topic/:topicSlug/category/:categorySlug" element={<PageTransition><CategoryPage /></PageTransition>} />
                                            <Route path="/topic/:topicSlug/category/:categorySlug/section/:sectionSlug" element={<PageTransition><SectionPage /></PageTransition>} />
                                            <Route
                                                path="/progress"
                                                element={
                                                    <ProtectedRoute>
                                                        <PageTransition><ProgressPage /></PageTransition>
                                                    </ProtectedRoute>
                                                }
                                            />

                                            <Route
                                                path="/bookmarks"
                                                element={
                                                    <ProtectedRoute>
                                                        <PageTransition><BookmarksPage /></PageTransition>
                                                    </ProtectedRoute>
                                                }
                                            />
                                            <Route path="/share" element={<PageTransition><ShareCodePage /></PageTransition>} />
                                            <Route path="/reviews" element={<PageTransition><ReviewQueuePage /></PageTransition>} />
                                            <Route path="/collab" element={<PageTransition><YjsCollaborative /></PageTransition>} />
                                        </Routes>
                                    </AnimatePresence>
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
                        </SocketProvider>
                    </AuthProvider>
                </LoaderProvider>
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
