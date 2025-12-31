import React from 'react';
import CodeEditor from '../components/CodeEditor';
import './CompilerPage.css';

const CompilerPage = () => {
    return (
        <div className="compiler-page">
            <div className="compiler-container">
                <div className="compiler-header">
                    <h1 className="compiler-title">⚡ Interactive Compiler</h1>
                    <p className="compiler-subtitle">
                        Write, Run, and Debug in 40+ languages instantly.
                    </p>
                </div>

                <div className="compiler-editor-wrapper">
                    <CodeEditor />
                </div>
            </div>
        </div>
    );
};

export default CompilerPage;
