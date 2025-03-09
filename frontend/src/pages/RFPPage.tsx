import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { RFP, Event } from '../types';
import RFPEditor from '../components/rfp/RFPEditor';
import RFPEditorV2 from '../components/rfp/RFPEditorV2';
import RFPView from '../components/rfp/RFPView';
import Sidebar from '../components/layout/Sidebar';
import { generateRFP, modifyRFPWithAI } from '../services/api';
import '../styles/rfp.css';

const RFPPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [rfp, setRfp] = useState<RFP | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [useNewEditor, setUseNewEditor] = useState(true); // Set to true to use the new editor by default
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'RFP' | 'Floorplan' | 'Vendors'>('RFP');
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    if (!user || !eventId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch event data
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();
        
        if (eventError) throw eventError;
        setEvent(eventData);
        
        // Fetch RFP data
        const { data: rfpData, error: rfpError } = await supabase
          .from('rfps')
          .select('*')
          .eq('event_id', eventId)
          .maybeSingle();
        
        if (rfpError) throw rfpError;
        setRfp(rfpData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load RFP data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, eventId]);

  const handleGenerateRFP = async () => {
    if (!event || !eventId || !user) return;
    
    try {
      setGenerating(true);
      setError(null);
      
      // Generate RFP using the API
      const response = await generateRFP(event.parsed_data, eventId, user.id);
      
      // Save to Supabase
      if (rfp) {
        // Update existing RFP
        const { data, error } = await supabase
          .from('rfps')
          .update({ rfp_text: response.rfp })
          .eq('id', rfp.id)
          .select()
          .single();
          
        if (error) throw error;
        setRfp(data);
      } else {
        // Create new RFP
        const { data, error } = await supabase
          .from('rfps')
          .insert({
            event_id: eventId,
            rfp_text: response.rfp
          })
          .select()
          .single();
          
        if (error) throw error;
        setRfp(data);
      }
      
    } catch (error) {
      console.error('Error generating RFP:', error);
      setError('Failed to generate RFP');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRFP = async (rfpText: string) => {
    if (!rfp || !eventId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('rfps')
        .update({ rfp_text: rfpText })
        .eq('id', rfp.id)
        .select()
        .single();
        
      if (error) throw error;
      setRfp(data);
      setIsEditMode(false);
      
    } catch (error) {
      console.error('Error saving RFP:', error);
      setError('Failed to save RFP');
    } finally {
      setLoading(false);
    }
  };

  const handleAIPrompt = async (prompt: string): Promise<string> => {
    if (!rfp || !user) return '';
    
    try {
      return await modifyRFPWithAI(rfp.rfp_text, prompt, eventId, user.id, rfp.id);
    } catch (error) {
      console.error('Error processing AI prompt:', error);
      throw new Error('Failed to process AI prompt');
    }
  };

  const handleTabChange = (tab: 'RFP' | 'Floorplan' | 'Vendors') => {
    setActiveTab(tab);
    // In a real app, you would navigate to the appropriate page
    if (tab !== 'RFP' && eventId) {
      navigate(`/event/${eventId}`);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  if (loading && !rfp && !event) {
    return <div className="loading">Loading...</div>;
  }

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
              className={`header-tab ${activeTab === 'RFP' ? 'active' : ''}`}
              onClick={() => handleTabChange('RFP')}
            >
              RFP
            </button>
            <button 
              className={`header-tab ${activeTab === 'Floorplan' ? 'active' : ''}`}
              onClick={() => handleTabChange('Floorplan')}
            >
              Floorplan
            </button>
            <button 
              className={`header-tab ${activeTab === 'Vendors' ? 'active' : ''}`}
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
      
      <div className="rfp-page-content">
        <div className={`sidebar ${!sidebarVisible ? 'hidden' : ''}`}>
          <Sidebar
            activeConversationId={eventId}
            sidebarVisible={sidebarVisible}
            onToggleSidebar={toggleSidebar}
          />
        </div>
        
        <div className={`main-content ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
          {useNewEditor ? (
            <RFPEditorV2
              rfp={rfp}
              eventData={event?.parsed_data || null}
              eventName={event?.parsed_data?.eventType || 'Event'}
              onSave={handleSaveRFP}
              onAIPrompt={handleAIPrompt}
              loading={loading || generating}
            />
          ) : (
            <>
              <div className="rfp-page-header">
                <h1>{event?.parsed_data?.eventType || 'Event'} RFP</h1>
                <div className="rfp-actions">
                  {!rfp && (
                    <button 
                      className="generate-rfp-button" 
                      onClick={handleGenerateRFP}
                      disabled={generating}
                    >
                      {generating ? 'Generating...' : 'Generate RFP'}
                    </button>
                  )}
                  
                  {rfp && !isEditMode && (
                    <button 
                      className="edit-rfp-button" 
                      onClick={() => setIsEditMode(true)}
                    >
                      Edit RFP
                    </button>
                  )}
                  
                  {rfp && isEditMode && (
                    <button 
                      className="view-rfp-button" 
                      onClick={() => setIsEditMode(false)}
                    >
                      View RFP
                    </button>
                  )}
                  
                  <button 
                    className="toggle-editor-button" 
                    onClick={() => setUseNewEditor(true)}
                  >
                    Use New Editor
                  </button>
                </div>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              {rfp && !isEditMode && (
                <RFPView 
                  rfp={rfp} 
                  onSave={handleSaveRFP} 
                  loading={loading} 
                />
              )}
              
              {isEditMode && (
                <RFPEditor 
                  rfp={rfp} 
                  eventData={event?.parsed_data || null}
                  onSave={handleSaveRFP}
                  onAIPrompt={handleAIPrompt}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RFPPage; 