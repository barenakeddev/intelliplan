import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatHistory, { ChatMessage } from './ChatHistory';
import ChatInput from './ChatInput';

interface ChatInterfaceProps {
  conversationId: string;
  eventName: string;
  onBackToConversations: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversationId,
  eventName,
  onBackToConversations,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history for this conversation
    const loadChatHistory = async () => {
      setLoading(true);
      try {
        // In a real app, fetch messages from API
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock messages
        const mockMessages: ChatMessage[] = [
          {
            id: '1',
            sender: 'user',
            text: 'I need to plan a corporate retreat for 50 people.',
            timestamp: '10:30 AM'
          },
          {
            id: '2',
            sender: 'system',
            text: 'Great! I can help you plan that. What type of activities are you interested in for the retreat?',
            timestamp: '10:31 AM'
          },
          {
            id: '3',
            sender: 'user',
            text: 'We want team building activities and some relaxation time. Maybe a mix of workshops and outdoor activities.',
            timestamp: '10:33 AM'
          },
          {
            id: '4',
            sender: 'system',
            text: 'Sounds good! I\'ve created an initial plan for your corporate retreat. You can view and edit the details in the RFP tab, and check out the proposed floor plan in the Floorplan tab.',
            timestamp: '10:34 AM'
          }
        ];
        
        setMessages(mockMessages);
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [conversationId]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    try {
      // In a real app, send message to API and get response
      // For now, simulate a delay and response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const systemMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'system',
        text: `I've updated your event plan based on: "${text}". You can see the changes in the tabs to the right.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, systemMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <button className="back-button" onClick={onBackToConversations}>
          ← Back
        </button>
        <h2 className="chat-title">{eventName}</h2>
      </div>
      <ChatHistory messages={messages} loading={loading} messagesEndRef={messagesEndRef} />
      <ChatInput 
        onSubmit={handleSendMessage} 
        loading={loading} 
        placeholder="Type a message..."
      />
    </div>
  );
};

export default ChatInterface; 