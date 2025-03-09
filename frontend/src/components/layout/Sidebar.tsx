import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Conversation } from '../../types';

interface SidebarProps {
  activeConversationId?: string;
  sidebarVisible?: boolean;
  onToggleSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeConversationId,
  sidebarVisible = true,
  onToggleSidebar
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
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <button 
            className="primary-button" 
            onClick={handleNewConversation}
          >
            Create New Event
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
        
        <div className="user-profile-container">
          <div className="user-profile">
            <div className="user-avatar">
              <div className="avatar-circle">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="status-badge">Pro</div>
            </div>
            <div className="user-info">
              <div className="user-name">{user?.email?.split('@')[0] || 'User'}</div>
            </div>
            <button className="settings-button" onClick={() => navigate('/settings')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;