import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { getFamily } from '../lib/family'
import FamilyBadge from '../components/FamilyBadge'

export default function Board() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const family = getFamily()

  async function loadMessages() {
    if (!supabase) return
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  useEffect(() => {
    loadMessages()
    if (!supabase) return
    const channel = supabase.channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || !supabase || sending) return
    setSending(true)
    await supabase.from('messages').insert({
      family_name: family,
      body: input.trim(),
      created_at: new Date().toISOString(),
    })
    setInput('')
    setSending(false)
  }

  function formatTime(ts) {
    const d = new Date(ts)
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col" style={{ height: 'calc(100vh - 48px)' }}>
      <h1 className="font-display text-3xl font-bold text-[#2A2118] mb-2">💬 Message Board</h1>
      <p className="text-[#78350F] text-sm mb-4">Quick notes, questions, and trip chatter.</p>

      {!supabase && (
        <p className="text-[#B91C1C] bg-red-50 p-3 rounded-lg mb-4 text-sm">Supabase not connected.</p>
      )}

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && (
          <p className="text-[#78350F]/50 text-sm italic text-center pt-8">No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.family_name === family
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                isMe ? 'bg-[#C2410C] text-white' : 'bg-white/60 border border-[#78350F]/10'
              }`}>
                {!isMe && (
                  <div className="mb-1">
                    <FamilyBadge family={msg.family_name} small />
                  </div>
                )}
                <p className={`text-sm ${isMe ? 'text-white' : 'text-[#2A2118]'}`}>{msg.body}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-[#78350F]/40'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 sticky bottom-0 pb-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 border border-[#78350F]/30 rounded-lg px-4 py-3 text-sm bg-white"
          disabled={!supabase}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="px-5 py-3 bg-[#C2410C] text-white rounded-lg font-bold text-sm disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}
