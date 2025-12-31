import React, { useState } from 'react';
import { Box } from '@mui/material';
import CodeEditor from '../components/CodeEditor';
import './CompilerPage.css';

const CompilerPage = () => {
    const [code, setCode] = useState(`// Welcome to the Interactive Compiler
// Write your code here and click Run to execute

function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));
`);

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
                    />
                </Box>
            </div>
        </div>
    );
};

export default CompilerPage;
