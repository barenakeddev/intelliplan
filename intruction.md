# Refined Instructions for Building IntelliPlan Prototype

## Project Overview

Build a web application that enables users to:
1. Input event descriptions in natural language
2. Extract structured event details using NLP
3. Generate event RFPs
4. Create and modify floor plans

Use Supabase for authentication, database, and backend functions.

## UI & Visual Design

The application UI should match the design shown in the provided images:

### Layout Structure
- **Left Sidebar**: Contains conversation history with:
  - Avatar/icon for each conversation
  - Name of event/RFP
  - Supporting text snippet
  - Timestamp (showing "10 min" in the example)
  
- **Main Content Area**:
  - Top navigation tabs: RFP, Floorplan, Vendors
  - When Floorplan tab is selected, show a submenu with options:
    - Table types
    - Seating options
    - Staging elements
    - AV equipment
  - Prominent display of the event name ("EVENT NAME" in the mockup)

### Floor Plan Editor
The floor plan editor should:
- Show a room layout with accurate dimensions (like the 10.69m x 5.51m in the example)
- Support round tables with chairs (8 tables shown in the example)
- Include stage elements with proper positioning
- Show entrance/exit points with proper markings
- Include measurements and grid system for accurate placement

## System Architecture

### Database Schema (Supabase)

```
Users Table: Handled by Supabase Auth
Events Table:
  - id: uuid (primary key)
  - user_id: uuid (foreign key to auth.users)
  - original_description: text
  - parsed_data: jsonb
  - created_at: timestamp

RFPs Table:
  - id: uuid (primary key)
  - event_id: uuid (foreign key to events)
  - rfp_text: text
  - created_at: timestamp

FloorPlans Table:
  - id: uuid (primary key)
  - event_id: uuid (foreign key to events)
  - layout: jsonb (should store all positioning, dimensions, and object types)
  - venue_dimensions: jsonb (width, length, height)
  - created_at: timestamp
  
Conversations Table:
  - id: uuid (primary key)
  - event_id: uuid (foreign key to events)
  - last_updated: timestamp
  - snippet: text (preview text for sidebar)
```

### Backend API Endpoints

#### 1. Parse Description Endpoint
- **Route**: POST /api/parseDescription
- **Functionality**: 
  - Accept event description text
  - Detect language and translate if needed
  - Extract structured event data using OpenAI
- **Request Body**: `{ "description": "string" }`
- **Response**: 
  ```json
  {
    "parsedData": {
      "eventType": "string",
      "numberOfGuests": number,
      "seatingStyle": "string",
      "cateringStyle": "string",
      "date": "string",
      "venueSize": {
        "width": number,
        "length": number
      }
    },
    "language": "string"
  }
  ```

#### 2. Generate RFP Endpoint
- **Route**: POST /api/generateRFP
- **Functionality**: Create formatted RFP from parsed data
- **Request Body**: 
  ```json
  { 
    "parsedData": {
      "eventType": "string",
      "numberOfGuests": number,
      "seatingStyle": "string",
      "cateringStyle": "string",
      "date": "string",
      "venueSize": {
        "width": number,
        "length": number
      }
    }
  }
  ```
- **Response**: `{ "rfp": "string" }`

#### 3. Generate Floor Plan Endpoint
- **Route**: POST /api/generateFloorPlan
- **Functionality**: Create initial floor plan based on event details
- **Request Body**: Same as generate RFP
- **Response**:
  ```json
  {
    "venueDimensions": {
      "width": number,
      "length": number
    },
    "elements": [
      {
        "id": number,
        "type": "table",
        "shape": "round",
        "x": number,
        "y": number,
        "radius": number,
        "capacity": number,
        "chairs": [
          {"angle": number, "distance": number}
        ]
      },
      {
        "id": number,
        "type": "stage",
        "x": number,
        "y": number,
        "width": number,
        "height": number,
        "rotation": number
      },
      {
        "id": number,
        "type": "exit",
        "x": number,
        "y": number,
        "isEmergency": boolean
      }
    ]
  }
  ```

## Implementation Steps

### 1. Project Setup ✅

```bash
# Create project directories
mkdir -p intelliplan-app/{frontend,backend}
cd intelliplan-app

# Backend setup
cd backend
npm init -y
npm install express typescript ts-node @types/node @types/express cors dotenv openai supabase-js langdetect
npx tsc --init

# Frontend setup
cd ../frontend
npx create-react-app . --template typescript
npm install react-router-dom @supabase/supabase-js konva react-konva axios
```

### 2. Supabase Configuration 🔄

1. Create a Supabase project at https://supabase.com
2. Create tables with structure defined above using Supabase interface
3. Enable and configure authentication
4. Create `.env` files in both frontend and backend directories: ✅

