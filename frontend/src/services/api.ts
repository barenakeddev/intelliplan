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

// NLP API
export const parseDescription = async (description: string, userId?: string) => {
  const response = await api.post('/parseDescription', { description, userId });
  return response.data;
};

// RFP API
export const generateRFP = async (parsedData: ParsedEventData, eventId?: string, userId?: string) => {
  const response = await api.post('/generateRFP', { parsedData, eventId, userId });
  return response.data;
};

// Floor Plan API
export const generateFloorPlan = async (parsedData: ParsedEventData, eventId?: string, userId?: string) => {
  const response = await api.post('/generateFloorPlan', { parsedData, eventId, userId });
  return response.data;
};

export const updateFloorPlan = async (floorPlanId: string, layout: FloorPlanElement[]) => {
  const response = await api.put('/updateFloorPlan', { floorPlanId, layout });
  return response.data;
}; 