import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import TabNavigation, { TabType, FloorplanSubTab } from '../components/layout/TabNavigation';
import RFPView from '../components/rfp/RFPView';
import FloorPlanEditor from '../components/floorplan/FloorPlanEditor';
import ConversationList from '../components/conversations/ConversationList';
import ChatInterface from '../components/chat/ChatInterface';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('floorplan');
  const [activeSubTab, setActiveSubTab] = useState<FloorplanSubTab>('tables');
  const [eventName, setEventName] = useState<string>('EVENT NAME');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rfpData, setRfpData] = useState<any>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(id);

  useEffect(() => {
    // In a real app, we would fetch the event details from the API
    // For now, we'll use mock data
    const fetchEventDetails = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        setEventName('EVENT NAME');
        
        // Mock RFP data
        setRfpData({
          rfp_text: 'This is a sample RFP for ' + eventName
        });

        // If we have an ID, show the chat interface
        if (id && id !== 'new') {
          setShowChat(true);
          setActiveConversationId(id);
        } else {
          setShowChat(false);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleSaveRfp = (rfpText: string) => {
    console.log('Saving RFP:', rfpText);
    // In a real app, we would save this to the API
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setShowChat(true);
  };

  const handleBackToConversations = () => {
    setShowChat(false);
  };

  const renderTabContent = () => {
    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }

    switch (activeTab) {
      case 'rfp':
        return <RFPView rfp={rfpData} onSave={handleSaveRfp} loading={isLoading} />;
      case 'floorplan':
        return <FloorPlanEditor width={800} height={600} />;
      case 'vendors':
        return <div className="vendors-placeholder">Vendors tab content (not implemented yet)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="event-details-container">
      <div className="event-details-content">
        {showChat ? (
          <ChatInterface 
            conversationId={activeConversationId || ''}
            eventName={eventName}
            onBackToConversations={handleBackToConversations}
          />
        ) : (
          <ConversationList 
            activeConversationId={activeConversationId} 
            onSelectConversation={handleConversationSelect}
          />
        )}
        <div className="event-details-main">
          <TabNavigation 
            activeTab={activeTab} 
            onTabChange={(tab) => setActiveTab(tab)} 
            activeSubTab={activeSubTab}
            onSubTabChange={(subTab) => setActiveSubTab(subTab)}
            eventName={eventName}
          />
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 