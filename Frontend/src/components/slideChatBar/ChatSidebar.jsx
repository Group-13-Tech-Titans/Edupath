import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

// Import Refactored Components
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

// Initialize socket connection
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

export default function ChatSidebar({ isOpen, onClose, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        author: currentUser?.name || "Admin",
        text: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* Background Overlay */}
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
        {/* 1. Header Component */}
        <ChatHeader onClose={onClose} />

        {/* 2. Message List Component */}
        <MessageList messages={messages} currentUser={currentUser} />

        {/* 3. Message Input Component */}
        <MessageInput 
          currentMessage={currentMessage} 
          setCurrentMessage={setCurrentMessage} 
          sendMessage={sendMessage} 
          handleKeyPress={handleKeyPress} 
        />
      </div>
    </>
  );
}