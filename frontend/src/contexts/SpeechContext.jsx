import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const SpeechContext = createContext()

export function SpeechProvider({ children }) {
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(false)

    // Initialize SpeechSynthesis on mount to avoid latency on first interaction
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.getVoices()
        }
    }, [])


    const speak = useCallback((text) => {
        if (!isSpeechEnabled || !window.speechSynthesis) return

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        // Optional: Customize voice/pitch/rate here
        // utterance.rate = 1;
        // utterance.pitch = 1;

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
                stop() // Stop immediately if toggled off
            } else {
                // Speak a confirmation string
                const msg = new SpeechSynthesisUtterance("Voice assistant enabled");
                window.speechSynthesis.speak(msg);
            }
            return newState
        })
    }, [stop])


    return (
        <SpeechContext.Provider value={{ isSpeechEnabled, toggleSpeech, speak, stop }}>
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
