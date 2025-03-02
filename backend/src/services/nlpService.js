"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEventDescription = parseEventDescription;
exports.detectLanguage = detectLanguage;
exports.translateText = translateText;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Initialize OpenAI client
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Parses an event description using OpenAI to extract structured data
 * @param description The natural language event description
 * @returns Structured event data
 */
function parseEventDescription(description) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if OpenAI API key is available
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
                console.warn('OpenAI API key not configured. Using mock data.');
                return generateMockData(description);
            }
            const response = yield openai.chat.completions.create({
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
            return result;
        }
        catch (error) {
            console.error('Error parsing event description:', error);
            return generateMockData(description);
        }
    });
}
/**
 * Generates mock data when OpenAI is not available
 * @param description The event description
 * @returns Mock structured event data
 */
function generateMockData(description) {
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
    }
    else if (isConference) {
        eventType = 'Conference';
        guests = 200;
        seatingStyle = 'theater';
        cateringStyle = 'buffet';
    }
    else if (isCorporate) {
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
function detectLanguage(text) {
    return __awaiter(this, void 0, void 0, function* () {
        // This is a placeholder. In a real implementation, you would use a language detection library
        // For now, we'll assume English
        return 'en';
    });
}
function translateText(text_1) {
    return __awaiter(this, arguments, void 0, function* (text, targetLanguage = 'en') {
        // This is a placeholder. In a real implementation, you would use a translation service
        // For now, we'll just return the original text
        return text;
    });
}
