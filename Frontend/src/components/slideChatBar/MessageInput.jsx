import React from "react";
import { Send } from "lucide-react";

export default function MessageInput({ currentMessage, setCurrentMessage, sendMessage, handleKeyPress }) {
  return (
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
        <Send className="w-5 h-5 ml-0.5" />
      </button>
    </div>
  );
}