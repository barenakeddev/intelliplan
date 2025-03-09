import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import TabNavigation, { TabType, FloorplanSubTab } from '../components/layout/TabNavigation';
import HorizontalDivider from '../components/layout/HorizontalDivider';
import ChatInterface from '../components/chat/ChatInterface';
import RFPView from '../components/rfp/RFPView';
import FloorPlanEditor from '../components/floorplan/FloorPlanEditor';
import { FloorPlanProvider } from '../context/FloorPlanContext';
import { RFP } from '../types';
import SidebarToggle from '../components/layout/SidebarToggle';

const NewEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('rfp');
  const [activeSubTab, setActiveSubTab] = useState<FloorplanSubTab>('tables');
  const [eventName, setEventName] = useState<string>('New Event');
  const [rfpData, setRfpData] = useState<RFP | null>(null);
  const [isGeneratingRFP, setIsGeneratingRFP] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const handleBackToConversations = () => {
    navigate('/dashboard');
  };

  const handleSaveRfp = async (rfpText: string) => {
    // In a real app, we would save the RFP to the database
    console.log('Saving RFP:', rfpText);
  };

  const handleRfpUpdatedFromChat = async (updatedRfpText: string) => {
    try {
      // Update the RFP data
      if (rfpData) {
        // Create a new RFP object with the updated content
        const updatedRfp: RFP = { 
          id: rfpData.id,
          event_id: 'new',
          rfp_text: updatedRfpText,
          created_at: new Date().toISOString()
        };
        setRfpData(updatedRfp);
      } else {
        // Create a new RFP object
        const newRfp: RFP = { 
          id: 'new',
          event_id: 'new',
          rfp_text: updatedRfpText,
          created_at: new Date().toISOString()
        };
        setRfpData(newRfp);
      }
      
      // Switch to RFP tab to show the updated content
      if (activeTab !== 'rfp') {
        setActiveTab('rfp');
      }
    } catch (error) {
      console.error('Error updating RFP from chat:', error);
    }
  };

  const handleTabChange = (tab: 'RFP' | 'Floorplan' | 'Vendors') => {
    setActiveTab(tab.toLowerCase() as TabType);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rfp':
        return (
          <div className="rfp-container-wrapper">
            <RFPView rfp={rfpData} onSave={handleSaveRfp} loading={isGeneratingRFP} />
            <div className="rfp-actions">
              <button 
                className="open-rfp-editor-button"
                onClick={() => console.log('Open RFP Editor')}
              >
                Open Full RFP Editor
              </button>
            </div>
          </div>
        );
      case 'floorplan':
        return (
          <FloorPlanProvider>
            <div className="floorplan-container">
              <FloorPlanEditor width={800} height={600} />
            </div>
          </FloorPlanProvider>
        );
      case 'vendors':
        return <div className="vendors-placeholder">Vendors tab content (not implemented yet)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="new-event-container">
      <div className={`chat-sidebar ${!sidebarVisible ? 'hidden' : ''}`}>
        <ChatInterface 
          conversationId="new"
          eventName={eventName}
          onBackToConversations={handleBackToConversations}
          rfp={rfpData}
          onRfpUpdated={handleRfpUpdatedFromChat}
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
      
      <div className={`main-content-with-chat ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
        <Header 
          title={eventName} 
          showBackButton={true} 
          activeTab={activeTab === 'rfp' ? 'RFP' : activeTab === 'floorplan' ? 'Floorplan' : 'Vendors'}
          onTabChange={handleTabChange}
        />
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={(tab) => setActiveTab(tab as TabType)}
          activeSubTab={activeSubTab}
          onSubTabChange={(subTab) => setActiveSubTab(subTab as FloorplanSubTab)}
          eventName={eventName}
        />
        <HorizontalDivider />
        <div className="event-details-main">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default NewEventPage; 