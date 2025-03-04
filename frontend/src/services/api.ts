import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export interface FloorPlanElement {
  id: number;
  type: string;
  x: number;
  y: number;
  [key: string]: any;
}

export interface FloorPlan {
  venueDimensions: {
    width: number;
    length: number;
  };
  elements: FloorPlanElement[];
}

/**
 * Parses an event description to extract structured data
 * @param description The event description to parse
 * @param userId Optional user ID
 * @returns Parsed event data
 */
export const parseDescription = async (description: string, userId?: string) => {
  try {
    const response = await api.post('/rfp/parse-description', { description, userId });
    return response.data;
  } catch (error) {
    console.error('Error parsing description:', error);
    throw error;
  }
};

/**
 * Extracts information from a conversation message
 * @param message The message to extract information from
 * @param currentInfo The current information we have
 * @param userId Optional user ID
 * @returns Updated information
 */
export const extractInfoFromMessage = async (message: string, currentInfo: any, userId?: string) => {
  try {
    const response = await api.post('/rfp/extract-info', { message, currentInfo, userId });
    return response.data;
  } catch (error) {
    console.error('Error extracting information from message:', error);
    throw error;
  }
};

// RFP API
export const generateRFP = async (parsedData: ParsedEventData, eventId?: string, userId?: string) => {
  const response = await api.post('/rfp/generate', { parsedData, eventId, userId });
  return response.data;
};

// AI Prompt for RFP modification
export const modifyRFPWithAI = async (rfpText: string, prompt: string, eventId?: string, userId?: string, rfpId?: string) => {
  try {
    // If rfpText is empty, we're creating a new RFP from scratch
    const isNewRfp = !rfpText || rfpText.trim() === '';
    
    const response = await api.post('/rfp/modify', { 
      currentRFP: rfpText, 
      prompt,
      eventId, 
      userId, 
      rfpId,
      isNewRfp
    });
    
    // Return the full response data
    return response.data;
  } catch (error) {
    console.error('Error modifying RFP with AI:', error);
    // Return an object with the original text if there's an error
    return { modifiedRFP: rfpText };
  }
};

// Floor Plan API
export const generateFloorPlan = async (parsedData: ParsedEventData, eventId?: string, userId?: string) => {
  const response = await api.post('/floorplan/generate', { parsedData, eventId, userId });
  return response.data;
};

export const updateFloorPlan = async (floorPlanId: string, layout: FloorPlanElement[]) => {
  const response = await api.put('/floorplan/update', { floorPlanId, layout });
  return response.data;
}; 