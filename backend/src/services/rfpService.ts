import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ParsedEventData } from './nlpService';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates an RFP (Request for Proposal) based on parsed event data
 * @param parsedData Structured event data
 * @returns Generated RFP text
 */
export async function generateRFP(parsedData: ParsedEventData): Promise<string> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
      console.warn('OpenAI API key not configured. Using template RFP.');
      return generateTemplateRFP(parsedData);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert event planner who creates professional Request for Proposals (RFPs) for venues.
          Create a detailed and professional RFP based on the event details provided.
          The RFP should follow this exact format:
          
          # Request for Proposal (RFP)

          ## 1. Event Overview
          - Event Name
          - Event Host Organization
          - Event Organizer (if different from Host Organization)
          - Event Type
          - Event Description
          
          ## 2. Event Dates & Flexibility
          - Preferred Date
          - Alternative Date(s)
          - Dates Flexible? (Yes/No)
          
          ## 3. Attendance
          - Estimated Number of Attendees
          
          ## 4. Venue Requirements
          Include a table with these exact columns:
          | Room/Function | Space Required (sqft) | Seating Arrangement | Expected Number of Attendees | Accessibility Features |
          
          ## 5. Catering Requirements
          - Meal Periods
          - Service Style
          
          ## 6. Audio/Visual Requirements
          - Equipment Needed
          - Additional Technical Needs
          
          ## 7. Contact Information
          - Contact Name
          - Phone
          - Email
          - Address
          
          Format the RFP professionally with clear sections and headings.`
        },
        {
          role: "user",
          content: `Please create an RFP for the following event:
          
          Event Type: ${parsedData.eventType}
          Number of Guests: ${parsedData.numberOfGuests}
          Seating Style: ${parsedData.seatingStyle}
          Catering Style: ${parsedData.cateringStyle}
          Date: ${parsedData.date}
          Venue Size: ${parsedData.venueSize.width}m x ${parsedData.venueSize.length}m`
        }
      ]
    });

    return response.choices[0].message.content || generateTemplateRFP(parsedData);
  } catch (error) {
    console.error('Error generating RFP:', error);
    return generateTemplateRFP(parsedData);
  }
}

/**
 * Modifies an existing RFP based on a user prompt
 * @param currentRFP The current RFP text
 * @param prompt The user's modification prompt
 * @returns Modified RFP text
 */
export async function modifyRFPWithAI(currentRFP: string, prompt: string): Promise<string> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
      console.warn('OpenAI API key not configured. Cannot modify RFP with AI.');
      return currentRFP;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert event planner who creates and modifies professional Request for Proposals (RFPs) for venues.
          You will be given an existing RFP and a request to modify it in some way.
          
          The RFP should maintain this exact format:
          
          # Request for Proposal (RFP)

          ## 1. Event Overview
          - Event Name
          - Event Host Organization
          - Event Organizer (if different from Host Organization)
          - Event Type
          - Event Description
          
          ## 2. Event Dates & Flexibility
          - Preferred Date
          - Alternative Date(s)
          - Dates Flexible? (Yes/No)
          
          ## 3. Attendance
          - Estimated Number of Attendees
          
          ## 4. Venue Requirements
          Include a table with these exact columns:
          | Room/Function | Space Required (sqft) | Seating Arrangement | Expected Number of Attendees | Accessibility Features |
          
          ## 5. Catering Requirements
          - Meal Periods
          - Service Style
          
          ## 6. Audio/Visual Requirements
          - Equipment Needed
          - Additional Technical Needs
          
          ## 7. Contact Information
          - Contact Name
          - Phone
          - Email
          - Address
          
          Maintain the professional formatting and structure of the RFP.
          Only make changes that are relevant to the user's request.
          Return the complete modified RFP.`
        },
        {
          role: "user",
          content: `Here is the current RFP:
          
          ${currentRFP}
          
          Please modify this RFP according to the following request:
          
          ${prompt}`
        }
      ]
    });

    return response.choices[0].message.content || currentRFP;
  } catch (error) {
    console.error('Error modifying RFP:', error);
    return currentRFP;
  }
}

/**
 * Generates a template RFP when OpenAI is not available
 * @param parsedData Structured event data
 * @returns Template RFP text
 */
function generateTemplateRFP(parsedData: ParsedEventData): string {
  return `# Request for Proposal (RFP)

## 1. Event Overview
- **Event Name:** 
- **Event Host Organization:** 
- **Event Organizer:** 
- **Event Type:** ${parsedData.eventType || '[Conference, Meeting, Exhibition, etc.]'}
- **Event Description:**  
  *Provide a brief overview of the event objectives, target audience, and overall theme.*

## 2. Event Dates & Flexibility
- **Preferred Date:** ${parsedData.date || '[Insert Date]'}
- **Alternative Date(s):** 
- **Dates Flexible?** (Yes/No): 

## 3. Attendance
- **Estimated Number of Attendees:** ${parsedData.numberOfGuests || '[Insert Number]'}

## 4. Venue Requirements
Please provide detailed information for each room or function space required. Include any accessibility features (e.g., ADA compliance, wheelchair access):

| Room/Function        | Space Required (sqft) | Seating Arrangement | Expected Number of Attendees | Accessibility Features |
| -------------------- | --------------------- | ------------------- | ---------------------------- | ---------------------- |
| Main Hall            | ${parsedData.venueSize ? `${parsedData.venueSize.width * parsedData.venueSize.length}` : '[Insert sqft]'} | ${parsedData.seatingStyle || '[Insert arrangement]'} | ${parsedData.numberOfGuests || ''} | |

## 5. Catering Requirements
- **Meal Periods:** [e.g., Breakfast, Lunch, Coffee Breaks]
- **Service Style:** ${parsedData.cateringStyle || '[e.g., Plated, Buffet, Family-Style]'}

## 6. Audio/Visual Requirements
- **Equipment Needed:** (e.g., Projectors, Screens, Sound System, Microphones)
- **Additional Technical Needs:** 

## 7. Contact Information
- **Contact Name:** 
- **Phone:** 
- **Email:** 
- **Address:** 
`;
} 