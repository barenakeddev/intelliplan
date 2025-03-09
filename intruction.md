# Updated Instructions for IntelliPlan Prototype

## Project Overview

Build a web application that enables users to:
1. Input event descriptions in natural language
2. Extract structured event details using NLP
3. Generate event RFPs
4. Create and modify floor plans
5. Engage in conversational AI to refine event details

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

#### 1. Parse Description Endpoint ✅
- **Route**: POST /api/rfp/parse-description
- **Functionality**: 
  - Accept event description text
  - Extract structured event data using OpenAI
- **Request Body**: `{ "description": "string", "userId": "string" }`
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
    }
  }
  ```

#### 2. Extract Info From Message Endpoint ✅
- **Route**: POST /api/rfp/extract-info
- **Functionality**: Extract structured information from chat messages
- **Request Body**: `{ "message": "string", "currentInfo": object, "userId": "string" }`
- **Response**: `{ "updatedInfo": object }`

#### 3. Generate RFP Endpoint ✅
- **Route**: POST /api/rfp/generate
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
    },
    "eventId": "string",
    "userId": "string"
  }
  ```
- **Response**: `{ "rfp": "string" }`

#### 4. Modify RFP Endpoint ✅
- **Route**: POST /api/rfp/modify
- **Functionality**: Modify existing RFP or create new one with AI
- **Request Body**: 
  ```json
  {
    "currentRFP": "string",
    "prompt": "string",
    "eventId": "string",
    "userId": "string",
    "rfpId": "string",
    "isNewRfp": boolean
  }
  ```
- **Response**: `{ "modifiedRFP": "string" }`

#### 5. Generate Floor Plan Endpoint ✅
- **Route**: POST /api/floorplan/generate
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

#### 6. Update Floor Plan Endpoint ✅
- **Route**: PUT /api/floorplan/update
- **Functionality**: Update existing floor plan layout
- **Request Body**: 
  ```json
  {
    "floorPlanId": "string",
    "layout": [FloorPlanElement]
  }
  ```
- **Response**: `{ "success": boolean, "floorPlan": object }`

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
6. Backend API implementation:
   - NLP service for parsing event descriptions
   - RFP generation and modification with AI
   - Extract information from chat messages
   - Floor plan generation
7. RFP view and editing functionality
8. Event details page with tabs
9. Error handling and graceful degradation
10. Floor plan editor implementation with React-Konva:
    - Basic canvas setup with proper scaling
    - Grid system with measurements
    - Table, stage, and exit elements
    - Element selection and manipulation
    - Drag and drop functionality

### In Progress 🔄

1. Floor plan editor enhancements:
   - Additional element types (AV equipment, decorations)
   - Element property editing panel
   - Undo/redo functionality
   - Save/load floor plans
2. Vendor management features
3. User authentication flow improvements
4. UI polish to match design specifications
5. Mobile responsiveness

### Key Components Added

1. **Conversational AI for RFP Creation** ✅
   - Added ability to extract structured information from chat messages
   - Implemented progressive information gathering through conversation
   - Added RFP generation based on collected information

2. **RFP Modification with AI** ✅
   - Added ability to modify existing RFPs with AI
   - Implemented prompt-based RFP refinement

3. **Floor Plan Editor** ✅
   - Implemented interactive floor plan editor with React-Konva
   - Added support for different element types (tables, stage, exits)
   - Implemented drag-and-drop functionality
   - Added grid system with measurements
   - Implemented element selection and manipulation

4. **Error Handling Improvements** ✅
   - Added graceful error handling for API failures
   - Implemented fallback mechanisms when services are unavailable

## File Structure

### Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── nlpController.ts ✅
│   │   ├── rfpController.ts ✅
│   │   └── floorPlanController.ts ✅
│   ├── services/
│   │   ├── nlpService.ts ✅
│   │   ├── rfpService.ts ✅
│   │   └── floorPlanService.ts ✅
│   ├── routes/
│   │   ├── apiRoutes.ts ✅
│   │   ├── rfpRoutes.ts ✅
│   │   └── floorPlanRoutes.ts ✅
│   ├── utils/
│   │   └── supabaseClient.ts ✅
│   └── index.ts ✅
├── .env ✅
├── package.json ✅
└── tsconfig.json ✅
```

### Frontend Structure
```
frontend/
├── public/
│   ├── assets/
│   │   ├── icons/
│   │   └── avatars/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.tsx ✅
│   │   │   └── Register.tsx ✅
│   │   ├── conversations/
│   │   │   ├── ConversationList.tsx ✅
│   │   │   └── ConversationItem.tsx ✅
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx ✅
│   │   │   ├── ChatHistory.tsx ✅
│   │   │   └── CombinedChatPanel.tsx ✅
│   │   ├── rfp/
│   │   │   ├── RFPView.tsx ✅
│   │   │   └── RFPEditor.tsx ✅
│   │   ├── floorplan/
│   │   │   ├── FloorPlanEditor.tsx ✅
│   │   │   └── elements/
│   │   │       ├── Table.tsx ✅
│   │   │       ├── StageElement.tsx ✅
│   │   │       └── Exit.tsx ✅
│   │   ├── vendors/
│   │   │   └── VendorList.tsx 🔄
│   │   └── layout/
│   │       ├── Header.tsx ✅
│   │       ├── TabNavigation.tsx ✅
│   │       ├── HorizontalDivider.tsx ✅
│   │       └── ResizablePanel.tsx ✅
│   ├── services/
│   │   ├── api.ts ✅
│   │   └── supabaseClient.ts ✅
│   ├── context/
│   │   ├── AuthContext.tsx ✅
│   │   └── FloorPlanContext.tsx ✅
│   ├── types/
│   │   └── index.ts ✅
│   ├── pages/
│   │   ├── Home.tsx ✅
│   │   ├── Dashboard.tsx ✅
│   │   ├── EventDetails.tsx ✅
│   │   └── RFPPage.tsx ✅
│   ├── styles/
│   │   ├── global.css ✅
│   │   ├── sidebar.css ✅
│   │   └── floorplan.css ✅
│   ├── App.tsx ✅
│   └── index.tsx ✅
├── .env ✅
├── package.json ✅
└── tsconfig.json ✅
```

## Next Steps

1. Complete the floor plan editor enhancements:
   - Add property editing panel for selected elements
   - Implement undo/redo functionality
   - Add save/load functionality for floor plans
   - Add more element types (AV equipment, decorations)

2. Implement vendor management features:
   - Create vendor database schema
   - Implement vendor listing and filtering
   - Add vendor selection for events
   - Implement vendor communication features

3. Improve user authentication flow:
   - Add password reset functionality
   - Implement email verification
   - Add user profile management
   - Implement role-based access control

4. Polish UI to match design specifications:
   - Implement consistent styling across all components
   - Add animations and transitions
   - Improve responsive design for mobile devices
   - Add dark mode support

5. Add comprehensive error handling:
   - Implement error boundaries for React components
   - Add retry mechanisms for API calls
   - Improve error messaging for users
   - Add logging for debugging

6. Implement testing strategy:
   - Add unit tests for critical components
   - Implement integration tests for API endpoints
   - Add end-to-end tests for critical user flows
   - Set up continuous integration

7. Prepare for deployment:
   - Optimize bundle size
   - Implement caching strategies
   - Set up production environment
   - Configure monitoring and analytics

## Known Issues to Fix

1. API endpoint path issues causing 404 errors
2. Error handling for 'new' event ID in Supabase queries
3. Improve error handling in ChatInterface for API failures
4. Fix ESLint warnings in ChatInterface.tsx
5. Improve performance of floor plan editor with large number of elements
6. Fix scaling issues in floor plan editor on different screen sizes
7. Address TypeScript errors in FloorPlanContext
8. Improve mobile responsiveness of the UI

