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
exports.openai = void 0;
exports.createConversation = createConversation;
exports.getConversation = getConversation;
exports.addMessageToConversation = addMessageToConversation;
exports.getInitialMessage = getInitialMessage;
exports.generateRFP = generateRFP;
exports.generateFinalRFP = generateFinalRFP;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("../utils/errorHandler");
dotenv_1.default.config();
exports.openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
// System prompt for RFP conversational assistant
const RFP_SYSTEM_PROMPT = `You are an EXPERT event planning AI assistant designed to help users create Requests for Proposal (RFPs) for venues through natural, conversational interactions. You have extensive knowledge of the event planning industry, venue requirements, and RFP best practices. Your goal is to efficiently gather detailed event planning information in a friendly, clear, and concise manner, simulating a conversation between an experienced event planner and a client.

Your objectives:

    Collect the following REQUIRED details without overwhelming the user:

        Event Overview
            Event Name, Host Organization, Organizer (if different)
            Event Type (conference, wedding, seminar, fundraiser, etc.)
            Brief description (purpose, theme)

        Event Dates & Flexibility
            Preferred Date (obtain SPECIFIC dates with month, day, and year)
            Alternative Date(s) (obtain SPECIFIC dates with month, day, and year)
            Flexibility (Yes/No)

        Attendance
            Estimated Number of Attendees (obtain a specific number or range)

        Venue Requirements (Meeting/Event Spaces)
            Number of rooms/spaces required
            Approximate size needed or seating arrangements (e.g., theatre, classroom, banquet style)
            Accessibility requirements (ADA compliance, wheelchair access)

        Guest Room Requirements
            Number of rooms needed
            Dates needed
            Special room requirements

        Catering Requirements
            Meal Periods (Breakfast, Lunch, Dinner, Breaks)
            Service Style (Plated, Buffet, Family-Style)
            Dietary needs (vegan, gluten-free, etc.)

        AV Needs
            Basic equipment needed (microphones, projectors, screens, podium, etc.)
            Wi-Fi, live streaming, etc.

        Budget Range (obtain a specific amount or range)

        Parking/Transportation Needs

        Contact Information (name, phone, email, address)
        
        Other (for anything that doesn't fit in other categories)
        
        Concessions (any special requests for complimentary items)

Conversational Style Guidelines:

    CRITICAL:
    - CAREFULLY READ the user's entire message to extract ALL provided information
    - NEVER ask for information that was already provided, either explicitly or implicitly
    - SCAN the entire conversation history before asking questions
    - If user corrects you or points out you missed information, apologize briefly and adjust
    - If a user mentions multiple details in one message, acknowledge ALL of them
    
    IMPORTANT: 
    - ASK ONLY ONE QUESTION AT A TIME and wait for a response before asking the next question
    - Keep your responses brief, direct, and human-like
    - DO NOT provide lengthy summaries of the collected information - the RFP document already shows this
    - When confirming an information update, keep it extremely brief (e.g., "Thanks! I've updated the RFP.")
    - If any part of the request is unclear, ask for clarification on ONLY that part
    - Never repeat previously gathered information unless specifically asked
    
CRITICAL: Maintain clear distinction between different types of information:
    - Keep Guest Room accommodation information (hotel rooms) completely separate from Venue Requirements (meeting/event spaces)
    - Do not mix these two categories when asking questions or summarizing information
    - Do not mix up seating arrangements (theater, classroom, etc.) with service style (buffet, plated)

IMPORTANT FLOW CONTROL:
    - After the user answers a question, acknowledge their response with a single short sentence before asking the next question
    - When you've collected enough information (at least 70% of the required fields), notify the user: "I have enough information for the RFP. Would you like to provide any additional details about [list 2-3 missing important fields]?"
    - At the end of the conversation, say: "Thank you. The RFP contains all the information you provided. Did I miss anything or do you have any questions?"

Your first message should be a brief welcome and ask what type of event they're planning. After they respond, ask ONLY ONE question at a time in a natural flow, waiting for the user's response each time.`;
// Storage for conversations
const conversations = {};
// Generate a unique conversation ID
function generateConversationId() {
    return Date.now().toString();
}
// Create a new conversation
function createConversation() {
    const conversationId = generateConversationId();
    conversations[conversationId] = {
        id: conversationId,
        messages: [
            { role: 'system', content: RFP_SYSTEM_PROMPT },
        ]
    };
    return conversationId;
}
/**
 * Get a conversation by ID
 */
