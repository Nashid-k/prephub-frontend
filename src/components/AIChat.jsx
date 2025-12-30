import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import './AIChat.css';

const AIChat = React.forwardRef(({ topic, section, context = {}, codeContext = null }, ref) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Expose sendMessage to parent
    React.useImperativeHandle(ref, () => ({
        sendMessage: (text) => {
            handleSend(text);
        }
    }));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (manualInput = null) => {
        const textToSend = manualInput || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        if (!manualInput) setInput('');
        setIsLoading(true);

        try {
            const requestContext = {
                topic,
                section,
                ...context,
                currentCode: codeContext?.code // Send current editor code if available
            };

            const response = await aiAPI.askQuestion(textToSend, requestContext);

            const aiMessage = { role: 'ai', content: response.data.answer };
            setMessages(prev => [...prev, aiMessage]);

            // Check if AI included a code block that might be a fix
            if (codeContext && (textToSend.toLowerCase().includes('fix') || textToSend.toLowerCase().includes('code'))) {
                const codeBlockMatch = response.data.answer.match(/```(?:javascript|js|typescript|ts)?\n([\s\S]*?)```/);
                if (codeBlockMatch && codeBlockMatch[1]) {
                    // Code block found logic
                }
            }

        } catch (err) {
            console.error('AI Error:', err);
            const errorMessage = {
                role: 'ai',
                content: 'Sorry, I encountered an error. Please try again.'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // State for update confirmation modal
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [pendingCode, setPendingCode] = useState(null);

    // Helper to extract code from message to update editor
    const updateEditorWithCode = (content) => {
        const codeBlockMatch = content.match(/```(?:javascript|js|typescript|ts)?\n([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1] && codeContext?.setCode) {
            setPendingCode(codeBlockMatch[1]);
            setShowUpdateModal(true);
        } else {
            console.warn('No code block found in this message.');
        }
    };

    const confirmUpdate = () => {
        if (pendingCode && codeContext?.setCode) {
            codeContext.setCode(pendingCode);
            setShowUpdateModal(false);
            setPendingCode(null);
        }
    };

    const cancelUpdate = () => {
        setShowUpdateModal(false);
        setPendingCode(null);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="ai-chat glass">
            {/* Confirmation Modal */}
            {showUpdateModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h3>Update Code Editor?</h3>
                        <p>This will replace your current code with the AI's solution. This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button onClick={cancelUpdate} className="btn btn-secondary">Cancel</button>
                            <button onClick={confirmUpdate} className="btn btn-primary">Confirm Update</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="chat-header">
                <div className="chat-title">
                    <span className="chat-icon">🤖</span>
                    <div>
                        Prephub AI
                        <span className="chat-subtitle">Assistant</span>
                    </div>
                </div>
            </div>

            <div className="chat-messages" ref={chatContainerRef}>
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <div className="chat-icon" style={{ fontSize: '3rem', width: '64px', height: '64px' }}>💬</div>
                        <div>
                            <p style={{ fontWeight: 600 }}>Hello! I'm your AI tutor.</p>
                            <p>Ask me questions about {topic || 'this topic'}, request practice problems, or get help with code!</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <div className="message-avatar">
                                {msg.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className="message-content">
                                <div className="message-bubble">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                                {msg.role === 'ai' && msg.content.includes('```') && context.activeTab === 'practice' && (
                                    <div className="update-editor-container">
                                        <button
                                            className="update-editor-btn"
                                            onClick={() => updateEditorWithCode(msg.content)}
                                        >
                                            <span>📝</span> Update Editor
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {isLoading && (
                    <div className="message ai"> {/* Matching CSS class 'ai' */}
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            <div className="message-bubble">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <div className="chat-input-wrapper" style={{ flex: 1 }}>
                    <textarea
                        className="chat-input"
                        placeholder="Ask a question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        rows={1}
                        style={{ height: 'auto', minHeight: '24px' }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? (
                            <div className="loading-dot" style={{ width: 8, height: 8, background: 'white', borderRadius: '50%' }}></div>
                        ) : (
                            // Arrow Up Icon
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default AIChat;
