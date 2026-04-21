import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// ── Mock Data ────────────────────────────────────────────────────
const MOCK_CONVERSATIONS = [
  {
    id: "C001",
    studentId: "S001",
    name: "Priya Sharma",
    initials: "PS",
    track: "Web Development",
    lastMessage: "Thank you for the React resources!",
    lastTime: "2026-04-19T10:30:00Z",
    unread: 2,
    messages: [
      { id: 1, from: "student", text: "Hi! I wanted to ask about the React hooks assignment.", time: "2026-04-19T09:00:00Z" },
      { id: 2, from: "mentor",  text: "Sure Priya! Which part are you finding difficult?", time: "2026-04-19T09:05:00Z" },
      { id: 3, from: "student", text: "The useEffect cleanup function is confusing me.", time: "2026-04-19T09:10:00Z" },
      { id: 4, from: "mentor",  text: "Great question! The cleanup runs before the component unmounts or before the effect runs again. I'll share a resource.", time: "2026-04-19T09:15:00Z" },
      { id: 5, from: "student", text: "Thank you for the React resources!", time: "2026-04-19T10:30:00Z" },
    ],
  },
  {
    id: "C002",
    studentId: "S002",
    name: "Rahul Mehta",
    initials: "RM",
    track: "Data Science & ML",
    lastMessage: "Can we schedule a session this Friday?",
    lastTime: "2026-04-18T16:00:00Z",
    unread: 1,
    messages: [
      { id: 1, from: "mentor",  text: "Hi Rahul, how is the ML project going?", time: "2026-04-18T14:00:00Z" },
      { id: 2, from: "student", text: "It's going well! I've improved the model accuracy to 87%.", time: "2026-04-18T14:30:00Z" },
      { id: 3, from: "mentor",  text: "That's fantastic progress! Keep it up.", time: "2026-04-18T15:00:00Z" },
      { id: 4, from: "student", text: "Can we schedule a session this Friday?", time: "2026-04-18T16:00:00Z" },
    ],
  },
  {
    id: "C003",
    studentId: "S003",
    name: "Anjali Kumar",
    initials: "AK",
    track: "React & TypeScript",
    lastMessage: "The portfolio review was super helpful!",
    lastTime: "2026-04-17T11:00:00Z",
    unread: 0,
    messages: [
      { id: 1, from: "student", text: "Good morning! Ready for today's portfolio review.", time: "2026-04-17T09:00:00Z" },
      { id: 2, from: "mentor",  text: "Morning Anjali! Let's start with your GitHub profile.", time: "2026-04-17T09:05:00Z" },
      { id: 3, from: "student", text: "The portfolio review was super helpful!", time: "2026-04-17T11:00:00Z" },
    ],
  },
  {
    id: "C004",
    studentId: "S004",
    name: "Nimal Perera",
    initials: "NP",
    track: "Networking",
    lastMessage: "I will complete the assignment by tomorrow.",
    lastTime: "2026-04-16T13:00:00Z",
    unread: 0,
    messages: [
      { id: 1, from: "mentor",  text: "Hi Nimal! Have you started the networking assignment?", time: "2026-04-16T12:00:00Z" },
      { id: 2, from: "student", text: "I will complete the assignment by tomorrow.", time: "2026-04-16T13:00:00Z" },
    ],
  },
  {
    id: "C005",
    studentId: "S005",
    name: "Sahana Jayasinghe",
    initials: "SJ",
    track: "Web Development",
    lastMessage: "Taking a short break, will be back next week.",
    lastTime: "2026-04-10T08:00:00Z",
    unread: 0,
    messages: [
      { id: 1, from: "student", text: "Taking a short break, will be back next week.", time: "2026-04-10T08:00:00Z" },
      { id: 2, from: "mentor",  text: "No problem Sahana, take care! Reach out whenever you're ready.", time: "2026-04-10T09:00:00Z" },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────
function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)    return "Just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── Main Page ────────────────────────────────────────────────────
export default function MentorMessages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeId, setActiveId]           = useState("C001");
  const [search, setSearch]               = useState("");
  const [newMsg, setNewMsg]               = useState("");
  const location = useLocation();
  const messagesEndRef = useRef(null);

  // Ensure window starts at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Set active conversation if studentId passed in state
  useEffect(() => {
    if (location.state?.studentId) {
      const conv = conversations.find((c) => c.studentId === location.state.studentId);
      if (conv) {
        setActiveId(conv.id);
      }
    }
  }, [location.state, conversations]);

  // Scroll to bottom within container only
  useEffect(() => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [activeId, conversations]);

  const activeConv = conversations.find((c) => c.id === activeId);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) =>
      !q || c.name.toLowerCase().includes(q) || c.track.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openConversation = (id) => {
    // Mark messages as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
    setActiveId(id);
  };

  const handleSend = () => {
    const text = newMsg.trim();
    if (!text) return;

    const newMessage = {
      id: Date.now(),
      from: "mentor",
      text,
      time: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMessage], lastMessage: text, lastTime: newMessage.time }
          : c
      )
    );
    setNewMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <>
      {/* ── Page Title ─────────────────────────────────────────── */}
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

      {/* ── Main Chat Layout ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">

        {/* ── Conversation List (left) ──────────────────────────── */}
        <section className="rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden">
          <div className="p-4 border-b-2 border-slate-100">
            <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-400 focus-within:bg-white">
              <SearchIcon />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full bg-transparent text-sm outline-none" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">No conversations found.</p>
            ) : (
              filtered.map((c) => (
                <button key={c.id} type="button"
                  onClick={() => openConversation(c.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 border-b border-slate-100 text-left transition hover:bg-emerald-50 ${
                    activeId === c.id ? "bg-emerald-50 border-l-4 border-l-teal-400" : ""
                  }`}>
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-300 text-base font-extrabold text-white">
                      {c.initials}
                    </div>
                    {c.unread > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-white">
                        {c.unread}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${c.unread > 0 ? "font-extrabold text-slate-800" : "font-semibold text-slate-700"}`}>
                        {c.name}
                      </span>
                      <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(c.lastTime)}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{c.track}</p>
                    <p className={`text-xs truncate mt-0.5 ${c.unread > 0 ? "font-semibold text-slate-600" : "text-slate-400"}`}>
                      {c.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* ── Chat Window (right) ───────────────────────────────── */}
        <section className="rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden" style={{ minHeight: "600px" }}>

          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-4 border-b-2 border-slate-100 px-6 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-300 text-base font-extrabold text-white">
                  {activeConv.initials}
                </div>
                <div>
                  <div className="text-base font-extrabold text-slate-800">{activeConv.name}</div>
                  <div className="text-xs text-slate-500">{activeConv.track}</div>
                </div>
                <div className="ml-auto flex gap-2">
                  <Link to={`/mentor/student-details/${activeConv.studentId}`}
                    className="rounded-xl border-2 border-teal-400 bg-white px-4 py-2 text-xs font-bold text-teal-500 transition hover:bg-teal-400 hover:text-white">
                    View Profile
                  </Link>
                  <Link to={`/mentor/sessions`}
                    className="rounded-xl bg-teal-400 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-500">
                    View Sessions
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
                {activeConv.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.from === "mentor" ? "justify-end" : "justify-start"}`}>
                    {m.from === "student" && (
                      <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-300 text-xs font-extrabold text-white">
                        {activeConv.initials}
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.from === "mentor"
                        ? "bg-teal-400 text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}>
                      <p className="leading-relaxed">{m.text}</p>
                      <p className={`mt-1 text-xs ${m.from === "mentor" ? "text-teal-100" : "text-slate-400"}`}>
                        {formatTime(m.time)}
                      </p>
                    </div>
                    {m.from === "mentor" && (
                      <div className="ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-extrabold text-slate-600">
                        Me
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
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
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-400 text-white transition hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed">
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

/* ── Icons ────────────────────────────────────────────────────── */
function SearchIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>; }
function SendIcon()     { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" /></svg>; }
function ChatBigIcon()  { return <svg className="h-16 w-16 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>; }
