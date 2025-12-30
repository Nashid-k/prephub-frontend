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

        // Voice Selection: Prioritize "Enhanced" or "Premium" voices
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = 
            voices.find(v => v.lang === langCode && (v.name.includes('Premium') || v.name.includes('Enhanced'))) ||
            voices.find(v => v.lang === langCode && v.name.includes('Google')) ||
            voices.find(v => v.lang === langCode && !v.localService) || // Prefer cloud voices
            voices.find(v => v.lang === langCode) ||
            voices.find(v => v.lang.startsWith(langCode.split('-')[0]));

        // Intelligent chunking: Respect natural phrase boundaries
        const chunks = text.match(/[^.?!,;:|—–-]+[.?!,;:|—–-]?/g) || [text]; 
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
            
            // ═══════════════════════════════════════════════════
            // ADVANCED HUMANIZATION LAYER
            // ═══════════════════════════════════════════════════
            
            const wordCount = chunkText.split(' ').length;
            const hasQuestion = chunkText.includes('?');
            const hasExclamation = chunkText.includes('!');
            const isLongPhrase = wordCount > 10;
            
            // 1. EMOTIONAL PROSODY: Adjust based on punctuation
            if (hasQuestion) {
                // Questions: Higher pitch, slightly faster
                utterance.pitch = 1.08 + (Math.random() * 0.06); // 1.08-1.14
                utterance.rate = 1.02 + (Math.random() * 0.06);  // 1.02-1.08
            } else if (hasExclamation) {
                // Excitement: Moderate pitch, faster rate
                utterance.pitch = 1.05 + (Math.random() * 0.08); // 1.05-1.13
                utterance.rate = 1.05 + (Math.random() * 0.1);   // 1.05-1.15
            } else {
                // 2. DYNAMIC RATE: Slow down for complex/long phrases
                let baseRate;
                if (isLongPhrase) {
                    baseRate = 0.88; // Thoughtful, deliberate
                } else if (wordCount > 5) {
                    baseRate = 0.93; // Moderate
                } else {
                    baseRate = 0.97; // Quick, casual
                }
                
                // Add micro-variations to avoid robotic uniformity
                const rateJitter = (Math.random() * 0.12) - 0.06; // ±0.06
                utterance.rate = Math.max(0.82, Math.min(1.1, baseRate + rateJitter));
                
                // 3. PITCH VARIATION: Subtle changes for naturalness
                const pitchJitter = (Math.random() * 0.10) - 0.05; // ±0.05
                utterance.pitch = Math.max(0.95, Math.min(1.08, 1.0 + pitchJitter));
            }
            
            // 4. BREATHING PAUSES: Context-aware silence durations
            let pauseDuration;
            const lastChar = chunkText.slice(-1);
            
            if (['.', '!', '?'].includes(lastChar)) {
                // Sentence end: Deep breath (like a human finishing a thought)
                pauseDuration = 1000 + (Math.random() * 300); // 1000-1300ms
            } else if ([';', ':', '—', '–'].includes(lastChar)) {
                // Clause separator: Thinking pause
                pauseDuration = 700 + (Math.random() * 150); // 700-850ms
            } else if (lastChar === ',') {
                // Comma: Quick breath
                pauseDuration = 400 + (Math.random() * 150); // 400-550ms
            } else {
                // No punctuation: Minimal pause (phrase continuation)
                pauseDuration = 250 + (Math.random() * 100); // 250-350ms
            }
            
            // 5. LONG PHRASE BONUS PAUSE: Add extra "thinking time"
            if (isLongPhrase && ['.', '!', '?'].includes(lastChar)) {
                pauseDuration += 200; // Extra breath for complex sentences
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
