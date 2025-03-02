import React, { useState } from 'react';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  loading: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  loading,
  placeholder = 'Describe your event...',
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !loading) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit}>
        <textarea
          className="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          rows={3}
        />
        <button
          type="submit"
          className="chat-submit-button"
          disabled={!text.trim() || loading}
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default ChatInput; 