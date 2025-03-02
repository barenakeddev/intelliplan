import React from 'react';
import { Conversation } from '../../types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  return (
    <div 
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="conversation-avatar">
        <div className="avatar-placeholder">
          <div className="avatar-icon">
            <div className="triangle"></div>
            <div className="square"></div>
            <div className="circle"></div>
          </div>
        </div>
      </div>
      <div className="conversation-details">
        <div className="conversation-name">{conversation.name}</div>
        <div className="conversation-snippet">{conversation.snippet || 'Supporting line text lorem...'}</div>
      </div>
      <div className="conversation-time">
        {conversation.timestamp || '10 min'}
      </div>
    </div>
  );
};

export default ConversationItem; 