import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Stop } from '@mui/icons-material';
import { Box } from '@mui/material';
import useVoice from '../hooks/useVoice';
import { aiAPI } from '../services/api';
import './VoiceWidget.css';

const VoiceWidget = ({ context, onAiResponse }) => {
    const { isListening, transcript, startListening, stopListening, speak, isSpeaking, cancelSpeech } = useVoice();
    const [isProcessing, setIsProcessing] = useState(false);
    const [silenceTimer, setSilenceTimer] = useState(null);

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

    // Verbal fillers for English only
    const humanizeText = (text) => {
        const fillers = ['um', 'uh', 'well', 'so', 'you know'];
        let sentences = text.match(/[^.!?]+[.!?]*/g) || [text];

        sentences = sentences.map((sentence, idx) => {
            if (idx === 0) return sentence; // First sentence confident
            if (Math.random() < 0.15) {
                const filler = fillers[Math.floor(Math.random() * fillers.length)];
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

            const prompt = `[VOICE_MODE] User said: "${text}". 
            Reply conversationally in English. Keep it concise (under 2 sentences).
            
            You can use emotional tags: [whispers], [giggles], [sarcastically], [excited], [calm]
            Use them naturally where appropriate.`;

            const res = await aiAPI.askQuestion(prompt, aiContext);
            const answer = res.data.answer || res.data;

            const humanizedAnswer = humanizeText(answer);

            // Speak then restart listening
            speak(humanizedAnswer, () => {
                setTimeout(() => startListening(), 500);
            });

            if (onAiResponse) onAiResponse(text, answer);

        } catch (error) {
            console.error("Voice Error:", error);
            speak("Sorry, technical error.");
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleVoice = () => {
        if (isSpeaking) {
            cancelSpeech();
            stopListening();
            return;
        }

        if (isListening) {
            stopListening();
            if (transcript) handleVoiceSubmit(transcript);
        } else {
            startListening();
        }
    };

    return (
        <Box className="voice-widget-container">
            <div className={`voice-status ${isListening || isSpeaking || isProcessing ? 'visible' : ''}`}>
                {isListening ? (transcript ? 'Listening...' : 'Speak now...') :
                    isProcessing ? 'Thinking...' :
                        isSpeaking ? 'Speaking...' : ''}
            </div>

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
