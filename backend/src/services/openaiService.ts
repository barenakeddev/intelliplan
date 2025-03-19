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

    Keep your responses brief, direct, and human-like.
    Clarify details when the user provides ambiguous or incomplete information.
    Ask questions one at a time, naturally guiding the user through each step.
    Use friendly language and a supportive tone.

IMPORTANT: Your first message should be a brief welcome and ask what type of event they're planning. After they respond, ask ONLY ONE question at a time in a natural flow. DO NOT repeat questions that have already been answered.

Follow this structured yet natural conversational approach for each interaction.`;

// Store conversations in memory (in production, this would be in a database)
interface Conversation {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
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
    logger.info(`Getting initial message for conversation ${conversationId}`);
    
    // If conversation doesn't exist, create it
    if (!conversations[conversationId]) {
      createConversation();
    }
    
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: RFP_SYSTEM_PROMPT }
      ],
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 150,
    });

    const message = chatCompletion.choices[0]?.message?.content || "Hello! What type of event are you planning?";
    
    // Add this message to the conversation
    if (!conversations[conversationId]) {
      conversations[conversationId] = {
        messages: [
          { role: 'system', content: RFP_SYSTEM_PROMPT },
          { role: 'assistant', content: message }
        ]
      };
    } else {
      conversations[conversationId].messages.push({ role: 'assistant', content: message });
    }
    
    return message;
  } catch (error: any) {
    logger.error("Error getting initial message:", error);
    return "Hello! I'm here to help you create an RFP for your event. What type of event are you planning?";
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

// Generate final RFP document
export async function generateFinalRFP(conversationId: string): Promise<string> {
  try {
    if (!conversations[conversationId]) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }
    
    // Create a special prompt for generating the final RFP document
    const finalPrompt = `Based on our conversation, please generate a complete formal Request for Proposal (RFP) document. Include all the details we've discussed organized into appropriate sections.`;
    
    // Add this as a user message
    conversations[conversationId].messages.push({ role: 'user', content: finalPrompt });
    
    const chatCompletion = await openai.chat.completions.create({
      messages: conversations[conversationId].messages,
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 2048, // Use more tokens for the final document
    });

    if (!chatCompletion.choices[0]?.message?.content) {
      logger.warn("OpenAI returned an empty response for final RFP.");
      throw ErrorTypes.ExternalService("Received empty response from OpenAI", "OpenAI");
    }
    
    return chatCompletion.choices[0].message.content;
  } catch (error: any) {
    logger.error("Error generating final RFP:", error);
    throw ErrorTypes.ExternalService(`Error generating final RFP: ${error.message}`, "OpenAI");
  }
} 