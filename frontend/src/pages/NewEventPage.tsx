import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabType, FloorplanSubTab } from '../components/layout/TabNavigation';
import ChatInterface from '../components/chat/ChatInterface';
import RFPView from '../components/rfp/RFPView';
import FloorPlanEditor from '../components/floorplan/FloorPlanEditor';
import { FloorPlanProvider } from '../context/FloorPlanContext';
import { RFP } from '../types';
import ResizablePanel from '../components/layout/ResizablePanel';

const NewEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('rfp');
  const [activeSubTab, setActiveSubTab] = useState<FloorplanSubTab>('tables');
  const [eventName, setEventName] = useState<string>('New Event');
  const [rfpData, setRfpData] = useState<RFP | null>(null);
  const [isGeneratingRFP, setIsGeneratingRFP] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

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
        return <RFPView rfp={rfpData} onSave={handleSaveRfp} loading={isGeneratingRFP} />;
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
    <div className="app-container">
      <header className="app-header">
        <div className="header-container">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate(-1)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"></path>
              </svg>
            </button>
            <div className="app-logo">IntelliPlan</div>
          </div>
          <div className="header-tabs">
            <button 
              className={`header-tab ${activeTab === 'rfp' ? 'active' : ''}`}
              onClick={() => handleTabChange('RFP')}
            >
              RFP
            </button>
            <button 
              className={`header-tab ${activeTab === 'floorplan' ? 'active' : ''}`}
              onClick={() => handleTabChange('Floorplan')}
            >
              Floorplan
            </button>
            <button 
              className={`header-tab ${activeTab === 'vendors' ? 'active' : ''}`}
              onClick={() => handleTabChange('Vendors')}
            >
              Vendors
            </button>
          </div>
          <div className="header-right">
            <button className="profile-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"></path>
              </svg>
            </button>
          </div>
        </div>
        <div className="horizontal-divider"></div>
      </header>

      <ResizablePanel
        leftPanel={
          <div className={`chat-sidebar ${!sidebarVisible ? 'hidden' : ''}`}>
            <ChatInterface 
              conversationId="new"
              eventName={eventName}
              onBackToConversations={() => {}}
              rfp={rfpData}
              onRfpUpdated={handleRfpUpdatedFromChat}
              sidebarVisible={sidebarVisible}
              onToggleSidebar={toggleSidebar}
            />
          </div>
        }
        rightPanel={
          <div className="main-content">
            <div className="tab-content">
              {renderTabContent()}
            </div>
          </div>
        }
        initialLeftWidth={30}
        minLeftWidth={20}
        maxLeftWidth={60}
        sidebarVisible={sidebarVisible}
        onToggleSidebar={toggleSidebar}
      />
    </div>
  );
};

export default NewEventPage; 