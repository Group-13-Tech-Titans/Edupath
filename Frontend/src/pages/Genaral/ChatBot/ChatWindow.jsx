import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import axios from "axios";


export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('edupath_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Fallback for technical errors that might leak from backend
  const sanitizeMessage = (msgText) => {
    if (typeof msgText !== 'string') return "I'm having a little trouble connecting right now.";
    if (msgText.includes("GoogleGenerativeAI Error") || msgText.includes("429 Too Many Requests") || msgText.includes("fetch")) {
      return "I'm sorry, I'm having a little trouble connecting right now (I might be overwhelmed!). Could we try that again in a moment?";
    }
    return msgText;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('edupath_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    setMessages(prev => [...prev, { text, sender: 'user', time }]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Send request to backend
      const response = await axios.post(import.meta.env.VITE_API_URL + "/api/chatbot/chat", {
        history: messages,
        message: text
      });

      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (response.data.success) {
        setMessages(prev => [...prev, { text: sanitizeMessage(response.data.data.text), sender: 'bot', time: botTime }]);
      } else {
        const fallback = response.data.error || "Sorry, I'm having trouble connecting right now.";
        setMessages(prev => [...prev, { text: sanitizeMessage(fallback), sender: 'bot', time: botTime }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const errorMsg = error.response?.data?.error || "Network error. Please try again.";
      setMessages(prev => [...prev, { text: sanitizeMessage(errorMsg), sender: 'bot', time: botTime }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-20 left-0 w-[360px] h-[650px] max-h-[85vh] flex flex-col rounded-3xl bg-[#efeae2] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-50 origin-bottom-left"
    >
      {/* Header Section */}
      <div className="relative bg-gradient-to-b from-[#001e2b] to-[#002f3a] px-4 pt-4 pb-6 text-white">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            🎓
          </div>
          <span className="font-bold tracking-wide">EduPath Support</span>
        </div>
        
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Chat Messages */}
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] min-w-[80px] rounded-2xl px-3 py-2 text-[15px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-[#d9fdd3] text-[#111b21] rounded-br-none' : 'bg-white text-[#111b21] rounded-bl-none'}`}>
                  <div className={msg.sender === 'bot' ? 'prose prose-sm prose-slate max-w-none' : 'break-words'}>
                    {msg.sender === 'user' ? (
                      msg.text
                    ) : (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    )}
                  </div>
                  <div className={`text-[11px] font-medium text-right mt-1 ${msg.sender === 'user' ? 'text-green-800/70' : 'text-slate-400'}`}>
                    {msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-start"
              >
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 bg-slate-400 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
          className="flex items-center gap-2"
        >
          <input 
            type="text" 
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#13aa52] transition-colors"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#13aa52] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#0f8b42]"
          >
            <svg className="w-5 h-5 -ml-0.5 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </motion.div>
  );
}
