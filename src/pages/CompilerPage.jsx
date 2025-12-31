import React, { useState } from 'react';
import { Box } from '@mui/material';
import CodeEditor from '../components/CodeEditor';
import AIOutputModal from '../components/AIOutputModal';
import { aiAPI } from '../services/api';
import './CompilerPage.css';

const CompilerPage = () => {
    const [code, setCode] = useState(`// Welcome to the Interactive Compiler
// Write your code here and click Run to execute

function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));
`);

    // AI Modal States
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiModalType, setAiModalType] = useState('');
    const [aiModalResponse, setAiModalResponse] = useState('');
    const [aiModalLoading, setAiModalLoading] = useState(false);

    const handleAiHelp = async (type, code, lang = 'javascript') => {
        setAiModalType(type);
        setAiModalOpen(true);
        setAiModalLoading(true);

        try {
            let prompt = '';
            switch (type) {
                case 'explain':
                    prompt = `Explain this ${lang} code concisely:

\`\`\`${lang}
${code}
\`\`\`

Provide:
1. **Purpose** (1 sentence)
2. **Key concepts** (bullet points)
3. **How it works** (brief steps)`;
                    break;
                case 'debug':
                    prompt = `Analyze this ${lang} code for bugs and issues:

\`\`\`${lang}
${code}
\`\`\`

Provide:
1. **Issues found** (list each)
2. **Why they're problems**
3. **How to fix them** (with code examples)`;
                    break;
                case 'optimize':
                    prompt = `Suggest optimizations for this ${lang} code:

\`\`\`${lang}
${code}
\`\`\`

Provide:
1. **Performance improvements**
2. **Best practices** to follow
3. **Cleaner alternatives** (with code)`;
                    break;
                default:
                    prompt = `Help me with this ${lang} code:\n\n${code}`;
            }

            const context = { topic: 'compiler', section: 'Interactive Compiler', code, problem: '' };
            const res = await aiAPI.askQuestion(prompt, context, lang);
            setAiModalResponse(res.data.answer || res.data);
            setAiModalLoading(false);
        } catch (err) {
            setAiModalResponse('Failed to get AI help. Please try again.');
            setAiModalLoading(false);
        }
    };

    return (
        <div className="compiler-page">
            <div className="compiler-container">
                <div className="compiler-header">
                    <h1 className="compiler-title">⚡ Interactive Compiler</h1>
                    <p className="compiler-subtitle">
                        Write, Run, and Debug in 40+ languages instantly.
                    </p>
                </div>

                {/* Use same structure as Practice page */}
                <Box sx={{
                    flex: 1,
                    height: '100%',
                    width: '100%',
                    overflow: 'hidden'
                }}>
                    <CodeEditor
                        code={code}
                        onCodeChange={setCode}
                        onAiHelp={handleAiHelp}
                    />
                </Box>

                {/* AI Output Modal */}
                <AIOutputModal
                    open={aiModalOpen}
                    onClose={() => setAiModalOpen(false)}
                    type={aiModalType}
                    response={aiModalResponse}
                    loading={aiModalLoading}
                />
            </div>
        </div>
    );
};

export default CompilerPage;
