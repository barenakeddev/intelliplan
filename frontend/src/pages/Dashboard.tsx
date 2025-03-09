import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import { useNavigate } from 'react-router-dom';
import SidebarToggle from '../components/layout/SidebarToggle';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Mock data for conversations
  const conversations = [
    {
      id: '1',
      name: 'Corporate Retreat',
      snippet: 'Planning a team-building event for 50 people',
      timestamp: '10 min',
      avatar: '🏢'
    },
    {
      id: '2',
      name: 'Wedding Reception',
      snippet: 'Elegant venue for 150 guests with catering',
      timestamp: '1 hour',
      avatar: '💍'
    },
    {
      id: '3',
      name: 'Tech Conference',
      snippet: 'Venue with AV equipment for 200 attendees',
      timestamp: '2 days',
      avatar: '💻'
    }
  ];

  const handleConversationClick = (id: string) => {
    navigate(`/event/${id}`);
  };

  const handleNewConversation = () => {
    // In a real app, we would create a new conversation in the database
    // and then navigate to it
    navigate('/event/new');
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${!sidebarVisible ? 'hidden' : ''}`}>
        <Sidebar 
          sidebarVisible={sidebarVisible}
          onToggleSidebar={toggleSidebar}
        />
      </div>
      
      {/* Floating toggle button that stays visible even when sidebar is hidden */}
      <div className="floating-sidebar-toggle">
        <SidebarToggle 
          isOpen={sidebarVisible} 
          onToggle={toggleSidebar} 
          variant="inline"
        />
      </div>
      
      <div className={`main-content ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
        <Header 
          title="IntelliPlan Dashboard" 
          showBackButton={false}
        />
        <div className="dashboard-main">
          <div className="dashboard-welcome">
            <h1>Welcome to IntelliPlan</h1>
            <p>Your AI-powered event planning assistant</p>
          </div>
          
          <div className="dashboard-actions">
            <button 
              className="primary-button"
              onClick={handleNewConversation}
            >
              Create New Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 