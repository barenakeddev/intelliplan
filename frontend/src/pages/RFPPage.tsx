import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { RFP, ParsedEventData, Event } from '../types';
import RFPEditor from '../components/rfp/RFPEditor';
import RFPView from '../components/rfp/RFPView';
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
  const [error, setError] = useState<string | null>(null);

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

  if (loading && !rfp && !event) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="rfp-page">
      <div className="rfp-page-header">
        <h1>{event?.parsed_data.eventType || 'Event'} RFP</h1>
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
      
      {!rfp && !generating && (
        <div className="rfp-empty-state">
          <p>No RFP has been generated yet. Click the "Generate RFP" button to create one based on the event details.</p>
        </div>
      )}
      
      {generating && (
        <div className="rfp-generating">
          <p>Generating RFP based on event details...</p>
        </div>
      )}
    </div>
  );
};

export default RFPPage; 