import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

const useVoice = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Stop after one sentence/command for now
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                if (event.error === 'not-allowed') {
                    toast.error('Microphone access denied');
                }
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        } else {
            console.warn('Browser does not support Speech Recognition');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                setTranscript('');
                recognitionRef.current.start();
            } catch (e) {
                console.error("Already started", e);
            }
        } else {
            toast.error('Voice not supported in this browser');
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const speak = useCallback((text) => {
        if (!window.speechSynthesis) return;
        
        // Stop any current speech
        window.speechSynthesis.cancel();

        // 1. Voice Selection Strategy: Hunt for "best" voices
        const voices = window.speechSynthesis.getVoices();
        // Priority: Google US English -> Microsoft -> Samantha -> Default
        const preferredVoice = voices.find(v => v.name.includes('Google US English')) || 
                               voices.find(v => v.name.includes('Google')) ||
                               voices.find(v => v.name.includes('Microsoft David')) ||
                               voices.find(v => v.name.includes('Natural')) ||
                               voices[0];

        // 2. "Humanizer": Split text into chunks for "breath" pauses
        // Split by punctuation (. ? ! ,) but keep the delimiter
        const chunks = text.match(/[^.?!,]+[.?!,]?/g) || [text];

        let chunkIndex = 0;

        const speakNextChunk = () => {
            if (chunkIndex >= chunks.length) {
                setIsSpeaking(false);
                return;
            }

            const chunkText = chunks[chunkIndex].trim();
            if (!chunkText) {
                chunkIndex++;
                speakNextChunk();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(chunkText);
            
            if (preferredVoice) utterance.voice = preferredVoice;
            
            // 3. Dynamic Prosody: Vary pitch/rate slightly for realism
            utterance.rate = 1.0; 
            utterance.pitch = 1.0; 

            // Add slight "breath" pause after commas/sentences
            const isSentenceEnd = ['.', '!', '?'].some(char => chunkText.endsWith(char));
            const pauseDuration = isSentenceEnd ? 600 : 300; // Longer pause for full stops

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                chunkIndex++;
                setTimeout(speakNextChunk, pauseDuration); // "Breath" pause
            };
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        };

        speakNextChunk();

    }, []);

    const cancelSpeech = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        speak,
        cancelSpeech,
        isSpeaking
    };
};

export default useVoice;
