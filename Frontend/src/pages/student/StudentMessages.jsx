import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PageShell from "../../components/PageShell.jsx";
import {
  getConversations,
  getMessages as getMessagesApi,
  sendMessage as sendMessageApi,
  markAsRead,
  getEligibleMentors
} from "../../api/mentorApi.js";
import { subscribeToMessages, unsubscribeFromMessages } from "../../socket.js";
import { useApp } from "../../context/AppProvider.jsx";

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
export default function StudentMessages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [eligibleMentors, setEligibleMentors] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);

  const location = useLocation();
  const messagesEndRef = useRef(null);
  const { fetchUnreadCount } = useApp();

  // Initial fetch
  useEffect(() => {
    fetchConversations();
    fetchEligibleMentors();
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

  const fetchEligibleMentors = async () => {
    try {
      const data = await getEligibleMentors();
      setEligibleMentors(data);
    } catch (err) {
      console.error("Failed to fetch eligible mentors:", err);
    }
  };

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.mentorId);
    }
  }, [activeConv]);

  const fetchMessages = async (mentorId) => {
    setMsgLoading(true);
    try {
      const data = await getMessagesApi(mentorId);
      setMessages(data);
      // Mark as read
      await markAsRead(mentorId);
      fetchUnreadCount();
      // Update local unread count
      setConversations(prev => prev.map(c => c.mentorId === mentorId ? { ...c, studentUnreadCount: 0 } : c));
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setMsgLoading(false);
    }
  };

  // Set active conversation if mentorId passed in state
  useEffect(() => {
    if (location.state?.mentorId) {
      const targetMentorId = location.state.mentorId;

      // If already active, don't re-set to avoid infinite loops
      if (activeConv?.mentorId === targetMentorId) return;

      // 1. Try to find in existing conversations
      const existingConv = conversations.find(c => c.mentorId === targetMentorId);
      if (existingConv) {
        setActiveConv(existingConv);
        return;
      }

      // 2. If not found and mentors are loaded, start a temp chat
      if (eligibleMentors.length > 0) {
        const mentor = eligibleMentors.find(m => m.id === targetMentorId);
        if (mentor) {
          setActiveConv({
            mentorId: mentor.id,
            mentorName: mentor.name,
            track: "Mentor",
            lastMessage: "",
            lastTime: null
          });
        }
      }
    }
  }, [location.state?.mentorId, conversations, eligibleMentors, activeConv?.mentorId]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Real-time socket listener
  useEffect(() => {
    const handleNewMessage = (msg) => {
      console.log("Real-time message received in StudentMessages:", msg);

      // 1. If it's for the active conversation, add it to messages
      if (activeConv && msg.senderRole === "mentor" && msg.senderId === activeConv.mentorId) {
        setMessages(prev => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        markAsRead(activeConv.mentorId).then(() => fetchUnreadCount()).catch(console.error);
      } else {
        // 2. If it's for another conversation, update the list
        setConversations(prev => {
          const exists = prev.find(c => c.mentorId === msg.senderId);
          if (exists) {
            return prev.map(c => {
              if (c.mentorId === msg.senderId) {
                return {
                  ...c,
                  lastMessage: msg.text,
                  lastTime: msg.createdAt,
                  studentUnreadCount: (c.studentUnreadCount || 0) + 1
                };
              }
              return c;
            });
          } else if (msg.senderRole === "mentor") {
            // New conversation from a mentor
            fetchConversations();
            return prev;
          }
          return prev;
        });
      }
    };

    subscribeToMessages(handleNewMessage);
    return () => unsubscribeFromMessages(handleNewMessage);
  }, [activeConv]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return conversations.filter((c) =>
      !q || c.mentorName?.toLowerCase().includes(q) || (c.track && c.track.toLowerCase().includes(q))
    );
  }, [conversations, search]);

  const openConversation = (conv) => {
    setActiveConv(conv);
  };

  const startNewChat = (mentor) => {
    const existing = conversations.find(c => c.mentorId === mentor.id);
    if (existing) {
      setActiveConv(existing);
    } else {
      setActiveConv({
        mentorId: mentor.id,
        mentorName: mentor.name,
        track: "Mentor",
        lastMessage: "",
        lastTime: null
      });
      setMessages([]);
    }
    setShowNewChatDropdown(false);
  };

  const handleSend = async () => {
    const text = newMsg.trim();
    if (!text || !activeConv) return;

    try {
      const payload = {
        receiverId: activeConv.mentorId,
        text: text
      };

      const sentMsg = await sendMessageApi(payload);
      setMessages(prev => [...prev, sentMsg]);
      setNewMsg("");

      // Update last message in conversation list
      setConversations(prev => {
        const exists = prev.find(c => c.mentorId === activeConv.mentorId);
        if (exists) {
          return prev.map(c =>
            c.mentorId === activeConv.mentorId
              ? { ...c, lastMessage: text, lastTime: new Date().toISOString() }
              : c
          );
        } else {
          // Add new conversation to list
          return [{
            mentorId: activeConv.mentorId,
            mentorName: activeConv.mentorName,
            lastMessage: text,
            lastTime: new Date().toISOString(),
            studentUnreadCount: 0
          }, ...prev];
        }
      });
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

  const totalUnread = conversations.reduce((sum, c) => sum + (c.studentUnreadCount || 0), 0);

  return (
    <PageShell>
      <div className="-mx-4 -my-6 min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <section className="mb-5 flex flex-col justify-between gap-4 rounded-2xl bg-white p-7 shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-[#2c3e50]">Messages</h1>
              <p className="mt-1 text-sm text-slate-500">Connect with your mentors and get guidance.</p>
            </div>
            {totalUnread > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-bold text-[#5DD9C1]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5DD9C1] text-xs text-white">{totalUnread}</span>
                Unread message{totalUnread > 1 ? "s" : ""}
              </span>
            )}
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
            {/* Chat List Sidebar */}
            <section className="rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden h-[700px]">
              <div className="p-4 border-b-2 border-slate-100 space-y-3">
                <div className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-[#5DD9C1] focus-within:bg-white transition-all">
                  <SearchIcon />
                  <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search chats..."
                    className="w-full bg-transparent text-sm outline-none font-medium" />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowNewChatDropdown(!showNewChatDropdown)}
                    className="w-full bg-[#5DD9C1] hover:bg-[#4bcbb0] text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    New Message
                  </button>

                  {showNewChatDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 border-b border-slate-50">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Select Mentor</p>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {eligibleMentors.length > 0 ? (
                          eligibleMentors.map(m => (
                            <button key={m.id} onClick={() => startNewChat(m)} className="w-full px-4 py-3 text-left hover:bg-emerald-50 flex items-center gap-3 transition-all group">
                              <div className="h-8 w-8 rounded-full bg-emerald-100 text-[#5DD9C1] flex items-center justify-center text-[10px] font-black group-hover:bg-[#5DD9C1] group-hover:text-white transition-all">
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-bold text-slate-700 group-hover:text-[#5DD9C1]">{m.name}</span>
                            </button>
                          ))
                        ) : (
                          <p className="px-4 py-4 text-center text-xs text-slate-400 font-medium">No active mentors found. Book a session to start chatting!</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="p-10 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-100 border-t-[#5DD9C1] rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Loading Chats</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ChatBigIcon className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">No active conversations</p>
                    <p className="text-[11px] text-slate-300 mt-1">Start a chat with your mentor.</p>
                  </div>
                ) : (
                  filtered.map((c) => {
                    const initials = c.mentorName?.split(" ").map(n => n[0]).join("").toUpperCase() || "M";
                    const isUnread = (c.studentUnreadCount || 0) > 0;
                    return (
                      <button key={c.mentorId} type="button"
                        onClick={() => openConversation(c)}
                        className={`w-full flex items-center gap-3 px-4 py-5 border-b border-slate-50 text-left transition-all hover:bg-emerald-50/50 ${activeConv?.mentorId === c.mentorId ? "bg-emerald-50 border-l-4 border-l-[#5DD9C1]" : ""
                          }`}>
                        <div className="relative flex-shrink-0">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-extrabold text-white shadow-sm ${activeConv?.mentorId === c.mentorId ? "bg-[#5DD9C1]" : "bg-gradient-to-br from-slate-400 to-slate-500"
                            }`}>
                            {initials}
                          </div>
                          {isUnread && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white">
                              {c.studentUnreadCount}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm truncate ${isUnread ? "font-extrabold text-slate-900" : "font-bold text-slate-700"}`}>
                              {c.mentorName}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex-shrink-0 uppercase tracking-tighter">{formatTime(c.lastTime)}</span>
                          </div>
                          <p className={`text-xs truncate mt-0.5 ${isUnread ? "font-bold text-[#5DD9C1]" : "text-slate-400 font-medium"}`}>
                            {c.lastMessage || "No messages yet"}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            {/* Chat Window */}
            <section className="rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden h-[700px]">
              {activeConv ? (
                <>
                  <div className="flex items-center gap-4 border-b border-slate-100 px-8 py-5 bg-white">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5DD9C1] text-base font-extrabold text-white shadow-md shadow-emerald-100">
                      {activeConv.mentorName?.split(" ").map(n => n[0]).join("").toUpperCase() || "M"}
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-extrabold text-slate-800">{activeConv.mentorName}</div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Chat</span>
                      </div>
                    </div>
                    <Link to={`/mentor/profile/${activeConv.mentorId}`}
                      className="rounded-xl border-2 border-emerald-100 bg-white px-5 py-2.5 text-xs font-bold text-[#5DD9C1] transition-all hover:bg-[#5DD9C1] hover:text-white hover:border-[#5DD9C1]">
                      Mentor Profile
                    </Link>
                  </div>

                  <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5 bg-[#fbfcfd] custom-scrollbar">
                    {msgLoading ? (
                      <div className="flex flex-1 items-center justify-center flex-col gap-2">
                        <div className="w-6 h-6 border-3 border-emerald-100 border-t-[#5DD9C1] rounded-full animate-spin"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Retrieving Messages</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center flex-col gap-4 text-center opacity-40 grayscale">
                        <div className="bg-slate-100 p-8 rounded-full">
                          <ChatBigIcon className="w-12 h-12" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">Start the conversation</p>
                          <p className="text-xs font-bold text-slate-500">Say hello to {activeConv.mentorName}!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((m, idx) => {
                        const isMe = m.senderRole === "student";
                        const showTime = idx === 0 || new Date(m.createdAt) - new Date(messages[idx - 1].createdAt) > 300000;
                        return (
                          <React.Fragment key={m._id}>
                            {showTime && (
                              <div className="flex justify-center my-2">
                                <span className="bg-slate-200/50 text-[10px] font-black text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">
                                  {formatTime(m.createdAt)}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-[15px] ${isMe
                                ? "bg-[#5DD9C1] text-white rounded-br-sm shadow-lg shadow-emerald-100 font-medium"
                                : "bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100 font-medium"
                                }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                                <p className={`mt-1.5 text-[10px] font-bold text-right ${isMe ? "text-emerald-100/70" : "text-slate-400"}`}>
                                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t border-slate-100 px-8 py-6 bg-white">
                    <div className="flex items-end gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-[#5DD9C1] focus-within:bg-white transition-all">
                      <textarea
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        placeholder={`Type your message to ${activeConv.mentorName}...`}
                        className="flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] font-medium text-slate-700 outline-none"
                        style={{ maxHeight: "120px" }}
                      />
                      <button type="button" onClick={handleSend}
                        disabled={!newMsg.trim()}
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#5DD9C1] text-white transition-all hover:bg-[#4bcbb0] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-100">
                        <SendIcon />
                      </button>
                    </div>
                    <div className="mt-3 flex justify-between items-center px-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter to send • Shift+Enter for new line</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{newMsg.length} characters</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center flex-col gap-6 text-slate-400 p-10 text-center">
                  <div className="bg-slate-50 p-12 rounded-full shadow-inner">
                    <ChatBigIcon className="h-24 w-24 opacity-20" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">Your Inbox</h3>
                    <p className="text-sm font-bold text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
                      Select a conversation from the sidebar or start a new chat with one of your mentors.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewChatDropdown(true)}
                    className="bg-[#5DD9C1] text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 hover:scale-105 transition-all"
                  >
                    Start New Conversation
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-400"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>; }
function SendIcon() { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4 20-7z" /></svg>; }
function ChatBigIcon({ className }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>; }
