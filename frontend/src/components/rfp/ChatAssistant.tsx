import React, { useState, useRef, useEffect } from 'react';
import { ChatAssistantProps, Message } from '../../types';

const ChatAssistant: React.FC<ChatAssistantProps> = ({ rfpName, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Welcome to IntelliPlan! Tell me about your event and I'll help create your RFP.`,
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Send the message to the parent component and get the response
      const response = await onSendMessage(inputValue);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(inputValue, response),
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = (input: string, aiResponse: string): string => {
    if (aiResponse) {
      return `I've updated the RFP based on your request. You can see the changes in the editor.`;
    }
    
    if (input.toLowerCase().includes('rfp') || input.toLowerCase().includes('proposal')) {
      return 'I can help you create an RFP. Would you like to start with a template or create one from scratch? Please provide details about your event type, date, and requirements.';
    } else if (input.toLowerCase().includes('floorplan') || input.toLowerCase().includes('layout')) {
      return 'I can assist with floorplan design. What type of event space are you working with? Please provide dimensions and any specific requirements for seating, staging, or other elements.';
    } else if (input.toLowerCase().includes('vendor') || input.toLowerCase().includes('supplier')) {
      return 'I can help you manage vendor information. Would you like to add new vendors or review existing ones for your event?';
    } else {
      return 'I\'m here to help with your RFP and event planning needs. You can ask me to generate RFP content, create floorplans, or manage vendor information. What would you like to work on?';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 chat-container">
      {/* Header */}
      <div className="relative px-4 py-3 bg-white">
        <div className="flex items-center">
          <button className="mr-2 p-1 rounded hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h2 className="font-medium">AI Assistant</h2>
        </div>
        {/* Continuous horizontal line */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gray-200"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 messages-container min-h-[calc(100vh-150px)]" ref={scrollAreaRef}>
        <div className="space-y-4 h-full flex flex-col">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`message-bubble ${
                  message.sender === 'assistant' 
                    ? 'bg-white border border-gray-200 text-gray-800' 
                    : 'bg-purple-600 text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex space-x-2 items-center h-5">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div className="mt-auto" ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white message-input-container">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button 
            type="submit" 
            className="rounded-full w-10 h-10 bg-purple-600 flex items-center justify-center text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatAssistant; 