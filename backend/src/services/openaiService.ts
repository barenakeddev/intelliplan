import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ErrorTypes, logger } from '../utils/errorHandler';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for RFP conversational assistant
const RFP_SYSTEM_PROMPT = `You are an AI assistant designed to help users create Requests for Proposal (RFPs) through natural, conversational interactions. Your goal is to efficiently gather detailed event planning information in a friendly, clear, and concise manner, similar to a real-world conversation between an event planner and venue coordinator.

Your objectives:

    Collect the following details without overwhelming the user:

        Event Overview
            Event Name, Host Organization, Organizer (if different)
            Event Type (conference, wedding, seminar, fundraiser, etc.)
            Brief description (purpose, audience, theme)

        Event Dates & Flexibility
            Preferred Date
            Alternative Date(s)
            Flexibility (Yes/No)

        Attendance
            Estimated Number of Attendees

        Venue Requirements
            Number of rooms/spaces required
            Approximate size needed or seating arrangements (e.g., theatre, classroom, banquet style)
            Accessibility requirements (ADA compliance, wheelchair access)

        Catering Requirements
            Meal Periods (Breakfast, Lunch, Dinner, Breaks)
            Service Style (Plated, Buffet, Family-Style)
            Dietary needs (vegan, gluten-free, etc.)

        Audio/Visual Requirements
            Equipment needed (microphones, projectors, screens, podium, etc.)
            Additional technical requirements (Wi-Fi, live streaming, etc.)

        Budget Range

        Parking/Transportation Needs

        Contact Information (name, phone, email, address)

Conversational Style Guidelines:

    IMPORTANT: NEVER ask for information that has already been provided, either explicitly or implicitly. Carefully review previous messages before asking a question.
    Keep your responses brief, direct, and human-like.
    Clarify details when the user provides ambiguous or incomplete information.
    Ask questions one at a time, naturally guiding the user through each step.
    Use friendly language and a supportive tone.
    
CRITICAL: Maintain clear distinction between different types of information:
    - Keep Guest Room accommodation information (hotel rooms) completely separate from Venue Requirements (meeting/event spaces)
    - Do not mix these two categories when asking questions or summarizing information
    
IMPORTANT: Your first message should be a brief welcome and ask what type of event they're planning. After they respond, ask ONLY ONE question at a time in a natural flow. DO NOT repeat questions that have already been answered.

Follow this structured yet natural conversational approach for each interaction.`;

// Store conversations in memory (in production, this would be in a database)
interface Conversation {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  structuredData?: Record<string, any>;
}

const conversations: Record<string, Conversation> = {};

// Generate a unique conversation ID
function generateConversationId(): string {
  return Date.now().toString();
}

// Create a new conversation
export function createConversation(): string {
  const conversationId = generateConversationId();
  conversations[conversationId] = {
    messages: [
      { role: 'system', content: RFP_SYSTEM_PROMPT },
    ]
  };
  return conversationId;
}

// Get conversation
export function getConversation(conversationId: string): Conversation | null {
  return conversations[conversationId] || null;
}

// Add message to conversation
export function addMessageToConversation(conversationId: string, role: 'user' | 'assistant', content: string): void {
  if (!conversations[conversationId]) {
    throw new Error(`Conversation with ID ${conversationId} not found`);
  }
  
  conversations[conversationId].messages.push({ role, content });
}

// Get first assistant message
export async function getInitialMessage(conversationId: string): Promise<string> {
  try {
    // Create the system prompt defining the assistant's behavior
    const systemPrompt = {
      role: 'system' as const,
      content: `You are an event planning assistant helping a client create a Request for Proposal (RFP) for their venue search. Your goal is to collect all necessary information in a conversational way and guide the user through the entire process.

Be friendly but efficient. Ask one or two questions at a time to keep the conversation flowing naturally. 

Follow this question flow to ensure we collect all required information:
1. First ask about basic event details: what type of event (conference, wedding, etc.), name of the event, which organization is hosting it
2. Then ask about the purpose/description of the event and the audience
3. Next ask about dates: preferred date, any alternative dates, and whether there's flexibility with the dates
4. Then ask about attendance: how many people are expected
5. Then ask about space requirements: how many rooms/spaces needed and preferred setup/seating arrangement
6. Ask about catering needs: which meals will be served and any specific service style or dietary requirements
7. Ask about any A/V or technical requirements
8. Ask about budget if appropriate
9. Collect any details about special requests or concessions needed
10. If applicable, ask about guest room requirements
11. Finally, ask about the program flow/timeline

If the client's answers are vague or incomplete, ask follow-up questions to get specific information. For dates, make sure to get the full date including the year. For attendance, get a specific number or range.

Never overwhelm the client with too many questions at once. Ask at most two questions in each response. If they seem confused or overwhelmed, focus on just one question at a time.

Do not generate or display an RFP until explicitly requested, but periodically summarize the information collected so far.

For your first message, just use a simple greeting like "Hello! What can I help you plan today?" `
    };

    if (!conversations[conversationId]) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    // Add the system prompt to the conversation
    conversations[conversationId].messages.push(systemPrompt);

    // Instead of generating with OpenAI, use a fixed simple greeting
    const initialMessage = "Hello! What can I help you plan today?";

    // Add the initial greeting to the conversation history
    conversations[conversationId].messages.push({
      role: 'assistant' as const,
      content: initialMessage
    });

    return initialMessage;
  } catch (error: any) {
    logger.error("Error in OpenAI service:", error);
    if (error.code === 'invalid_api_key') {
      throw ErrorTypes.ExternalService("Invalid OpenAI API Key.", "OpenAI");
    } else {
      throw ErrorTypes.ExternalService(`OpenAI API Error: ${error.message}`, "OpenAI");
    }
  }
}

