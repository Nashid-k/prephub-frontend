import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Translate, Stop } from '@mui/icons-material';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import useVoice from '../hooks/useVoice';
import { aiAPI } from '../services/api';
import './VoiceWidget.css';

const LANGUAGES = [
    { code: 'en-US', label: 'English', name: 'English' },
    { code: 'hi-IN', label: 'Hindi (हिंदी)', name: 'Hindi' },
    { code: 'ta-IN', label: 'Tamil (தமிழ்)', name: 'Tamil' },
    { code: 'ml-IN', label: 'Malayalam (മലയാളം)', name: 'Malayalam' }
];

const VoiceWidget = ({ context, onAiResponse }) => {
    const [lang, setLang] = useState(LANGUAGES[0]);
    const { isListening, transcript, startListening, stopListening, speak, isSpeaking, cancelSpeech } = useVoice(lang.code);
    const [isProcessing, setIsProcessing] = useState(false);
    const [silenceTimer, setSilenceTimer] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    // Auto-stop listening logic
    useEffect(() => {
        if (isListening && transcript) {
            if (silenceTimer) clearTimeout(silenceTimer);
            const timer = setTimeout(() => {
                stopListening();
                handleVoiceSubmit(transcript);
            }, 2500);
            setSilenceTimer(timer);
        }
        return () => {
            if (silenceTimer) clearTimeout(silenceTimer);
        };
    }, [transcript, isListening]);

    // ═══════════════════════════════════════════════════
    // BREATHING AI: Inject verbal fillers for naturalness
    // ═══════════════════════════════════════════════════
    const humanizeText = (text, language) => {
        // Language-specific fillers
        const fillers = {
            'en-US': ['um', 'uh', 'well', 'so', 'you know', 'like'],
            'hi-IN': ['उम्म', 'आह', 'तो', 'देखो'],
            'ta-IN': ['உம்', 'அப்படி', 'சரி'],
            'ml-IN': ['ഉം', 'അത്', 'ശരി']
        };

        const langFillers = fillers[language] || fillers['en-US'];

        // Split into sentences
        let sentences = text.match(/[^.!?]+[.!?]*/g) || [text];

        // Inject fillers strategically (15% chance per sentence)
        sentences = sentences.map((sentence, idx) => {
            // Skip first sentence (AI starts confidently)
            if (idx === 0) return sentence;

            // 15% chance to add a filler at sentence start
            if (Math.random() < 0.15) {
                const filler = langFillers[Math.floor(Math.random() * langFillers.length)];
                return `${filler}... ${sentence.trim()}`;
            }
            return sentence;
        });

        return sentences.join(' ');
    };

    const handleVoiceSubmit = async (text) => {
        if (!text.trim()) return;

        setIsProcessing(true);
        try {
            const aiContext = {
                ...context,
                mode: 'voice_tutor'
            };

            const prompt = `[VOICE_MODE] User said (in ${lang.name}): "${text}". 
            Reply conversationally in ${lang.name} language only. 
            Keep it concise (under 2 sentences) and simple. Do not use code blocks.`;

            const res = await aiAPI.askQuestion(prompt, aiContext);
            const answer = res.data.answer || res.data;

            // Apply "Breathing AI" humanization
            const humanizedAnswer = humanizeText(answer, lang.code);

            // Speak the answer, then restart listening (Continuous Mode)
            speak(humanizedAnswer, () => {
                // Short delay to avoid picking up system audio if echo cancellation is poor
                setTimeout(() => {
                    startListening();
                }, 500);
            });
            if (onAiResponse) onAiResponse(text, answer);

        } catch (error) {
            console.error("Voice AI Error:", error);
            speak("Sorry, technical error.");
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleVoice = () => {
        if (isSpeaking) {
            cancelSpeech();
            stopListening(); // Ensure loop is broken
            return;
        }

        if (isListening) {
            stopListening();
            // Manual stop = intent to submit (or just silence)
            // But usually user clicks stop to abort. Let's send if text exists.
            if (transcript) handleVoiceSubmit(transcript);
        } else {
            startListening();
        }
    };

    return (
        <Box className="voice-widget-container">
            <div className={`voice-status ${isListening || isSpeaking || isProcessing ? 'visible' : ''}`}>
                {isListening ? (transcript ? 'Listening...' : `Speak ${lang.name}...`) :
                    isProcessing ? 'Thinking...' :
                        isSpeaking ? 'Speaking...' : ''}
            </div>

            {/* Language Selector */}
            <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ bgcolor: 'rgba(0,0,0,0.4)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' }, mb: 1, width: 32, height: 32 }}
            >
                <Translate fontSize="small" />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: { bgcolor: 'rgba(20,20,30,0.95)', color: 'white', backdropFilter: 'blur(10px)' } }}
            >
                {LANGUAGES.map((l) => (
                    <MenuItem
                        key={l.code}
                        onClick={() => { setLang(l); setAnchorEl(null); }}
                        selected={lang.code === l.code}
                        sx={{ fontSize: '0.85rem' }}
                    >
                        {l.label}
                    </MenuItem>
                ))}
            </Menu>

            <button
                className={`voice-btn ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
                onClick={toggleVoice}
                aria-label="Voice Assistant"
            >
                {isSpeaking ? <Stop /> : isListening ? <MicOff /> : <Mic />}
            </button>
        </Box>
    );
};

export default VoiceWidget;
