import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSpeech } from '../contexts/SpeechContext';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../services/chatService';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const COMMANDS = {
    'go home': '/',
    'dashboard': '/',
    'chat': '/chat',
    'talk': '/chat',
    'legal': '/legal',
    'rights': '/legal',
    'report': '/report',
    'file report': '/report',
    'emergency': '/emergency',
    'help': '/emergency',
    'education': '/education',
    'learn': '/education',
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceCommander() {
    const {
        isSpeechEnabled,
        toggleSpeech,
        speak,
        isListening,
        isSpeaking,
        isDictating,
        transcript,
        setCommandCallback,
        isSTTAvailable
    } = useSpeech();

    const navigate = useNavigate();
    const isProcessingRef = useRef(false);

    const processCommand = useCallback(async (text) => {
        // If we are currently dictating into a specific field (like chat),
        // the global assistant should "stay silent" to avoid conflicts.
        if (isProcessingRef.current || isDictating) return;

        const lowerText = text.toLowerCase().trim();
        if (!lowerText || lowerText.length < 3) return;

        console.log('VoiceCommander: Analyzing ->', lowerText);
        isProcessingRef.current = true;

        // 1. Navigation
        for (const [command, path] of Object.entries(COMMANDS)) {
            if (lowerText.includes(command)) {
                speak(`Navigating to ${command}`);
                navigate(path);
                isProcessingRef.current = false;
                return;
            }
        }

        // 2. Stop toggle
        if (lowerText.includes('stop listening') || lowerText.includes('turn off voice')) {
            toggleSpeech();
            isProcessingRef.current = false;
            return;
        }

        // 3. AI Chat (Hands-free mode)
        try {
            const reply = await sendMessage(lowerText);
            speak(reply);
        } catch (error) {
            console.error('VoiceCommander: AI Error:', error);
            speak("I can hear you, but my connection to the brain is a bit unstable.");
        } finally {
            isProcessingRef.current = false;
        }
    }, [navigate, speak, toggleSpeech, isDictating]);

    useEffect(() => {
        setCommandCallback(processCommand);
        return () => setCommandCallback(null);
    }, [processCommand, setCommandCallback]);

    if (!isSTTAvailable) return null;

    if (!isSpeechEnabled) return (
        <button
            onClick={toggleSpeech}
            className="fixed bottom-6 right-6 p-4 bg-white text-bloom-600 rounded-full shadow-bloom hover:bg-bloom-50 transition-all z-50 flex items-center gap-3 border border-bloom-100 group"
        >
            <div className="bg-bloom-100 p-2 rounded-full group-hover:bg-bloom-200 transition-colors">
                <Mic size={20} />
            </div>
            <span className="text-sm font-bold pr-2 bg-gradient-to-r from-bloom-600 to-petal-600 bg-clip-text text-transparent">Enable Voice Assistant</span>
        </button>
    );

    return (
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
            {/* Minimal UI when just listening, Rich UI when speaking or processing */}
            {(isSpeaking || (isListening && !isDictating && transcript)) && (
                <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-bloom-100 mb-2 max-w-xs animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                            <span className={`relative flex h-3 w-3 ${isSpeaking ? 'bg-blue-500' : 'bg-bloom-500'} rounded-full`}>
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSpeaking ? 'bg-blue-400' : 'bg-bloom-400'} opacity-75`}></span>
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isSpeaking ? 'text-blue-600' : 'text-bloom-600'}`}>
                                {isSpeaking ? 'Assistant Speaking' : 'Voice Active'}
                            </span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {isSpeaking ? "Responding to your request..." : `"${transcript}"`}
                    </p>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={toggleSpeech}
                    className="p-4 bg-white/90 backdrop-blur-sm text-bloom-500 rounded-full shadow-lg hover:text-red-500 transition-all border border-bloom-100 shadow-bloom"
                    title="Disable Voice Mode"
                >
                    <MicOff size={24} />
                </button>

                <div className={`p-4 rounded-full shadow-2xl transition-all transform duration-500 ${isSpeaking ? 'bg-blue-600 text-white scale-110 shadow-lg' :
                        isListening ? 'bg-bloom-600 text-white scale-110 ring-4 ring-bloom-100' : 'bg-gray-400 text-white'
                    }`}>
                    {isSpeaking ? <Volume2 size={24} className="animate-pulse" /> : <Mic size={24} />}
                </div>
            </div>
        </div>
    );
}
