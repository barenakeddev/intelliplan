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
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRfpData = extractRfpData;
exports.getExtractionResults = getExtractionResults;
exports.getDataCollectionRecommendations = getDataCollectionRecommendations;
const openaiService_1 = require("./openaiService");
const errorHandler_1 = require("../utils/errorHandler");
// In-memory store for extraction results
const extractionResults = {};
/**
 * Extracts RFP data from conversation with specialized extraction agent
 */
function extractRfpData(conversationId, messages) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Create a clone of messages to avoid modifying the original
            const messagesCopy = [...messages];
            // Add a system message to define the extraction agent's role
            messagesCopy.unshift({
                role: 'system',
                content: `You are an RFP Data Extraction Specialist. Your only job is to carefully analyze conversations between an event planner and a client, and extract structured information for an RFP (Request for Proposal). 
      
      CRITICAL INSTRUCTIONS:
      - Examine EVERY message thoroughly and extract ALL details provided
      - Pay special attention to the first message from the user, which often contains multiple pieces of information
      - Look for information that may be scattered across different messages or mentioned in passing
      - Carefully note when information has been corrected by the user 
      - Extract ONLY information that has been EXPLICITLY stated or confirmed
      - Never make assumptions or infer information that hasn't been clearly communicated
      - If information is ambiguous or unclear, mark it as "Not specified" rather than guessing
      
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
            const structuredDataCompletion = yield openaiService_1.openai.chat.completions.create({
                messages: messagesCopy,
                model: 'gpt-4o-mini', // Could use a different model here for extraction
                temperature: 0.1, // Lower temperature for more deterministic results
                max_tokens: 1500,
                response_format: { type: "json_object" }
            });
            const structuredDataContent = ((_b = (_a = structuredDataCompletion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "{}";
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
                    extractionResults[conversationId].fields[key] = Object.assign(Object.assign({}, value), { extractedAt: now });
                }
            }
            extractionResults[conversationId].lastUpdated = now;
            // Convert to data format expected by frontend
            const resultForFrontend = {};
            // Only include fields with confidence above threshold (0.6)
            const confidenceThreshold = 0.6;
            for (const [key, field] of Object.entries(extractionResults[conversationId].fields)) {
                if (field.confidence >= confidenceThreshold) {
                    resultForFrontend[key] = field.value;
                }
            }
            errorHandler_1.logger.info(`Extracted RFP data for conversation ${conversationId} with ${Object.keys(resultForFrontend).length} confident fields`);
            return {
                data: resultForFrontend,
                metadata: {
                    extractedAt: now,
                    confidence: extractionResults[conversationId].fields
                }
            };
        }
        catch (error) {
            errorHandler_1.logger.error("Error extracting RFP data:", error);
            return {
                data: {},
                metadata: {
                    error: error.message
                }
            };
        }
    });
}
/**
 * Retrieves the latest extraction results for a conversation
 */
function getExtractionResults(conversationId) {
    return extractionResults[conversationId] || null;
}
/**
 * Get recommendations for additional data collection based on current extraction results
 */
function getDataCollectionRecommendations(conversationId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const extractionResult = getExtractionResults(conversationId);
            if (!extractionResult) {
                return [];
            }
            // Convert current extraction results to a readable format
            const extractedInfo = {};
            for (const [key, field] of Object.entries(extractionResult.fields)) {
                if (field.confidence >= 0.6) { // Only include confident fields
                    extractedInfo[key] = field.value;
                }
            }
            // Create a message for the AI to analyze what's missing
            const messages = [
                {
                    role: 'system',
                    content: 'You are an RFP data analysis expert helping to identify missing information to collect from a client for a complete event Request for Proposal. Your recommendations should be specific, actionable, and in JSON format.'
                },
                {
                    role: 'user',
                    content: `Here's the information I've already collected for this RFP in JSON format:
        ${JSON.stringify(extractedInfo, null, 2)}
        
        Based on this information, please provide a JSON list of 3-5 additional questions I should ask the client to complete the RFP. Each question should target a specific missing field or area that would be important for an event venue to know. Only include fields that are currently empty or have low confidence.
        
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
            const recommendationsCompletion = yield openaiService_1.openai.chat.completions.create({
                messages,
                model: 'gpt-4o-mini',
                temperature: 0.7,
                max_tokens: 500,
                response_format: { type: "json_object" }
            });
            const content = ((_b = (_a = recommendationsCompletion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "{}";
            const recommendations = JSON.parse(content);
            return recommendations.questions || [];
        }
        catch (error) {
            errorHandler_1.logger.error("Error generating data collection recommendations:", error);
            return [];
        }
    });
}
