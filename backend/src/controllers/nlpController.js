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
exports.parseDescription = parseDescription;
const nlpService_1 = require("../services/nlpService");
const supabaseClient_1 = require("../utils/supabaseClient");
/**
 * Parses an event description and returns structured data
 * @param req Express request object
 * @param res Express response object
 */
function parseDescription(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { description, userId } = req.body;
            if (!description) {
                return res.status(400).json({ error: 'Event description is required' });
            }
            // Parse the event description
            const parsedData = yield (0, nlpService_1.parseEventDescription)(description);
            // If userId is provided, save to Supabase
            if (userId) {
                try {
                    // Insert event into Supabase
                    const { data: eventData, error: eventError } = yield supabaseClient_1.supabase
                        .from('events')
                        .insert({
                        user_id: userId,
                        original_description: description,
                        parsed_data: parsedData
                    })
                        .select('id')
                        .single();
                    if (eventError) {
                        console.error('Error saving event to Supabase:', eventError);
                    }
                    else if (eventData) {
                        // Create a conversation entry for this event
                        const snippet = description.length > 100
                            ? description.substring(0, 97) + '...'
                            : description;
                        const { error: conversationError } = yield supabaseClient_1.supabase
                            .from('conversations')
                            .insert({
                            event_id: eventData.id,
                            snippet
                        });
                        if (conversationError) {
                            console.error('Error creating conversation:', conversationError);
                        }
                        // Return the event ID along with parsed data
                        return res.status(200).json({
                            parsedData,
                            eventId: eventData.id,
                            language: 'en' // Default to English for now
                        });
                    }
                }
                catch (dbError) {
                    console.error('Database error:', dbError);
                }
            }
            // If no userId or there was an error saving, just return the parsed data
            return res.status(200).json({
                parsedData,
                language: 'en' // Default to English for now
            });
        }
        catch (error) {
            console.error('Error in parseDescription controller:', error);
            return res.status(500).json({ error: 'Failed to parse event description' });
        }
    });
}
