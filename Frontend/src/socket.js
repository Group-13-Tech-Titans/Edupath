import { io } from "socket.io-client";
import { API_BASE } from "./api/client.js";

let socket = null;

// Pending event listeners queued before the socket was ready
const pendingListeners = []; // [{ event, cb }]

export const initiateSocketConnection = (userId) => {
  // Avoid re-connecting if already connected for the same user
  if (socket && socket.connected) return;

  socket = io(API_BASE, {
    transports: ["websocket"],
    query: { userId },
  });

  console.log(`Connecting socket for user: ${userId}`);

  socket.on("connect", () => {
    socket.emit("join_room", userId);
    console.log(`Joined room: ${userId}`);

    // Flush any listeners registered before the socket was ready
    pendingListeners.forEach(({ event, cb }) => {
      socket.on(event, cb);
    });
    pendingListeners.length = 0;
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

let messageCallbacks = [];

export const subscribeToMessages = (cb) => {
  messageCallbacks.push(cb);

  if (socket) {
    if (messageCallbacks.length === 1) {
      socket.on("receive_message", (msg) => {
        console.log("Socket message received:", msg);
        messageCallbacks.forEach((callback) => callback(msg));
      });
    }
  } else {
    pendingListeners.push({
      event: "receive_message",
      cb: (msg) => messageCallbacks.forEach((c) => c(msg)),
    });
  }
};

export const unsubscribeFromMessages = (cb) => {
  messageCallbacks = messageCallbacks.filter((callback) => callback !== cb);
  if (messageCallbacks.length === 0 && socket) {
    socket.off("receive_message");
  }
};

/**
 * Generic subscribe/unsubscribe for any custom socket event.
 * Safe to call before the socket is initialized — queued and flushed on connect.
 */
export const subscribeToEvent = (event, cb) => {
  if (socket) {
    socket.on(event, cb);
  } else {
    pendingListeners.push({ event, cb });
  }
};

export const unsubscribeFromEvent = (event, cb) => {
  if (socket) {
    if (cb) socket.off(event, cb);
    else socket.off(event);
  }
  const idx = pendingListeners.findIndex((l) => l.event === event && l.cb === cb);
  if (idx !== -1) pendingListeners.splice(idx, 1);
};

export const getSocket = () => socket;

export default socket;
