import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const SpeechContext = createContext()

// Speech Recognition setup (cross-browser)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function SpeechProvider({ children }) {
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const recognitionRef = useRef(null)

    // Initialize SpeechSynthesis on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.getVoices()
        }

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Stop after one result by default
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }
    }, [])


    const speak = useCallback((text) => {
        if (!isSpeechEnabled || !window.speechSynthesis) return

        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        window.speechSynthesis.speak(utterance)
    }, [isSpeechEnabled])

    const stop = useCallback(() => {
        if (!window.speechSynthesis) return
        window.speechSynthesis.cancel()
    }, [])

    const toggleSpeech = useCallback(() => {
        setIsSpeechEnabled((prev) => {
            const newState = !prev
            if (!newState) {
                stop()
            } else {
                const msg = new SpeechSynthesisUtterance("Voice assistant enabled");
                window.speechSynthesis.speak(msg);
            }
            return newState
        })
    }, [stop])

    const startListening = useCallback((callback) => {
        if (!recognitionRef.current) return;

        recognitionRef.current.onresult = (event) => {
            const currentTranscript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            setTranscript(currentTranscript);
            if (event.results[0].isFinal && callback) {
                callback(currentTranscript);
            }
        };

        setTranscript('');
        recognitionRef.current.start();
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);


    return (
        <SpeechContext.Provider value={{
            isSpeechEnabled,
            toggleSpeech,
            speak,
            stop,
            isListening,
            transcript,
            startListening,
            stopListening
        }}>
            {children}
        </SpeechContext.Provider>
    )
}

export function useSpeech() {
    const context = useContext(SpeechContext)
    if (context === undefined) {
        throw new Error('useSpeech must be used within a SpeechProvider')
    }
    return context
}
