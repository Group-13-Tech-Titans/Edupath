import React from "react";
import { X } from "lucide-react";

export default function ChatHeader({ onClose }) {
  return (
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
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}