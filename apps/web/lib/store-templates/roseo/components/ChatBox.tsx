import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react'

const subjects = [
  'General Inquiry',
  'Order Support',
  'Product Question',
  'Returns & Refunds',
  'Shipping Info',
]

type Message = {
  text: string
  sender: 'customer' | 'admin'
  createdAt: string
}

type Chat = {
  id: string
  subject: string
  status: 'open' | 'closed'
  messages: Message[]
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false)
  const [chat, setChat] = useState<Chat | null>(null)
  const [message, setMessage] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('General Inquiry')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    if (!chat) {
      const newChat: Chat = {
        id: Date.now().toString(),
        subject: selectedSubject,
        status: 'open',
        messages: [{ text: message.trim(), sender: 'customer', createdAt: new Date().toISOString() }],
      }
      setChat(newChat)
      setMessage('')
    } else {
      const updatedChat = {
        ...chat,
        messages: [
          ...chat.messages,
          { text: message.trim(), sender: 'customer' as const, createdAt: new Date().toISOString() },
        ],
      }
      setChat(updatedChat)
      setMessage('')
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-900 hover:bg-primary-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="Chat support"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-900" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden" style={{ maxHeight: '520px' }}>
          <div className="bg-primary-900 text-white px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-base">ROSEO Support</h3>
              <p className="text-primary-300 text-xs mt-0.5">We typically reply within minutes</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-primary-300">Online</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50" style={{ minHeight: '280px', maxHeight: '320px' }}>
            {!chat ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <MessageCircle className="w-10 h-10 text-neutral-300 mb-3" />
                <p className="text-sm text-neutral-500 mb-3">Send us a message and we'll respond shortly</p>
              </div>
            ) : (
              chat.messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                      msg.sender === 'customer'
                        ? 'bg-primary-900 text-white rounded-br-sm'
                        : 'bg-white text-neutral-800 border border-neutral-200 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.sender === 'admin' && (
                      <p className="text-[10px] font-semibold text-primary-900 mb-1 uppercase tracking-wider">Support</p>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'customer' ? 'text-primary-300' : 'text-neutral-400'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {chat && (
            <div className="px-4 py-2 border-t border-neutral-100">
              <div className="relative">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 pr-8 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          )}

          {chat?.status === 'closed' && (
            <div className="px-4 py-2 bg-neutral-100 border-t border-neutral-200 text-center">
              <p className="text-xs text-neutral-500">This conversation has been closed</p>
            </div>
          )}

          <form onSubmit={handleSend} className="p-3 border-t border-neutral-100 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-neutral-400"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!message.trim() || sending}
                className="w-10 h-10 bg-primary-900 hover:bg-primary-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}