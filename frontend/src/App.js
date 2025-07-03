
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css"


const socket = io("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [toUser, setToUser] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.on("privateMessage", (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.off("privateMessage");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const joinChat = () => {
    if (username) {
      socket.emit("join", username);
    }
  };

  const sendMessage = () => {
    if (username && toUser && message) {
      socket.emit("privateMessage", {
        to: toUser,
        from: username,
        message
      });
      setMessage("");
    }
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="header">
          <div className="header-content">
            <h1 className="title">
              <span className="lock-icon">🔐</span>
              Private Chat
            </h1>
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>

        <div className="input-section">
          <div className="input-group">
            <input
              className="input-field username-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={joinChat}
            />
            <input
              className="input-field recipient-input"
              placeholder="Send to user"
              value={toUser}
              onChange={(e) => setToUser(e.target.value)}
            />
          </div>
          <div className="message-input-container">
            <input
              className="input-field message-input"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="send-button" onClick={sendMessage}>
              <span className="send-icon">📤</span>
            </button>
          </div>
        </div>

        <div className="chat-section">
          <div className="chat-header">
            <h3>💬 Messages</h3>
          </div>
          <div className="chat-messages">
            {chat.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">💭</span>
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              chat.map((c, index) => (
                <div key={index} className={`message ${c.from === username ? 'sent' : 'received'}`}>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender">{c.from}</span>
                      <span className="timestamp">{c.time}</span>
                    </div>
                    <div className="message-text">{c.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </div>
       );
}

export default App;