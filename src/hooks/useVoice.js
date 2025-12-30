import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

const useVoice = (langCode = 'en-US') => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef(null);

    // Re-initialize recognition when language changes
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = langCode; // Dynamic language

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };
            recognitionRef.current.onerror = (event) => {
                console.error('Speech error', event.error);
                setIsListening(false);
            };
            recognitionRef.current.onend = () => setIsListening(false);
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [langCode]);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                setTranscript('');
                recognitionRef.current.start();
            } catch (e) {
                console.error("Restarting recognition", e);
                recognitionRef.current.stop();
                setTimeout(() => recognitionRef.current.start(), 200);
            }
        } else {
            toast.error('Voice not supported');
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) recognitionRef.current.stop();
    }, []);

    const speak = useCallback((text, onEndCallback = null) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        // Voice Selection logic...
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = 
            voices.find(v => v.lang === langCode && v.name.includes('Google')) ||
            voices.find(v => v.lang === langCode) ||
            voices.find(v => v.lang.startsWith(langCode.split('-')[0]));

        // Better chunking: Split on natural phrase boundaries
        const chunks = text.match(/[^.?!,;:|]+[.?!,;:|]?/g) || [text]; 
        let chunkIndex = 0;

        const speakNextChunk = () => {
            if (chunkIndex >= chunks.length) {
                setIsSpeaking(false);
                if (onEndCallback) onEndCallback();
                return;
            }

            const chunkText = chunks[chunkIndex].trim();
            if (!chunkText) {
                chunkIndex++;
                speakNextChunk();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(chunkText);
            utterance.lang = langCode;
            if (preferredVoice) utterance.voice = preferredVoice;
            
            // Human-like dynamic rate variation (subtle randomness)
            // Slow down slightly for longer/complex chunks, speed up for short ones
            const wordCount = chunkText.split(' ').length;
            const baseRate = wordCount > 8 ? 0.92 : 0.98; // Slow down for longer phrases
            const randomVariation = (Math.random() * 0.08) - 0.04; // ±0.04
            utterance.rate = Math.max(0.85, Math.min(1.05, baseRate + randomVariation));
            
            // Slight pitch variation for naturalness
            utterance.pitch = 0.98 + (Math.random() * 0.08); // 0.98-1.06

            // Enhanced breathing pauses
            const isSentenceEnd = ['.', '!', '?', '|'].some(char => chunkText.endsWith(char));
            const isLongPause = [';', ':'].some(char => chunkText.endsWith(char));
            
            let pauseDuration;
            if (isSentenceEnd) {
                pauseDuration = 900 + Math.random() * 200; // 900-1100ms (natural "breath")
            } else if (isLongPause) {
                pauseDuration = 600 + Math.random() * 100; // 600-700ms (thinking pause)
            } else {
                pauseDuration = 350 + Math.random() * 100; // 350-450ms (comma pause)
            }

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => {
                chunkIndex++;
                setTimeout(speakNextChunk, pauseDuration);
            };
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        };

        speakNextChunk();
    }, [langCode]);

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
