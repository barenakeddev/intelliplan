import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the structure for parsed event data
export interface ParsedEventData {
  eventType: string;
  numberOfGuests: number;
  seatingStyle: string;
  cateringStyle: string;
  date: string;
  venueSize: {
    width: number;
    length: number;
  };
}

/**
 * Parses an event description using OpenAI to extract structured data
 * @param description The natural language event description
 * @returns Structured event data
 */
export async function parseEventDescription(description: string): Promise<ParsedEventData> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
      console.warn('OpenAI API key not configured. Using mock data.');
      return generateMockData(description);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that extracts structured event planning data from natural language descriptions.
          Extract the following information:
          - Event type (conference, wedding, corporate retreat, etc.)
          - Number of guests
          - Seating style (banquet, theater, classroom, etc.)
          - Catering style (buffet, plated, cocktail, etc.)
          - Date of the event
          - Venue size requirements (width and length in meters)
          
          Return the data as a JSON object with the following structure:
          {
            "eventType": string,
            "numberOfGuests": number,
            "seatingStyle": string,
            "cateringStyle": string,
            "date": string,
            "venueSize": {
              "width": number,
              "length": number
            }
          }
          
          If any information is missing, make a reasonable assumption based on the event type and other details.`
        },
        {
          role: "user",
          content: description
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as ParsedEventData;
  } catch (error) {
    console.error('Error parsing event description:', error);
    return generateMockData(description);
  }
}

/**
 * Generates mock data when OpenAI is not available
 * @param description The event description
 * @returns Mock structured event data
 */
function generateMockData(description: string): ParsedEventData {
  // Extract some basic info from the description
  const isWedding = description.toLowerCase().includes('wedding');
  const isConference = description.toLowerCase().includes('conference');
  const isCorporate = description.toLowerCase().includes('corporate') || description.toLowerCase().includes('business');
  
  // Generate mock data based on keywords in the description
  let eventType = 'Generic Event';
  let guests = 50;
  let seatingStyle = 'banquet';
  let cateringStyle = 'buffet';
  
  if (isWedding) {
    eventType = 'Wedding Reception';
    guests = 100;
    seatingStyle = 'banquet';
    cateringStyle = 'plated';
  } else if (isConference) {
    eventType = 'Conference';
    guests = 200;
    seatingStyle = 'theater';
    cateringStyle = 'buffet';
  } else if (isCorporate) {
    eventType = 'Corporate Event';
    guests = 75;
    seatingStyle = 'classroom';
    cateringStyle = 'cocktail';
  }
  
  // Extract numbers from the description if available
  const numberMatch = description.match(/\d+/);
  if (numberMatch) {
    const extractedNumber = parseInt(numberMatch[0], 10);
    if (extractedNumber > 0 && extractedNumber < 1000) {
      guests = extractedNumber;
    }
  }
  
  return {
    eventType,
    numberOfGuests: guests,
    seatingStyle,
    cateringStyle,
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    venueSize: {
      width: Math.max(10, Math.ceil(Math.sqrt(guests * 1.5))),
      length: Math.max(10, Math.ceil(Math.sqrt(guests * 1.5) * 1.5))
    }
  };
}

export async function detectLanguage(text: string): Promise<string> {
  // This is a placeholder. In a real implementation, you would use a language detection library
  // For now, we'll assume English
  return 'en';
}

export async function translateText(text: string, targetLanguage: string = 'en'): Promise<string> {
  // This is a placeholder. In a real implementation, you would use a translation service
  // For now, we'll just return the original text
  return text;
} 