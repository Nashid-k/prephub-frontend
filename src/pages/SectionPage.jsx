import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, startTransition } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme, Box, Typography } from '@mui/material';
import toast from 'react-hot-toast';

// APIs & Hooks
import { curriculumAPI, aiAPI, testCaseAPI, progressAPI } from '../services/api';
import { useSectionAggregate } from '../hooks/useCurriculum';
import { useAuth } from '../context/AuthContext';
import useActivityTracking from '../hooks/useActivityTracking';
import { trackAIExplanation, trackTopicStart } from '../services/analytics';
import { toggleBookmark, isBookmarked } from '../utils/bookmarks';
import { getTopicColor } from '../utils/topicMetadata';

// Components
import GlobalLoader from '../components/common/GlobalLoader';
import AuroraBackground from '../components/common/AuroraBackground';
import SectionHeader from '../components/features/section/SectionHeader';
import SectionNavigation from '../components/features/section/SectionNavigation';
import SectionContent from '../components/features/section/SectionContent';
import QuizModal from '../components/features/quiz/QuizModal';
import AIOutputModal from '../components/features/ai/AIOutputModal';

// Styles
import './SectionPage.css';
import confetti from 'canvas-confetti';
import CopilotWidget from '../components/features/ai/CopilotWidget';

const SectionPage = () => {
    const { topicSlug, categorySlug, sectionSlug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // --- State Management ---
    const [section, setSection] = useState(null);
    const [topic, setTopic] = useState(null);
    const [category, setCategory] = useState(null);
    const [allSections, setAllSections] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [progressMap, setProgressMap] = useState({});

    // Content State
    const [activeTab, setActiveTab] = useState('learn');
    const [contentLoading, setContentLoading] = useState(false);
    const [aiContent, setAiContent] = useState('');
    const [problemContent, setProblemContent] = useState('');
    const [editorCode, setEditorCode] = useState('// Write your solution here...');
    const [testCases, setTestCases] = useState(null);
    const [testCasesLoading, setTestCasesLoading] = useState(false);

    // UI State
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    // Language State
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [targetLanguage, setTargetLanguage] = useState(null);

    // AI Modal State
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiModalType, setAiModalType] = useState('');
    const [aiModalResponse, setAiModalResponse] = useState('');
    const [aiModalLoading, setAiModalLoading] = useState(false);

    // --- Hooks & Effects ---

    const topicColor = useMemo(() => getTopicColor(topicSlug, isDark), [topicSlug, isDark]);

    // Data Fetching
    const {
        data: sectionData,
        isLoading: sectionLoading,
        isFetching
    } = useSectionAggregate(topicSlug, sectionSlug);

    useActivityTracking(topicSlug, { categorySlug, sectionSlug });

    useEffect(() => {
        setLoading(sectionLoading && !sectionData);
    }, [sectionLoading, sectionData]);

    useEffect(() => {
        if (sectionData && sectionData.section?.slug === sectionSlug) {
            applyAggregateData(sectionData);
            trackTopicStart(topicSlug);
        }
    }, [sectionData, topicSlug, sectionSlug]);

    useEffect(() => {
        // Reset ephemeral content on navigation
        setAiContent('');
        setProblemContent('');
        setTestCases(null);
        setSelectedLanguage('javascript');
        setActiveTab('learn'); // Reset to learn tab by default unless overwritten by Blind 75 logic
    }, [topicSlug, sectionSlug]);

    // --- Logic Helpers ---

    const applyAggregateData = async (data) => {
        const { section: sec, topic: top, category: cat, siblingSections, allTopicSections, userProgress } = data;

        setSection(sec);
        setTopic(top);
        setCategory(cat);
        const allSecs = allTopicSections || siblingSections || [];
        setAllSections(allSecs);

        // Progress & Bookmarks
        setBookmarked(isBookmarked(sec._id));
        if (data.progress) setProgressMap(data.progress);
        else setProgressMap(prev => ({ ...prev, [sec.slug]: userProgress?.completed || false }));

        const isBlind75 = cat?.group?.startsWith('Blind 75');

        // Setup Editor Code
        if (sec) {
            if (isBlind75) {
                // Initialize with JS boilerplate
                setEditorCode(getBoilerplateCode(sec.title, 'javascript'));
                setActiveTab('practice');
            } else {
                setEditorCode(`// Practice ${sec.title}\n\n// Write your solution here...`);
            }
        }

        // Generate Content
        const promises = [];
        if (isBlind75) {
            promises.push(generateTestCases(sec));
            promises.push(generateProblemContent(sec));
        } else {
            promises.push(generateAIContent(sec, cat, 'javascript'));
        }

        await Promise.all(promises);

        const idx = allSecs.findIndex(s => s.slug === sectionSlug);
        setCurrentIndex(idx);
    };

    const getBoilerplateCode = (title, lang) => {
        const problemName = title.toLowerCase();
        const funcName = title.replace(/\s+/g, '');
        // Simplified boilerplate logic
        if (lang === 'python') return `def ${title.toLowerCase().replace(/\s+/g, '_')}(args):\n    print("Input:", args)\n    return None`;
        return `function ${funcName}(args) {\n  console.log("Input:", args);\n  return null;\n}`;
    };

    // --- Content Generation Actions ---

    const generateProblemContent = async (sec) => {
        startTransition(() => setContentLoading(true));
        try {
            const prompt = `You are writing ONLY the problem description for problem "${sec.title}". Include problem statement, inputs/outputs, constraints. NO SOLUTIONS.`;
            const response = await aiAPI.explainTopic(topicSlug, sec.title, prompt);
            setProblemContent(response.data.explanation);
        } catch (err) {
            setProblemContent('Failed to load problem.');
        } finally {
            setContentLoading(false);
        }
    };

    const generateAIContent = async (sec, cat, lang = 'javascript') => {
        startTransition(() => setContentLoading(true));
        try {
            const context = `${cat?.group ? `Group: ${cat.group}. ` : ''}${cat ? `Category: ${cat.name}. ` : ''}${sec.description || ''}`;
            const response = await aiAPI.explainTopic(topic?.name || topicSlug, sec.title, context, lang);
            setAiContent(response.data.explanation);
        } catch (err) {
            setAiContent('Failed to generate content.');
        } finally {
            setContentLoading(false);
        }
    };

    const generateTestCases = async (sec) => {
        setTestCasesLoading(true);
        try {
            const response = await testCaseAPI.generateTestCases(sec.title, sec.description || '', '');
            setTestCases(response.data.testCases);
        } catch (err) {
            setTestCases({ sampleCases: [], hiddenCases: [] });
        } finally {
            setTestCasesLoading(false);
        }
    };

    // --- User Actions ---

    const handleLanguageSelect = async (newLang) => {
        if (newLang === selectedLanguage) return;

        setTargetLanguage(newLang);
        startTransition(() => setContentLoading(true));

        try {
            // If Practice Mode, just switch boilerplate
            if (activeTab === 'practice' && category?.group?.startsWith('Blind 75')) {
                setEditorCode(getBoilerplateCode(section.title, newLang));
                setSelectedLanguage(newLang);
                toast.success(`Switched to ${newLang}`);
                setContentLoading(false);
                setTargetLanguage(null);
                return;
            }

            // If Learn Mode, translate content
            // Assuming simple refetch for now as complex regex was in original
            // A full implementation would call the translate endpoint
            await generateAIContent(section, category, newLang);
            setSelectedLanguage(newLang);
        } catch (err) {
            toast.error("Failed to translate");
        } finally {
            setContentLoading(false);
            setTargetLanguage(null);
        }
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

    const handleAiHelp = async (type, code) => {
        setAiModalType(type);
        setAiModalOpen(true);
        setAiModalLoading(true);
        try {
            const res = await aiAPI.analyzeCode(code, type === 'explain' ? 'review' : type, selectedLanguage);
            setAiModalResponse(res.data.analysis);
        } catch (err) {
            setAiModalResponse('Failed to analyze.');
        } finally {
            setAiModalLoading(false);
        }
    };

    const handleToggleComplete = async () => {
        try {
            // Optimistic update
            const newStatus = !progressMap[sectionSlug];
            setProgressMap(prev => ({ ...prev, [sectionSlug]: newStatus }));

            // Trigger confetti if completing
            if (newStatus) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }

            // Call API
            await progressAPI.toggleProgress(topicSlug, sectionSlug, newStatus);
            toast.success(newStatus ? "Marked as complete!" : "Marked as incomplete");

        } catch (err) {
            // Revert on error
            setProgressMap(prev => ({ ...prev, [sectionSlug]: !prev[sectionSlug] }));
            toast.error("Failed to update progress");
        }
    };

    // --- Render ---

    if (loading) return <GlobalLoader fullScreen />;
    if (!section) return <Typography sx={{ p: 4 }}>Section not found</Typography>;

    const showLanguageSwitcher = ['algorithms', 'data-structures', 'dsa', 'blind-75', 'leetcode'].some(t =>
        topicSlug.toLowerCase().includes(t) || category?.group?.toLowerCase().includes(t)
    );

    return (
        <AuroraBackground color={topicColor}>
            <Box sx={{
                minHeight: '100vh',
                pt: { xs: 10, md: 12 },
                pb: 8,
                px: { xs: 2, md: 4 }
            }}>
                <SectionHeader
                    topicSlug={topicSlug}
                    categorySlug={categorySlug}
                    categoryName={category?.name}
                    topicColor={topicColor}
                    isDark={isDark}
                    sectionTitle={section.title}

                    showLanguageSwitcher={showLanguageSwitcher}
                    selectedLanguage={selectedLanguage}
                    onLanguageSelect={handleLanguageSelect}

                    bookmarked={bookmarked}
                    onToggleBookmark={handleToggleBookmark}

                    isCompleted={progressMap[sectionSlug] || false}
                    onToggleComplete={handleToggleComplete}

                    onOpenQuiz={() => setIsQuizOpen(true)}
                    onMobileToggle={() => setMobileOpen(true)}
                />

                <SectionContent
                    activeTab={activeTab}
                    onChangeTab={setActiveTab}

                    section={section}
                    aiContent={aiContent}
                    problemContent={problemContent}
                    testCases={testCases}

                    editorCode={editorCode}
                    onCodeChange={setEditorCode}

                    contentLoading={contentLoading}
                    testCasesLoading={testCasesLoading}

                    onAiHelp={(type) => handleAiHelp(type, editorCode)}

                    topicColor={topicColor}
                    isDark={isDark}
                />

                <CopilotWidget
                    onAiAction={(type) => handleAiHelp(type, editorCode)}
                    isDark={isDark}
                    topicName={topic?.name || topicSlug}
                />

                <SectionNavigation
                    mobileOpen={mobileOpen}
                    onMobileClose={() => setMobileOpen(false)}
                    sections={allSections}
                    currentIndex={currentIndex}
                    topicSlug={topicSlug}
                    categorySlug={categorySlug}
                    topicColor={topicColor}
                    isDark={isDark}
                    progressMap={progressMap}
                />

                <QuizModal
                    open={isQuizOpen}
                    onClose={() => setIsQuizOpen(false)}
                    topic={topicSlug}
                    section={section.title}
                    isDark={isDark}
                    language={selectedLanguage}
                    content={activeTab === 'learn' ? aiContent : (section.description || section.content)}
                />

                <AIOutputModal
                    open={aiModalOpen}
                    onClose={() => setAiModalOpen(false)}
                    title={aiModalType === 'debug' ? 'Debug Analysis' : 'Code Review'}
                    content={aiModalResponse}
                    isLoading={aiModalLoading}
                />
            </Box>
        </AuroraBackground>
    );
};

export default SectionPage;