function getConversation(conversationId) {
    return conversations[conversationId] || null;
}
// Add message to conversation
function addMessageToConversation(conversationId, role, content) {
    if (!conversations[conversationId]) {
        throw new Error(`Conversation with ID ${conversationId} not found`);
    }
    conversations[conversationId].messages.push({ role, content });
}
// Get first assistant message
function getInitialMessage(conversationId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Create the system prompt defining the assistant's behavior
            const systemPrompt = {
                role: 'system',
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
                role: 'assistant',
                content: initialMessage
            });
            return initialMessage;
        }
        catch (error) {
            errorHandler_1.logger.error("Error in OpenAI service:", error);
            if (error.code === 'invalid_api_key') {
                throw errorHandler_1.ErrorTypes.ExternalService("Invalid OpenAI API Key.", "OpenAI");
            }
            else {
                throw errorHandler_1.ErrorTypes.ExternalService(`OpenAI API Error: ${error.message}`, "OpenAI");
            }
        }
    });
}
// Generate RFP based on conversation history
function generateRFP(conversationId, prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            errorHandler_1.logger.info('Attempting to use OpenAI model: gpt-4o-mini');
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
            const chatCompletion = yield exports.openai.chat.completions.create({
                messages: conversations[conversationId].messages,
                model: 'gpt-4o-mini',
                temperature: 0.7,
                max_tokens: 500,
            });
            if (!((_b = (_a = chatCompletion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content)) {
                errorHandler_1.logger.warn("OpenAI returned an empty response.");
                throw errorHandler_1.ErrorTypes.ExternalService("Received empty response from OpenAI", "OpenAI");
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
                    yield updateRfpStructuredData(conversationId);
                }
                catch (error) {
                    // We don't want to fail the main function if this fails
                    errorHandler_1.logger.warn("Failed to extract structured RFP data during conversation: " + error);
                }
            }
            errorHandler_1.logger.info('Successfully used model: gpt-4o-mini');
            return assistantMessage;
        }
        catch (error) {
            errorHandler_1.logger.error("Error in OpenAI service:", error);
            if (error.code === 'invalid_api_key') {
                throw errorHandler_1.ErrorTypes.ExternalService("Invalid OpenAI API Key.", "OpenAI");
            }
            else {
                throw errorHandler_1.ErrorTypes.ExternalService(`OpenAI API Error: ${error.message}`, "OpenAI");
            }
        }
    });
}
// Helper function to update structured data based on conversation
function updateRfpStructuredData(conversationId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
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
        const structuredDataCompletion = yield exports.openai.chat.completions.create({
            messages: messagesCopy,
            model: 'gpt-4o-mini',
            temperature: 0.3,
            max_tokens: 1024,
            response_format: { type: "json_object" }
        });
        // Store the extracted data in the conversation object for later use
        try {
            const structuredDataContent = ((_b = (_a = structuredDataCompletion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "{}";
            const structuredData = JSON.parse(structuredDataContent);
            // Store this data with the conversation
            if (!conversations[conversationId].structuredData) {
                conversations[conversationId].structuredData = {};
            }
            conversations[conversationId].structuredData = structuredData;
            errorHandler_1.logger.info("Successfully extracted and stored structured RFP data during conversation");
        }
        catch (error) {
            errorHandler_1.logger.warn("Failed to parse structured RFP data during conversation");
            // Continue without storing if parsing fails
        }
    });
}
// Generate final RFP document
function generateFinalRFP(conversationId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
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

4. Venue Requirements (Meeting/Event Spaces)
   - Number of Rooms/Spaces Required
   - Seating Arrangement
   - Accessibility Requirements

5. Catering Requirements
   - Meal Periods
   - Service Style
   - Food & Beverage Details
   - Dietary Restrictions

6. AV Needs
   - Equipment Needed

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
    - Concessions
    - Guest Rooms (completely separate from meeting spaces)
    - Typical Program Sample Flow (in table format with Time, Function, and Attendance/Set columns)
    - Other

For any sections where we haven't collected information, please include the section headings but leave them blank. Format the document in a clean, professional style appropriate for sending to venues.`;
            // Add this as a user message
            conversations[conversationId].messages.push({ role: 'user', content: finalPrompt });
            // Use any previously extracted structured data if available
            let structuredData = conversations[conversationId].structuredData || {};
            // If we don't have structured data already, extract it now
            if (!structuredData || Object.keys(structuredData).length === 0) {
                yield updateRfpStructuredData(conversationId);
                structuredData = conversations[conversationId].structuredData || {};
            }
            // Generate the final RFP document
            const chatCompletion = yield exports.openai.chat.completions.create({
                messages: conversations[conversationId].messages,
                model: 'gpt-4o-mini',
                temperature: 0.5,
                max_tokens: 1500,
            });
            if (!((_b = (_a = chatCompletion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content)) {
                throw errorHandler_1.ErrorTypes.ExternalService("Received empty response from OpenAI", "OpenAI");
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
        }
        catch (error) {
            errorHandler_1.logger.error("Error generating final RFP:", error);
            if (error.code === 'invalid_api_key') {
                throw errorHandler_1.ErrorTypes.ExternalService("Invalid OpenAI API Key.", "OpenAI");
            }
            else {
                throw errorHandler_1.ErrorTypes.ExternalService(`OpenAI API Error: ${error.message}`, "OpenAI");
            }
        }
    });
}
