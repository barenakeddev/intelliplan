import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { TabType, FloorplanSubTab } from '../components/layout/TabNavigation';
import HorizontalDivider from '../components/layout/HorizontalDivider';
import ChatInterface from '../components/chat/ChatInterface';
import RFPView from '../components/rfp/RFPView';
import FloorPlanEditor from '../components/floorplan/FloorPlanEditor';
import { FloorPlanProvider } from '../context/FloorPlanContext';
import ResizablePanel from '../components/layout/ResizablePanel';
import Sidebar from '../components/layout/Sidebar';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { RFP, Event } from '../types';
import { generateRFP } from '../services/api';
import SidebarToggle from '../components/layout/SidebarToggle';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('floorplan');
  const [activeSubTab, setActiveSubTab] = useState<FloorplanSubTab>('tables');
  const [eventName, setEventName] = useState<string>('Annual Tech Conference 2025');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rfpData, setRfpData] = useState<RFP | null>(null);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(id);
  const [isGeneratingRFP, setIsGeneratingRFP] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch the event details from the API
    // For now, we'll use mock data
    const fetchEventDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // If creating a new event, don't try to fetch from Supabase
        if (id === 'new') {
          setEventName('New Event');
          setShowChat(true); // Show chat for new events
          setIsLoading(false);
          return;
        }
        
        // Fetch event data from Supabase
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
        
        if (eventError) throw eventError;
        
        if (eventData) {
          setEventName(eventData.parsed_data?.eventType || 'EVENT NAME');
        }
        
        // Fetch RFP data
        const { data: rfpData, error: rfpError } = await supabase
          .from('rfps')
          .select('*')
          .eq('event_id', id)
          .maybeSingle();
        
        if (rfpError) throw rfpError;
        setRfpData(rfpData);

        // Show chat interface for existing events
        setShowChat(true);
        setActiveConversationId(id);
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleSaveRfp = async (rfpText: string) => {
    if (!id) return;
    
    try {
      if (rfpData) {
        // Update existing RFP
        const { error } = await supabase
          .from('rfps')
          .update({ rfp_text: rfpText })
          .eq('id', rfpData.id);
          
        if (error) throw error;
      } else {
        // Create new RFP
        const { error } = await supabase
          .from('rfps')
          .insert({ event_id: id, rfp_text: rfpText });
          
        if (error) throw error;
        
        // Refresh RFP data
        const { data, error: fetchError } = await supabase
          .from('rfps')
          .select('*')
          .eq('event_id', id)
          .single();
          
        if (fetchError) throw fetchError;
        setRfpData(data);
      }
    } catch (error) {
      console.error('Error saving RFP:', error);
    }
  };

  const handleGenerateRFP = async () => {
    if (!id) return;
    
    try {
      setIsGeneratingRFP(true);
      
      // Create sample event data for the corporate retreat
      const sampleEventData = {
        eventType: 'Corporate Retreat',
        numberOfGuests: 50,
        seatingStyle: 'Round Tables',
        cateringStyle: 'Buffet',
        date: '2023-10-15',
        venueSize: {
          width: 20,
          length: 30
        }
      };
      
      // Generate RFP using the API
      const response = await generateRFP(sampleEventData, id);
      
      if (response && response.rfp) {
        // Save the generated RFP
        await handleSaveRfp(response.rfp);
        
        // Refresh RFP data
        const { data, error } = await supabase
          .from('rfps')
          .select('*')
          .eq('event_id', id)
          .single();
          
        if (error) throw error;
        setRfpData(data);
      }
    } catch (error) {
      console.error('Error generating RFP:', error);
    } finally {
      setIsGeneratingRFP(false);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setShowChat(true);
  };

  const handleBackToConversations = () => {
    setShowChat(false);
  };

  const handleRfpUpdatedFromChat = async (updatedRfpText: string) => {
    if (!id) return;
    
    try {
      // Update the local state first for immediate feedback
      if (rfpData) {
        setRfpData({
          ...rfpData,
          rfp_text: updatedRfpText
        });
      } else {
        // Create a new RFP object if none exists
        setRfpData({
          id: 'new',
          event_id: id,
          rfp_text: updatedRfpText,
          created_at: new Date().toISOString()
        });
      }
      
      // Then save to the database
      await handleSaveRfp(updatedRfpText);
      
      // If we're not already on the RFP tab, switch to it to show the changes
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
    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }

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
      {showChat ? (
        <>
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
                  conversationId={activeConversationId || ''}
                  eventName={eventName}
                  onBackToConversations={handleBackToConversations}
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
        </>
      ) : (
        <div className="dashboard-container">
          <Sidebar 
            activeConversationId={activeConversationId}
            sidebarVisible={true}
          />
          <div className="dashboard-main">
            <div className="dashboard-welcome">
              <h1>Welcome to IntelliPlan</h1>
              <p>Select an event from the sidebar or create a new one to get started.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails; 