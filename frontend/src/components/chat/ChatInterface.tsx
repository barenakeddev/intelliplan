import React, { useState, useEffect, useRef } from 'react';
import { parseDescription, modifyRFPWithAI, extractInfoFromMessage } from '../../services/api';
import { RFP } from '../../types';

interface ChatInterfaceProps {
  conversationId: string;
  eventName: string;
  onBackToConversations: () => void;
  rfp: RFP | null;
  onRfpUpdated: (rfpText: string) => void;
}

// Define the structure for collected event information
interface EventInfo {
  eventType?: string;
  numberOfGuests?: number;
  preferredDate?: string;
  alternativeDates?: string[];
  datesFlexible?: boolean;
  venueRequirements?: {
    rooms?: Array<{
      function: string;
      spaceRequired?: string;
      seatingArrangement?: string;
      attendees?: number;
      accessibility?: string;
    }>;
  };
  cateringRequirements?: {
    mealPeriods?: string[];
    serviceStyle?: string;
  };
  avRequirements?: {
    equipment?: string[];
    technicalNeeds?: string;
  };
  contactInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  additionalInfo?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  eventName,
  onBackToConversations,
  rfp,
  onRfpUpdated
}) => {
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'assistant' }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [collectedInfo, setCollectedInfo] = useState<EventInfo>({});
  const [rfpGenerated, setRfpGenerated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial assistant message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          text: "Welcome to IntelliPlan! I'm your event planning assistant. Please tell me about your event, and I'll help you create a Request for Proposal (RFP). You can start by telling me what type of event you're planning.",
          sender: 'assistant'
        }
      ]);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Determine what information is still needed based on event type
  const getNextQuestion = (info: EventInfo): string => {
    // Check for basic information first
    if (!info.eventType) {
      return "What type of event are you planning? (e.g., wedding, conference, corporate meeting, trade show)";
    }
    
    if (!info.numberOfGuests) {
      return "How many guests or attendees are you expecting?";
    }
    
    if (!info.preferredDate) {
      return "What is your preferred date for the event?";
    }
    
    if (info.preferredDate && info.datesFlexible === undefined) {
      return "Are your dates flexible? If so, what alternative dates would work?";
    }
    
    // Event-specific questions
    const eventType = info.eventType.toLowerCase();
    
    // Check venue requirements
    if (!info.venueRequirements || !info.venueRequirements.rooms || info.venueRequirements.rooms.length === 0) {
      if (eventType.includes('wedding')) {
        return "What spaces will you need for your wedding? (e.g., ceremony space, reception area, cocktail hour space)";
      } else if (eventType.includes('conference') || eventType.includes('meeting')) {
        return "What meeting spaces will you need? (e.g., main conference room, breakout rooms, exhibition space)";
      } else if (eventType.includes('trade show')) {
        return "What are your exhibition space requirements? Do you need any additional meeting rooms?";
      } else {
        return "What spaces or rooms will you need for your event?";
      }
    }
    
    // Check catering requirements
    if (!info.cateringRequirements || !info.cateringRequirements.serviceStyle) {
      if (eventType.includes('wedding')) {
        return "What type of catering service would you prefer for your wedding? (e.g., plated dinner, buffet, stations)";
      } else if (eventType.includes('conference')) {
        return "What food and beverage services will you need? (e.g., coffee breaks, lunch, reception)";
      } else {
        return "What are your catering requirements for this event?";
      }
    }
    
    // Check AV requirements
    if (!info.avRequirements || !info.avRequirements.equipment) {
      if (eventType.includes('conference') || eventType.includes('meeting')) {
        return "What audio/visual equipment will you need? (e.g., projectors, microphones, video conferencing)";
      } else if (eventType.includes('wedding')) {
        return "Will you need any audio/visual equipment for your wedding? (e.g., microphones, speakers, projector for slideshows)";
      } else {
        return "What audio/visual requirements do you have for your event?";
      }
    }
    
    // If we have all the essential information, ask for any additional details
    if (!info.additionalInfo) {
      return "Is there anything else you'd like to include in your RFP? Any special requirements or additional information?";
    }
    
    // If we have all the information, suggest generating the RFP
    return "I think I have all the information I need. Would you like me to generate your RFP now?";
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add user message to chat
    const userMessage = { text: newMessage, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Process the user's message to extract information
      let updatedInfo = collectedInfo;
      let assistantResponse = "";
      
      try {
        const response = await extractInfoFromMessage(newMessage, collectedInfo, conversationId);
        
        if (response && response.updatedInfo) {
          // Update the collected information
          updatedInfo = response.updatedInfo;
          setCollectedInfo(updatedInfo);
        }
      } catch (error) {
        console.error('Error extracting information:', error);
        // Continue with existing information if API fails
      }
      
      // Check if the user is asking to generate the RFP
      const generateKeywords = ['generate rfp', 'create rfp', 'make rfp', 'build rfp'];
      const shouldGenerateRFP = generateKeywords.some(keyword => 
        newMessage.toLowerCase().includes(keyword)
      ) || (newMessage.toLowerCase().includes('yes') && 
        messages.length > 0 && messages[messages.length - 1].text.includes('generate your RFP now'));
      
      if (shouldGenerateRFP || 
          (updatedInfo.eventType && 
           updatedInfo.numberOfGuests && 
           updatedInfo.preferredDate && 
           updatedInfo.venueRequirements && 
           updatedInfo.cateringRequirements)) {
        
        // We have enough information to generate the RFP
        assistantResponse = "Great! I'm generating your RFP based on the information you've provided.";
        
        try {
          // Generate the RFP
          const rfpResponse = await modifyRFPWithAI(
            "",
            `Create a detailed RFP based on this information: ${JSON.stringify(updatedInfo, null, 2)}`,
            conversationId
          );
          
          if (rfpResponse && rfpResponse.modifiedRFP) {
            onRfpUpdated(rfpResponse.modifiedRFP);
            setRfpGenerated(true);
            
            // Add a follow-up message after a short delay
            setTimeout(() => {
              setMessages(prev => [
                ...prev,
                { 
                  text: "I've created your RFP! You can view it in the RFP tab. Is there anything specific you'd like to modify or add to it?", 
                  sender: 'assistant' 
                }
              ]);
            }, 1500);
          } else {
            assistantResponse = "I'm having trouble generating the RFP. Let's continue gathering information.";
          }
        } catch (error) {
          console.error('Error generating RFP:', error);
          assistantResponse = "I'm having trouble generating the RFP right now. Let's continue gathering information.";
        }
      } else {
        // Ask the next relevant question
        assistantResponse = getNextQuestion(updatedInfo);
      }

      // Add assistant response to chat
      setMessages(prev => [...prev, { text: assistantResponse, sender: 'assistant' }]);
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [
        ...prev,
        { 
          text: "I'm sorry, I encountered an error processing your request. Please try again.",
          sender: 'assistant'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <button className="back-button" onClick={onBackToConversations}>
          &larr; Back
        </button>
        <h2>{eventName}</h2>
      </div>
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-content">{message.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input-container">
        <textarea
          className="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
        />
        <button 
          className="send-button" 
          onClick={handleSendMessage}
          disabled={isLoading || !newMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface; 