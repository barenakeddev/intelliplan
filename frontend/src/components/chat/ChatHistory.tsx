import React, { RefObject } from 'react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: string;
}

interface ChatHistoryProps {
  messages: ChatMessage[];
  loading?: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement | null> | null;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  messages, 
  loading = false,
  messagesEndRef 
}) => {
  return (
    <div className="chat-history">
      {messages.length === 0 ? (
        <div className="chat-empty-state">
          <p>No messages yet. Start by describing your event.</p>
        </div>
      ) : (
        <div className="chat-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`chat-message ${message.sender === 'user' ? 'user-message' : 'system-message'}`}
            >
              <div className="message-content">{message.text}</div>
              <div className="message-timestamp">{message.timestamp}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-message system-message loading-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          {messagesEndRef && <div ref={messagesEndRef} />}
        </div>
      )}
    </div>
  );
};

export default ChatHistory; 