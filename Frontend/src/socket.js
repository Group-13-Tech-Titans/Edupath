import { io } from "socket.io-client";
import { API_BASE } from "./api/client.js";

let socket;

export const initiateSocketConnection = (userId) => {
  socket = io(API_BASE, {
    transports: ["websocket"],
    query: { userId },
  });
  console.log(`Connecting socket for user: ${userId}`);
  
  socket.on("connect", () => {
    socket.emit("join_room", userId);
    console.log(`Joined room: ${userId}`);
  });
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

let messageCallbacks = [];

export const subscribeToMessages = (cb) => {
  if (!socket) return;
  messageCallbacks.push(cb);
  
  // Attach only once
  if (messageCallbacks.length === 1) {
    socket.on("receive_message", (msg) => {
      console.log("Socket message received:", msg);
      messageCallbacks.forEach(callback => callback(msg));
    });
  }
};

export const unsubscribeFromMessages = (cb) => {
  messageCallbacks = messageCallbacks.filter(callback => callback !== cb);
  if (messageCallbacks.length === 0 && socket) {
    socket.off("receive_message");
  }
};

export default socket;
