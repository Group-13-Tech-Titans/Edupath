import React from "react";
import { MessageSquare } from "lucide-react";

export default function MessageList({ messages, currentUser }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-70">
          <MessageSquare className="w-12 h-12 mb-2" strokeWidth={1.5} />
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
  );
}