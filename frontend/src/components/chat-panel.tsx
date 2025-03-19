import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useRfp } from "../context/rfp-context";
import { sendMessage, startConversation, generateFinalRFP } from "../services/api";
import ConversationList, { Conversation } from "./conversation-list";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatPanelProps {
  className?: string;
}

export default function ChatPanel({ className = "" }: ChatPanelProps) {
  const { setRfpData, isLoading, setIsLoading, setGeneratedRfp } = useRfp();
  const [message, setMessage] = useState("");
  const [showConversationList, setShowConversationList] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentConversationName, setCurrentConversationName] = useState<string>("New Event");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Start a new conversation when component loads
  useEffect(() => {
    if (!showConversationList && !currentConversationId && chatHistory.length === 0) {
      startNewConversation();
    }
  }, [showConversationList]);

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
          content: "Hello! I'm here to help you create an RFP for your event. What type of event are you planning?",
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

  const handleSendMessage = async () => {
    if (message.trim() && currentConversationId) {
      // Add user message to chat history
      setChatHistory([...chatHistory, { role: "user", content: message }]);
      const userMessage = message;
      setMessage("");

      // Set loading state
      setIsLoading(true);

      try {
        // Add loading message
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: "Generating response..." },
        ]);

        // Call the API to get a response
        const response = await sendMessage(currentConversationId, userMessage);
        
        // Remove loading message
        setChatHistory((prev) => prev.slice(0, -1));
        
        // Add assistant response
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response,
          },
        ]);

        // If we've collected enough information, update the event name
        if (
          userMessage.toLowerCase().includes("event name") ||
          userMessage.toLowerCase().includes("name") && chatHistory.length < 5
        ) {
          // Extract a name from the user message
          setCurrentConversationName(userMessage.replace(/event name|name/i, "").trim() || "New Event");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error processing message:", error);
        
        // Remove loading message
        setChatHistory((prev) => prev.slice(0, -1));
        
        // Add error message
        setChatHistory((prev) => [
          ...prev,
          { 
            role: "assistant", 
            content: "I'm sorry, I encountered an error. Please try again." 
          },
        ]);
        
        setIsLoading(false);
      }
    }
  };

  const handleGenerateRFP = async () => {
    try {
      if (!currentConversationId) {
        throw new Error("No active conversation");
      }
      
      setIsLoading(true);
      
      // Add a message to indicate we're generating the RFP
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Generating your RFP document..." },
      ]);

      // Call the API to generate the final RFP from the conversation
      const rfpText = await generateFinalRFP(currentConversationId);
      setGeneratedRfp(rfpText);

      // Update the RFP data with information from the conversation
      setRfpData(prev => ({
        ...prev,
        eventName: currentConversationName,
      }));

      // Remove the generating message
      setChatHistory((prev) => prev.slice(0, -1));

      // Add confirmation message
      setChatHistory((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "I've generated an RFP document for you! You can view and edit it in the RFP panel." 
        },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error("Error generating RFP:", error);
      
      // Remove the generating message
      setChatHistory((prev) => prev.slice(0, -1));
      
      setChatHistory((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'm sorry, there was an error generating the RFP. Please try again." 
        },
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
    <div className={`w-full md:w-[450px] flex flex-col bg-gray-50 border-r transition-all duration-300 ease-in-out ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={handleBackToConversations}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-medium flex-1 text-center">{currentConversationName}</h2>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
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

      {/* Chat Input and Generate RFP Button */}
      <div className="p-4 border-t">
        {chatHistory.length > 5 && (
          <Button
            onClick={handleGenerateRFP}
            className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            Generate RFP Document
          </Button>
        )}
        <div className="flex items-center space-x-2">
          <Input
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
            className="bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full"
            disabled={isLoading || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 