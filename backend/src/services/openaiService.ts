import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ErrorTypes, logger } from '../utils/errorHandler';
import { ChatCompletionMessageParam } from 'openai/resources';

dotenv.config();

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for RFP conversational assistant
const RFP_SYSTEM_PROMPT = `You are an EXPERT hospitality and event solutions consultant designed to help clients create detailed Requests for Proposal (RFPs) for venues and services. You have extensive knowledge across all aspects of event planning, venue selection, hospitality management, logistics, AV/technology requirements, catering, accommodations, and industry best practices. Your expertise extends beyond just event planning to include business strategy, audience engagement, logistics optimization, and ROI considerations.

Your objectives:

    Collect the following REQUIRED details through natural, intelligent conversation:

        Event Overview
            Event Name, Host Organization, Organizer (if different)
            Event Type (conference, wedding, seminar, fundraiser, etc.)
            Brief description (purpose, theme, business objectives)

        Event Dates & Flexibility
            Preferred Date (obtain SPECIFIC dates with month, day, and year)
            Alternative Date(s) (obtain SPECIFIC dates with month, day, and year)
            Flexibility (Yes/No)

        Attendance
            Estimated Number of Attendees (obtain a specific number or range)
            Attendee demographics/profile if relevant

        Venue Requirements (Meeting/Event Spaces)
            Number of rooms/spaces required
            Approximate size needed or seating arrangements (e.g., theatre, classroom, banquet style)
            Accessibility requirements (ADA compliance, wheelchair access)
            Special requirements (natural light, outdoor space, etc.)

        Guest Room Requirements
            Number of rooms needed
            Dates needed
            Special room requirements

        Catering Requirements
            Meal Periods (Breakfast, Lunch, Dinner, Breaks)
            Service Style (Plated, Buffet, Family-Style)
            Dietary needs (vegan, gluten-free, etc.)
            Bar service requirements

        AV/Technology Needs
            Equipment needed (microphones, projectors, screens, podium, etc.)
            Technical specifications (resolution, sound quality, etc.)
            Wi-Fi, live streaming, recording requirements
            Event technology (registration systems, audience engagement tools)

        Budget Range (obtain a specific amount or range)
            Overall budget or budget breakdowns

        Parking/Transportation Needs
            Shuttle services, parking requirements, public transportation

        Contact Information (name, phone, email, address)
        
        Other (for anything that doesn't fit in other categories)
        
        Concessions (any special requests for complimentary items)

Conversational Intelligence Guidelines:

    CRITICAL:
    - CAREFULLY READ the user's entire message to extract ALL provided information
    - RECOGNIZE when the user provides information in ways that don't fit standard categories and adapt accordingly
    - PARSE complex responses that address multiple requirements at once
    - INTERPRET information given in industry terms, general descriptions, or inexact language
    - If you receive a response like "the necessary for a conference" for AV needs, RECOGNIZE this as a request for standard conference AV equipment and LIST SPECIFIC ITEMS like "projector, screen, microphones, sound system, etc."
    - When users provide general answers, help them by suggesting specific examples or options
    - If a user says they have an RFP conversation but hasn't shared it, RECOGNIZE this situation and kindly ask them to share the conversation so you can assist them
    
    IMPORTANT: 
    - ASK ONLY ONE QUESTION AT A TIME and wait for a response before asking the next question
    - Keep your responses brief, direct, and expert-like
    - If any part of the request is unclear, ask for clarification on ONLY that part
    - Never repeat previously gathered information unless specifically asked
    - Use your professional expertise to recommend additional considerations they might have missed
    
INSTRUCTION FOR HANDLING COMPLEX RESPONSES:
    - When the user gives a general answer like "standard for a conference" or "the usual setup," USE YOUR EXPERTISE to translate this into SPECIFIC items that would be needed
    - Always convert general descriptions into CONCRETE, SPECIFIC LISTS of items or requirements
    - For AV needs, a general answer should be translated to a specific list like ["projector and screen", "wireless microphones", "sound system", "recording capability"]

IMPORTANT FLOW CONTROL:
    - After the user answers a question, acknowledge their response with a single short sentence before asking the next question
    - When you've collected enough information (at least 70% of the required fields), notify the user: "I have enough information for the RFP. Would you like to provide any additional details about [list 2-3 missing important fields]?"
    - At the end of the conversation, say: "Thank you. The RFP contains all the information you provided. Did I miss anything or do you have any questions?"
    - DO NOT provide lengthy summaries at the end of the conversation as the information is already being populated in the RFP document

Your first message should be a brief welcome and ask what type of event they're planning. After they respond, ask ONLY ONE question at a time in a natural flow, waiting for the user's response each time.`;

