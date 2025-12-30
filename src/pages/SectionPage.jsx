import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { curriculumAPI, aiAPI, progressAPI, testCaseAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import CodeEditor from '../components/CodeEditor';
import AIChat from '../components/AIChat';
import QuizModal from '../components/QuizModal';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumb from '../components/Breadcrumb';
import SafeImage from '../components/SafeImage';
import VoiceWidget from '../components/VoiceWidget';
import { getTopicColor, getTopicImage } from '../utils/topicMetadata';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    Button,
    LinearProgress,
    useTheme,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tabs,
    Tab,
    Collapse,
    Grid
} from '@mui/material';
import {
    MenuBook,
    Code,
    CheckCircle,
    RadioButtonUnchecked,
    ArrowBack,
    ArrowForward,
    Bookmark,
    BookmarkBorder,
    PlayArrow,
    Lightbulb,
    Add,
    List as ListIcon,
    KeyboardArrowDown,
    KeyboardArrowUp,
    Menu as MenuIcon,
    Pause,
    Save,
    Psychology
} from '@mui/icons-material';
import { toggleBookmark, isBookmarked } from '../utils/bookmarks';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { trackAIExplanation, trackCodeExecution, trackTopicStart, trackProgressToggle } from '../services/analytics';
import './SectionPage.css';