// Generate RFP based on conversation history
export async function generateRFP(conversationId: string, prompt?: string): Promise<string> {
  try {
    logger.info('Attempting to use OpenAI model: gpt-4o-mini');
    
    // If a prompt is provided but no conversation exists, create a new one
    if (prompt && !conversations[conversationId]) {
      const newConvId = createConversation();
      // Just to be safe, use the id we've just created
      conversations[newConvId].messages.push({ role: 'user', content: prompt });
    }
    
    // If a prompt is provided and conversation exists, add it to the conversation
    if (prompt && conversations[conversationId]) {
      conversations[conversationId].messages.push({ role: 'user', content: prompt });
    }
    
    // We need to check if the conversation exists now
    if (!conversations[conversationId]) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }
    
    const chatCompletion = await openai.chat.completions.create({
      messages: conversations[conversationId].messages,
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!chatCompletion.choices[0]?.message?.content) {
      logger.warn("OpenAI returned an empty response.");
      throw ErrorTypes.ExternalService("Received empty response from OpenAI", "OpenAI");
    }
    
    const assistantMessage = chatCompletion.choices[0].message.content;
    
    // Add the assistant's response to the conversation
    conversations[conversationId].messages.push({ 
      role: 'assistant', 
      content: assistantMessage 
    });
    
    // After each message exchange, extract structured data silently
    // We'll do this only if the conversation has at least 4 messages (system + initial greeting + user + assistant)
    if (conversations[conversationId].messages.length >= 4) {
      try {
        await updateRfpStructuredData(conversationId);
      } catch (error) {
        // We don't want to fail the main function if this fails
        logger.warn("Failed to extract structured RFP data during conversation: " + error);
      }
    }
    
    logger.info('Successfully used model: gpt-4o-mini');
    return assistantMessage;
  } catch (error: any) {
    logger.error("Error in OpenAI service:", error);
    if (error.code === 'invalid_api_key') {
      throw ErrorTypes.ExternalService("Invalid OpenAI API Key.", "OpenAI");
    } else {
      throw ErrorTypes.ExternalService(`OpenAI API Error: ${error.message}`, "OpenAI");
    }
  }
}

