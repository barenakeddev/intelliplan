import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import TabNavigation, { TabType, FloorplanSubTab } from '../components/layout/TabNavigation';
import HorizontalDivider from '../components/layout/HorizontalDivider';
import ResizablePanel from '../components/layout/ResizablePanel';
import RFPView from '../components/rfp/RFPView';
import FloorPlanEditor from '../components/floorplan/FloorPlanEditor';
import ConversationList from '../components/conversations/ConversationList';
import ChatInterface from '../components/chat/ChatInterface';
import CombinedChatPanel from '../components/chat/CombinedChatPanel';
import SidebarToggle from '../components/layout/SidebarToggle';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { RFP } from '../types';
import { generateRFP } from '../services/api';
import { FloorPlanProvider } from '../context/FloorPlanContext';
import Sidebar from '../components/layout/Sidebar';

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

  const handleOpenRFPEditor = () => {
    if (id) {
      navigate(`/event/${id}/rfp`);
    }
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
        return (
          <div className="rfp-container-wrapper">
            <RFPView rfp={rfpData} onSave={handleSaveRfp} loading={isGeneratingRFP} />
            <div className="rfp-actions">
              <button 
                className="open-rfp-editor-button"
                onClick={handleOpenRFPEditor}
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
    <div className="event-details-container">
      <div className={`sidebar ${!sidebarVisible ? 'hidden' : ''}`}>
        <Sidebar 
          activeConversationId={id} 
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
          <ResizablePanel
            leftPanel={
              <ChatInterface 
                conversationId={id || ''}
                eventName={eventName}
                onBackToConversations={handleBackToConversations}
                rfp={rfpData}
                onRfpUpdated={handleRfpUpdatedFromChat}
              />
            }
            rightPanel={renderTabContent()}
            initialLeftWidth={35}
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 