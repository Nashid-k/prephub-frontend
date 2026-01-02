import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, startTransition } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { curriculumAPI, aiAPI, progressAPI, testCaseAPI } from '../services/api';
import { useSectionAggregate } from '../hooks/useCurriculum';
import AIChat from '../components/features/ai/AIChat';
import QuizModal from '../components/features/quiz/QuizModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ContentSkeleton, EditorSkeleton } from '../components/common/SkeletonLoader';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Drawer } from '@mui/material';
import Breadcrumb from '../components/layout/Breadcrumb';
import SafeImage from '../components/common/SafeImage';
import AIOutputModal from '../components/features/ai/AIOutputModal';
import { getTopicColor, getTopicImage } from '../utils/topicMetadata';

// Lazy load heavy components for better performance
const ReactMarkdown = React.lazy(() => import('react-markdown'));
const SyntaxHighlighter = React.lazy(() =>
    import('react-syntax-highlighter').then(module => ({
        default: module.Prism
    }))
);
const CodeEditor = React.lazy(() => import('../components/features/editor/CodeEditor'));
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
    Grid,
    Select,
    Menu,
    MenuItem,
    InputLabel,
    FormControl,
    CircularProgress
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
import useActivityTracking, { trackCompletion } from '../hooks/useActivityTracking';
import './SectionPage.css';

