import { useState, useEffect, useRef } from "react";
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
  const [messageCount, setMessageCount] = useState(0);
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
    const triggerMessageCount = 12; // Increased from 8 to allow for more conversation
    
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

  // Extract RFP data from messages
  const extractRfpData = (userMessage: string, assistantResponse: string) => {
    const combinedText = userMessage + " " + assistantResponse;
    const updates: Partial<any> = {};
    
    // Event Name
    if (combinedText.match(/event\s*name|event\s*title/i)) {
      const eventNameMatch = combinedText.match(/event\s*name\s*:?\s*([^\.]*)\./i) || 
                          combinedText.match(/for\s+(?:the|an?|our)?\s*([^\.]*?)\s*event/i) ||
                          combinedText.match(/planning\s+(?:the|an?|our)?\s*([^\.]*?)\s*event/i);
      
      if (eventNameMatch && eventNameMatch[1].trim()) {
        updates.eventName = eventNameMatch[1].trim();
        setCurrentConversationName(eventNameMatch[1].trim());
      }
    }
    
    // Host Organization
    const orgMatch = combinedText.match(/host\s*organization\s*:?\s*([^\.]*)\./i) ||
                   combinedText.match(/(?:organized|hosted)\s*by\s*([^\.]*)\./i);
    
    if (orgMatch && orgMatch[1].trim()) {
      updates.hostOrganization = orgMatch[1].trim();
    }
    
    // Organizer
    const organizerMatch = combinedText.match(/organizer\s*:?\s*([^\.]*)\./i) ||
                         combinedText.match(/(?:coordinated|arranged|managed)\s*by\s*([^\.]*)\./i);
    
    if (organizerMatch && organizerMatch[1].trim()) {
      updates.organizer = organizerMatch[1].trim();
    }
    
    // Event Type
    const typeMatch = combinedText.match(/event\s*type\s*:?\s*([^\.]*)\./i) ||
                    combinedText.match(/type\s*of\s*event\s*:?\s*([^\.]*)\./i) ||
                    combinedText.match(/(?:it's|it is|this is)\s*a\s*([^\.]*?)\s*(?:event|gathering|meeting)/i);
    
    if (typeMatch && typeMatch[1].trim()) {
      updates.eventType = typeMatch[1].trim();
    }
    
    // Event Description
    const descMatch = combinedText.match(/description\s*:?\s*([^\.]*(?:\.[^\.]*){0,3})\./i) ||
                    combinedText.match(/(?:about|regarding|concerning)\s*([^\.]*(?:\.[^\.]*){0,3})\./i);
    
    if (descMatch && descMatch[1].trim()) {
      updates.eventDescription = descMatch[1].trim();
    }
    
    // Dates
    const preferredDateMatch = combinedText.match(/preferred\s*date\s*:?\s*([^\.]*)\./i) || 
                              combinedText.match(/event\s*date\s*:?\s*([^\.]*)\./i) ||
                              combinedText.match(/planning\s*(?:the\s*event)?\s*for\s*([^\.]*?\d{4})/i) ||
                              combinedText.match(/(?:on|for)\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}\s*(?:,|\s)\s*\d{4})/i);
    
    if (preferredDateMatch && preferredDateMatch[1].trim()) {
      updates.preferredDate = preferredDateMatch[1].trim();
    }
    
    const alternativeDateMatch = combinedText.match(/alternative\s*date\s*:?\s*([^\.]*)\./i) || 
                                combinedText.match(/backup\s*date\s*:?\s*([^\.]*)\./i) || 
                                combinedText.match(/second\s*(?:option|choice)\s*:?\s*([^\.]*)\./i);
    
    if (alternativeDateMatch && alternativeDateMatch[1].trim()) {
      updates.alternativeDate = alternativeDateMatch[1].trim();
    }
    
    // Date Flexibility
    const flexibilityMatch = combinedText.match(/flexibility\s*:?\s*([^\.]*)\./i) ||
                           combinedText.match(/(?:dates?\s*are|is)\s*flexible\s*:?\s*([^\.]*)\./i);
    
    if (flexibilityMatch) {
      const flexText = flexibilityMatch[1].toLowerCase();
      updates.dateFlexibility = flexText.includes('yes') || flexText.includes('flexible');
    } else if (combinedText.toLowerCase().includes('no flexibility') || 
               combinedText.toLowerCase().includes('not flexible') ||
               combinedText.toLowerCase().includes('fixed date')) {
      updates.dateFlexibility = false;
    }
    
    // Attendee Count
    const attendeeMatch = combinedText.match(/attendee\s*(?:profile|count|number)\s*:?\s*([^\.]*)\./i) ||
                        combinedText.match(/(?:expecting|expect|anticipate|about|approximately)\s*(\d+\s*(?:to|-)\s*\d+|\d+)\s*(?:people|guests|attendees|participants)/i);
    
    if (attendeeMatch && attendeeMatch[1].trim()) {
      updates.attendeeCount = attendeeMatch[1].trim();
      updates.attendeeProfile = attendeeMatch[1].trim();
    }
    
    // Venue Requirements
    const roomsMatch = combinedText.match(/rooms?\s*required\s*:?\s*([^\.]*)\./i) ||
                      combinedText.match(/(?:need|require)\s*(\d+\s*(?:to|-)\s*\d+|\d+)\s*(?:rooms?|spaces?)/i) ||
                      combinedText.match(/(?:big|large|small|medium)?\s*hall/i);
    
    if (roomsMatch && roomsMatch[0].trim()) {
      updates.roomsRequired = roomsMatch[0].trim();
    }
    
    const seatingMatch = combinedText.match(/seating\s*arrangement\s*:?\s*([^\.]*)\./i) ||
                        combinedText.match(/(?:set\s*up|arranged|setup)\s*in\s*(?:a|an)?\s*([^\.]*?)\s*(?:style|format|arrangement)/i) ||
                        combinedText.match(/(?:theatre|classroom|banquet|reception|cabaret|boardroom)\s*(?:style|setup|arrangement)?/i);
    
    if (seatingMatch && seatingMatch[0].trim()) {
      updates.seatingArrangement = seatingMatch[0].trim();
    }
    
    const accessibilityMatch = combinedText.match(/accessibility\s*requirements?\s*:?\s*([^\.]*)\./i) ||
                             combinedText.match(/(?:ADA|wheelchair|accessible)\s*([^\.]*)\./i);
    
    if (accessibilityMatch && accessibilityMatch[1].trim()) {
      updates.accessibilityRequirements = accessibilityMatch[1].trim();
    }
    
    // General Information
    if (combinedText.toLowerCase().includes("general information") || combinedText.toLowerCase().includes("additional information")) {
      const generalInfoMatch = combinedText.match(/general\s*information\s*:?\s*([^\.]*(?:\.[^\.]*){0,3})\./i) ||
                              combinedText.match(/additional\s*(?:requirements|information)\s*:?\s*([^\.]*(?:\.[^\.]*){0,3})\./i);
      
      if (generalInfoMatch && generalInfoMatch[1].trim()) {
        updates.generalInformation = generalInfoMatch[1].trim();
      }
    }
    
    // Catering Requirements
    const mealMatch = combinedText.match(/meal\s*periods?\s*:?\s*([^\.]*)\./i) ||
                     combinedText.match(/(?:breakfast|lunch|dinner|meals)\s*([^\.]*)\./i);
    
    if (mealMatch && mealMatch[1].trim()) {
      updates.mealPeriods = mealMatch[1].trim();
    }
    
    const serviceMatch = combinedText.match(/service\s*style\s*:?\s*([^\.]*)\./i) ||
                        combinedText.match(/(?:plated|buffet|family-style|served)\s*([^\.]*)\./i);
    
    if (serviceMatch && serviceMatch[1].trim()) {
      updates.serviceStyle = serviceMatch[1].trim();
    }
    
    const dietaryMatch = combinedText.match(/dietary\s*needs?\s*:?\s*([^\.]*)\./i) ||
                        combinedText.match(/(?:vegetarian|vegan|gluten-free|allergies)\s*([^\.]*)\./i);
    
    if (dietaryMatch && dietaryMatch[1].trim()) {
      updates.dietaryNeeds = dietaryMatch[1].trim();
    }
    
    // Concessions
    if (combinedText.toLowerCase().includes("concession") || combinedText.toLowerCase().includes("request")) {
      const concessionMatches = combinedText.match(/(?:complimentary|free|included|provide)\s+([^\.;,]*)[\.;,]/gi);
      if (concessionMatches && concessionMatches.length > 0) {
        updates.concessions = concessionMatches.map(match => match.trim());
      }
    }
    
    // AV Needs
    if (combinedText.toLowerCase().includes("av") || combinedText.toLowerCase().includes("audio") || 
        combinedText.toLowerCase().includes("visual") || combinedText.toLowerCase().includes("equipment")) {
      
      const avEquipMatch = combinedText.match(/equipment\s*needed\s*:?\s*([^\.]*)\./i) ||
                          combinedText.match(/(?:microphones|projectors|screens)\s*([^\.]*)\./i);
      
      if (avEquipMatch && avEquipMatch[1].trim()) {
        updates.avEquipment = avEquipMatch[1].trim();
      }
      
      const techReqMatch = combinedText.match(/technical\s*requirements?\s*:?\s*([^\.]*)\./i) ||
                          combinedText.match(/(?:wifi|wi-fi|internet|streaming)\s*([^\.]*)\./i);
      
      if (techReqMatch && techReqMatch[1].trim()) {
        updates.technicalRequirements = techReqMatch[1].trim();
      }
      
      const avMatches = combinedText.match(/need\s+([^\.;,]*?equipment[^\.;,]*)[\.;,]/gi) ||
                        combinedText.match(/(?:require|need)(?:d|s|ing)?\s+([^\.;,]*?(?:projector|screen|microphone|internet|wifi|av)[^\.;,]*)[\.;,]/gi);
      
      if (avMatches && avMatches.length > 0) {
        updates.avNeeds = avMatches.map(match => match.trim());
      }
    }
    
    // Food & Beverage
    if (combinedText.toLowerCase().includes("food") || combinedText.toLowerCase().includes("meal") || 
        combinedText.toLowerCase().includes("beverage") || combinedText.toLowerCase().includes("catering")) {
      const foodMatches = combinedText.match(/(?:providing|provide|need|require|include)\s+([^\.;,]*?(?:breakfast|lunch|dinner|reception|coffee|snack|meal|food)[^\.;,]*)[\.;,]/gi);
      
      if (foodMatches && foodMatches.length > 0) {
        updates.foodAndBeverage = foodMatches.map(match => match.trim());
      }
    }
    
    // Budget
    const budgetMatch = combinedText.match(/budget\s*range\s*:?\s*([^\.]*)\./i) ||
                      combinedText.match(/(?:\$|USD|dollar|budget)(?:\s*\d+[k,]?\s*(?:to|-)\s*\$?\s*\d+[k,]?|\s*\d+[k,]?)/i);
    
    if (budgetMatch && budgetMatch[1]?.trim()) {
      updates.budgetRange = budgetMatch[1].trim();
    }
    
    // Parking
    const parkingMatch = combinedText.match(/parking\s*needs?\s*:?\s*([^\.]*)\./i) ||
                        combinedText.match(/(?:parking|cars|vehicles)\s*([^\.]*)\./i);
    
    if (parkingMatch && parkingMatch[1].trim()) {
      updates.parkingNeeds = parkingMatch[1].trim();
    }
    
    // Transportation
    const transportMatch = combinedText.match(/transportation\s*needs?\s*:?\s*([^\.]*)\./i) ||
                         combinedText.match(/(?:shuttle|transport|bus)\s*([^\.]*)\./i);
    
    if (transportMatch && transportMatch[1].trim()) {
      updates.transportationNeeds = transportMatch[1].trim();
    }
    
    // Contact Information
    const nameMatch = combinedText.match(/contact\s*name\s*:?\s*([^\.]*)\./i) ||
                    combinedText.match(/(?:my name is|contact person)\s*([^\.]*)\./i);
    
    if (nameMatch && nameMatch[1].trim()) {
      updates.contactName = nameMatch[1].trim();
    }
    
    const phoneMatch = combinedText.match(/(?:phone|telephone|mobile)\s*:?\s*([^\.]*)\./i) ||
                      combinedText.match(/(?:\+\d{1,3}|\(\d{3}\))?[\s.-]?\d{3}[\s.-]?\d{4}/i);
    
    if (phoneMatch && phoneMatch[1]?.trim()) {
      updates.contactPhone = phoneMatch[1].trim();
    }
    
    const emailMatch = combinedText.match(/email\s*:?\s*([^\.]*)\./i) ||
                      combinedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
    
    if (emailMatch && emailMatch[1]?.trim()) {
      updates.contactEmail = emailMatch[1].trim();
    }
    
    const addressMatch = combinedText.match(/address\s*:?\s*([^\.]*)\./i) ||
                        combinedText.match(/located\s*at\s*([^\.]*)\./i);
    
    if (addressMatch && addressMatch[1]?.trim()) {
      updates.contactAddress = addressMatch[1].trim();
    }
    
    // Guest Rooms - Make sure this is clearly separated from venue requirements
    if ((combinedText.toLowerCase().includes("guest room") || 
        combinedText.toLowerCase().includes("hotel room") || 
        combinedText.toLowerCase().includes("accommodation") || 
        combinedText.toLowerCase().includes("lodging")) && 
        !combinedText.toLowerCase().includes("meeting room") && 
        !combinedText.toLowerCase().includes("venue")) {
      
      const roomMatches = combinedText.match(/(?:need|require|book|reserve)\s+([^\.;,]*?(?:guest room|hotel room|accommodation|suite)[^\.;,]*)[\.;,]/gi);
      
      if (roomMatches && roomMatches.length > 0) {
        updates.guestRooms = roomMatches.map(match => match.trim());
      }
    }
    
    // Apply all the updates gathered to the RFP data
    if (Object.keys(updates).length > 0) {
      setRfpData(prev => ({
        ...prev,
        ...updates
      }));
    }
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

        // Extract RFP data from the conversation
        extractRfpData(userMessage, response);

        // If we've collected enough information, update the event name
        if (
          (userMessage.toLowerCase().includes("event name") || 
          (userMessage.toLowerCase().includes("name") && chatHistory.length < 5))
        ) {
          // Extract a name from the user message
          const nameMatch = userMessage.match(/event\s*name\s*:?\s*([^\.]*)/i) ||
                          userMessage.match(/name\s*:?\s*([^\.]*)/i) ||
                          userMessage.match(/planning\s*(?:a|an)?\s*([^\.]*?)\s*event/i);
          
          if (nameMatch && nameMatch[1].trim()) {
            setCurrentConversationName(nameMatch[1].trim());
            setRfpData(prev => ({
              ...prev,
              eventName: nameMatch[1].trim()
            }));
          }
        }

        // Increment message count for auto-generation trigger
        setMessageCount(prevCount => prevCount + 1);

        setIsLoading(false);
        
        // Re-focus the input field after response is received
        if (inputRef.current) {
          inputRef.current.focus();
        }
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

  // Auto-generate RFP without user clicking a button
  const autoGenerateRFP = async () => {
    try {
      if (!currentConversationId) {
        throw new Error("No active conversation");
      }
      
      setIsLoading(true);
      
      // Add a message to indicate we're processing information
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "I'm updating your RFP document with our conversation..." },
      ]);

      // Call the API to generate the final RFP from the conversation
      const rfpResponse = await generateFinalRFP(currentConversationId);
      
      // Check if the response is in the new format (object with text and data properties)
      let rfpText = '';
      let rfpData: Record<string, any> | null = null;
      
      if (typeof rfpResponse === 'object' && rfpResponse !== null) {
        if ('text' in rfpResponse) {
          rfpText = rfpResponse.text as string;
          setGeneratedRfp(rfpText);
        }
        if ('data' in rfpResponse) {
          rfpData = rfpResponse.data as Record<string, any>;
        }
      } else {
        // Handle legacy format (string)
        try {
          const parsedResponse = JSON.parse(rfpResponse as string);
          if (parsedResponse && typeof parsedResponse === 'object') {
            if ('text' in parsedResponse) {
              rfpText = parsedResponse.text;
              setGeneratedRfp(rfpText);
            }
            if ('data' in parsedResponse) {
              rfpData = parsedResponse.data;
            }
          } else {
            // If it's not an object or doesn't have expected properties, use as is
            rfpText = rfpResponse as string;
            setGeneratedRfp(rfpResponse as string);
          }
        } catch (e) {
          // If it's not valid JSON, use as is
          rfpText = rfpResponse as string;
          setGeneratedRfp(rfpResponse as string);
        }
      }

      // Update the RFP data with structured information from the conversation
      if (rfpData) {
        setRfpData(prev => ({
          ...prev,
          ...rfpData,
          // Make sure to keep event name from conversation name if data doesn't have it
          eventName: (rfpData?.eventName as string) || currentConversationName
        }));
      } else {
        // Fallback to just updating event name
        setRfpData(prev => ({
          ...prev,
          eventName: currentConversationName,
        }));
      }

      // Remove the generating message
      setChatHistory((prev) => prev.slice(0, -1));

      // Add confirmation message
      setChatHistory((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "I've updated your RFP with the information we've discussed." 
        },
      ]);

      setIsLoading(false);
      
      // Re-focus the input field
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error("Error generating RFP:", error);
      
      // Remove the generating message
      setChatHistory((prev) => prev.slice(0, -1));
      
      setChatHistory((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'm sorry, there was an error updating your RFP. Let's continue our conversation." 
        },
      ]);
      setIsLoading(false);
      
      // Re-focus the input field even after error
      if (inputRef.current) {
        inputRef.current.focus();
      }
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
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
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

      {/* Chat Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
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