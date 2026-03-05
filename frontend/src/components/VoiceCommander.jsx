import React, { useState, useEffect, useCallback } from 'react';
import { useSpeech } from '../contexts/SpeechContext';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, MessageSquare, Shield, Book, Home, FileText, Phone } from 'lucide-react';

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

export default function VoiceCommander() {
    const { isSpeechEnabled, toggleSpeech, speak, isListening, transcript, startListening, stopListening } = useSpeech();
    const navigate = useNavigate();
    const [showIndicator, setShowIndicator] = useState(false);

    const processCommand = useCallback((text) => {
        const lowerText = text.toLowerCase().trim();
        console.log('Voice Command:', lowerText);

        for (const [command, path] of Object.entries(COMMANDS)) {
            if (lowerText.includes(command)) {
                speak(`Navigating to ${command}`);
                navigate(path);
                return;
            }
        }

        if (lowerText.includes('stop listening')) {
            stopListening();
            speak('Stopping voice recognition');
            return;
        }

        if (lowerText.length > 2) {
            speak(`I heard ${lowerText}, but I don't recognize that command.`);
        }
    }, [navigate, speak, stopListening]);

    useEffect(() => {
        if (isSpeechEnabled && !isListening) {
            // Auto-restart listening if speech mode is on? 
            // Maybe better to have a dedicated "Activation" phrase or a button.
            // For now, let's keep it button-triggered for better UX/Privacy.
        }
    }, [isSpeechEnabled, isListening]);

    if (!isSpeechEnabled) return (
        <button
            onClick={toggleSpeech}
            className="fixed bottom-6 right-6 p-4 bg-gray-200 text-gray-600 rounded-full shadow-lg hover:bg-gray-300 transition-all z-50 flex items-center gap-2"
            title="Enable Voice Mode"
        >
            <MicOff size={24} />
            <span className="text-sm font-medium">Voice Mode Off</span>
        </button>
    );

    return (
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
            {isListening && (
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-bloom-100 mb-2 max-w-xs animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 bg-bloom-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-bloom-600 uppercase tracking-wider">Listening...</span>
                    </div>
                    <p className="text-sm text-gray-700 italic">
                        "{transcript || 'Say "Go to chat", "Emergency", etc...'}"
                    </p>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={toggleSpeech}
                    className="p-4 bg-bloom-100 text-bloom-600 rounded-full shadow-lg hover:bg-bloom-200 transition-all"
                    title="Disable Voice Mode"
                >
                    <MicOff size={24} />
                </button>

                <button
                    onMouseDown={() => startListening(processCommand)}
                    onMouseUp={stopListening}
                    className={`p-4 rounded-full shadow-lg transition-all transform active:scale-95 ${isListening ? 'bg-bloom-600 text-white scale-110 ring-4 ring-bloom-200' : 'bg-bloom-500 text-white hover:bg-bloom-600'
                        }`}
                    title="Hold to speak"
                >
                    <Mic size={24} />
                </button>
            </div>
        </div>
    );
}
