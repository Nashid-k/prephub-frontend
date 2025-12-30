import React, { useEffect, useState } from 'react';
import { Mic, MicOff, VolumeUp, Stop } from '@mui/icons-material';
import { Box, Tooltip, IconButton, Fade } from '@mui/material';
import useVoice from '../hooks/useVoice';
import { aiAPI } from '../services/api';
import './VoiceWidget.css';

const VoiceWidget = ({ context, onAiResponse }) => {
    const { isListening, transcript, startListening, stopListening, speak, isSpeaking, cancelSpeech } = useVoice();
    const [isProcessing, setIsProcessing] = useState(false);
    const [silenceTimer, setSilenceTimer] = useState(null);

    // Auto-stop listening logic (simple silence-like effect)
    // In a real app we'd use more complex VAD, but here we assume if transcript updates, user is talking.
    // If transcript doesn't update for 2s while listening, we submit.

    useEffect(() => {
        if (isListening && transcript) {
            // Reset timer on new input
            if (silenceTimer) clearTimeout(silenceTimer);

            const timer = setTimeout(() => {
                stopListening(); // Stop first
                handleVoiceSubmit(transcript);
            }, 2500); // 2.5s of silence triggers submit

            setSilenceTimer(timer);
        }
        return () => {
            if (silenceTimer) clearTimeout(silenceTimer);
        };
    }, [transcript, isListening]);

    const handleVoiceSubmit = async (text) => {
        if (!text.trim()) return;

        setIsProcessing(true);
        try {
            // Context injection for AI
            const aiContext = {
                ...context, // Module, Section, etc.
                mode: 'voice_tutor' // Add a hint to AI it's a voice convo
            };

            const prompt = `[VOICE_MODE] User said: "${text}". Reply conversationally and concisely (under 2 sentences if possible, unless explaining a concept). Do not use markdown code blocks if possible, or keep them very brief.`;

            const res = await aiAPI.askQuestion(prompt, aiContext);
            const answer = res.data.answer || res.data; // Adjust based on actual API response structure

            // Speak the answer
            speak(answer);

            // Optional: Pass back to parent if we want to show it in chat potentially?
            if (onAiResponse) onAiResponse(text, answer);

        } catch (error) {
            console.error("Voice AI Error:", error);
            speak("Sorry, I had trouble understanding that.");
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleVoice = () => {
        if (isSpeaking) {
            cancelSpeech();
            return;
        }

        if (isListening) {
            stopListening();
            // If we stopped manually and have text, submit it immediately
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
