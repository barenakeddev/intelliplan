import OpenAI from 'openai';
import { openai } from './openaiService';
import { ErrorTypes, logger } from '../utils/errorHandler';
import { ChatCompletionMessageParam } from 'openai/resources';

// Store extraction results with confidence scores
interface ExtractionField {
  value: string;
  confidence: number; // 0-1 confidence score
  extractedAt: Date;
}

interface ExtractionResult {
  conversationId: string;
  lastUpdated: Date;
  fields: Record<string, ExtractionField>;
}

// In-memory store for extraction results
const extractionResults: Record<string, ExtractionResult> = {};

/**
 * Extracts RFP data from conversation with specialized extraction agent
 */
export async function extractRfpData(conversationId: string, messages: any[]): Promise<Record<string, any>> {
  try {
    // Create a clone of messages to avoid modifying the original
    const messagesCopy = [...messages];
    
    // Add a system message to define the extraction agent's role
    messagesCopy.unshift({
      role: 'system',
      content: `You are an RFP Data Extraction Specialist with advanced intelligence. Your job is to carefully analyze conversations between an event planner and a client, and extract structured information for an RFP (Request for Proposal).
      
      CRITICAL INSTRUCTIONS:
      - Examine EVERY message thoroughly and extract ALL details provided
      - Pay special attention to the first message from the user, which often contains multiple pieces of information
      - Look for information that may be scattered across different messages or mentioned in passing
      - Carefully note when information has been corrected by the user 
      - Extract ONLY information that has been EXPLICITLY stated or confirmed
      - Never make assumptions or infer information that hasn't been clearly communicated
      - Recognize context and clarifications that modify previously stated information
      - If information is ambiguous or unclear, mark it as "Not specified" rather than guessing
      - When encountering numeric values in text, parse them accurately (like "250 people" or "$50,000 budget")
      - Be able to identify when a user mentions having an RFP conversation they haven't shared yet
      - Distinguish between main event spaces and breakout rooms/auxiliary spaces
      - Recognize room setup styles (theater, classroom, banquet, half-round, etc.) and their implications
      
      For each field you extract, provide a confidence score (0.0-1.0) based on how certain you are that the information is correct.`
    });
    
    // Add the extraction prompt
    messagesCopy.push({ 
      role: 'user', 
      content: `Analyze the conversation and extract structured RFP data for the following fields:

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
24. Guest Room Requirements (separate from meeting spaces)
25. Program Flow Details

For EACH field, include a confidence score from 0.0 to 1.0.

Please respond with a JSON object containing all extracted information. The json response format should follow this structure:
{
  "eventName": {"value": "", "confidence": 0.0},
  "hostOrganization": {"value": "", "confidence": 0.0},
  "organizer": {"value": "", "confidence": 0.0},
  "eventType": {"value": "", "confidence": 0.0},
  "eventDescription": {"value": "", "confidence": 0.0},
  "preferredDate": {"value": "", "confidence": 0.0},
  "alternativeDate": {"value": "", "confidence": 0.0},
  "dateFlexibility": {"value": true/false, "confidence": 0.0},
  "attendeeCount": {"value": "", "confidence": 0.0},
  "roomsRequired": {"value": "", "confidence": 0.0},
  "seatingArrangement": {"value": "", "confidence": 0.0},
  "accessibilityRequirements": {"value": "", "confidence": 0.0},
  "mealPeriods": {"value": "", "confidence": 0.0},
  "serviceStyle": {"value": "", "confidence": 0.0},
  "dietaryNeeds": {"value": "", "confidence": 0.0},
  "avNeeds": {"value": "", "confidence": 0.0},
  "budgetRange": {"value": "", "confidence": 0.0},
  "parkingNeeds": {"value": "", "confidence": 0.0},
  "transportationNeeds": {"value": "", "confidence": 0.0},
  "contactName": {"value": "", "confidence": 0.0},
  "contactPhone": {"value": "", "confidence": 0.0},
  "contactEmail": {"value": "", "confidence": 0.0},
  "contactAddress": {"value": "", "confidence": 0.0},
  "other": {"value": "", "confidence": 0.0},
  "concessions": {"value": [""], "confidence": 0.0},
  "foodAndBeverage": {"value": [""], "confidence": 0.0},
  "guestRooms": {"value": [""], "confidence": 0.0},
  "programFlow": {"value": [{ "time": "", "function": "", "attendanceSet": "" }], "confidence": 0.0}
}` 
    });
    
    // Get structured data using a more precise model
    const structuredDataCompletion = await openai.chat.completions.create({
      messages: messagesCopy,
      model: 'gpt-4o-mini', // Could use a different model here for extraction
      temperature: 0.1,     // Lower temperature for more deterministic results
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });
    
    const structuredDataContent = structuredDataCompletion.choices[0]?.message?.content || "{}";
    const extractedData = JSON.parse(structuredDataContent);
    
    // Update extraction results with timestamp
    const now = new Date();
    
    if (!extractionResults[conversationId]) {
      extractionResults[conversationId] = {
        conversationId,
        lastUpdated: now,
        fields: {}
      };
    }
    
    // Update extraction store with new data and timestamps
    for (const [key, value] of Object.entries(extractedData)) {
      if (value && typeof value === 'object' && 'value' in value && 'confidence' in value) {
        extractionResults[conversationId].fields[key] = {
          ...value as ExtractionField,
          extractedAt: now
        };
      }
    }
    
    extractionResults[conversationId].lastUpdated = now;
    
    // Convert to data format expected by frontend
    const resultForFrontend: Record<string, any> = {};
    
    // Only include fields with confidence above threshold (0.6)
    const confidenceThreshold = 0.6;
    for (const [key, field] of Object.entries(extractionResults[conversationId].fields)) {
      if (field.confidence >= confidenceThreshold) {
        // Special handling for fields that should always be arrays
        if (key === 'foodAndBeverage' || key === 'concessions' || key === 'guestRooms' || key === 'avNeeds') {
          if (typeof field.value === 'string') {
            // If it's a string, convert it to an array with the string as a single item
            resultForFrontend[key] = field.value ? [field.value] : [];
          } else if (Array.isArray(field.value)) {
            resultForFrontend[key] = field.value;
          } else {
            resultForFrontend[key] = [];
          }
        } else {
          resultForFrontend[key] = field.value;
        }
      }
    }
    
    logger.info(`Extracted RFP data for conversation ${conversationId} with ${Object.keys(resultForFrontend).length} confident fields`);
    
    return {
      data: resultForFrontend,
      metadata: {
        extractedAt: now,
        confidence: extractionResults[conversationId].fields
      }
    };
  } catch (error: any) {
    logger.error("Error extracting RFP data:", error);
    return {
      data: {},
      metadata: {
        error: error.message
      }
    };
  }
}

