import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

const useVoice = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef(null);

    // Speech Recognition (English only)
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

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
    }, []);

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

    const speak = useCallback(async (text, onEndCallback = null) => {
        try {
            setIsSpeaking(true);
            
            // Call backend ElevenLabs TTS API
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tts/elevenlabs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error(`TTS failed: ${response.status}`);
            }

            const { audio } = await response.json();
            
            // Convert base64 to audio and play
            const audioBlob = new Blob(
                [Uint8Array.from(atob(audio), c => c.charCodeAt(0))],
                { type: 'audio/mpeg' }
            );
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioElement = new Audio(audioUrl);

            audioElement.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                if (onEndCallback) onEndCallback();
            };

            audioElement.onerror = (err) => {
                console.error('Audio playback error:', err);
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
            };

            await audioElement.play();

        } catch (error) {
            console.error('ElevenLabs TTS Error:', error);
            setIsSpeaking(false);
            toast.error('Voice failed');
        }
    }, []);

    const cancelSpeech = useCallback(() => {
        // ElevenLabs audio playback automatically stops on component unmount
        setIsSpeaking(false);
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
