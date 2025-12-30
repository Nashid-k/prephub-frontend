import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import './AIChat.css';

const AIChat = React.forwardRef(({ topic, section, user, context = {}, codeContext = null }, ref) => {
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

    // Dynamic Loading Messages
    const [loadingMessage, setLoadingMessage] = useState('');

    const getLoadingMessage = (topic) => {
        const messages = {
            default: ['Thinking...', 'Analyzing...', 'Consulting the archives...', 'Formatting response...'],
            mongodb: ['Querying the database...', 'Optimizing aggregation pipeline...', 'Indexing your request...', 'Connecting to cluster...'],
            react: ['Rendering component...', 'Updating virtual DOM...', 'Running useEffect...', 'Checking dependency array...'],
            node: ['Spinning up server...', 'Handling request...', 'Resolving promise...', 'Reading stream...'],
            javascript: ['Hoisting variables...', 'Executing call stack...', 'Parsing script...', 'Checking types...']
        };

        const topicLower = (topic || '').toLowerCase();
        let key = 'default';
        if (topicLower.includes('mongo')) key = 'mongodb';
        else if (topicLower.includes('react')) key = 'react';
        else if (topicLower.includes('node') || topicLower.includes('express')) key = 'node';
        else if (topicLower.includes('script')) key = 'javascript';

        const list = messages[key];
        return list[Math.floor(Math.random() * list.length)];
    };


    const handleSend = async (manualInput = null) => {
        const textToSend = manualInput || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMessage]);
        if (!manualInput) setInput('');

        setIsLoading(true);
        setLoadingMessage(getLoadingMessage(topic)); // Set random message

        try {
            const requestContext = {
                topic,
                section,
                ...context,
                currentCode: codeContext?.code
            };

            const response = await aiAPI.askQuestion(textToSend, requestContext);

            const aiMessage = { role: 'ai', content: response.data.answer };
            setMessages(prev => [...prev, aiMessage]);

            if (codeContext && (textToSend.toLowerCase().includes('fix') || textToSend.toLowerCase().includes('code'))) {
                const codeBlockMatch = response.data.answer.match(/```(?:javascript|js|typescript|ts)?\n([\s\S]*?)```/);
                if (codeBlockMatch && codeBlockMatch[1]) {
                    // Code block logic
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
            setLoadingMessage('');
        }
    };

    // ... (rest of update modal logic)

    // ... (rest of update modal logic)

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="ai-chat glass">
            {/* ... modal ... */}

            <div className="chat-header">
                {/* ... header ... */}
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
