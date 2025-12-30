import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { compilerAPI } from '../services/api';
import { Box, Button, Select, MenuItem, Typography, IconButton, Tooltip, CircularProgress, Chip, Stack } from '@mui/material';
import { PlayArrow, CheckCircle, BugReport, Lightbulb, AutoFixHigh, ExpandMore, Code as CodeIcon } from '@mui/icons-material';
import { trackCodeExecution } from '../services/analytics';
import './CodeEditor.css';

const CodeEditor = ({
    defaultLanguage = 'javascript',
    code,
    onCodeChange,
    testCases = null,
    problemTitle = '',
    onAiHelp,
    externalOutput
}) => {
    const [language, setLanguage] = useState(defaultLanguage);
    const [testResults, setTestResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' }
    ];

    const wrapCodeWithTests = (userCode, cases) => {
        if (!cases || cases.length === 0) return userCode;

        // Extract function name from user code
        const functionMatch = userCode.match(/function\s+(\w+)\s*\(/);
        if (!functionMatch) return userCode;

        const functionName = functionMatch[1];

        let wrappedCode = userCode + '\n\n';
        wrappedCode += '// Test execution wrapper\n';
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

    // Resize Handlers
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

        if (testResults.type === 'output') {
            return (
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                    {testResults.output}
                </Box>
            );
        }

        const { type, results } = testResults;
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
                    {Array.isArray(results) && results.map((result, index) => (
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
        <Box className="code-editor glass" ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '600px', borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            {/* Toolbar */}
            <Box sx={{
                p: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'rgba(255,255,255,0.03)',
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
                        onChange={(e) => setLanguage(e.target.value)}
                        size="small"
                        sx={{
                            minWidth: 120,
                            borderRadius: '12px',
                            '& .MuiSelect-select': { py: 0.75, fontSize: '0.875rem' }
                        }}
                    >
                        {languages.map(lang => (
                            <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                        ))}
                    </Select>

                    {/* AI Tools */}
                    {onAiHelp && (
                        <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Explain Code">
                                <IconButton size="small" onClick={() => onAiHelp('explain')} sx={{ color: 'var(--primary)', bgcolor: 'rgba(10, 132, 255, 0.1)' }}>
                                    <Lightbulb fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Debug Code">
                                <IconButton size="small" onClick={() => onAiHelp('debug')} sx={{ color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                                    <BugReport fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Optimize/Fix">
                                <IconButton size="small" onClick={() => onAiHelp('optimize')} sx={{ color: '#8b5cf6', bgcolor: 'rgba(139, 92, 246, 0.1)' }}>
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
                        startIcon={isRunning ? <CircularProgress size={16} /> : <PlayArrow />}
                        sx={{
                            borderRadius: '9999px',
                            textTransform: 'none',
                            boxShadow: 'none',
                            px: 3
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
                            startIcon={isSubmitting ? <CircularProgress size={16} /> : <CheckCircle />}
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

            {/* Editor Area */}
            <Box className="editor-content" sx={{ height: `${editorHeightPercent}%`, position: 'relative' }}>
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(value) => onCodeChange(value || '')}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: true,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16 }
                    }}
                />
            </Box>

            {/* Resize Handle */}
            <Box
                className={`resize-handle ${isDragging ? 'dragging' : ''}`}
                onMouseDown={startResize}
                sx={{
                    height: '8px',
                    cursor: 'ns-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.paper',
                    borderTop: '1px solid',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                }}
            >
                <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'text.disabled' }} />
            </Box>

            {/* Output Area */}
            <Box className="editor-output" sx={{ height: `${100 - editorHeightPercent}%`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ p: 1, px: 2, borderBottom: '1px solid', borderColor: 'divider', fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary', bgcolor: 'rgba(255,255,255,0.02)' }}>
                    Console / Test Results
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                    {error && (
                        <Box sx={{ color: 'error.main', fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                            {error}
                        </Box>
                    )}
                    {renderTestResults()}
                    {!testResults && !error && !isRunning && !isSubmitting && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.disabled', gap: 1 }}>
                            <CodeIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                            <Typography variant="body2">Run code to see output</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default CodeEditor;