// Storage for conversations
const conversations: Record<string, {
  id: string;
  messages: any[];
  structuredData?: Record<string, any>;
  messageCount: number; // Track number of messages to manage context window
}> = {};

// Max messages to keep in context before summarization
const MAX_CONVERSATION_MESSAGES = 30;

// Generate a unique conversation ID
function generateConversationId(): string {
  return Date.now().toString();
}

// Create a new conversation
export function createConversation(): string {
  const conversationId = generateConversationId();
  conversations[conversationId] = {
    id: conversationId,
    messages: [
      { role: 'system', content: RFP_SYSTEM_PROMPT },
    ],
    messageCount: 1
  };
  return conversationId;
}

/**
 * Get a conversation by ID
 */
export function getConversation(conversationId: string) {
  return conversations[conversationId] || null;
}

// Add message to conversation
export function addMessageToConversation(conversationId: string, role: 'user' | 'assistant', content: string): void {
  if (!conversations[conversationId]) {
    throw new Error(`Conversation with ID ${conversationId} not found`);
  }
  
  conversations[conversationId].messages.push({ role, content });
  conversations[conversationId].messageCount++;
  
  // Check if we need to manage the context window
  if (conversations[conversationId].messageCount > MAX_CONVERSATION_MESSAGES) {
    manageConversationContext(conversationId);
  }
}

// Manage conversation context to prevent losing important information
async function manageConversationContext(conversationId: string): Promise<void> {
  try {
    const conversation = conversations[conversationId];
    if (!conversation) return;
    
    // Extract the system message
    const systemMessage = conversation.messages.find(m => m.role === 'system');
    
    // Get the conversation history excluding system message
    const conversationHistory = conversation.messages.filter(m => m.role !== 'system');
    
    // Create a prompt to summarize the conversation so far
    const summaryMessages: ChatCompletionMessageParam[] = [
      { role: 'system' as const, content: 'You are an AI assistant that summarizes conversations while preserving ALL important details. Create a detailed summary that retains ALL specific information mentioned including names, dates, numbers, requirements, and preferences. Be comprehensive but concise, focusing on factual information rather than conversation flow.' },
      { role: 'user' as const, content: `Please summarize the following conversation, preserving ALL details and information shared. Focus on extracting and retaining ALL specific pieces of information about the event being planned.\n\n${JSON.stringify(conversationHistory)}` }
    ];
    
    // Generate a summary using the API
    const summaryCompletion = await openai.chat.completions.create({
      messages: summaryMessages,
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 2500,
    });
    
    const summarizedContent = summaryCompletion.choices[0]?.message?.content || '';
    
    // Create a new messages array with the summary
    const newMessages = [
      systemMessage, // Keep the original system message
      { role: 'assistant' as const, content: `Conversation Summary: ${summarizedContent}` },
      // Keep the last 10 messages for immediate context
      ...conversationHistory.slice(-10)
    ];
    
    // Update the conversation with the new messages
    conversation.messages = newMessages.filter(Boolean);
    conversation.messageCount = newMessages.length;
    
    logger.info(`Managed context window for conversation ${conversationId}, reducing from ${conversationHistory.length} to ${newMessages.length} messages`);
  } catch (error) {
    logger.error("Error managing conversation context:", error);
    // Continue with the existing context if summarization fails
  }
}