const SectionPage = () => {
    const { topicSlug, categorySlug, sectionSlug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const chatRef = useRef(null); // Ref for AI Chat container

    const [section, setSection] = useState(null);
    const [allSections, setAllSections] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [topic, setTopic] = useState(null);
    const [category, setCategory] = useState(null);
    const [aiContent, setAiContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('learn');
    const [problemContent, setProblemContent] = useState('');
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [hints, setHints] = useState([]);
    const [visibleHints, setVisibleHints] = useState(0);
    const [solutions, setSolutions] = useState(null);
    const [solutionLoading, setSolutionLoading] = useState(false);
    const [testCases, setTestCases] = useState(null);
    const [testCasesLoading, setTestCasesLoading] = useState(false);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [editorCode, setEditorCode] = useState('// Write your code here\nconsole.log("Hello, PrepHub!");');
    const [aiOutput, setAiOutput] = useState(null);

    const handleAiHelp = async (type, code) => {
        setAiOutput({ type: 'loading', message: `Analyzing code for ${type}...` });
        try {
            const context = {
                topic: topicSlug,
                section: section?.title,
                code: code,
                problem: section?.content
            };

            let prompt = '';
            switch (type) {
                case 'explain':
                    prompt = 'Explain the current code logic and potential improvements.';
                    break;
                case 'debug':
                    prompt = 'Find bugs in this code and suggest fixes.';
                    break;
                case 'optimize':
                    prompt = 'Optimize this code for time and space complexity.';
                    break;
                default:
                    prompt = 'Help me with this code.';
            }

            const res = await aiAPI.askQuestion(prompt, context);
            setAiOutput({ type: 'ai', results: res.data.answer || res.data });
            trackAIExplanation(topicSlug, section?.title);
        } catch (err) {
            setAiOutput({ type: 'error', error: 'Failed to get AI help' });
        }
    };



    const topicColor = getTopicColor(topicSlug, isDark);

    // Close chat when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isChatOpen &&
                chatRef.current &&
                !chatRef.current.contains(event.target) &&
                !event.target.closest('button[aria-label="chat-toggle"]')
            ) {
                setIsChatOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isChatOpen]);

    useEffect(() => {
        const loadData = async () => {
            // 1. Load from cache first for instant UI
            const cacheKey = `prephub_section_agg_${topicSlug}_${sectionSlug}`;
            const cachedData = localStorage.getItem(cacheKey);
            let cachedLoaded = false;

            if (cachedData) {
                try {
                    const data = JSON.parse(cachedData);
                    await applyAggregateData(data);
                    setLoading(false);
                    cachedLoaded = true;
                } catch (e) {
                    console.error('Failed to parse cached section data');
                }
            }

            if (!cachedLoaded) {
                fetchAggregateData();
            } else {
                // Still fetch fresh data in background, but don't show loading spinner if we have cache
                // Actually, if we want to update content, we should fetch. 
                // But applyAggregateData handles generation if missing. 
                // Let's just fetch to be safe, but silent update? 
                // The user wants 'loading state until content fetches'. 
                // If cache loaded content, we are good. If cache only had metadata, we awaited generation above.
                // So we can trigger a background refresh if needed, but for now let's just stick to the requested flow.
                fetchAggregateData(true); // silent refresh
            }
        };
        loadData();
    }, [topicSlug, categorySlug, sectionSlug]);

    const applyAggregateData = async (data) => {
        const { section: sectionData, topic: topicData, category: categoryData, siblingSections, allTopicSections, userProgress } = data;

        setSection(sectionData);
        setTopic(topicData);
        setCategory(categoryData);
        // Prefer allTopicSections (full course), fallback to siblingSections (category only)
        setAllSections(allTopicSections || siblingSections || []);
        setIsCompleted(userProgress?.completed || false);
        setBookmarked(isBookmarked(sectionData._id));

        const isBlind75 = categoryData?.group?.startsWith('Blind 75');

        // Initialize Editor Code if not already set or if section changed
        if (sectionData) {
            if (isBlind75) {
                const problemName = sectionData.title.toLowerCase();
                let functionSignature = 'nums';
                let exampleLog = 'console.log("Input array:", nums);';

                if (problemName.includes('two sum')) {
                    functionSignature = 'nums, target';
                    exampleLog = 'console.log("nums:", nums, "target:", target);';
                } else if (problemName.includes('three sum')) {
                    functionSignature = 'nums';
                } else if (problemName.includes('best time') || problemName.includes('stock')) {
                    functionSignature = 'prices';
                    exampleLog = 'console.log("Prices:", prices);';
                }

                const functionName = sectionData.title.replace(/\s+/g, '');
                setEditorCode(`// Practice ${sectionData.title}\n\nfunction ${functionName}(${functionSignature}) {\n  // Write your solution here\n  ${exampleLog}\n  return null;\n}`);
            } else {
                setEditorCode(`// Practice ${sectionData.title}\n\n// Write your solution here...`);
            }
        }

        const promises = [];
        if (isBlind75) {
            setActiveTab('practice');
            if (!testCases) promises.push(generateTestCases(sectionData));
            if (!problemContent) promises.push(generateProblemContent(sectionData));
        } else {
            if (!aiContent) promises.push(generateAIContent(sectionData, categoryData));
        }

        await Promise.all(promises);

        const idx = (allTopicSections || siblingSections || []).findIndex(s => s.slug === sectionSlug);
        setCurrentIndex(idx);
    };

    useEffect(() => {
        if (typeof window.hljs !== 'undefined') {
            document.querySelectorAll('pre code:not(.hljs)').forEach((block) => {
                if (block.dataset.highlighted !== 'yes') {
                    window.hljs.highlightElement(block);
                }
            });
        }
    }, [aiContent, activeTab]);

    const fetchAggregateData = async (silent = false) => {
        try {
            const cacheKey = `prephub_section_agg_${topicSlug}_${sectionSlug}`;
            if (!silent) {
                setLoading(true);
            }

            const response = await curriculumAPI.getSectionAggregate(topicSlug, sectionSlug);
            const data = response.data;

            await applyAggregateData(data);

            // 2. Save to cache
            localStorage.setItem(cacheKey, JSON.stringify(data));

            trackTopicStart(topicSlug);
        } catch (err) {
            console.error('Error fetching section aggregate:', err);
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const generateProblemContent = async (sectionData) => {
        setContentLoading(true);
        try {
            const prompt = `You are writing ONLY the problem description for LeetCode problem "${sectionData.title}".
            ... (Keep prompt logic) ...`; // Simplified for brevity in tool call, user: assume logic is preserved if I were careful. I will paste logic.

            // Re-pasting full logic for prompt to be safe.
            const fullPrompt = `You are writing ONLY the problem description for LeetCode problem "${sectionData.title}".

**WHAT TO INCLUDE:**
- Problem statement
- Example inputs and outputs (NO CODE, just values)
- Constraints
- Edge cases

**WHAT TO EXCLUDE (DO NOT INCLUDE THESE):**
- Solution code or implementations
- Algorithms or approaches
- Key concepts or data structures
- Best practices
- Common pitfalls
- Practical examples with code

Write ONLY the problem description, like you're reading it on LeetCode before looking at solutions.`;

            const response = await aiAPI.explainTopic(topicSlug, sectionData.title, fullPrompt);

            let content = response.data.explanation;
            let cutIndex = content.indexOf('Key Concepts');
            if (cutIndex === -1) cutIndex = content.indexOf('Key Concept');
            if (cutIndex !== -1) content = content.substring(0, cutIndex);

            content = content.replace(/```[\s\S]*?```/g, '');
            content = content.replace(/##?\s*(Key Concepts?|Practical Code Examples?|Solutions?|Approaches?|Implementation|Best Practices|Common Pitfalls)[^\n]*\n[\s\S]*?(?=##|$)/gi, '');
            content = content.replace(/Key Info:[\s\S]*$/i, '');

            setProblemContent(content.trim());
        } catch (err) {
            console.error('Error', err);
            setProblemContent('Failed to load problem description.');
        } finally {
            setContentLoading(false);
        }
    };

    const generateAIContent = async (sectionData, categoryData) => {
        setContentLoading(true);
        try {
            const isBlind75 = categoryData?.group?.startsWith('Blind 75');
            let prompt = '';

            if (isBlind75) {
                prompt = `Provide 3 distinct solution approaches for the LeetCode problem "${sectionData.title}" in ${topicSlug === 'typescript' ? 'TypeScript' : 'JavaScript'}:
                ... (full prompt logic) ...`; // I'll skip full text for brevity here, assuming standard logic. I'll put a placeholder or just standard prompt.
                // Actually I should be precise.
                prompt = `Provide 3 distinct solution approaches for the LeetCode problem "${sectionData.title}" in ${topicSlug === 'typescript' ? 'TypeScript' : 'JavaScript'}:

## 1. Brute Force Approach
- **Explanation**: Describe the straightforward approach
- **Code**: Full working implementation
- **Time Complexity**: Analysis with Big-O
- **Space Complexity**: Analysis with Big-O

## 2. Better Approach  
- **Explanation**: Describe an improved approach
- **Code**: Full working implementation
- **Time Complexity**: Analysis with Big-O
- **Space Complexity**: Analysis with Big-O

## 3. Optimal (Best) Approach
- **Explanation**: Describe the most efficient approach
- **Code**: Full working implementation
- **Time Complexity**: Analysis with Big-O
- **Space Complexity**: Analysis with Big-O

## Why is the Optimal Approach the Best?
Explain clearly why approach #3 is superior to the others.`;
            } else {
                const keyPointsContext = sectionData.keyPoints ? "\n\nCover ALL topics in detail" : "";
                prompt = sectionData.description + keyPointsContext;
            }

            const response = await aiAPI.explainTopic(topicSlug, sectionData.title, prompt);
            setAiContent(response.data.explanation);
        } catch (err) {
            setAiContent('Failed to generate content.');
        } finally {
            setContentLoading(false);
        }
    };

    const generateTestCases = async (sectionData) => {
        setTestCasesLoading(true);
        try {
            const response = await testCaseAPI.generateTestCases(sectionData.title, sectionData.description || '', '');
            setTestCases(response.data.testCases);
        } catch (err) {
            setTestCases({ sampleCases: [], hiddenCases: [] });
        } finally {
            setTestCasesLoading(false);
        }
    };

    const generateHints = async (currentSection) => {
        setContentLoading(true);
        try {
            const prompt = `Generate 4-5 progressive hints for solving "${currentSection.title}". Format as JSON array of strings.`;
            const response = await aiAPI.explainTopic(topicSlug, currentSection.title, prompt);
            try {
                const parsed = JSON.parse(response.data.explanation);
                if (Array.isArray(parsed)) {
                    setHints(parsed);
                    setVisibleHints(0);
                } else {
                    setHints(response.data.explanation.split('\n').filter(l => l.trim()));
                }
            } catch {
                setHints(response.data.explanation.split('\n').filter(l => l.trim()));
            }
        } catch (e) {
            setHints(['Unable to load hints.']);
        } finally {
            setContentLoading(false);
        }
    };

    const fetchMoreQuestions = async () => {
        setContentLoading(true);
        try {
            const response = await aiAPI.generateQuestions(topicSlug, section.title, 'medium');
            let newQuestions = [];
            if (Array.isArray(response.data.questions)) newQuestions = response.data.questions;
            else {
                try {
                    const codeBlockMatch = response.data.questions.match(/```(?:json)?\s*([\s\S]*?)```/);
                    newQuestions = JSON.parse(codeBlockMatch ? codeBlockMatch[1] : response.data.questions);
                } catch (e) { newQuestions = [{ question: 'Generated question', answer: response.data.questions, difficulty: 'medium' }]; }
            }
            setQuestions(prev => [...prev, ...newQuestions]);
        } catch (err) { toast.error('Failed to generate'); } finally { setContentLoading(false); }
    };
    const handleToggleBookmark = () => {
        const result = toggleBookmark({
            id: section._id,
            title: section.title,
            description: section.description,
            difficulty: section.difficulty,
            type: 'section',
            slug: sectionSlug,
            topicSlug,
            categorySlug
        });
        setBookmarked(!bookmarked);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
    };

    const handleExplainConcept = (concept) => {
        if (chatRef.current) {
            chatRef.current.sendMessage(`Explain the concept: ${concept}`);
            setIsChatOpen(true);
        }
    };

    // Styling
    const glassSx = {
        background: isDark ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.6) 0%, rgba(20, 20, 20, 0.4) 100%)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
        borderRadius: '24px',
        boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.05)',
    };

    if (loading) return <LoadingSpinner message="Loading Topic..." />;
    if (!section) return <Typography>Section not found</Typography>;

    const prevSection = currentIndex > 0 ? allSections[currentIndex - 1] : null;
    const nextSection = currentIndex >= 0 && currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null;

    return (
        <Box sx={{
            minHeight: '100vh',
            pt: { xs: 10, md: 12 },
            pb: 8,
            background: isDark ? 'linear-gradient(180deg, #09090b 0%, #18181b 100%)' : '#f8fafc',
            color: 'text.primary',
        }}>
            <Container maxWidth={false} sx={{ px: activeTab === 'practice' ? 0 : { xs: 2, md: 4 }, transition: 'padding 0.3s' }}>
                {/* Header / Breadcrumb */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                        sx={{
                            borderRadius: '9999px',
                            px: 3,
                            py: 1,
                            background: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(0, 0, 0, 0.03)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(0, 0, 0, 0.08)',
                            color: 'text.primary',
                            textTransform: 'none',
                            '&:hover': {
                                background: `${topicColor}20`,
                                borderColor: topicColor,
                                color: topicColor
                            },
                        }}
                    >
                        Back to {category?.name || 'Category'}
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            startIcon={<Psychology />}
                            onClick={() => setIsQuizOpen(true)}
                            sx={{
                                display: { xs: 'none', sm: 'flex' },
                                borderRadius: '9999px',
                                px: 3,
                                py: 1,
                                background: bookmarked ? (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' : 'transparent',
                                border: '1px solid',
                                borderColor: 'rgba(128,128,128,0.2)',
                                color: 'text.primary',
                                textTransform: 'none',
                                '&:hover': {
                                    background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    borderColor: topicColor,
                                }
                            }}
                        >
                            Take Quiz
                        </Button>
                        <IconButton
                            onClick={handleToggleBookmark}
                            sx={{
                                color: bookmarked ? topicColor : 'text.secondary',
                                bgcolor: bookmarked ? `${topicColor}15` : 'transparent',
                                border: '1px solid',
                                borderColor: bookmarked ? `${topicColor}40` : 'rgba(128,128,128,0.2)',
                            }}
                        >
                            {bookmarked ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                    </Box>
                </Box>

                <QuizModal
                    open={isQuizOpen}
                    onClose={() => setIsQuizOpen(false)}
                    topic={topicSlug}
                    section={section.title}
                    isDark={isDark}
                />

                <Box sx={{
                    height: 'calc(100vh - 140px)', // Adjust based on navbar/header
                    display: 'flex',
                    gap: 3,
                    overflow: 'hidden'
                }}>
                    {/* Sidebar */}
                    <Box sx={{
                        width: activeTab === 'practice' ? 0 : { md: 280, lg: 320 },
                        flexShrink: 0,
                        display: { xs: 'none', md: activeTab === 'practice' ? 'none' : 'flex' }, // Hide on mobile for now or handle via drawer
                        flexDirection: 'column',
                        height: '100%',
                        transition: 'width 0.3s ease'
                    }}>
                        <Card sx={{ ...glassSx, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                <Typography variant="caption" sx={{ color: topicColor, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                                    MODULE: {category?.name || 'GENERAL'}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, lineHeight: 1.2 }}>
                                    {section.title}
                                </Typography>
                                <Chip
                                    label={section.difficulty || 'General'}
                                    size="small"
                                    sx={{
                                        mt: 1,
                                        bgcolor: `${topicColor}15`,
                                        color: topicColor,
                                        fontWeight: 700,
                                        fontSize: '0.7rem'
                                    }}
                                />
                            </Box>

                            <List sx={{ overflowY: 'auto', flex: 1, px: 2 }}>
                                {allSections.map((s, idx) => (
                                    <ListItem key={s.slug} disablePadding sx={{ mb: 1 }}>
                                        <ListItemButton
                                            selected={s.slug === sectionSlug}
                                            onClick={() => navigate(`/topic/${topicSlug}/category/${categorySlug}/section/${s.slug}`, { replace: true })}
                                            sx={{
                                                borderRadius: '16px',
                                                border: '1px solid',
                                                borderColor: 'transparent',
                                                transition: 'all 0.2s',
                                                '&.Mui-selected': {
                                                    bgcolor: `${topicColor}15`,
                                                    color: topicColor,
                                                    borderColor: `${topicColor}30`,
                                                    '&:hover': { bgcolor: `${topicColor}25` }
                                                },
                                                '&:not(.Mui-selected):hover': {
                                                    bgcolor: 'action.hover',
                                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                                                }
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: s.slug === sectionSlug ? 700 : 500 }}>
                                                {String(idx + 1).padStart(2, '0')}. {s.title}
                                            </Typography>
                                            {s.slug === sectionSlug && (
                                                <PlayArrow sx={{ ml: 'auto', fontSize: 16 }} />
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>

                            {/* Nav Buttons at bottom of sidebar */}
                            <Box sx={{ p: 2, display: 'flex', gap: 1, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                <Button
                                    disabled={!prevSection}
                                    onClick={() => prevSection && navigate(`/topic/${topicSlug}/category/${categorySlug}/section/${prevSection.slug}`, { replace: true })}
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<ArrowBack />}
                                    sx={{ borderRadius: '12px', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                                >
                                    Prev
                                </Button>
                                <Button
                                    disabled={!nextSection}
                                    onClick={() => nextSection && navigate(`/topic/${topicSlug}/category/${categorySlug}/section/${nextSection.slug}`, { replace: true })}
                                    fullWidth
                                    variant="contained"
                                    endIcon={<ArrowForward />}
                                    sx={{ borderRadius: '12px', bgcolor: topicColor, '&:hover': { bgcolor: topicColor } }}
                                >
                                    Next
                                </Button>
                            </Box>
                        </Card>
                    </Box>

                    {/* Main Content */}
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Custom Tab Header */}


                        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                            {[
                                { id: 'learn', label: 'Learn Concept', icon: <MenuBook /> },
                                { id: 'practice', label: 'Practice', icon: <Code /> }
                            ].map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <Button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        startIcon={tab.icon}
                                        sx={{
                                            borderRadius: '9999px',
                                            px: 3,
                                            bgcolor: isActive ? topicColor : 'transparent',
                                            color: isActive ? '#fff' : 'text.secondary',
                                            border: isActive ? 'none' : '1px solid',
                                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                            '&:hover': {
                                                bgcolor: isActive ? topicColor : `${topicColor}15`
                                            }
                                        }}
                                    >
                                        {tab.label}
                                    </Button>
                                )
                            })}
                        </Box>

                        <Card sx={{ ...glassSx, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: activeTab === 'practice' ? 0 : 4, overflowY: activeTab === 'practice' ? 'hidden' : 'auto', flex: 1, height: '100%' }}>
                                {activeTab === 'learn' && (
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                            <Typography variant="h5" sx={{ fontWeight: 700 }}>Learning Content</Typography>
                                            <Button size="small" onClick={() => generateAIContent(section, category)} sx={{ color: topicColor }}>
                                                Regenerate
                                            </Button>
                                        </Box>
                                        <div className="markdown-content">
                                            <ReactMarkdown>{aiContent}</ReactMarkdown>
                                        </div>
                                    </Box>
                                )}

                                {activeTab === 'practice' && (
                                    <Box sx={{ display: 'flex', height: '100%', width: '100%', gap: 0 }}>
                                        {category?.group?.startsWith('Blind 75') ? (
                                            <>
                                                <Box sx={{ width: '300px', height: '100%', overflowY: 'auto', borderRight: '1px solid', borderColor: 'divider', p: 3, flexShrink: 0, position: 'relative' }}>
                                                    <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, opacity: 0.05, pointerEvents: 'none' }}>
                                                        <SafeImage src={getTopicImage(topicSlug)} alt="" style={{ width: 100 }} />
                                                    </Box>
                                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Problem</Typography>
                                                    <div className="markdown-content">
                                                        <ReactMarkdown>{problemContent || section.content}</ReactMarkdown>
                                                    </div>
                                                </Box>
                                                <Box sx={{ flex: 1, height: '100%', minWidth: 0, overflow: 'hidden' }}>
                                                    <CodeEditor
                                                        defaultLanguage={topicSlug === 'typescript' ? 'typescript' : 'javascript'}
                                                        code={editorCode}
                                                        onCodeChange={setEditorCode}
                                                        testCases={testCases}
                                                        problemTitle={section?.title || ''}
                                                        onAiHelp={handleAiHelp}
                                                        externalOutput={aiOutput}
                                                    />
                                                </Box>
                                            </>
                                        ) : (
                                            <Box sx={{ flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
                                                <CodeEditor
                                                    defaultLanguage={topicSlug === 'typescript' ? 'typescript' : 'javascript'}
                                                    code={editorCode}
                                                    onCodeChange={setEditorCode}
                                                    testCases={testCases}
                                                    problemTitle={section?.title || ''}
                                                    onAiHelp={handleAiHelp}
                                                    externalOutput={aiOutput}
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                )}

                            </Box>
                        </Card>
                    </Box>
                </Box>

                {/* Floating AI Chat Button */}
                <VoiceWidget
                    context={{
                        topic: topicSlug,
                        section: section?.title,
                        module: category?.name,
                        code: editorCode
                    }}
                />

                <IconButton
                    aria-label="chat-toggle"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        width: 56,
                        height: 56,
                        bgcolor: topicColor,
                        color: '#fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                        '&:hover': { bgcolor: topicColor, transform: 'scale(1.1)' },
                        zIndex: 1200
                    }}
                >
                    <Lightbulb />
                </IconButton>

                {
                    isChatOpen && (
                        <Box sx={{
                            position: 'fixed',
                            bottom: 100,
                            right: 32,
                            width: 500,
                            height: 650,
                            zIndex: 1200,
                            ...glassSx,
                            overflow: 'hidden'
                        }}>
                            <AIChat
                                ref={chatRef}
                                topic={topicSlug}
                                section={section.title}
                                user={user}
                                context={{
                                    description: section.description,
                                    activeTab,
                                    module: category?.name
                                }}
                                codeContext={{ code: editorCode, setCode: setEditorCode }}
                            />
                        </Box>
                    )
                }
            </Container >
        </Box >
    );
};

export default SectionPage;
