import React from 'react';
import SidebarToggle from '../layout/SidebarToggle';

interface ChatHeaderProps {
  onBackToConversations: () => void;
  eventName?: string;
  sidebarVisible?: boolean;
  onToggleSidebar?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onBackToConversations,
  eventName,
  sidebarVisible,
  onToggleSidebar
}) => {
  return (
    <div className="chat-header">
      <button className="back-button" onClick={onBackToConversations}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <div className="chat-title">{eventName || "New chat"}</div>
      {onToggleSidebar && (
        <SidebarToggle 
          isOpen={sidebarVisible || false} 
          onToggle={onToggleSidebar} 
          variant="inline"
        />
      )}
    </div>
  );
};

export default ChatHeader; 