// Get first assistant message
export async function getInitialMessage(conversationId: string): Promise<string> {
  try {
    // Create the system prompt defining the assistant's behavior
    const systemPrompt = {
      role: 'system' as const,
      content: RFP_SYSTEM_PROMPT
    };

    if (!conversations[conversationId]) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    // Add the system prompt to the conversation
    conversations[conversationId].messages.push(systemPrompt);

    // Instead of generating with OpenAI, use a fixed simple greeting
    const initialMessage = "Hi! What can I help you plan today?";

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
      max_tokens: 2000,
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
  const structureExtractionPrompt = `You are an expert event planning data analyzer. Your task is to carefully extract structured information from the conversation for an RFP. Follow these guidelines:

1. Extract only information that was EXPLICITLY stated by the user
2. DO NOT invent or assume any information not directly provided
3. For each field, include a confidence score (0.0-1.0) based on how certain you are about the extracted data
4. Use proper formatting, capitalization, and complete sentences when extracting text fields
5. If the information wasn't provided or is unclear, leave the field empty and assign a low confidence score

Analyze our conversation and extract the following information in a structured format for an RFP:
1. Event Name
2. Host Organization
3. Organizer
4. Event Type
5. Event Description
6. Preferred Date
7. Alternative Date
8. Date Flexibility (yes/no)
9. Attendee Count
10. Rooms Required (number and types for meeting/event spaces)
11. Seating Arrangement
12. Accessibility Requirements
13. Meal Periods (breakfast, lunch, dinner, etc.)
14. Service Style (buffet, plated, etc.)
15. Dietary Needs
16. AV Needs
17. Budget Range
18. Parking Needs
19. Transportation Needs
20. Contact Information (name, phone, email, address)
21. Other
22. Concessions
23. Food & Beverage Requirements
24. Guest Room Requirements (quantity, types)
25. Program Flow Details (timeline with times, functions, attendance, setup)

For ANY field where the information is not explicitly provided in our conversation, use "Not specified" rather than leaving it blank or making assumptions.

Respond in JSON format only with this structure. I need you to format your response as a json object:
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
  "roomsRequired": "",
  "seatingArrangement": "",
  "accessibilityRequirements": "",
  "mealPeriods": "",
  "serviceStyle": "",
  "dietaryNeeds": "",
  "avNeeds": "",
  "budgetRange": "",
  "parkingNeeds": "",
  "transportationNeeds": "",
  "contactName": "",
  "contactPhone": "",
  "contactEmail": "",
  "contactAddress": "",
  "other": "",
  "concessions": ["", ""],
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
    // Check if we have a conversation
    const conversation = conversations[conversationId];
    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }
    
    // First, update the structured data
    await updateRfpStructuredData(conversationId);
    
    // Get the structured data
    const structuredData = conversation.structuredData || {};
    
    // Create a prompt for generating the final document
    const finalDocumentMessages: ChatCompletionMessageParam[] = [
      { 
        role: 'system', 
        content: `You are an expert at creating professional, well-formatted RFP documents based on information collected through conversations.
        
        Your task is to create a concise, professional RFP document that includes all the information provided. Format the document in clear sections with headers and bullet points where appropriate.
        
        IMPORTANT GUIDELINES:
        - Focus on facts and specific details only
        - Maintain a professional, concise tone
        - Do not add any information that wasn't explicitly provided
        - Do not add unnecessary text like introductions, explanations, or conclusions
        - The RFP should be ready for direct use without further editing
        - Format with clear section headers and bullet points for readability
        - Present the information in a logical order
        - Include all verified information from the structured data
        - Do not invent or fabricate any details
        - Do not add "notes" or "suggestions" sections
        - Do not add any disclaimers, footnotes, or explanatory text
        - The final document should be focused solely on the event requirements` 
      },
      { 
        role: 'user', 
        content: `Here is the structured data extracted from the conversation:
        
        ${JSON.stringify(structuredData, null, 2)}
        
        Please generate a professional RFP document based on this information.` 
      }
    ];
    
    // Generate the final document
    const finalDocumentCompletion = await openai.chat.completions.create({
      messages: finalDocumentMessages,
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    const finalRfpText = finalDocumentCompletion.choices[0]?.message?.content || "";
    
    logger.info(`Generated final RFP document for conversation ${conversationId}`);
    
    return {
      text: finalRfpText,
      data: structuredData
    };
  } catch (error: any) {
    logger.error("Error generating final RFP:", error);
    throw error;
  }
} 