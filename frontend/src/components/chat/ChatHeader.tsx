import React from 'react';

interface ChatHeaderProps {
  onBackToConversations: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onBackToConversations }) => {
  return (
    <div className="chat-header">
      <button className="back-button" onClick={onBackToConversations}>
        &larr; Back
      </button>
      <h2 className="mb-10 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black">
        What can I help you plan?
      </h2>
    </div>
  );
};

export default ChatHeader; 