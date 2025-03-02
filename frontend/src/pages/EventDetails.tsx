import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import TabNavigation from '../components/layout/TabNavigation';
import RFPView from '../components/rfp/RFPView';
import FloorPlanEditor from '../components/floorplan/FloorPlanEditor';

type TabType = 'rfp' | 'floorplan' | 'vendors';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('rfp');
  const [eventName, setEventName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rfpData, setRfpData] = useState<any>(null);

  useEffect(() => {
    // In a real app, we would fetch the event details from the API
    // For now, we'll use mock data
    const fetchEventDetails = async () => {
      setIsLoading(true);
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        if (id === 'new') {
          setEventName('New Event');
        } else if (id === '1') {
          setEventName('Corporate Retreat');
        } else if (id === '2') {
          setEventName('Wedding Reception');
        } else if (id === '3') {
          setEventName('Tech Conference');
        } else {
          setEventName(`Event ${id}`);
        }

        // Mock RFP data
        setRfpData({
          rfp_text: 'This is a sample RFP for ' + eventName
        });
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, eventName]);

  const handleSaveRfp = (rfpText: string) => {
    console.log('Saving RFP:', rfpText);
    // In a real app, we would save this to the API
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
      <Header />
      <div className="event-details-content">
        <Sidebar activeConversationId={id} />
        <div className="event-details-main">
          <h1 className="event-name">{eventName}</h1>
          <TabNavigation 
            activeTab={activeTab} 
            onTabChange={(tab) => setActiveTab(tab as TabType)} 
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