/**
 * Retrieves the latest extraction results for a conversation
 */
export function getExtractionResults(conversationId: string): ExtractionResult | null {
  return extractionResults[conversationId] || null;
}

/**
 * Get recommendations for additional data collection based on current extraction results
 */
export async function getDataCollectionRecommendations(conversationId: string): Promise<string[]> {
  try {
    const extractionResult = getExtractionResults(conversationId);
    if (!extractionResult) {
      return [];
    }
    
    // Convert current extraction results to a readable format
    const extractedInfo: Record<string, any> = {};
    for (const [key, field] of Object.entries(extractionResult.fields)) {
      if (field.confidence >= 0.6) { // Only include confident fields
        extractedInfo[key] = field.value;
      }
    }
    
    // Create a message for the AI to analyze what's missing
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an advanced RFP data analysis expert helping to identify missing information for a complete event Request for Proposal. Your recommendations should be specific, actionable, prioritized by importance, and delivered in JSON format.

You understand event planning deeply and can recognize critical gaps in RFP information that would affect venue selection, pricing, and logistics. You recognize patterns in the existing data to infer what type of event is being planned and what information would be most relevant.

Your analysis should consider:
1. The type of event and its specific requirements
2. Standard industry expectations for this type of event
3. Critical information venues need for accurate pricing
4. Information needed for operational planning
5. Details that affect guest experience
6. Logical follow-up questions based on currently available information`
      },
      {
        role: 'user',
        content: `Here's the information I've already collected for this RFP in JSON format:
        ${JSON.stringify(extractedInfo, null, 2)}
        
        Based on this information, please provide a JSON list of 3-5 additional questions I should ask the client to complete the RFP. Each question should target a specific missing field or area that would be important for an event venue to know. 
        
        Prioritize questions about:
        1. Missing critical information needed by venues
        2. Details that would significantly affect pricing
        3. Information needed for operational planning
        4. Details that would enhance the event experience
        
        Format questions in a conversational tone that an event planner would use with a client.
        
        Return a JSON array of strings, each string being a question to ask. I need you to format your response as JSON. Example json response format:
        {
          "questions": [
            "What is your preferred seating arrangement for the main event?",
            "Do you have any specific dietary requirements that need to be accommodated?",
            "What is your budget range for this event?"
          ]
        }`
      }
    ];
    
    // Get recommendations from OpenAI
    const recommendationsCompletion = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });
    
    const content = recommendationsCompletion.choices[0]?.message?.content || "{}";
    const recommendations = JSON.parse(content);
    
    return recommendations.questions || [];
  } catch (error) {
    logger.error("Error generating data collection recommendations:", error);
    return [];
  }
} 