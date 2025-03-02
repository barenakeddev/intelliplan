import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Conversation } from '../../types';
import ConversationItem from './ConversationItem';

interface ConversationListProps {
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  activeConversationId,
  onSelectConversation
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data to match the screenshot
        const mockConversations: Conversation[] = [
          {
            id: '1',
            event_id: '1',
            name: 'Name',
            snippet: 'Supporting line text lorem...',
            last_updated: new Date().toISOString(),
            avatar: 'N',
            timestamp: '10 min'
          },
          {
            id: '2',
            event_id: '2',
            name: 'Name',
            snippet: 'Supporting line text lorem...',
            last_updated: new Date().toISOString(),
            avatar: 'N',
            timestamp: '10 min'
          },
          {
            id: '3',
            event_id: '3',
            name: 'Name',
            snippet: 'Supporting line text lorem...',
            last_updated: new Date().toISOString(),
            avatar: 'N',
            timestamp: '10 min'
          },
          {
            id: '4',
            event_id: '4',
            name: 'Name',
            snippet: 'Supporting line text lorem...',
            last_updated: new Date().toISOString(),
            avatar: 'N',
            timestamp: '10 min'
          },
          {
            id: '5',
            event_id: '5',
            name: 'Name',
            snippet: 'Supporting line text lorem...',
            last_updated: new Date().toISOString(),
            avatar: 'N',
            timestamp: '10 min'
          },
          {
            id: '6',
            event_id: '6',
            name: 'Name',
            snippet: 'Supporting line text lorem...',
            last_updated: new Date().toISOString(),
            avatar: 'N',
            timestamp: '10 min'
          },
          {
            id: '7',
            event_id: '7',
            name: 'Name',
            snippet: 'Supporting line text lorem...',
            last_updated: new Date().toISOString(),
            avatar: 'N',
            timestamp: '10 min'
          }
        ];

        setConversations(mockConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
  };

  return (
    <div className="conversations-container">
      <h2 className="conversations-title">Conversations</h2>
      <div className="conversations-list">
        {loading ? (
          <div className="loading-indicator">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="empty-state">No events yet. Create your first event!</div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeConversationId === conversation.id}
              onClick={() => handleSelectConversation(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList; 