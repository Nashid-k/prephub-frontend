import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { compilerAPI } from '../services/api';
import { Box, Button, Select, MenuItem, Typography, IconButton, Tooltip, CircularProgress, Chip, Stack } from '@mui/material';
import { PlayArrow, CheckCircle, BugReport, Lightbulb, AutoFixHigh, ExpandMore, Code as CodeIcon } from '@mui/icons-material';
import { trackCodeExecution } from '../services/analytics';
import { useLanguage } from '../context/LanguageContext';
import './CodeEditor.css';

const Editor = lazy(() => import('@monaco-editor/react'));

const CodeEditor = ({
    defaultLanguage = null,
    code,
    onCodeChange,
    testCases = null,
    problemTitle = '',
    onAiHelp,
    externalOutput
}) => {
    const { selectedLanguage: globalLanguage, setSelectedLanguage } = useLanguage();
    const [language, setLanguage] = useState(defaultLanguage || globalLanguage);
    const [testResults, setTestResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const editorRef = useRef(null);

    useEffect(() => {
        if (!defaultLanguage) {
            setLanguage(globalLanguage);
        }
    }, [globalLanguage, defaultLanguage]);

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        if (!defaultLanguage) {
            setSelectedLanguage(newLang);
        }
    };

    useEffect(() => {
        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
                editorRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (externalOutput) {
            setTestResults(externalOutput);
        }
    }, [externalOutput]);
    const [error, setError] = useState('');
    const [editorHeightPercent, setEditorHeightPercent] = useState(70);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const languages = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'c', label: 'C' },
        { value: 'csharp', label: 'C#' },
        { value: 'go', label: 'Go' },
        { value: 'dart', label: 'Dart' },
        { value: 'rust', label: 'Rust' },
        { value: 'kotlin', label: 'Kotlin' }
    ];

    const wrapCodeWithTests = (userCode, cases) => {
        if (!cases || cases.length === 0) return userCode;

        const functionMatch = userCode.match(/function\s+(\w+)\s*\(/);
        if (!functionMatch) return userCode;

        const functionName = functionMatch[1];

        let wrappedCode = userCode + '\n\n';
        wrappedCode += 'const __testResults = [];\n';

        cases.forEach((testCase, index) => {
            const inputParams = Object.values(testCase.input).map(v => JSON.stringify(v)).join(', ');
            wrappedCode += `try {\n`;
            wrappedCode += `  const result = ${functionName}(${inputParams});\n`;
            wrappedCode += `  const passed = JSON.stringify(result) === JSON.stringify(${JSON.stringify(testCase.expected)});\n`;
            wrappedCode += `  __testResults.push({ passed, input: ${JSON.stringify(testCase.input)}, expected: ${JSON.stringify(testCase.expected)}, got: result, description: "${testCase.description || ''}" });\n`;
            wrappedCode += `} catch (e) {\n`;
            wrappedCode += `  __testResults.push({ passed: false, error: e.message, input: ${JSON.stringify(testCase.input)} });\n`;
            wrappedCode += `}\n`;
        });

        wrappedCode += 'console.log(JSON.stringify(__testResults));\n';
        return wrappedCode;
    };

    const handleRun = async () => {
        setIsRunning(true);
        setTestResults(null);
        setError('');

        try {
            if (!testCases || !testCases.sampleCases) {
                const response = await compilerAPI.executeCode(language, code);
                if (response.data.success) {
                    setTestResults({
                        type: 'output',
                        output: response.data.output || 'Program executed successfully (no output)'
                    });
                    trackCodeExecution(language);
                } else {
                    setError(response.data.error || 'Execution failed');
                }
                return;
            }

            const wrappedCode = wrapCodeWithTests(code, testCases.sampleCases);
            const response = await compilerAPI.executeCode(language, wrappedCode);

            if (response.data.success) {
                try {
                    const results = JSON.parse(response.data.output.trim());
                    setTestResults({ type: 'run', results });
                    trackCodeExecution(language);
                } catch (e) {
                    setError(`Failed to parse test results. Raw output: ${response.data.output}`);
                }
            } else {
                setError(response.data.error || 'Execution failed');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to execute code');
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!testCases || !testCases.hiddenCases) {
            setError('No test cases available for submission');
            return;
        }

        setIsSubmitting(true);
        setTestResults(null);
        setError('');

        try {
            const allCases = [...testCases.sampleCases, ...testCases.hiddenCases];
            const wrappedCode = wrapCodeWithTests(code, allCases);
            const response = await compilerAPI.executeCode(language, wrappedCode);

            if (response.data.success) {
                try {
                    const results = JSON.parse(response.data.output.trim());
                    setTestResults({ type: 'submit', results });
                } catch (e) {
                    setError(`Failed to parse submission results.`);
                }
            } else {
                setError(response.data.error || 'Submission execution failed');
            }
        } catch (err) {
            setError(err.message || 'Failed to submit code');
        } finally {
            setIsSubmitting(false);
        }
    };

    const startResize = (e) => {
        setIsDragging(true);
        e.preventDefault();
    };

    const stopResize = () => {
        setIsDragging(false);
    };

    const handleResize = (e) => {
        if (!isDragging || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const newHeight = e.clientY - containerRect.top;
        const totalHeight = containerRect.height;
        let percentage = (newHeight / totalHeight) * 100;
        percentage = Math.max(20, Math.min(percentage, 80));
        setEditorHeightPercent(percentage);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleResize);
            window.addEventListener('mouseup', stopResize);
        } else {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', stopResize);
        }
        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', stopResize);
        };
    }, [isDragging]);

    const renderTestResults = () => {
        if (!testResults) return null;

        if (testResults.type === 'loading') {
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                    <CircularProgress size={30} />
                    <Typography variant="body2" color="text.secondary">{testResults.message || 'Processing...'}</Typography>
                </Box>
            );
        }

        if (testResults.type === 'error') {
            return (
                <Box sx={{ p: 2, color: 'error.main', bgcolor: 'rgba(211, 47, 47, 0.05)', borderRadius: 2, border: '1px solid', borderColor: 'error.main' }}>
                    <strong>Error:</strong> {testResults.error}
                </Box>
            );
        }

        if (testResults.type === 'ai') {
            return (
                <Box sx={{ p: 2, fontSize: '0.9rem', lineHeight: 1.6 }}>
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 600 }}>
                        <AutoFixHigh fontSize="small" /> AI Analysis
                    </Box>
                    <Box sx={{ whiteSpace: 'pre-wrap' }}>
                        {typeof testResults.results === 'string' ? testResults.results : JSON.stringify(testResults.results, null, 2)}
                    </Box>
                </Box>
            );
        }

        if (testResults.type === 'output') {
            return (
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                    {testResults.output}
                </Box>
            );
        }

        const { type, results } = testResults;

        if (!Array.isArray(results)) {
            return (
                <Box sx={{ p: 2, color: 'text.secondary' }}>
                    Output: {JSON.stringify(results)}
                </Box>
            );
        }

        const passedCount = results.filter(r => r.passed).length;
        const totalCount = results.length;
        const allPassed = passedCount === totalCount;

        return (
            <Box>
                <Box sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: allPassed ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                    border: '1px solid',
                    borderColor: allPassed ? 'success.main' : 'error.main',
                    color: allPassed ? 'success.main' : 'error.main',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    {type === 'submit' ?
                        (allPassed ? `✅ Accepted (${passedCount}/${totalCount})` : `❌ Wrong Answer (${passedCount}/${totalCount})`)
                        : `Test Results: ${passedCount}/${totalCount} passed`
                    }
                </Box>

                <Stack spacing={2}>
                    {results.map((result, index) => (
                        <Box key={index} sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: result.passed ? 'rgba(46, 125, 50, 0.3)' : 'rgba(211, 47, 47, 0.3)',
                            bgcolor: result.passed ? 'rgba(46, 125, 50, 0.05)' : 'rgba(211, 47, 47, 0.05)'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontWeight: 600, color: result.passed ? 'success.main' : 'error.main' }}>
                                <span>{result.passed ? '✓' : '✗'} Test Case {index + 1}</span>
                                {result.description && <span style={{ opacity: 0.8 }}>{result.description}</span>}
                            </Box>
                            {!result.passed && (
                                <Box sx={{ fontSize: '0.85rem', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                    <div><strong>Input:</strong> {JSON.stringify(result.input)}</div>
                                    {result.error ? (
                                        <div style={{ color: '#d32f2f' }}><strong>Error:</strong> {result.error}</div>
                                    ) : (
                                        <>
                                            <div><strong>Expected:</strong> {JSON.stringify(result.expected)}</div>
                                            <div style={{ color: '#d32f2f' }}><strong>Got:</strong> {JSON.stringify(result.got)}</div>
                                        </>
                                    )}
                                </Box>
                            )}
                        </Box>
                    ))}
                </Stack>
            </Box>
        );
    };

    return (
        <Box className="code-editor glass" ref={containerRef} sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '600px',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
            border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)'
        }}>
            <Box sx={{
                p: 1.5,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        size="small"
                        sx={{
                            minWidth: 140,
                            borderRadius: '12px',
                            fontWeight: 600,
                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                            border: 'none',
                            '& .MuiSelect-select': { py: 1, fontSize: '0.875rem' },
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }
                        }}
                    >
                        {languages.map(lang => (
                            <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                        ))}
                    </Select>

                    {onAiHelp && (
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Explain Code">
                                <IconButton size="small" onClick={() => onAiHelp('explain', code, language)} sx={{ color: 'var(--primary)', bgcolor: 'rgba(10, 132, 255, 0.1)', '&:hover': { bgcolor: 'rgba(10, 132, 255, 0.2)' } }}>
                                    <Lightbulb fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Debug Code">
                                <IconButton size="small" onClick={() => onAiHelp('debug', code, language)} sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}>
                                    <BugReport fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Optimize/Fix">
                                <IconButton size="small" onClick={() => onAiHelp('optimize', code, language)} sx={{ color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.1)', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.2)' } }}>
                                    <AutoFixHigh fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    )}
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        onClick={handleRun}
                        disabled={isRunning || isSubmitting}
                        startIcon={isRunning ? <CircularProgress size={16} color="inherit" /> : <PlayArrow />}
                        sx={{
                            borderRadius: '9999px',
                            textTransform: 'none',
                            boxShadow: 'none',
                            px: 3,
                            bgcolor: '#5e5ce6',
                            '&:hover': { bgcolor: '#4b4acb', boxShadow: 'none' }
                        }}
                    >
                        {isRunning ? 'Running' : 'Run'}
                    </Button>
                    {testCases && testCases.hiddenCases && (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleSubmit}
                            disabled={isRunning || isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                            sx={{
                                borderRadius: '9999px',
                                textTransform: 'none',
                                boxShadow: 'none',
                                px: 3
                            }}
                        >
                            {isSubmitting ? 'Submitting' : 'Submit'}
                        </Button>
                    )}
                </Stack>
            </Box>

            <Box className="editor-content" sx={{
                height: `${editorHeightPercent}%`,
                minHeight: '300px',
                position: 'relative',
                bgcolor: '#1e1e1e',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0 0 12px 12px',
                overflow: 'hidden'
            }}>
                {!isEditorReady && (
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#1e1e1e',
                        zIndex: 10
                    }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress size={40} sx={{ mb: 2 }} />
                            <Typography variant="body2" color="text.secondary">Loading Editor...</Typography>
                        </Box>
                    </Box>
                )}
                <Suspense fallback={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                }>
                    <Editor
                        height="100%"
                        language={language}
                        defaultValue={code}
                        onChange={(value) => onCodeChange(value || '')}
                        theme="prephub-dark"
                        beforeMount={(monaco) => {
                            monaco.editor.defineTheme('prephub-dark', {
                                base: 'vs-dark',
                                inherit: true,
                                rules: [],
                                colors: { 'editor.background': '#1e1e1e' }
                            });
                        }}
                        onMount={(editor, monaco) => {
                            editorRef.current = editor;
                            setIsEditorReady(true);

                            monaco.editor.defineTheme('prephub-dark', {
                                base: 'vs-dark',
                                inherit: true,
                                rules: [],
                                colors: {
                                    'editor.background': '#1e1e1e',
                                }
                            });

                            monaco.editor.setTheme('prephub-dark');
                        }}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            roundedSelection: true,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 20 },
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            wordWrap: 'on',
                            lineHeight: 24,
                            renderLineHighlight: 'none',
                            hideCursorInOverviewRuler: true,
                            overviewRulerBorder: false,
                            theme: 'prephub-dark'
                        }}
                    />
                </Suspense>
            </Box>

            <Box
                className={`resize-handle ${isDragging ? 'dragging' : ''}`}
                onMouseDown={startResize}
                sx={{
                    height: '10px',
                    cursor: 'ns-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    borderTop: '1px solid',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: 'primary.main',
                        '& > div': { bgcolor: 'white', opacity: 1 }
                    },
                    zIndex: 10
                }}
            >
                <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'text.secondary', opacity: 0.5 }} />
            </Box>

            <Box className="editor-output" sx={{
                height: `${100 - editorHeightPercent}%`,
                minHeight: '150px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1c1c1e' : '#f8fafc'
            }}>
                <Box sx={{
                    p: 1.5,
                    px: 3,
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 1
                }}>
                    Console Output
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto', p: 3, fontFamily: 'monospace' }}>
                    {error && (
                        <Box sx={{ color: '#ff4d4f', whiteSpace: 'pre-wrap', fontSize: '0.9rem', p: 2, bgcolor: 'rgba(255, 77, 79, 0.1)', borderRadius: 2 }}>
                            ✕ {error}
                        </Box>
                    )}
                    {renderTestResults()}
                    {!testResults && !error && !isRunning && !isSubmitting && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.disabled', gap: 1.5, opacity: 0.6 }}>
                            <CodeIcon sx={{ fontSize: 48 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>Ready to execute</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box >
    );
};

export default React.memo(CodeEditor);
