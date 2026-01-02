import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../../services/api';
import ReactMarkdown from 'react-markdown';
import './AIChat.css';

const AIChat = React.forwardRef(({ topic, section, user, context = {}, codeContext = null, experienceLevel = 'advanced', onClose }, ref) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null); // Fixed: Added missing ref

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
        sendMessage: (text) => {
            setInput(text);
            handleSend(text);
        }
    }));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (manualInput = null) => {
        const textToSend = manualInput || input;
        if (!textToSend.trim() || isLoading) return;

        const newMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setIsLoading(true);
        setLoadingMessage('Thinking...');

        try {
            // Include code context if available (for logic help)
            const fullContext = {
                ...context,
                currentCode: codeContext?.code || '',
                sectionTitle: section,
                topicSlug: topic
            };

            const response = await aiAPI.askQuestion(
                textToSend,
                fullContext,
                'javascript', // Default, or pass from props if needed
                experienceLevel
            );

            const aiResponse = response.data.answer || response.data.explanation || "I couldn't generate a response.";

            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        } catch (error) {
            console.error('AI Chat Error:', error);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const updateEditorWithCode = (content) => {
        // Extract code block if present
        const codeBlockRegex = /```\w*\n([\s\S]*?)```/;
        const match = content.match(codeBlockRegex);

        if (match && match[1] && codeContext?.setCode) {
            codeContext.setCode(match[1]);
        } else if (codeContext?.setCode) {
            // If no block, try setting content directly (though risky if explanation included)
            // Better to only update if code block found, or ask user? 
            // For now, if no block, maybe just ignore or try to clean it?
            // Let's assume content IS the code if no blocks, or just notify user.
            // But usually AI returns markdown.
            // If no match, we don't update to avoid breaking editor with text.
            console.warn("No code block found to update editor");
        }
    };

    return (
        <div className="ai-chat glass">
            <div className="chat-header">
                <div className="chat-title">
                    <div className="chat-icon">💬</div>
                    <div>
                        AI Tutor
                        <div className="chat-subtitle">{topic ? topic : 'General Help'}</div>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
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
                                {msg.role === 'user' ? (
                                    (user?.picture || user?.photoURL) ?
                                        <img src={user.picture || user.photoURL} alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        : '👤'
                                ) : '🤖'}
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
                    <div className="message ai">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span className="loading-text">{loadingMessage}</span>
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
