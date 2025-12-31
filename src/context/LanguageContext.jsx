import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
    { value: 'javascript', label: 'JavaScript', icon: '📜', extension: 'js' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷', extension: 'ts' },
    { value: 'python', label: 'Python', icon: '🐍', extension: 'py' },
    { value: 'java', label: 'Java', icon: '☕', extension: 'java' },
    { value: 'cpp', label: 'C++', icon: '⚙️', extension: 'cpp' },
    { value: 'c', label: 'C', icon: '🔤', extension: 'c' },
    { value: 'csharp', label: 'C#', icon: '🔷', extension: 'cs' },
    { value: 'go', label: 'Go', icon: '🐹', extension: 'go' },
    { value: 'dart', label: 'Dart', icon: '🎯', extension: 'dart' },
    { value: 'rust', label: 'Rust', icon: '🦀', extension: 'rs' },
    { value: 'kotlin', label: 'Kotlin', icon: '🟣', extension: 'kt' }
];

export const LanguageProvider = ({ children }) => {
    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        // Load from localStorage or default to JavaScript
        const saved = localStorage.getItem('prephub_preferred_language');
        return saved || 'javascript';
    });

    useEffect(() => {
        // Save to localStorage whenever language changes
        localStorage.setItem('prephub_preferred_language', selectedLanguage);
    }, [selectedLanguage]);

    const getLanguageConfig = (langValue) => {
        return SUPPORTED_LANGUAGES.find(lang => lang.value === langValue) || SUPPORTED_LANGUAGES[0];
    };

    const value = {
        selectedLanguage,
        setSelectedLanguage,
        languageConfig: getLanguageConfig(selectedLanguage),
        supportedLanguages: SUPPORTED_LANGUAGES,
        getLanguageConfig
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