```
# Backend .env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
PORT=3001

# Frontend .env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Backend Implementation 🔄

#### File Structure ✅
```
backend/
├── src/
│   ├── controllers/
│   │   ├── nlpController.ts
│   │   ├── rfpController.ts
│   │   └── floorPlanController.ts
│   ├── services/
│   │   ├── nlpService.ts
│   │   ├── rfpService.ts
│   │   └── floorPlanService.ts
│   ├── routes/
│   │   └── apiRoutes.ts
│   ├── utils/
│   │   └── supabaseClient.ts
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
```

#### Key Components

1. **NLP Service** - Implement in `nlpService.ts`:
   - Language detection function
   - Translation function (if needed)
   - OpenAI API call to extract event data
   - Data validation and formatting

2. **RFP Service** - Implement in `rfpService.ts`:
   - Template-based RFP generation
   - Customization based on event type

3. **Floor Plan Service** - Implement in `floorPlanService.ts`:
   - Algorithm to generate table placements based on:
     - Guest count
     - Seating style (banquet, theater, classroom)
     - Venue dimensions
     - Required elements (stage, exits)
   - Calculate optimal spacing between tables
   - Place chairs around tables based on capacity

4. **API Routes** - Configure in `apiRoutes.ts`:
   - Register all endpoints
   - Handle request validation
   - Error handling middleware

### 4. Frontend Implementation 🔄

#### File Structure ✅
```
frontend/
├── public/
│   ├── assets/
│   │   ├── icons/
│   │   │   ├── table-round.svg
│   │   │   ├── stage.svg
│   │   │   ├── exit.svg
│   │   │   └── chair.svg
│   │   └── avatars/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── conversations/
│   │   │   ├── ConversationList.tsx ✅
│   │   │   └── ConversationItem.tsx ✅
│   │   ├── chat/
│   │   │   ├── ChatInput.tsx ✅
│   │   │   ├── ChatInterface.tsx ✅
│   │   │   └── ChatHistory.tsx ✅
│   │   ├── rfp/
│   │   │   ├── RFPView.tsx
│   │   │   └── RFPEditor.tsx
│   │   ├── floorplan/
│   │   │   ├── FloorPlanEditor.tsx
│   │   │   ├── FloorPlanControls.tsx
│   │   │   ├── elements/
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Chair.tsx
│   │   │   │   ├── Stage.tsx
│   │   │   │   └── Exit.tsx
│   │   │   └── FloorPlanMeasurements.tsx
│   │   ├── vendors/
│   │   │   └── VendorList.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── TabNavigation.tsx
│   │       └── Footer.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── supabaseClient.ts ✅
│   ├── context/
│   │   ├── AuthContext.tsx ✅
│   │   └── FloorPlanContext.tsx
│   ├── types/
│   │   └── index.ts ✅
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Dashboard.tsx
│   │   └── EventDetails.tsx
│   ├── styles/
│   │   ├── global.css ✅
│   │   ├── sidebar.css ✅
│   │   └── floorplan.css
│   ├── App.tsx ✅
│   └── index.tsx ✅
├── .env ✅
├── package.json ✅
└── tsconfig.json ✅
```

#### Key Components 🔄

1. **Conversation List** - Implement in `ConversationList.tsx`: ✅
   - Vertical list of conversations matching the design in the image
   - Each item shows avatar, name, supporting text, and timestamp
   - Proper styling for active/selected item

2. **Tab Navigation** - Implement in `TabNavigation.tsx`: 🔄
   - Tabs for RFP, Floorplan, Vendors
   - Submenu for Floorplan tab with Table, Seating, Staging, AV options
   - Match styling from the provided image

3. **Chat Interface** - Implemented in `ChatInterface.tsx`, `ChatHistory.tsx`, and `ChatInput.tsx`: ✅
   - Chat box that fits within the page layout
   - Fixed width (25% of page width)
   - Independent scrolling for chat history
   - Auto-scroll to bottom when new messages are added
   - Proper message styling with user/assistant distinction
   - Responsive input area with send button
   - TypeScript type safety with proper ref handling

4. **Floor Plan Editor** - Implement using React-Konva:
   - Canvas sized according to venue dimensions
   - Grid system with measurements (as shown in image)
   - Support for:
     - Round tables with chairs (as in the reference image)
     - Stage elements
     - Exit signs and emergency exits
     - Stairways and other architectural elements
   - Drag-and-drop functionality
   - Snap-to-grid for precise placement
   - Room dimension display (matching the 10.69m x 5.51m style shown)

5. **Floor Plan Controls** - Implement in `FloorPlanControls.tsx`:
   - Menu for table types, seating styles, stage elements, AV equipment
   - Match the UI shown in the provided image
   - Allow adding new elements to the floor plan

### 5. User Flow Implementation

1. **Authentication Flow**: 🔄
   - User registers/logs in
   - Redirect to conversation list view on success

2. **Conversation Flow**:
   - Left sidebar shows all event conversations
   - User clicks to select a conversation
   - Details load in the right content area

3. **Event Creation Flow**:
   - User enters event description
   - System parses and displays structured data
   - New conversation appears in the sidebar
   - Event details are saved to Supabase

4. **RFP Generation Flow**:
   - User navigates to RFP tab
   - System generates RFP based on event details
   - User can edit and save RFP

5. **Floor Plan Creation Flow**:
   - User navigates to Floor Plan tab
   - System generates initial layout based on:
     - Number of guests
     - Table capacity (8 guests per table as in example)
     - Room dimensions
     - Required elements (stage, exits)
   - User can:
     - Drag tables to reposition
     - Add/remove tables
     - Adjust stage position
     - Add architectural elements
     - Floor plan auto-saves to Supabase

### 6. Styling Guidelines 🔄

1. **Color Scheme**:
   - Light, neutral background (white/light gray)
   - Purple for active/selected elements (as shown in tab selection)
   - Gray for icons and inactive elements

2. **Typography**:
   - Clean, sans-serif font for all text
   - Larger, bold font for event name
   - Medium size for tab navigation
   - Smaller size for conversation details

3. **Layout Spacing**:
   - Consistent padding in sidebar items (as shown in image)
   - Proper spacing between UI elements
   - Grid alignment for floor plan elements

4. **Chat Interface Styling**: ✅
   - Fixed width (25% of page width)
   - Independent scrolling container
   - Clear visual distinction between user and assistant messages
   - Responsive input area that adjusts to content
   - Proper spacing between messages

### 7. Testing Strategy

1. **Backend Tests**:
   - Unit tests for NLP, RFP, and floor plan services
   - API endpoint tests

2. **Frontend Tests**:
   - Component tests for UI elements
   - Integration tests for user flows
   - Visual regression tests to ensure UI matches design

### 8. Deployment

1. **Backend Deployment**:
   - Deploy Express server to Vercel, Heroku, or as Supabase Edge Functions
   - Configure environment variables

2. **Frontend Deployment**:
   - Deploy React app to Netlify or Vercel
   - Configure environment variables
   - Set up build settings

## Implementation Priority

1. Set up project structure and Supabase integration ✅
2. Implement authentication and conversation list UI 🔄
3. Build NLP service and event creation flow
4. Create RFP generation functionality
5. Develop floor plan editor with support for tables, chairs, and room dimensions
6. Implement floor plan controls matching the design
7. Add vendor management (if time permits)
8. Polish UI to match the provided design images

This provides a comprehensive development roadmap for building the IntelliPlan prototype with specific attention to the UI design shown in the provided images.

# Supabase SQL Setup Commands 

Here's the SQL to create all required database tables according to the schema:

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  original_description TEXT NOT NULL,
  parsed_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Enable Row Level Security
  CONSTRAINT user_owns_event FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RFPs Table
CREATE TABLE rfps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events NOT NULL,
  rfp_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FloorPlans Table
CREATE TABLE floor_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events NOT NULL,
  layout JSONB NOT NULL,
  venue_dimensions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations Table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  snippet TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policies to control access for Events table
CREATE POLICY "Users can view their own events" ON events 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON events 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON events 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON events 
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for RFPs table
CREATE POLICY "Users can view their own rfps" ON rfps 
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

CREATE POLICY "Users can insert their own rfps" ON rfps 
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

CREATE POLICY "Users can update their own rfps" ON rfps 
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

CREATE POLICY "Users can delete their own rfps" ON rfps 
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

-- Create policies for Floor Plans table
CREATE POLICY "Users can view their own floor plans" ON floor_plans 
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

CREATE POLICY "Users can insert their own floor plans" ON floor_plans 
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

CREATE POLICY "Users can update their own floor plans" ON floor_plans 
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

CREATE POLICY "Users can delete their own floor plans" ON floor_plans 
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

-- Create policies for Conversations table
CREATE POLICY "Users can view their own conversations" ON conversations 
  FOR SELECT USING (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

CREATE POLICY "Users can insert their own conversations" ON conversations 
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

CREATE POLICY "Users can update their own conversations" ON conversations 
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

CREATE POLICY "Users can delete their own conversations" ON conversations 
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM events WHERE id = event_id));

-- Create indexes for better performance
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_rfps_event_id ON rfps(event_id);
CREATE INDEX idx_floor_plans_event_id ON floor_plans(event_id);
CREATE INDEX idx_conversations_event_id ON conversations(event_id);
CREATE INDEX idx_conversations_last_updated ON conversations(last_updated DESC);

## Implementation Progress

### Completed Tasks ✅

1. Project setup and structure
2. Supabase client configuration
3. Basic authentication context
4. Conversation list UI implementation
5. Chat interface implementation:
   - Chat box with fixed width (25% of page)
   - Independent scrolling for chat history
   - Auto-scroll to bottom for new messages
   - Message styling with user/assistant distinction
   - TypeScript type safety improvements
   - Fixed ref handling in chat components

### In Progress 🔄

1. Tab navigation implementation
2. Floor plan editor development
3. RFP generation functionality
4. Backend API integration

### Next Steps

1. Complete the floor plan editor with React-Konva
2. Implement the NLP service for event description parsing
3. Develop the RFP generation functionality
4. Add vendor management features
5. Polish UI to match the design specifications