// Helper function to update structured data based on conversation
async function updateRfpStructuredData(conversationId: string) {
  // Create a special prompt for extracting structured data
  const structureExtractionPrompt = `Analyze our conversation and extract the following information in a structured format for an RFP:
1. Event Name
2. Host Organization
3. Organizer
4. Event Type
5. Event Description
6. Preferred Date
7. Alternative Date
8. Date Flexibility (yes/no)
9. Attendee Count
10. Attendee Profile
11. Rooms Required (number and types)
12. Seating Arrangement
13. Accessibility Requirements
14. Meal Periods (breakfast, lunch, dinner, etc.)
15. Service Style (buffet, plated, etc.)
16. Dietary Needs
17. AV Equipment
18. Technical Requirements
19. Budget Range
20. Parking Needs
21. Transportation Needs
22. Contact Information (name, phone, email, address)
23. General Information/Additional Notes
24. Concessions Requested (complimentary items, waivers, etc.)
25. Food & Beverage Requirements
26. Guest Room Requirements (quantity, types)
27. Program Flow Details (timeline with times, functions, attendance, setup)

For ANY field where the information is not explicitly provided in our conversation, use "Not specified" rather than leaving it blank or making assumptions.

Respond in JSON format only with this structure:
{
  "eventName": "",
  "hostOrganization": "",
  "organizer": "",
  "eventType": "",
  "eventDescription": "",
  "preferredDate": "",
  "alternativeDate": "",
  "dateFlexibility": true/false,
  "attendeeCount": "",
  "attendeeProfile": "",
  "roomsRequired": "",
  "seatingArrangement": "",
  "accessibilityRequirements": "",
  "mealPeriods": "",
  "serviceStyle": "",
  "dietaryNeeds": "",
  "avEquipment": "",
  "technicalRequirements": "",
  "budgetRange": "",
  "parkingNeeds": "",
  "transportationNeeds": "",
  "contactName": "",
  "contactPhone": "",
  "contactEmail": "",
  "contactAddress": "",
  "generalInformation": "",
  "concessions": ["", ""],
  "avNeeds": ["", ""],
  "foodAndBeverage": ["", ""],
  "guestRooms": ["", ""],
  "programFlow": [
    { "time": "", "function": "", "attendanceSet": "" }
  ]
}`;

  // Clone the conversation messages to avoid modifying the original
  const messagesCopy = [...conversations[conversationId].messages];
  
  // Add the extraction prompt
  messagesCopy.push({ role: 'user', content: structureExtractionPrompt });
  
  // Get structured data 
  const structuredDataCompletion = await openai.chat.completions.create({
    messages: messagesCopy,
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 1024,
    response_format: { type: "json_object" }
  });
  
  // Store the extracted data in the conversation object for later use
  try {
    const structuredDataContent = structuredDataCompletion.choices[0]?.message?.content || "{}";
    const structuredData = JSON.parse(structuredDataContent);
    
    // Store this data with the conversation
    if (!conversations[conversationId].structuredData) {
      conversations[conversationId].structuredData = {};
    }
    conversations[conversationId].structuredData = structuredData;
    
    logger.info("Successfully extracted and stored structured RFP data during conversation");
  } catch (error) {
    logger.warn("Failed to parse structured RFP data during conversation");
    // Continue without storing if parsing fails
  }
}

// Generate final RFP document
export async function generateFinalRFP(conversationId: string): Promise<{ text: string; data?: any }> {
  try {
    if (!conversations[conversationId]) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }
    
    // Create a special prompt for generating the final RFP document
    const finalPrompt = `Based on our conversation, please generate a complete formal Request for Proposal (RFP) document. Include all the details we've discussed organized into these sections:

1. Event Overview
   - Event Name
   - Host Organization
   - Organizer
   - Event Type
   - Description

2. Event Dates & Flexibility
   - Preferred Date
   - Alternative Date
   - Flexibility

3. Attendance
   - Estimated Number of Attendees
   - Attendee Profile

4. Venue Requirements
   - Number of Rooms/Spaces Required
   - Seating Arrangement
   - Accessibility Requirements

5. Catering Requirements
   - Meal Periods
   - Service Style
   - Food & Beverage Details
   - Dietary Restrictions

6. Audio/Visual Requirements
   - Technical Requirements
   - AV Needs Details

7. Budget Information
   - Budget Range

8. Parking & Transportation
   - Parking Needs
   - Transportation Requirements

9. Contact Information
   - Name
   - Phone
   - Email
   - Address

10. Additional Information
    - Concessions (if possible)
    - Guest Rooms
    - Typical Program Sample Flow (in table format with Time, Function, and Attendance/Set columns)

For any sections where we haven't collected information, please include the section headings but leave them blank. Format the document in a clean, professional style appropriate for sending to venues.`;
    
    // Add this as a user message
    conversations[conversationId].messages.push({ role: 'user', content: finalPrompt });
    
    // Use any previously extracted structured data if available
    let structuredData = conversations[conversationId].structuredData || {};
    
    // If we don't have structured data already, extract it now
    if (!structuredData || Object.keys(structuredData).length === 0) {
      await updateRfpStructuredData(conversationId);
      structuredData = conversations[conversationId].structuredData || {};
    }
    
    // Generate the final RFP document
    const chatCompletion = await openai.chat.completions.create({
      messages: conversations[conversationId].messages,
      model: 'gpt-4o-mini',
      temperature: 0.5,
      max_tokens: 1500,
    });
    
    if (!chatCompletion.choices[0]?.message?.content) {
      throw ErrorTypes.ExternalService("Received empty response from OpenAI", "OpenAI");
    }
    
    const rfpDocument = chatCompletion.choices[0].message.content;
    
    // Add the assistant's response to the conversation
    conversations[conversationId].messages.push({ 
      role: 'assistant', 
      content: rfpDocument 
    });
    
    // Return both the generated document and the structured data
    return {
      text: rfpDocument,
      data: structuredData
    };
  } catch (error: any) {
    logger.error("Error generating final RFP:", error);
    if (error.code === 'invalid_api_key') {
      throw ErrorTypes.ExternalService("Invalid OpenAI API Key.", "OpenAI");
    } else {
      throw ErrorTypes.ExternalService(`OpenAI API Error: ${error.message}`, "OpenAI");
    }
  }
} 