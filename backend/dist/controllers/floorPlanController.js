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
exports.generateFloorPlanController = generateFloorPlanController;
exports.updateFloorPlanController = updateFloorPlanController;
const floorPlanService_1 = require("../services/floorPlanService");
const supabaseClient_1 = require("../utils/supabaseClient");
/**
 * Generates a floor plan based on parsed event data
 * @param req Express request object
 * @param res Express response object
 */
function generateFloorPlanController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { parsedData, eventId, userId } = req.body;
            if (!parsedData) {
                return res.status(400).json({ error: 'Parsed event data is required' });
            }
            // Generate floor plan
            const floorPlan = yield (0, floorPlanService_1.generateFloorPlan)(parsedData);
            // If eventId and userId are provided, save to Supabase
            if (eventId && userId) {
                try {
                    // Check if the event belongs to the user
                    const { data: eventData, error: eventError } = yield supabaseClient_1.supabase
                        .from('events')
                        .select('id')
                        .eq('id', eventId)
                        .eq('user_id', userId)
                        .single();
                    if (eventError || !eventData) {
                        console.error('Error verifying event ownership:', eventError);
                        return res.status(403).json({ error: 'Not authorized to access this event' });
                    }
                    // Insert floor plan into Supabase
                    const { error: floorPlanError } = yield supabaseClient_1.supabase
                        .from('floor_plans')
                        .insert({
                        event_id: eventId,
                        layout: { elements: floorPlan.elements },
                        venue_dimensions: floorPlan.venueDimensions
                    });
                    if (floorPlanError) {
                        console.error('Error saving floor plan to Supabase:', floorPlanError);
                    }
                }
                catch (dbError) {
                    console.error('Database error:', dbError);
                }
            }
            return res.status(200).json(floorPlan);
        }
        catch (error) {
            console.error('Error in generateFloorPlan controller:', error);
            return res.status(500).json({ error: 'Failed to generate floor plan' });
        }
    });
}
function updateFloorPlanController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { floorPlanId, layout } = req.body;
            if (!floorPlanId || !layout) {
                return res.status(400).json({ error: 'Floor plan ID and layout are required' });
            }
            // Update floor plan in database
            const { data, error } = yield supabaseClient_1.supabase
                .from('floorplans')
                .update({
                layout,
            })
                .eq('id', floorPlanId)
                .select();
            if (error) {
                console.error('Error updating floor plan:', error);
                return res.status(500).json({ error: 'Failed to update floor plan' });
            }
            return res.status(200).json({
                success: true,
                floorPlan: data && data.length > 0 ? data[0] : null
            });
        }
        catch (error) {
            console.error('Error in updateFloorPlan controller:', error);
            return res.status(500).json({ error: 'Failed to update floor plan' });
        }
    });
}