const SectionPage = () => {
    const { topicSlug, categorySlug, sectionSlug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Helper to determine language (kept for reference, but default is JavaScript)
    const getLanguageFromTopic = (slug) => {
        const s = slug?.toLowerCase() || '';
        if (s.includes('html') || s.includes('css')) return 'html'; // or 'xml'/'css' but 'html' is safe for general web
        if (s.includes('python')) return 'python';
        if (s.includes('java') && !s.includes('script')) return 'java';
        if (s.includes('c-programming') || s === 'c') return 'c';
        if (s.includes('cpp') || s.includes('c++')) return 'cpp';
        if (s === 'typescript') return 'typescript';
        if (s.includes('go') || s.includes('golang')) return 'go';
        return 'javascript';
    };

    // Always default to JavaScript (users can switch if needed)
    const defaultLanguage = 'javascript';

    // Helper to generate boilerplate code based on problem title and language
    const getBoilerplateCode = (title, lang) => {
        const problemName = title.toLowerCase();
        const funcName = title.replace(/\s+/g, '');
        let args = ['nums'];
        let log = 'console.log("Input:", nums);';

        // Simple heuristic for common Blind 75 args
        if (problemName.includes('two sum')) {
            args = ['nums', 'target'];
            log = 'console.log("nums:", nums, "target:", target);';
        } else if (problemName.includes('stock')) {
            args = ['prices'];
            log = 'console.log("Prices:", prices);';
        } else if (problemName.includes('tree') || problemName.includes('invert')) {
            args = ['root'];
            log = 'console.log("Root:", root);';
        } else if (problemName.includes('string') || problemName.includes('anagram') || problemName.includes('message')) {
            args = ['s'];
            log = 'console.log("String:", s);';
        }

        switch (lang) {
            case 'python':
                return `# Practice ${title}\n\ndef ${title.toLowerCase().replace(/\s+/g, '_')}(${args.join(', ')}):\n    # Write your solution here\n    print("Input:", ${args[0]})\n    return None`;

            case 'java':
                return `// Practice ${title}\n\nclass Solution {\n    public void ${funcName}(${args.map(a => 'int[] ' + a).join(', ')}) {\n        // Write your solution here\n        System.out.println("Input: " + ${args[0]});\n    }\n}`;

            case 'cpp':
                return `// Practice ${title}\n\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void ${funcName}(${args.map(a => 'vector<int>& ' + a).join(', ')}) {\n        // Write your solution here\n        cout << "Input: " << ${args[0]}[0] << endl;\n    }\n};`;

            default: // javascript, typescript, etc
                return `// Practice ${title}\n\nfunction ${funcName}(${args.join(', ')}) {\n  // Write your solution here\n  ${log}\n  return null;\n}`;
        }
    };

    // Track activity automatically
    useActivityTracking(topicSlug, { categorySlug, sectionSlug });

    const chatRef = useRef(null); // Ref for AI Chat container

    const currentRequestRef = useRef(null); // Track current request to prevent race conditions

    const [section, setSection] = useState(null);
    const [allSections, setAllSections] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [topic, setTopic] = useState(null);
    const [category, setCategory] = useState(null);
    const [aiContent, setAiContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);
    const [languageChangeLoading, setLanguageChangeLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('learn');
    const [problemContent, setProblemContent] = useState('');
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [hints, setHints] = useState([]);
    const [visibleHints, setVisibleHints] = useState(0);
    const [solutions, setSolutions] = useState(null);
    const [solutionLoading, setSolutionLoading] = useState(false);
    const [testCases, setTestCases] = useState(null);
    const [testCasesLoading, setTestCasesLoading] = useState(false);
    const [progressMap, setProgressMap] = useState({});

    // State for Language Switcher - always defaults to JavaScript
    const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
    const [targetLanguage, setTargetLanguage] = useState(null); // Track target language during translation

    // Keep language as JavaScript when topic changes (don't auto-switch)
    // Users can manually switch if they prefer another language
    useEffect(() => {
        // Only reset to JavaScript on initial load or topic change
        setSelectedLanguage(defaultLanguage);
    }, [topicSlug]);

    // State for Language Menu
    const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false); // Mobile sidebar state

    const handleLanguageMenuOpen = (event) => {
        setLanguageMenuAnchor(event.currentTarget);
    };

    const handleLanguageMenuClose = () => {
        setLanguageMenuAnchor(null);
    };

    // Extract code blocks from markdown content
    const extractCodeBlocks = (markdown) => {
        const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
        const blocks = [];
        let match;

        while ((match = codeBlockRegex.exec(markdown)) !== null) {
            blocks.push({
                fullMatch: match[0],
                language: match[1],
                code: match[2],
                index: match.index
            });
        }

        return blocks;
    };


    const handleLanguageSelect = async (newLang) => {
        if (newLang === selectedLanguage) return;
        setLanguageMenuAnchor(null);

        // If in Practice Mode (Blind 75), just switch the editor boilerplate
        if (activeTab === 'practice' && category?.group?.startsWith('Blind 75')) {
            setSelectedLanguage(newLang);
            if (section) {
                // Check if user has modified code significantly? 
                // For now, always offer to reset or just switch language and let them keep code if they want?
                // The user request implies "switching" which usually means getting the snippet in that language.
                // We'll replace with boilerplate for the new language.
                const boilerplate = getBoilerplateCode(section.title, newLang);
                setEditorCode(boilerplate);
                toast.success(`Switched to ${newLang} boilerplate`);
            }
            return;
        }

        // Otherwise (Learn Mode), do the full AI translation of content
        setTargetLanguage(newLang);
        startTransition(() => setLanguageChangeLoading(true));

        try {
            // ... existing translation logic ...
            const codeBlocks = extractCodeBlocks(aiContent);
            if (codeBlocks.length === 0) {
                setSelectedLanguage(newLang);
                setLanguageChangeLoading(false);
                return;
            }
            const response = await aiAPI.translateCode(
                codeBlocks.map(b => b.code),
                selectedLanguage,
                newLang
            );

            // Replace code blocks in content (from end to start to maintain indices)
            let newContent = aiContent;
            const translated = response.data.translated;

            for (let i = codeBlocks.length - 1; i >= 0; i--) {
                const block = codeBlocks[i];
                const newBlock = `\`\`\`${newLang}\n${translated[i]}\n\`\`\``;

                newContent =
                    newContent.substring(0, block.index) +
                    newBlock +
                    newContent.substring(block.index + block.fullMatch.length);
            }

            setAiContent(newContent);
            setSelectedLanguage(newLang);
        } catch (err) {
            console.error(err);
            toast.error("Failed to translate content");
            setSelectedLanguage(newLang); // Force switch anyway
        } finally {
            setLanguageChangeLoading(false);
            setTargetLanguage(null);
        }
    };

    // Determine if language switcher should be visible
    const showLanguageSwitcher = ['algorithms', 'data-structures', 'dsa', 'blind-75', 'leetcode'].some(t => topicSlug.toLowerCase().includes(t) || category?.group?.toLowerCase().includes(t));

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [editorCode, setEditorCode] = useState('// Write your code here\nconsole.log("Hello, PrepHub!");');
    const [aiOutput, setAiOutput] = useState(null);

    // AI Modal States
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiModalType, setAiModalType] = useState('');
    const [aiModalResponse, setAiModalResponse] = useState('');
    const [aiModalLoading, setAiModalLoading] = useState(false);

    const handleAiHelp = async (type, code, lang = 'javascript') => {
        startTransition(() => {
            setAiModalType(type);
            setAiModalOpen(true);
            setAiModalLoading(true);
        });

        try {
            // Mode mapping: 'explain' -> 'review' (or we can add 'explain' mode to backend if needed)
            // Actually, 'explain' usually means general explanation. 'review' is critique.
            // Let's map: 
            // - explain -> review (General analysis)
            // - debug -> debug
            // - optimize -> optimize

            let mode = 'review';
            if (type === 'debug') mode = 'debug';
            if (type === 'optimize') mode = 'optimize';

            const res = await aiAPI.analyzeCode(code, mode, lang);

            startTransition(() => {
                setAiModalResponse(res.data.analysis);
                setAiModalLoading(false);
            });
            trackAIExplanation(topicSlug, section?.title);
        } catch (err) {
            startTransition(() => {
                setAiModalResponse('Failed to analyze code. Please try again.');
                setAiModalLoading(false);
            });
        }
    };



    const topicColor = useMemo(() => getTopicColor(topicSlug, isDark), [topicSlug, isDark]);

    // Close chat when clicking outside
    // Fix event listener leak by using useCallback
    const handleClickOutside = useCallback((event) => {
        if (isChatOpen &&
            chatRef.current &&
            !chatRef.current.contains(event.target) &&
            !event.target.closest('button[aria-label="chat-toggle"]')
        ) {
            setIsChatOpen(false);
        }
    }, [isChatOpen]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    // Intelligent Caching with React Query
    const {
        data: sectionData,
        isLoading: sectionLoading,
        isFetching,
        error: sectionError
    } = useSectionAggregate(topicSlug, sectionSlug);

    // Sync Loading State
    useEffect(() => {
        // Only show loading if we have no data at all (initial load)
        // If we have cached data (keepPreviousData), we don't show full loader
        setLoading(sectionLoading && !sectionData);
    }, [sectionLoading, sectionData]);

    // Sync Data to State
    useEffect(() => {
        if (sectionData && sectionData.section?.slug === sectionSlug) {
            // Only apply if the data matches current section (avoids stale previousData application)
            applyAggregateData(sectionData);
            trackTopicStart(topicSlug);

            // Reset AI content content when switching sections
            // We can detect switch by comparing IDs or just blindly resetting if needed
            // But doing it here might flicker. 
            // Better to rely on applyAggregateData setting main content.
        }
    }, [sectionData, topicSlug, sectionSlug]);

    // Reset ephemeral content on slug change (optional, but good for UX)
    useEffect(() => {
        setAiContent('');
        setProblemContent('');
        setTestCases(null);
    }, [topicSlug, sectionSlug]);

    const applyAggregateData = async (data) => {
        const { section: sectionData, topic: topicData, category: categoryData, siblingSections, allTopicSections, userProgress } = data;

        setSection(sectionData);
        setTopic(topicData);
        setCategory(categoryData);
        // Prefer allTopicSections (full course), fallback to siblingSections (category only)
        const allSecs = allTopicSections || siblingSections || [];
        setAllSections(allSecs);

        setIsCompleted(userProgress?.completed || false);
        setBookmarked(isBookmarked(sectionData._id));

        // Create progress map (assuming the API returns progress for all sections or we default to false)
        // If the API doesn't return full progress map, we might need to adjust the backend or just track current.
        // For now, let's try to derive it if possible, or init empty.
        // Actually, checking TopicPage logic, it gets `progress` object map.
        // The `getSectionAggregate` endpoint likely includes `progress` map or similar if we updated it recently.
        // Let's check what data holds. If `data.progress` exists, use it.
        if (data.progress) {
            setProgressMap(data.progress);
        } else {
            // Fallback: at least mark current as completed if true
            setProgressMap(prev => ({
                ...prev,
                [sectionData.slug]: userProgress?.completed || false
            }));
        }

        const isBlind75 = categoryData?.group?.startsWith('Blind 75');

        // Initialize Editor Code if not already set or if section changed
        if (sectionData) {
            if (isBlind75) {
                setEditorCode(getBoilerplateCode(sectionData.title, selectedLanguage));
            } else {
                setEditorCode(`// Practice ${sectionData.title}\n\n// Write your solution here...`);
            }
        }

        const promises = [];
        if (isBlind75) {
            setActiveTab('practice');
            // Always regenerate for fresh content on navigation
            promises.push(generateTestCases(sectionData));
            promises.push(generateProblemContent(sectionData));
        } else {
            // Always regenerate AI content on navigation to ensure it matches the current section
            promises.push(generateAIContent(sectionData, categoryData, selectedLanguage));
        }

        await Promise.all(promises);

        const idx = (allTopicSections || siblingSections || []).findIndex(s => s.slug === sectionSlug);
        setCurrentIndex(idx);
    };

    // Auto-scroll active item into view
    useEffect(() => {
        const activeItem = document.querySelector('.Mui-selected');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [sectionSlug, allSections, mobileOpen, activeTab]);

    useEffect(() => {
        if (typeof window.hljs !== 'undefined') {
            document.querySelectorAll('pre code:not(.hljs)').forEach((block) => {
                if (block.dataset.highlighted !== 'yes') {
                    window.hljs.highlightElement(block);
                }
            });
        }
    }, [aiContent, activeTab]);



    const generateProblemContent = async (sectionData) => {
        startTransition(() => setContentLoading(true));
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

    const generateAIContent = async (sectionData, categoryData, lang = 'javascript') => {
        // Use startTransition to prevent blocking the UI during state updates
        startTransition(() => setContentLoading(true));
        try {
            const isBlind75 = categoryData?.group?.startsWith('Blind 75');
            let context = '';

            // Use the human-readable topic name if available, otherwise slug
            const topicName = topic?.name || topicSlug;

            // Construct a context string that helps the AI classify
            const groupContext = categoryData?.group ? `Group: ${categoryData.group}. ` : '';
            const categoryContext = categoryData ? `Category: ${categoryData.name}. ` : '';

            if (isBlind75) {
                // For Blind 75, we want specific problem solving focus
                context = `${groupContext}${categoryContext}Problem Solving Context. Provide 3 distinct solution approaches.`;
            } else {
                // For general learning, provide rich context
                const keyPointsContext = sectionData.keyPoints ? `\nCover these key points: ${sectionData.keyPoints.join(', ')}.` : "";
                context = `${groupContext}${categoryContext}${sectionData.description || ''}${keyPointsContext}`;
            }

            const response = await aiAPI.explainTopic(topicName, sectionData.title, context, lang);
            setAiContent(response.data.explanation);
        } catch (err) {
            console.error(err);
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
        startTransition(() => setContentLoading(true));
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

    // Dead code removed: fetchMoreQuestions
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
        if (result.success) {
            toast.success(result.message);
            // Track completion if marking as done (assuming bookmark might double as done/saved for now, or just leave it. 
            // Wait, existing logic uses isCompleted for progress.
            // Let's find where progress is toggled. It seems distinct from bookmarking.
            // I will inject the trackCompletion into a new function if I can find it, or assume it's missing and rely on auto tracking for now.
            // Actually, I'll search for 'Mark Complete' button.
        }
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
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)',
        borderRadius: '24px',
        boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.05)',
    };

    if (loading) return <LoadingSpinner message="Loading Topic..." fullScreen />;
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
            {/* Top Loading Bar for Background Fetching */}
            {isFetching && !loading && (
                <LinearProgress
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        height: 3,
                        bgcolor: 'transparent',
                        '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${topicColor} 0%, ${topicColor}CC 100%)`
                        }
                    }}
                />
            )}

            <Container maxWidth={false} sx={{ px: activeTab === 'practice' ? 0 : { xs: 2, md: 4 }, transition: 'padding 0.3s' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={sectionSlug}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Header / Breadcrumb */}
                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Button
                                startIcon={<ArrowBack />}
                                onClick={() => navigate(`/topic/${topicSlug}/category/${categorySlug}`)}
                                sx={{
                                    borderRadius: '9999px',
                                    px: 3,
                                    py: 1,
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.05)'
                                            : 'rgba(0, 0, 0, 0.06)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid',
                                    borderColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.1)'
                                            : 'rgba(0, 0, 0, 0.12)',
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

                            {/* Mobile Sidebar Toggle */}
                            <IconButton
                                onClick={() => setMobileOpen(true)}
                                sx={{
                                    display: { xs: 'flex', md: 'none' },
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                    borderRadius: '12px',
                                    ml: 1
                                }}
                            >
                                <ListIcon />
                            </IconButton>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {showLanguageSwitcher && (
                                    <>
                                        <Button
                                            onClick={handleLanguageMenuOpen}
                                            sx={{
                                                borderRadius: '9999px',
                                                px: 3,
                                                py: 1,
                                                background: 'transparent',
                                                border: '1px solid',
                                                borderColor: 'rgba(128,128,128,0.2)',
                                                color: 'text.primary',
                                                textTransform: 'none',
                                                '&:hover': {
                                                    background: `${topicColor}15`,
                                                    borderColor: topicColor
                                                },
                                                position: 'relative',
                                                overflow: 'visible'
                                            }}
                                        >
                                            <Code sx={{ mr: 1, fontSize: '1.1rem' }} />
                                            {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
                                            <KeyboardArrowDown sx={{ ml: 0.5 }} />
                                        </Button>
                                        <Menu
                                            anchorEl={languageMenuAnchor}
                                            open={Boolean(languageMenuAnchor)}
                                            onClose={handleLanguageMenuClose}
                                            PaperProps={{
                                                sx: {
                                                    mt: 1,
                                                    borderRadius: 2,
                                                    minWidth: 150,
                                                    ...glassSx
                                                }
                                            }}
                                        >
                                            {[
                                                { code: 'javascript', label: 'JavaScript' },
                                                { code: 'python', label: 'Python' },
                                                { code: 'java', label: 'Java' },
                                                { code: 'cpp', label: 'C++' },
                                                { code: 'csharp', label: 'C#' },
                                                { code: 'go', label: 'Go' },
                                                { code: 'dart', label: 'Dart' }
                                            ].map((lang) => (
                                                <MenuItem
                                                    key={lang.code}
                                                    onClick={() => handleLanguageSelect(lang.code)}
                                                    selected={selectedLanguage === lang.code}
                                                    sx={{
                                                        '&.Mui-selected': {
                                                            bgcolor: `${topicColor}15`,
                                                            color: topicColor,
                                                            '&:hover': { bgcolor: `${topicColor}25` }
                                                        }
                                                    }}
                                                >
                                                    {lang.label}
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </>
                                )}
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
                            language={selectedLanguage}
                            content={activeTab === 'learn' ? aiContent : (section.description || section.content)} // Pass context
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
                                            {category?.group && <span style={{ opacity: 0.7 }}>{category.group} / </span>}
                                            {category?.name || 'CATEGORY'}
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
                                        {allSections.map((s, idx) => {
                                            const currentGroup = s.category?.group;
                                            const prevGroup = idx > 0 ? allSections[idx - 1].category?.group : null;
                                            const showHeader = currentGroup && currentGroup !== prevGroup;

                                            return (
                                                <React.Fragment key={s.slug}>
                                                    {showHeader && (
                                                        <Typography variant="subtitle2" sx={{
                                                            px: 2,
                                                            py: 1.5,
                                                            color: topicColor,
                                                            fontWeight: 800,
                                                            fontSize: '0.75rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: 1,
                                                            opacity: 0.8,
                                                            marginTop: idx > 0 ? 1 : 0
                                                        }}>
                                                            {currentGroup}
                                                        </Typography>
                                                    )}
                                                    <ListItem disablePadding sx={{ mb: 1 }}>
                                                        <ListItemButton
                                                            selected={s.slug === sectionSlug}
                                                            onClick={() => startTransition(() => navigate(`/topic/${topicSlug}/category/${categorySlug}/section/${s.slug}`))}
                                                            sx={{
                                                                bgcolor: s.slug === sectionSlug ? `${topicColor}15` : 'transparent',
                                                                color: s.slug === sectionSlug ? topicColor : 'text.primary',
                                                                borderLeft: s.slug === sectionSlug ? `3px solid ${topicColor}` : '3px solid transparent',
                                                                borderRadius: '0 12px 12px 0',
                                                                ml: 1,
                                                                mr: 1,
                                                                '&:hover': { bgcolor: `${topicColor}25` },
                                                                '&:not(.Mui-selected):hover': {
                                                                    bgcolor: 'action.hover',
                                                                    borderRadius: '12px',
                                                                    ml: 1,
                                                                    borderLeft: 'none'
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
                                                </React.Fragment>
                                            );
                                        })}
                                    </List>

                                    {/* Nav Buttons at bottom of sidebar */}
                                    <Box sx={{ p: 2, display: 'flex', gap: 1, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                        <Button
                                            disabled={!prevSection}
                                            onClick={() => prevSection && startTransition(() => navigate(`/topic/${topicSlug}/category/${categorySlug}/section/${prevSection.slug}`))}
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<ArrowBack />}
                                            sx={{ borderRadius: '12px', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                                        >
                                            Prev
                                        </Button>
                                        <Button
                                            disabled={!nextSection}
                                            onClick={() => nextSection && startTransition(() => navigate(`/topic/${topicSlug}/category/${categorySlug}/section/${nextSection.slug}`))}
                                            fullWidth
                                            variant="contained"
                                            endIcon={<ArrowForward />}
                                            sx={{
                                                borderRadius: '12px',
                                                bgcolor: topicColor,
                                                color: theme.palette.getContrastText(topicColor),
                                                '&:hover': { bgcolor: topicColor }
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </Box>
                                </Card>
                            </Box>

                            {/* Mobile Drawer */}
                            <Drawer
                                anchor="left"
                                open={mobileOpen}
                                onClose={() => setMobileOpen(false)}
                                PaperProps={{
                                    sx: { width: 300, bgcolor: 'background.default' }
                                }}
                            >
                                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                    <Typography variant="caption" sx={{ color: topicColor, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                                        {category?.group && <span style={{ opacity: 0.7 }}>{category.group} / </span>}
                                        {category?.name || 'CATEGORY'}
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, lineHeight: 1.2 }}>
                                        {section.title}
                                    </Typography>
                                </Box>
                                <List sx={{ overflowY: 'auto', flex: 1, px: 2, mt: 2 }}>
                                    {allSections.map((s, idx) => (
                                        <ListItem key={s.slug} disablePadding sx={{ mb: 1 }}>
                                            <ListItemButton
                                                selected={s.slug === sectionSlug}
                                                onClick={() => {
                                                    navigate(`/topic/${topicSlug}/category/${categorySlug}/section/${s.slug}`);
                                                    setMobileOpen(false);
                                                }}
                                                sx={{
                                                    borderRadius: '12px',
                                                    mb: 0.5,
                                                    '&.Mui-selected': {
                                                        bgcolor: `${topicColor}15`,
                                                        color: topicColor,
                                                        borderLeft: `3px solid ${topicColor}`,
                                                        '&:hover': { bgcolor: `${topicColor}25` }
                                                    }
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    {s.slug === sectionSlug ? <PlayArrow sx={{ fontSize: 18, color: topicColor }} /> :
                                                        progressMap?.[s.slug] ? <CheckCircle sx={{ fontSize: 18, color: '#30d158' }} /> :
                                                            <RadioButtonUnchecked sx={{ fontSize: 18, color: 'text.disabled' }} />}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={s.title}
                                                    primaryTypographyProps={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: s.slug === sectionSlug ? 600 : 400
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Drawer>

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
                                                    color: isActive ? theme.palette.getContrastText(topicColor) : 'text.secondary',
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
                                                    <Button
                                                        size="small"
                                                        onClick={() => startTransition(() => generateAIContent(section, category, selectedLanguage))}
                                                        sx={{
                                                            color: topicColor,
                                                            borderColor: topicColor,
                                                            '&:hover': {
                                                                bgcolor: `${topicColor}10`
                                                            }
                                                        }}
                                                    >
                                                        Regenerate
                                                    </Button>
                                                </Box>
                                                <div className="markdown-content">
                                                    {contentLoading || languageChangeLoading ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
                                                            <CircularProgress sx={{ color: topicColor, mb: 2 }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {languageChangeLoading
                                                                    ? `Translating to ${targetLanguage?.charAt(0).toUpperCase() + targetLanguage?.slice(1)}...`
                                                                    : 'Generating learning content...'}
                                                            </Typography>
                                                        </Box>
                                                    ) : aiContent ? (
                                                        <Suspense fallback={<ContentSkeleton />}>
                                                            <ReactMarkdown
                                                                components={{
                                                                    code({ node, inline, className, children, ...props }) {
                                                                        const match = /language-(\w+)/.exec(className || '');
                                                                        return !inline && match ? (
                                                                            <Suspense fallback={<EditorSkeleton />}>
                                                                                <SyntaxHighlighter
                                                                                    style={vscDarkPlus}
                                                                                    language={match[1]}
                                                                                    PreTag="div"
                                                                                    {...props}
                                                                                >
                                                                                    {String(children).replace(/\n$/, '')}
                                                                                </SyntaxHighlighter>
                                                                            </Suspense>
                                                                        ) : (
                                                                            <code className={className} {...props}>
                                                                                {children}
                                                                            </code>
                                                                        );
                                                                    },
                                                                    h4({ node, children, ...props }) {
                                                                        const text = String(children);
                                                                        if (text.includes('Trade-offs')) {
                                                                            return <h4 className="elite-header trade-off" {...props}>{children}</h4>;
                                                                        }
                                                                        if (text.includes('Internals') || text.includes('Deep Dive')) {
                                                                            return <h4 className="elite-header internal" {...props}>{children}</h4>;
                                                                        }
                                                                        if (text.includes('Gotchas') || text.includes('Anti-Patterns')) {
                                                                            return <h4 className="elite-header warning" {...props}>{children}</h4>;
                                                                        }
                                                                        if (text.includes('Mental Model')) {
                                                                            return <h4 className="elite-header mental-model" {...props}>{children}</h4>;
                                                                        }
                                                                        return <h4 {...props}>{children}</h4>;
                                                                    }
                                                                }}
                                                            >
                                                                {aiContent}
                                                            </ReactMarkdown>
                                                        </Suspense>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                                No content available
                                                            </Typography>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={() => generateAIContent(section, category, selectedLanguage)}
                                                                sx={{ color: topicColor, borderColor: topicColor }}
                                                            >
                                                                Generate Content
                                                            </Button>
                                                        </Box>
                                                    )}
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
                                                                <ReactMarkdown
                                                                    components={{
                                                                        code({ node, inline, className, children, ...props }) {
                                                                            const match = /language-(\w+)/.exec(className || '');
                                                                            return !inline && match ? (
                                                                                <SyntaxHighlighter
                                                                                    style={vscDarkPlus}
                                                                                    language={match[1]}
                                                                                    PreTag="div"
                                                                                    {...props}
                                                                                >
                                                                                    {String(children).replace(/\n$/, '')}
                                                                                </SyntaxHighlighter>
                                                                            ) : (
                                                                                <code className={className} {...props}>
                                                                                    {children}
                                                                                </code>
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {problemContent || section.content}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </Box>
                                                        <Box sx={{ flex: 1, height: '100%', minWidth: 0, overflow: 'hidden' }}>
                                                            <CodeEditor
                                                                defaultLanguage={selectedLanguage}
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
                                                            defaultLanguage={selectedLanguage}
                                                            code={editorCode}
                                                            onCodeChange={setEditorCode}
                                                            testCases={testCases}
                                                            problemTitle={section?.title || ''}
                                                            onAiHelp={(type, code) => handleAiHelp(type, code, selectedLanguage)}
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
                                color: theme.palette.getContrastText(topicColor),
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

                        {/* Language Change Loading Overlay */}
                        {
                            languageChangeLoading && (
                                <Box sx={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: 'rgba(0,0,0,0.7)',
                                    backdropFilter: 'blur(8px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 9999,
                                    flexDirection: 'column',
                                    gap: 3
                                }}>
                                    <CircularProgress size={60} sx={{ color: topicColor }} />
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                        {targetLanguage
                                            ? `Translating to ${targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)}...`
                                            : `Generating ${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Examples...`
                                        }
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                        {targetLanguage
                                            ? 'Translating code examples while preserving explanations'
                                            : 'Please wait while AI creates optimized code snippets'
                                        }
                                    </Typography>
                                </Box>
                            )
                        }

                        {/* AI Output Modal */}
                        <AIOutputModal
                            open={aiModalOpen}
                            onClose={() => setAiModalOpen(false)}
                            type={aiModalType}
                            response={aiModalResponse}
                            loading={aiModalLoading}
                        />
                    </motion.div>
                </AnimatePresence>
            </Container>
        </Box>
    );
};

export default SectionPage;
