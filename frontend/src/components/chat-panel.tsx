import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { useRfp } from "../context/rfp-context";
import { 
  sendMessage, 
  startConversation, 
  generateFinalRFP,
  extractRfpData,
  getDataCollectionRecommendations,
  RfpResponse
} from "../services/api";
import ConversationList, { Conversation } from "./conversation-list";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatPanelProps {
  className?: string;
}

export default function ChatPanel({ className = "" }: ChatPanelProps) {
  const { setRfpData, rfpData, isLoading, setIsLoading, setGeneratedRfp, dataConfidence, setDataConfidence } = useRfp();
  const [message, setMessage] = useState("");
  const [showConversationList, setShowConversationList] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentConversationName, setCurrentConversationName] = useState<string>("New Event");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [dataCollectionTips, setDataCollectionTips] = useState<string[]>([]);
  const [showTips, setShowTips] = useState(false);
  const [extractionTimeoutId, setExtractionTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    // Focus the input after each message is sent or received
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatHistory]);

  // Start a new conversation when component loads
  useEffect(() => {
    if (!showConversationList && !currentConversationId && chatHistory.length === 0) {
      startNewConversation();
    }
  }, [showConversationList, chatHistory.length, currentConversationId]);

  // Auto-generate RFP after a certain number of messages
  useEffect(() => {
    const triggerMessageCount = 16; // Increased from 12 to allow for more conversation
    
    if (messageCount >= triggerMessageCount && currentConversationId && !isLoading) {
      // Reset the counter so we don't keep generating
      setMessageCount(0);
      autoGenerateRFP();
    }
  }, [messageCount, currentConversationId, isLoading]);

  // Start a new conversation with the API
  const startNewConversation = async () => {
    try {
      setIsLoading(true);
      const { conversationId, message: initialMessage } = await startConversation();
      setCurrentConversationId(conversationId);
      setChatHistory([
        {
          role: "assistant",
          content: initialMessage,
        },
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error starting conversation:", error);
      setChatHistory([
        {
          role: "assistant",
          content: "Hi! What can I help you plan today?",
        },
      ]);
      setIsLoading(false);
    }
  };

  // Mock data for getting conversation details
  const getConversationById = (id: string): Conversation | undefined => {
    return [
      {
        id: "1",
        name: "Corporate Conference 2024",
        snippet: "Planning a corporate conference for 200 people",
        createdAt: "2023-06-15T10:30:00Z",
      },
      {
        id: "2",
        name: "Wedding Planning",
        snippet: "Planning a wedding for 150 guests",
        createdAt: "2023-06-10T14:20:00Z",
      },
      {
        id: "3",
        name: "Charity Gala",
        snippet: "Organizing a fundraising gala",
        createdAt: "2023-06-05T09:15:00Z",
      },
    ].find(conv => conv.id === id);
  };

  // Extract RFP data from conversation and update context
  const performDataExtraction = async () => {
    if (!currentConversationId) return;
    
    try {
      const extractionResult = await extractRfpData(currentConversationId);
      
      if (extractionResult.data && Object.keys(extractionResult.data).length > 0) {
        // Calculate what fields were updated
        const updatedFields: Record<string, boolean> = {};
        for (const [key, value] of Object.entries(extractionResult.data)) {
          if (rfpData[key as keyof typeof rfpData] !== value) {
            updatedFields[key] = true;
          }
        }
        
        // Update RFP data with extracted values
        setRfpData(prev => ({
          ...prev,
          ...extractionResult.data
        }));
        
        // Store confidence scores
        if (extractionResult.metadata?.confidence) {
          const confidenceScores: Record<string, number> = {};
          for (const [key, field] of Object.entries(extractionResult.metadata.confidence)) {
            confidenceScores[key] = field.confidence;
          }
          setDataConfidence(confidenceScores);
        }
      }
      
      // Get recommendations for missing data
      const recommendationsResult = await getDataCollectionRecommendations(currentConversationId);
      if (recommendationsResult.recommendations && recommendationsResult.recommendations.length > 0) {
        setDataCollectionTips(recommendationsResult.recommendations);
        
        // Only show tips if we have them and there's a gap in the conversation
        // We don't want to interrupt the flow if the user is actively typing
        const messageTimerDelay = 5000; // 5 seconds of inactivity
        
        // Clear any existing timeout
        if (extractionTimeoutId) {
          clearTimeout(extractionTimeoutId);
        }
        
        // Set a new timeout to show tips after a delay
        const timeoutId = setTimeout(() => {
          setShowTips(true);
        }, messageTimerDelay);
        
        setExtractionTimeoutId(timeoutId);
      } else {
        setDataCollectionTips([]);
        setShowTips(false);
      }
    } catch (error) {
      console.error("Error extracting RFP data:", error);
    }
  };
  
  // Clear the extraction timeout when unmounting
  useEffect(() => {
    return () => {
      if (extractionTimeoutId) {
        clearTimeout(extractionTimeoutId);
      }
    };
  }, [extractionTimeoutId]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    // Check if the user is referring to an RFP conversation they haven't shared
    const mentionsRfpConversation = message.toLowerCase().includes('conversation') && 
                                   (message.toLowerCase().includes('rfp') || 
                                    message.toLowerCase().includes('read this') ||
                                    message.toLowerCase().includes('create the rfp'));
    
    const trimmedMessage = message.trim();
    setMessage("");
    setIsLoading(true);
    
    // Add the user message to chat history
    setChatHistory(prevHistory => [
      ...prevHistory,
      {
        role: "user",
        content: trimmedMessage,
      },
    ]);
    
    try {
      // Create a new conversation if one doesn't exist yet
      if (!currentConversationId) {
        const { conversationId, message: initialMessage } = await startConversation();
        setCurrentConversationId(conversationId);
      }
      
      // If user mentions an RFP conversation they haven't shared, we'll handle this specially
      if (mentionsRfpConversation && trimmedMessage.length < 200) {
        // This likely means they're referring to a conversation but haven't shared it
        setChatHistory(prevHistory => [
          ...prevHistory,
          {
            role: "assistant",
            content: "It looks like you're referring to an RFP conversation, but I don't see the conversation details. Please copy and paste the full conversation text so I can help create the RFP.",
          },
        ]);
        setIsLoading(false);
        return;
      }
      
      // Get response from the server
      const responseMessage = await sendMessage(currentConversationId!, trimmedMessage);
      
      // Add the response to chat history
      setChatHistory(prevHistory => [
        ...prevHistory,
        {
          role: "assistant",
          content: responseMessage,
        },
      ]);
      
      // Increment message count for tracking conversation progress
      setMessageCount(prev => prev + 2); // +2 for user message and response
      
      // Schedule data extraction after a short delay
      if (extractionTimeoutId) {
        clearTimeout(extractionTimeoutId);
      }
      
      const timeoutId = setTimeout(() => {
        performDataExtraction();
      }, 1000);
      
      setExtractionTimeoutId(timeoutId);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Show error message in chat
      setChatHistory(prevHistory => [
        ...prevHistory,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically generate an RFP based on the conversation
  const autoGenerateRFP = async () => {
    if (!currentConversationId || isLoading) return;
    
    try {
      setIsLoading(true);
      
      // First, extract the latest data
      await performDataExtraction();
      
      // Next, check if we have enough data to generate a meaningful RFP
      const requiredFields = [
        'eventName',
        'eventType',
        'preferredDate',
        'attendeeCount',
      ];
      
      const missingRequiredFields = requiredFields.filter(field => 
        !rfpData[field as keyof typeof rfpData] || 
        rfpData[field as keyof typeof rfpData] === ''
      );
      
      if (missingRequiredFields.length > 0) {
        // We're missing required fields, so ask for them instead of generating
        const missingFieldsText = missingRequiredFields
          .map(field => {
            switch(field) {
              case 'eventName': return 'event name';
              case 'eventType': return 'event type';
              case 'preferredDate': return 'preferred date';
              case 'attendeeCount': return 'estimated number of attendees';
              default: return field.replace(/([A-Z])/g, ' $1').toLowerCase();
            }
          })
          .join(', ');
        
        // Add a message to the chat asking for the missing information
        const promptMessage = `I still need some essential information: ${missingFieldsText}. Could you please provide these details?`;
        
        setChatHistory(prev => [...prev, { role: "assistant", content: promptMessage }]);
        setIsLoading(false);
        return;
      }
      
      // Update the RFP
      const result = await generateFinalRFP(currentConversationId);
      setGeneratedRfp(result.text);
      
      // Add the completion message to the chat
      const completionMessage = `Thanks! I've updated the RFP.`;
      
      setChatHistory(prev => [...prev, { role: "assistant", content: completionMessage }]);
      
      // Get recommendations for additional data
      const recommendationsResult = await getDataCollectionRecommendations(currentConversationId);
      if (recommendationsResult.recommendations && recommendationsResult.recommendations.length > 0) {
        setDataCollectionTips(recommendationsResult.recommendations);
        setShowTips(true);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error updating RFP:", error);
      
      setChatHistory(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: "I'm sorry, there was an error updating the RFP. Let's continue our conversation to gather more details." 
        }
      ]);
      
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    const conversation = getConversationById(id);
    setCurrentConversationId(id);
    if (conversation) {
      setCurrentConversationName(conversation.name);
    }
    setShowConversationList(false);
    // In a real application, we would load the conversation history from the API
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setCurrentConversationName("New Event");
    setChatHistory([]);
    setShowConversationList(false);
    // The useEffect will trigger startNewConversation
  };

  const handleBackToConversations = () => {
    setShowConversationList(true);
  };

  // Handle clicking on a data collection tip
  const handleTipClick = (tip: string) => {
    setMessage(tip);
    setShowTips(false);
    inputRef.current?.focus();
  };

  if (showConversationList) {
    return (
      <ConversationList 
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        className={className}
      />
    );
  }

  return (
    <div className={`relative flex h-full max-h-screen flex-col bg-muted/40 ${className}`}>
      {/* Chat Header */}
      <div className="p-3 border-b flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={handleBackToConversations}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-medium flex-1 text-center">{currentConversationName}</h2>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-purple-600 text-white rounded-tr-none"
                  : "bg-gray-200 text-gray-800 rounded-tl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Data collection tips */}
      {showTips && dataCollectionTips.length > 0 && (
        <div className="absolute bottom-16 right-3 w-[90%] bg-white p-3 rounded-lg shadow-lg border border-primary/20 z-10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-primary">Suggested questions</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => setShowTips(false)}
            >
              ×
            </Button>
          </div>
          <ul className="space-y-1">
            {dataCollectionTips.map((tip, index) => (
              <li 
                key={index} 
                className="text-sm p-2 hover:bg-primary/10 rounded cursor-pointer"
                onClick={() => handleTipClick(tip)}
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Chat Input */}
      <div className="flex items-center border-t bg-background p-2">
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
          disabled={isLoading}
        />
        <Button
          onClick={handleSendMessage}
          size="icon"
          className="ml-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full"
          disabled={isLoading || !message.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 