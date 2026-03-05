import { useState, useRef, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { useSpeech } from '../contexts/SpeechContext'
import { sendMessage } from '../services/chatService'
import { useAuth } from '../contexts/AuthContext'

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: "Hi there 💜 I'm here for you. This is a safe space — you can share whatever is on your mind. I'm listening.",
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const { speak, stop } = useSpeech()

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} fade-up`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
        ${isUser
          ? 'bg-gradient-to-br from-bloom-400 to-petal-400 text-white'
          : 'bg-gradient-to-br from-petal-100 to-pink-100 text-bloom-500 border border-pink-200'
        }`}>
        {isUser ? 'Y' : '✿'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isUser
            ? 'bg-gradient-to-br from-bloom-500 to-petal-500 text-white rounded-br-sm shadow-bloom'
            : 'bg-white/90 border border-pink-100 text-gray-700 rounded-bl-sm shadow-sm'
          }`}
        onMouseEnter={() => speak(message.text)}
        onMouseLeave={stop}
      >
        {message.text}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 fade-up">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-petal-100 to-pink-100 border border-pink-200 flex items-center justify-center text-sm text-bloom-500">
        ✿
      </div>
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

export default function Chat() {
  const { user } = useAuth()
  const token = localStorage.getItem('safeher_token')
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const { speak, stop } = useSpeech()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const reply = await sendMessage(text, token)
      setMessages(prev => [...prev, { role: 'assistant', text: reply || 'I hear you. Can you tell me more?' }])
    } catch (err) {
      console.error('Chat error:', err)
      setError('Could not reach the support server. Please ensure the backend is running and try again.')
      setMessages(prev => prev.slice(0, -1))
      setInput(text)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-petal-50">
      <div className="page-container">
        <PageHeader
          icon="💬"
          title="AI Emotional Support"
          subtitle="A safe, private space to talk. Share your thoughts — our AI companion is here for you."
        />

        {/* Chat window */}
        <div className="glass-card overflow-hidden flex flex-col" style={{ height: '520px' }}>

          {/* Header bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-pink-100 bg-gradient-to-r from-bloom-50 to-petal-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bloom-400 to-petal-400 flex items-center justify-center text-white text-base shadow-bloom">
              ✿
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">SafeHer AI Companion</p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                Online — Here for you
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-5 mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Input area */}
          <div className="px-5 py-4 border-t border-pink-100 bg-white/60">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message… (Enter to send)"
                className="flex-1 input-field resize-none min-h-[44px] max-h-32 py-3 leading-snug"
                style={{ height: 'auto' }}
                onInput={e => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                onMouseEnter={() => speak('Send Message')}
                onMouseLeave={stop}
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-bloom-500 to-petal-500 text-white flex items-center justify-center
                           hover:from-bloom-600 hover:to-petal-600 transition-all duration-200 shadow-bloom disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              >
                <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Your conversations are private and confidential 💜
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