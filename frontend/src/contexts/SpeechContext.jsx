import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

const SpeechContext = createContext()

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function SpeechProvider({ children }) {
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isDictating, setIsDictating] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [sttError, setSttError] = useState(null)

    const recognitionRef = useRef(null)
    const shouldKeepListening = useRef(false)
    const dictationCallback = useRef(null)
    const commandCallback = useRef(null)

    // Robust start function
    const startMic = useCallback(() => {
        if (!recognitionRef.current || isSpeaking) return;
        try {
            recognitionRef.current.start();
            setSttError(null);
        } catch (e) {
            // Already started? No problem.
        }
    }, [isSpeaking]);

    useEffect(() => {
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setSttError(null);
            console.log('STT: Mic Started');
        };

        recognition.onresult = (event) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                fullTranscript += event.results[i][0].transcript;
            }

            const text = fullTranscript.trim();
            setTranscript(text);

            const isFinal = event.results[event.results.length - 1].isFinal;

            if (dictationCallback.current) {
                dictationCallback.current(text, isFinal);
            } else if (commandCallback.current && isFinal) {
                commandCallback.current(event.results[event.results.length - 1][0].transcript.trim());
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            console.log('STT: Mic Ended');
            if (shouldKeepListening.current && !window.speechSynthesis.speaking) {
                setTimeout(startMic, 300);
            }
        };

        recognition.onerror = (event) => {
            console.error('STT Error:', event.error);
            setSttError(event.error);
            setIsListening(false);

            if (event.error === 'not-allowed') {
                shouldKeepListening.current = false;
            }
        };

        recognitionRef.current = recognition;
    }, [startMic]);

    const stop = useCallback(() => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const speak = useCallback((text, callback) => {
        if (!isSpeechEnabled || !window.speechSynthesis) return;

        stop();
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.onstart = () => {
            setIsSpeaking(true);
            if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) { }
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            if (callback) callback();
        };

        window.speechSynthesis.speak(utterance);
    }, [isSpeechEnabled, stop]);

    const toggleSpeech = useCallback(() => {
        setIsSpeechEnabled(prev => {
            const next = !prev;
            if (next) {
                shouldKeepListening.current = true;
                speak("Voice assistant online.");
                setTimeout(startMic, 400);
            } else {
                shouldKeepListening.current = false;
                if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) { }
                stop();
            }
            return next;
        });
    }, [speak, startMic, stop]);

    const startDictation = useCallback((callback) => {
        dictationCallback.current = callback;
        setIsDictating(true);
        setTranscript('');
        shouldKeepListening.current = true;
        if (!isListening) startMic();
    }, [isListening, startMic]);

    const stopDictation = useCallback(() => {
        dictationCallback.current = null;
        setIsDictating(false);
        setTranscript('');
        if (!isSpeechEnabled) {
            shouldKeepListening.current = false;
            if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) { }
        }
    }, [isSpeechEnabled]);

    return (
        <SpeechContext.Provider value={{
            isSpeechEnabled, toggleSpeech,
            speak, stop,
            isListening, isSpeaking, isDictating,
            transcript, sttError,
            startDictation, stopDictation,
            setCommandCallback: (cb) => { commandCallback.current = cb; },
            isSTTAvailable: !!SpeechRecognition
        }}>
            {children}
        </SpeechContext.Provider>
    )
}

export function useSpeech() {
    return useContext(SpeechContext);
}
