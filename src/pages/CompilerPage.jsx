import React from 'react';
import CodeEditor from '../components/CodeEditor';
import './CompilerPage.css';

const CompilerPage = () => {
    return (
        <div className="compiler-page">
            <div className="compiler-container">
                <div className="compiler-header glass fade-in">
                    <h1 className="compiler-title">💻 Online Code Compiler</h1>
                    <p className="compiler-subtitle">
                        Practice coding in 40+ languages with instant execution
                    </p>
                </div>

                <div className="compiler-editor fade-in">
                    <CodeEditor />
                </div>
            </div>
        </div>
    );
};

export default CompilerPage;
