import React, { useState, useEffect } from 'react';
import { RFP, ParsedEventData } from '../../types';
import RichTextEditor from './RichTextEditor';
import ChatAssistant from './ChatAssistant';
import HorizontalDivider from '../layout/HorizontalDivider';

interface RFPEditorV2Props {
  rfp: RFP | null;
  eventData: ParsedEventData | null;
  eventName: string;
  onSave: (rfpText: string) => void;
  onAIPrompt: (prompt: string) => Promise<string>;
  loading: boolean;
}

const RFPEditorV2: React.FC<RFPEditorV2Props> = ({
  rfp,
  eventData,
  eventName,
  onSave,
  onAIPrompt,
  loading
}) => {
  const [rfpContent, setRfpContent] = useState(rfp?.rfp_text || '');

  useEffect(() => {
    if (rfp) {
      setRfpContent(rfp.rfp_text);
    }
  }, [rfp]);

  const handleSaveRFP = () => {
    onSave(rfpContent);
  };

  const handleChatMessage = async (message: string) => {
    try {
      const updatedRfp = await onAIPrompt(message);
      setRfpContent(updatedRfp);
      return updatedRfp;
    } catch (error) {
      console.error('Error processing chat message:', error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="rfp-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Chat Panel - Left sidebar */}
      <div className="w-1/3 min-w-[300px] max-w-[400px] border-r h-full flex flex-col overflow-hidden">
        <ChatAssistant 
          rfpName={eventName} 
          onSendMessage={handleChatMessage}
        />
      </div>

      {/* Main Content Panel - Right side */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="relative p-4 flex justify-between items-center">
          <h2 className="text-lg font-medium">Request for Proposal</h2>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            onClick={handleSaveRFP}
            disabled={loading}
          >
            Save RFP
          </button>
        </div>
        <HorizontalDivider />
        
        {/* RFP Editor */}
        <div className="flex-1 overflow-auto">
          <RichTextEditor 
            content={rfp?.rfp_text || ''}
            onChange={setRfpContent}
            placeholder="Start writing your RFP..."
            editorType="rfp"
          />
        </div>
      </div>
    </div>
  );
};

export default RFPEditorV2; 