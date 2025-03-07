import React from 'react';
import ChatInterface from './ChatInterface';
import ConversationList from '../conversations/ConversationList';

interface CombinedChatPanelProps {
  showChat: boolean;
  conversationId: string;
  eventName: string;
  onBackToConversations: () => void;
  rfp: any;
  onRfpUpdated: (text: string) => Promise<void>;
  onSelectConversation: (id: string) => void;
  activeConversationId?: string;
}

const CombinedChatPanel: React.FC<CombinedChatPanelProps> = ({
  showChat,
  conversationId,
  eventName,
  onBackToConversations,
  rfp,
  onRfpUpdated,
  onSelectConversation,
  activeConversationId
}) => {
  return (
    <div className="combined-chat-panel">
      {showChat ? (
        <ChatInterface 
          conversationId={conversationId}
          eventName={eventName}
          onBackToConversations={onBackToConversations}
          rfp={rfp}
          onRfpUpdated={onRfpUpdated}
        />
      ) : (
        <ConversationList 
          onSelectConversation={onSelectConversation}
          activeConversationId={activeConversationId}
        />
      )}
    </div>
  );
};

export default CombinedChatPanel; 