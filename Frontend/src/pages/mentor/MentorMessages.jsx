import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  getConversations, 
  getMessages as getMessagesApi, 
  sendMessage as sendMessageApi, 
  markAsRead 
} from "../../api/mentorApi.js";

// ── Helpers ──────────────────────────────────────────────────────
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── Main Page ────────────────────────────────────────────────────
export default function MentorMessages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const location = useLocation();
  const messagesEndRef = useRef(null);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
    window.scrollTo(0, 0);
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.studentId);
    }
  }, [activeConv]);

  const fetchMessages = async (studentId) => {
    setMsgLoading(true);
    try {
      const data = await getMessagesApi(studentId);
      setMessages(data);
      // Mark as read
      await markAsRead(studentId);
      // Update local unread count
      setConversations(prev => prev.map(c => c.studentId === studentId ? { ...c, unread: 0 } : c));
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setMsgLoading(false);
    }
  };

  // Set active conversation if studentId passed in state
  useEffect(() => {
    if (location.state?.studentId && conversations.length > 0) {
      const conv = conversations.find((c) => c.studentId === location.state.studentId);
      if (conv) {
        setActiveConv(conv);
      }
    }
  }, [location.state, conversations]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) =>
      !q || c.name.toLowerCase().includes(q) || (c.track && c.track.toLowerCase().includes(q))
    );
  }, [conversations, search]);

  const openConversation = (conv) => {
    setActiveConv(conv);
  };

  const handleSend = async () => {
    const text = newMsg.trim();
    if (!text || !activeConv) return;

    try {
      const payload = {
        receiverId: activeConv.studentId,
        text: text
      };

      const sentMsg = await sendMessageApi(payload);
      setMessages(prev => [...prev, sentMsg]);
      setNewMsg("");
      
      // Update last message in conversation list
      setConversations(prev => prev.map(c => 
        c.studentId === activeConv.studentId 
          ? { ...c, lastMessage: text, lastTime: new Date().toISOString() } 
          : c
      ));
    } catch (err) {
      alert("Failed to send message: " + err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

  return (
    <>
      <section className="mb-5 flex flex-col justify-between gap-4 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold">Messages</h1>
          <p className="mt-1 text-sm text-slate-500">Chat with your students directly.</p>
        </div>
        {totalUnread > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-4 py-2 text-sm font-bold text-teal-600">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-400 text-xs text-white">{totalUnread}</span>
            Unread message{totalUnread > 1 ? "s" : ""}
          </span>
        )}
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl bg-white shadow-[0_4px_20_rgba(0,0,0,0.08)] flex flex-col overflow-hidden max-h-[700px]">
          <div className="p-4 border-b-2 border-slate-100">
            <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-400 focus-within:bg-white">
              <SearchIcon />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-6 text-center text-sm text-slate-400">Loading chats...</p>
            ) : filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">No conversations found.</p>
            ) : (
              filtered.map((c) => {
                const initials = c.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "S";
                return (
                  <button key={c.studentId} type="button"
                    onClick={() => openConversation(c)}
                    className={`w-full flex items-center gap-3 px-4 py-4 border-b border-slate-100 text-left transition hover:bg-emerald-50 ${
                      activeConv?.studentId === c.studentId ? "bg-emerald-50 border-l-4 border-l-teal-400" : ""
                    }`}>
                    <div className="relative flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-300 text-base font-extrabold text-white">
                        {initials}
                      </div>
                      {c.unread > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-white">
                          {c.unread}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${c.unread > 0 ? "font-extrabold text-slate-800" : "font-semibold text-slate-700"}`}>
                          {c.name}
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(c.lastTime)}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{c.track || "Student"}</p>
                      <p className={`text-xs truncate mt-0.5 ${c.unread > 0 ? "font-semibold text-slate-600" : "text-slate-400"}`}>
                        {c.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden" style={{ minHeight: "600px", maxHeight: "700px" }}>
          {activeConv ? (
            <>
              <div className="flex items-center gap-4 border-b-2 border-slate-100 px-6 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-300 text-base font-extrabold text-white">
                  {activeConv.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "S"}
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-800">{activeConv.name}</div>
                  <div className="text-xs text-slate-500">{activeConv.track || "Student"}</div>
                </div>
                <div className="ml-auto flex gap-2">
                  <Link to={`/mentor/student-details/${activeConv.studentId}`}
                    className="rounded-xl border-2 border-teal-400 bg-white px-4 py-2 text-xs font-bold text-teal-500 transition hover:bg-teal-400 hover:text-white">
                    View Profile
                  </Link>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 bg-slate-50/30">
                {msgLoading ? (
                  <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-sm text-slate-400">No messages yet. Say hello!</div>
                ) : (
                  messages.map((m) => {
                    const isMentor = m.senderRole === "mentor";
                    const initials = activeConv.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "S";
                    return (
                      <div key={m._id} className={`flex ${isMentor ? "justify-end" : "justify-start"}`}>
                        {!isMentor && (
                          <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-300 text-xs font-extrabold text-white">
                            {initials}
                          </div>
                        )}
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMentor
                            ? "bg-teal-400 text-white rounded-br-sm shadow-md shadow-teal-100"
                            : "bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100"
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                          <p className={`mt-1 text-[10px] text-right ${isMentor ? "text-teal-100" : "text-slate-400"}`}>
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                        {isMentor && (
                          <div className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-extrabold text-slate-600">
                            Me
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t-2 border-slate-100 px-6 py-4">
                <div className="flex items-end gap-3">
                  <textarea
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder={`Message ${activeConv.name}...`}
                    className="flex-1 resize-none rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-teal-400 focus:bg-white"
                    style={{ maxHeight: "120px" }}
                  />
                  <button type="button" onClick={handleSend}
                    disabled={!newMsg.trim()}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-400 text-white transition hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-100">
                    <SendIcon />
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center flex-col gap-3 text-slate-400">
              <ChatBigIcon />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function SearchIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>; }
function SendIcon() { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" /></svg>; }
function ChatBigIcon() { return <svg className="h-16 w-16 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>; }
