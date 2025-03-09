export interface Conversation {
  id: string;
  event_id: string;
  last_updated: string;
  snippet: string;
  name: string;
  avatar: string;
  timestamp: string;
}

export interface Event {
  id: string;
  user_id: string;
  original_description: string;
  parsed_data: ParsedEventData;
  created_at: string;
}

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

export interface RFP {
  id: string;
  event_id: string;
  rfp_text: string;
  created_at: string;
}

export interface VenueDimensions {
  width: number;
  length: number;
  height?: number;
}

export interface Chair {
  angle: number;
  distance: number;
}

export interface TableElement {
  id: number;
  type: 'table';
  shape: 'round' | 'rectangular' | 'oval';
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  capacity: number;
  chairs: Chair[];
}

export interface StageElement {
  id: number;
  type: 'stage';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface ExitElement {
  id: number;
  type: 'exit';
  x: number;
  y: number;
  isEmergency: boolean;
}

export type FloorPlanElement = TableElement | StageElement | ExitElement;

export interface FloorPlan {
  id: string;
  event_id: string;
  layout: FloorPlanLayout;
  venue_dimensions: VenueDimensions;
  created_at: string;
}

export interface FloorPlanLayout {
  elements: FloorPlanElement[];
}

export interface User {
  id: string;
  email: string;
}

export interface RFPSection {
  id: string;
  title: string;
  content: string;
}

export interface ChatAssistantProps {
  rfpName: string;
  onSendMessage: (message: string) => Promise<string>;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editorType?: 'rfp' | 'floorplan' | 'vendor';
} 