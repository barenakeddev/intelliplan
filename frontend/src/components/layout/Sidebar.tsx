import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Conversation } from '../../types';

interface SidebarProps {
  activeConversationId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeConversationId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        // Fetch conversations from Supabase
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            event_id,
            last_updated,
            snippet,
            events (
              id,
              parsed_data
            )
          `)
          .order('last_updated', { ascending: false });

        if (error) throw error;

        // Transform data to match Conversation type
        if (data) {
          const transformedData: Conversation[] = data.map((conv: any) => {
            const eventName = conv.events?.parsed_data?.eventType || 'Untitled Event';
            return {
              id: conv.id,
              event_id: conv.event_id,
              last_updated: conv.last_updated,
              snippet: conv.snippet,
              name: eventName,
              avatar: eventName.charAt(0).toUpperCase(),
              timestamp: formatTime(conv.last_updated)
            };
          });

          setConversations(transformedData);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  const handleNewConversation = () => {
    navigate('/new-event');
  };

  const handleSelectConversation = (id: string) => {
    navigate(`/event/${id}`);
  };

  // Format timestamp to relative time (e.g., "10 min")
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    } else if (diffMins < 1440) {
      return `${Math.round(diffMins / 60)} hr`;
    } else {
      return `${Math.round(diffMins / 1440)} day`;
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="new-conversation-button" onClick={handleNewConversation}>
          New Event
        </button>
      </div>
      <div className="conversation-list">
        {loading ? (
          <div className="loading-indicator">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="empty-state">No events yet. Create your first event!</div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${activeConversationId === conversation.id ? 'active' : ''}`}
              onClick={() => handleSelectConversation(conversation.id)}
            >
              <div className="conversation-icon">
                {conversation.avatar}
              </div>
              <div className="conversation-details">
                <div className="conversation-name">{conversation.name}</div>
                <div className="conversation-snippet">{conversation.snippet}</div>
              </div>
              <div className="conversation-time">
                {conversation.timestamp}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;