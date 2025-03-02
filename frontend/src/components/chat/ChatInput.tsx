import React, { useState } from 'react';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  loading?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  loading = false,
  placeholder = 'Type a message...',
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !loading) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
        />
        <button
          type="submit"
          className="chat-submit-button"
          disabled={!text.trim() || loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInput; 