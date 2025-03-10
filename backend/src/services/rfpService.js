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
exports.modifyRFP = exports.generateRFP = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Initialize OpenAI client
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Generates an RFP (Request for Proposal) based on parsed event data
 * @param parsedData Structured event data
 * @returns Generated RFP text
 */
function generateRFP(parsedData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if OpenAI API key is available
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
                console.warn('OpenAI API key not configured. Using template RFP.');
                return generateTemplateRFP(parsedData);
            }
            const response = yield openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert event planner who creates professional Request for Proposals (RFPs) for venues.
          Create a detailed and professional RFP based on the event details provided.
          The RFP should include:
          
          1. Introduction with event overview
          2. Event details (date, time, number of guests)
          3. Venue requirements (size, layout, seating arrangement)
          4. Catering requirements
          5. AV and technical requirements
          6. Budget considerations
          7. Contact information (use placeholder)
          
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
        }
        catch (error) {
            console.error('Error generating RFP:', error);
            return generateTemplateRFP(parsedData);
        }
    });
}
/**
 * Generates a template RFP when OpenAI is not available
 * @param parsedData Structured event data
 * @returns Template RFP text
 */
function generateTemplateRFP(parsedData) {
    const today = new Date().toLocaleDateString();
    return `
# REQUEST FOR PROPOSAL (RFP)
## ${parsedData.eventType}
### Date: ${today}

## 1. EVENT OVERVIEW
We are planning a ${parsedData.eventType.toLowerCase()} and are seeking proposals from venues that can accommodate our requirements.

## 2. EVENT DETAILS
- **Event Type:** ${parsedData.eventType}
- **Date:** ${parsedData.date}
- **Number of Guests:** ${parsedData.numberOfGuests}
- **Event Duration:** 8 hours (typical)

## 3. VENUE REQUIREMENTS
- **Space Required:** Approximately ${parsedData.venueSize.width}m x ${parsedData.venueSize.length}m
- **Seating Arrangement:** ${parsedData.seatingStyle} style
- **Room Setup:** The venue should be able to accommodate our floor plan which includes tables, a stage area, and space for movement.

## 4. CATERING REQUIREMENTS
- **Service Style:** ${parsedData.cateringStyle}
- **Dietary Restrictions:** Venue must be able to accommodate common dietary restrictions (vegetarian, vegan, gluten-free)
- **Beverage Service:** Please include options for both alcoholic and non-alcoholic beverages

## 5. AUDIO/VISUAL REQUIREMENTS
- Sound system suitable for announcements and background music
- Projector and screen for presentations
- Lighting appropriate for the event type
- WiFi access for guests

## 6. BUDGET CONSIDERATIONS
Please provide detailed pricing for:
- Venue rental
- Catering (per person)
- AV equipment
- Any additional fees or charges

## 7. SUBMISSION REQUIREMENTS
Please include in your proposal (if available):
- Available dates around our preferred date
- Detailed cost breakdown
- Cancellation and refund policies
- Photos of the venue
- Floor plan options

## 8. CONTACT INFORMATION
For questions or to submit your proposal, please contact:
- Name: [Event Organizer]
- Email: organizer@example.com
- Phone: (555) 123-4567

Thank you for your consideration. We look forward to reviewing your proposal.
`;
}
/**
 * Modifies an existing RFP based on user prompt
 * @param rfpText Current RFP text
 * @param prompt User's modification prompt
 * @returns Modified RFP text
 */
function modifyRFP(rfpText, prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if OpenAI API key is available
            if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
                console.warn('OpenAI API key not configured. Cannot modify RFP.');
                return rfpText;
            }
            
            const response = yield openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert event planner who creates professional Request for Proposals (RFPs) for venues.
                        You are tasked with modifying an existing RFP based on the user's instructions.
                        Maintain the professional tone and format of the original RFP.
                        Keep the same Markdown formatting with headers and sections.
                        Only make changes that align with the user's prompt.`
                    },
                    {
                        role: "user",
                        content: `Here is the current RFP:
                        
                        ${rfpText}
                        
                        Please modify this RFP according to the following instructions:
                        
                        ${prompt}`
                    }
                ]
            });
            
            return response.choices[0].message.content || rfpText;
        } catch (error) {
            console.error('Error modifying RFP:', error);
            return rfpText;
        }
    });
}
exports.modifyRFP = modifyRFP;
