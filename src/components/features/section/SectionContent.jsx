import React, { Suspense } from 'react';
import { Box, Tabs, Tab, Typography, LinearProgress, useTheme, Card, CardContent } from '@mui/material';
import { MenuBook, Code, Lightbulb, PlayArrow } from '@mui/icons-material';
import { TopicContentSkeleton, EditorSkeleton } from '../../common/SkeletonLoader';
import SafeImage from '../../common/SafeImage';

// Lazy load heavy components
const ReactMarkdown = React.lazy(() => import('react-markdown'));
const CodeEditor = React.lazy(() => import('../editor/CodeEditor'));
const SyntaxHighlighter = React.lazy(() =>
    import('react-syntax-highlighter').then(module => ({ default: module.Prism }))
);

/**
 * SectionContent - Main content area with tabs for Learn/Practice
 */
const SectionContent = ({
    activeTab,
    onChangeTab,

    // Data
    section,
    aiContent,
    problemContent,
    testCases,

    // Editor State
    editorCode,
    onCodeChange,

    // Loading States
    contentLoading,
    testCasesLoading,

    // Callbacks
    onRunCode,
    onAiHelp,

    // Theme/Style
    topicColor,
    isDark
}) => {
    // Glass style for content cards
    const glassSx = {
        background: isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(30px)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.2)' : '0 10px 30px rgba(31, 38, 135, 0.05)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    };

    const editorGlassSx = {
        ...glassSx,
        background: isDark ? 'rgba(20, 20, 20, 0.6)' : 'rgba(255, 255, 255, 0.8)',
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Tabs */}
            <Box sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, val) => onChangeTab(val)}
                    sx={{
                        '& .MuiTabs-indicator': { backgroundColor: topicColor, height: 3, borderRadius: 3 },
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '1rem',
                            minHeight: 48,
                            px: 3,
                            color: 'text.secondary',
                            '&.Mui-selected': { color: topicColor },
                            transition: 'all 0.2s ease'
                        }
                    }}
                >
                    <Tab value="learn" label="Learn Concept" icon={<MenuBook sx={{ fontSize: 20, mb: 0, mr: 1 }} />} iconPosition="start" />
                    <Tab value="practice" label="Practice & Code" icon={<Code sx={{ fontSize: 20, mb: 0, mr: 1 }} />} iconPosition="start" />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
                {activeTab === 'learn' && (
                    <Box sx={{ height: '100%', pb: 2 }}>
                        <Card sx={glassSx}>
                            {contentLoading ? (
                                <Box sx={{ p: 4 }}>
                                    <TopicContentSkeleton />
                                </Box>
                            ) : (
                                <CardContent sx={{
                                    p: 4,
                                    height: '100%',
                                    overflowY: 'auto',
                                    '&::-webkit-scrollbar': { width: '6px' },
                                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(128,128,128,0.2)', borderRadius: '3px' }
                                }}>
                                    {/* Main Topic Image if available */}
                                    {/* <SafeImage src={topicImage} ... /> - Can add back if passed prop */}

                                    <Typography variant="h3" fontWeight={800} gutterBottom sx={{
                                        background: `linear-gradient(135deg, ${topicColor}, ${topicColor}aa)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 3
                                    }}>
                                        {section.title}
                                    </Typography>

                                    <Suspense fallback={<TopicContentSkeleton />}>
                                        <Box className="markdown-content">
                                            <ReactMarkdown
                                                components={{
                                                    code({ node, inline, className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                style={isDark ? undefined : undefined} // Add light theme if needed
                                                                language={match[1]}
                                                                PreTag="div"
                                                                customStyle={{
                                                                    background: isDark ? '#1e1e1e' : '#f5f5f7',
                                                                    borderRadius: '12px',
                                                                    padding: '1.5rem',
                                                                    fontSize: '0.9rem',
                                                                    margin: '1.5rem 0'
                                                                }}
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className={className} {...props} style={{
                                                                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                                                padding: '0.2rem 0.4rem',
                                                                borderRadius: '4px',
                                                                fontFamily: 'monospace'
                                                            }}>
                                                                {children}
                                                            </code>
                                                        );
                                                    }
                                                }}
                                            >
                                                {aiContent || section.content || "Content not available."}
                                            </ReactMarkdown>
                                        </Box>
                                    </Suspense>
                                </CardContent>
                            )}
                        </Card>
                    </Box>
                )}

                {activeTab === 'practice' && (
                    <Box sx={{ height: '100%', display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
                        {/* Left: Problem Description */}
                        <Box sx={{ flex: 1, height: '100%' }}>
                            <Card sx={glassSx}>
                                <CardContent sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
                                    <Typography variant="h5" fontWeight={700} gutterBottom>Problem</Typography>
                                    {contentLoading ? (
                                        <TopicContentSkeleton />
                                    ) : (
                                        <Box className="markdown-content">
                                            <Suspense fallback={<TopicContentSkeleton />}>
                                                <ReactMarkdown>{problemContent || section.description}</ReactMarkdown>
                                            </Suspense>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Right: Editor */}
                        <Box sx={{ flex: 1.2, height: '100%', minHeight: 500 }}>
                            <Card sx={editorGlassSx}>
                                <Box sx={{ flex: 1, position: 'relative' }}>
                                    <Suspense fallback={<EditorSkeleton />}>
                                        <CodeEditor
                                            code={editorCode}
                                            onChange={onCodeChange}
                                            language="javascript" // Passed from parent state ideally, hardcoded JS for now to match SectionPage default
                                            height="100%"
                                        />
                                    </Suspense>
                                </Box>
                                {/* Editor Actions Bar can go here or inside CodeEditor */}
                            </Card>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default SectionContent;
