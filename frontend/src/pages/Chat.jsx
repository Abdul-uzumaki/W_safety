import { useState, useRef, useEffect, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import { sendMessage } from '../services/chatService'
import { useAuth } from '../contexts/AuthContext'
import { Mic, MicOff, Send } from 'lucide-react'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: "Hi there 💜 I'm here for you. This is a safe space — you can share whatever is on your mind. I'm listening.",
}

/* ── Text-to-Speech helper — calls onDone when finished speaking ── */
function speakText(text, onDone) {
  if (!window.speechSynthesis || !text) {
    if (onDone) onDone()
    return
  }
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'en-US'
  u.onend = () => { if (onDone) onDone() }
  u.onerror = () => { if (onDone) onDone() }
  window.speechSynthesis.speak(u)
}

/* ── Chat Bubble ── */
function ChatBubble({ message, micOn }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} fade-up`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
        ${isUser
          ? 'bg-gradient-to-br from-bloom-400 to-petal-400 text-white'
          : 'bg-gradient-to-br from-petal-100 to-pink-100 text-bloom-500 border border-pink-200'
        }`}>
        {isUser ? 'Y' : '✿'}
      </div>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed cursor-pointer transition-colors
        ${isUser
            ? 'bg-gradient-to-br from-bloom-500 to-petal-500 text-white rounded-br-sm shadow-bloom hover:from-bloom-600'
            : 'bg-white/90 border border-pink-100 text-gray-700 rounded-bl-sm shadow-sm hover:bg-pink-50'
          }`}
        onClick={() => { if (!isUser) speakText(message.text) }}
      >
        {message.text}
      </div>
    </div>
  )
}

/* ── Typing dots ── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 fade-up">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-petal-100 to-pink-100 border border-pink-200 flex items-center justify-center text-sm text-bloom-500">✿</div>
      <div className="bg-white/90 border border-pink-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 rounded-full bg-bloom-300 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-bloom-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-bloom-300 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN CHAT COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function Chat() {
  const { user } = useAuth()
  const token = localStorage.getItem('safeher_token')

  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Mic state — completely local, no shared context
  const [micOn, setMicOn] = useState(false)
  const [micStatus, setMicStatus] = useState('') // '', 'listening', 'paused', 'error:...'
  const recognitionRef = useRef(null)
  const micActiveRef = useRef(false)  // global on/off
  const micPausedRef = useRef(false)  // temporary pause (e.g., during AI TTS)

  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, input])

  /* ── Create and start a fresh mic instance ── */
  const createAndStartMic = useCallback(() => {
    if (!SpeechRecognition) {
      setMicStatus('error:unsupported')
      return
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (_) { }
      recognitionRef.current = null
    }

    const rec = new SpeechRecognition()
    rec.lang = 'en-US'
    rec.interimResults = true
    rec.continuous = true

    rec.onstart = () => {
      if (micPausedRef.current) {
        try { rec.abort() } catch (_) { }
      } else {
        setMicStatus('listening')
        console.log('🎤 Mic STARTED')
      }
    }

    rec.onresult = (e) => {
      if (micPausedRef.current) return
      let text = ''
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript
      }
      setInput(text)
    }

    rec.onerror = (e) => {
      if (e.error !== 'aborted') {
        console.error('🎤 Mic Error:', e.error)
        setMicStatus('error:' + e.error)
      }
      if (e.error === 'not-allowed') {
        alert('Microphone blocked! Allow it in the address bar.')
        micActiveRef.current = false
        setMicOn(false)
      }
    }

    rec.onend = () => {
      console.log('🎤 Mic session ended. Active:', micActiveRef.current, 'Paused:', micPausedRef.current)
      // Auto-restart only if active AND NOT paused
      if (micActiveRef.current && !micPausedRef.current) {
        console.log('🎤 Auto-restarting mic...')
        setTimeout(() => {
          if (micActiveRef.current && !micPausedRef.current) {
            try { rec.start() } catch (err) {
              console.error('🎤 Failed to restart:', err)
              // If it fails (e.g., old instance is dead), create a fresh one
              if (err.name === 'InvalidStateError') {
                createAndStartMic()
              }
            }
          }
        }, 300)
      } else if (!micActiveRef.current) {
        setMicStatus('')
      }
    }

    recognitionRef.current = rec
    micPausedRef.current = false

    try {
      rec.start()
    } catch (err) {
      console.error('🎤 Mic failed to start:', err)
      setMicStatus('error:start-failed')
    }
  }, []) // No dependencies

  /* ── Stop the mic completely ── */
  const killMic = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (_) { }
      recognitionRef.current = null
    }
    setMicStatus('')
  }, [])

  /* ── Toggle mic on/off ── */
  const toggleMic = useCallback(() => {
    if (micActiveRef.current) {
      // Turn OFF
      micActiveRef.current = false
      micPausedRef.current = false
      setMicOn(false)
      killMic()
    } else {
      // Turn ON
      micActiveRef.current = true
      micPausedRef.current = false
      setMicOn(true)
      createAndStartMic()
    }
  }, [createAndStartMic, killMic])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      micActiveRef.current = false
      killMic()
    }
  }, [killMic])

  /* ── Send message ── */
  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const wasMicOn = micActiveRef.current

    // Pause mic while AI processes + speaks
    if (wasMicOn) {
      micPausedRef.current = true
      killMic()
      setMicStatus('paused')
    }

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const reply = await sendMessage(text, token)
      const replyText = reply || 'I hear you. Can you tell me more?'
      setMessages(prev => [...prev, { role: 'assistant', text: replyText }])

      if (wasMicOn) {
        // Speak AI reply, then restart mic after done
        speakText(replyText, () => {
          console.log('🔊 AI done speaking, restarting mic...')
          micPausedRef.current = false
          if (micActiveRef.current) {
            createAndStartMic()
          }
        })
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError('Could not reach the AI. Please try again.')
      setMessages(prev => prev.slice(0, -1))
      setInput(text)

      // Restart mic even on error
      if (wasMicOn) {
        micPausedRef.current = false
        if (micActiveRef.current) createAndStartMic()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasSTT = !!SpeechRecognition

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-petal-50">
      <div className="page-container">
        <PageHeader
          icon="💬"
          title="AI Emotional Support"
          subtitle="A safe, private space to talk. Share your thoughts — our AI companion is here for you."
        />

        <div className="glass-card overflow-hidden flex flex-col" style={{ height: '550px' }}>

          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100 bg-white/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bloom-400 to-petal-400 flex items-center justify-center text-white text-base shadow-bloom">✿</div>
              <div>
                <p className="font-semibold text-sm text-gray-800">SafeHer AI Companion</p>
                <p className="text-xs text-green-500 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online — Here for you
                </p>
              </div>
            </div>
            {/* Mic status badge in header */}
            {micOn && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${micStatus === 'listening' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
                }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${micStatus === 'listening' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                <span className={`text-[11px] font-bold uppercase tracking-wide ${micStatus === 'listening' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                  {micStatus === 'listening' ? '🎤 Listening' : micStatus === 'paused' ? '🔊 Speaking...' : 'Connecting...'}
                </span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} micOn={micOn} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-5 mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Mic error banner */}
          {micStatus.startsWith('error:') && (
            <div className="mx-5 mb-3 px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700 flex items-center gap-2">
              <span>🎤</span> Mic issue: <strong>{micStatus.replace('error:', '')}</strong>
              {micStatus === 'error:not-allowed' && ' — Allow mic access in browser settings'}
              {micStatus === 'error:unsupported' && ' — Use Chrome or Edge for voice'}
            </div>
          )}

          {/* Input area */}
          <div className="px-5 py-4 border-t border-pink-100 bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex gap-3 items-end">

              {/* Mic toggle button */}
              {hasSTT && (
                <button
                  onClick={toggleMic}
                  title={micOn ? 'Turn off mic' : 'Turn on mic (speak to type)'}
                  className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border shadow-sm
                    ${micOn
                      ? 'bg-red-500 text-white border-red-400 ring-4 ring-red-100 shadow-lg scale-105'
                      : 'bg-white text-bloom-500 border-pink-100 hover:bg-bloom-50 hover:border-bloom-200'}`}
                >
                  {micOn ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}

              {/* Text input */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={micOn ? '🎤 Listening... speak now' : 'Type your message…'}
                className={`flex-1 input-field resize-none min-h-[44px] max-h-32 py-3 leading-snug transition-all font-medium
                  ${micOn ? 'border-red-200 bg-red-50/30 placeholder-red-400' : 'border-pink-100'}`}
                style={{ height: 'auto' }}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-bloom-500 to-petal-500 text-white flex items-center justify-center
                  hover:from-bloom-600 hover:to-petal-600 transition-all duration-200 shadow-bloom disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>

            <p className="text-[10px] text-gray-400 mt-2 text-center font-medium italic">
              {micOn
                ? '🎤 Speak → text appears → press Send → AI replies with voice'
                : 'Your conversations are private and confidential 💜'}
            </p>
          </div>
        </div>

        {/* Support note */}
        <div className="mt-5 p-4 bg-petal-50 border border-petal-200 rounded-2xl text-sm text-petal-700 flex items-start gap-3">
          <span className="text-xl flex-shrink-0">💜</span>
          <p>
            <strong>Remember:</strong> You deserve to be safe and heard. If you are in immediate danger,
            please call <strong>112</strong> (Police) or <strong>181</strong> (Women Helpline) immediately.
          </p>
        </div>
      </div>
    </div>
  )
}