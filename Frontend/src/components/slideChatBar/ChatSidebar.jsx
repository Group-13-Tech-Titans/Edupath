import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Initialize socket connection to the backend server
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

export default function ChatSidebar({ isOpen, onClose, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    // Listen for incoming messages from the backend
    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup function to remove the event listener when component unmounts
    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        author: currentUser?.name || "Admin",
        text: currentMessage,
        // Format time to HH:MM AM/PM
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Send the message data to the backend
      await socket.emit("send_message", messageData);
      
      // Clear the input field after sending
      setCurrentMessage("");
    }
  };

  // Handle Enter key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* Background Overlay: Closes the sidebar when clicked outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm transition-opacity" 
          onClick={onClose} 
        ></div>
      )}

      {/* Slide-in Sidebar Container */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-slate-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Chat Header */}
        <div className="bg-emerald-600 text-white p-4 flex justify-between items-center shadow-md z-10">
          <div>
            <h2 className="font-bold text-lg">Admin Support Chat</h2>
            <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
              Live Group Chat
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-emerald-200 bg-emerald-700/50 hover:bg-emerald-700 rounded-full w-8 h-8 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Message Display Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-70">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
              </svg>
              <p className="text-sm font-medium">No messages yet.</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              // Determine if the message was sent by the current user
              const isMe = msg.author === (currentUser?.name || "Admin");
              
              return (
                <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <span className="text-[10px] font-semibold text-slate-400 mb-1 mx-1">
                    {msg.author} • {msg.time}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                    isMe 
                      ? "bg-emerald-500 text-white rounded-tr-sm" 
                      : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 flex gap-2 items-center">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 border-transparent rounded-full px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
          />
          <button 
            onClick={sendMessage}
            disabled={currentMessage.trim() === ""}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white w-10 h-10 rounded-full flex items-center justify-center transition shadow-md shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}