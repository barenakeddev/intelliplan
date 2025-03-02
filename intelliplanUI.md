IntelliPlan UI & Layout – Design and 
Implementation Guide 
Objective 
Build an intuitive, responsive, and clean user interface that enables users to manage event 
RFPs and floor plans easily. The design focuses on simplicity and clear 
interactions—keeping the user experience straightforward. 
 
Key UI Components 
1. Top Bar / Browser Window 
●  URL Display: 
A standard browser tab showing the current URL. 
●  User Profile: 
A profile icon or initial on the far right to indicate the logged-in user. 
2. Left Sidebar (Conversations Panel) 
●  Purpose: 
Displays a vertical list of event conversations (RFPs). 
●  Details: 
○  Each conversation entry includes: 
■  Avatar/Icon: Uses a company logo or initials. 
■  Name: The RFP title. 
■  Supporting Text: A snippet or last message. 
■  Timestamp: Date of the conversation. 
●  Interaction: 
○  Clicking a conversation loads its details. 
○  A toggle button allows the sidebar to be shown or hidden, expanding the main 
content area when hidden. 
3. Right Content Area 
●  Header Section: 
○  Displays the current event name (e.g., “EVENT NAME”). 
○  Contains tab navigation for different sections. 
●  Tab Navigation: 
○  Tabs: RFP, Floorplan, Vendors. 
○  Behavior: 
■  Clicking a tab updates the main content area to show related details. 
■  When the Floorplan tab is selected, a dedicated menu bar appears 
below for customization. 
●  Content Region: 
○  RFP Tab: 
■  Displays the detailed event RFP. 
○  Floorplan Tab: 
■  Shows an interactive canvas (via Konva.js) with objects representing 
tables, chairs, AV equipment, etc. 
■  Floorplan Menu Bar: 
■  Provides tool options to select table types (round, square, 
rectangular), seating styles (banquet, theater, etc.), chair 
options, audiovisual equipment, and stage elements. 
■  Supports drag-and-drop, grid snapping, and basic 
measurement tools. 
○  Vendors Tab: 
■  Lists vendors associated with the event, similar to a vendor directory. 
 
Layout & Wireframe Details 
Overall Layout 
●  Two-Column Structure: 
○  Left Column: Conversation list (collapsible). 
○  Right Column: Main content area with header and tabbed views. 
●  Responsive Design: 
○  On smaller screens, the left sidebar collapses into a drawer or overlay. 
○  The tab bar may convert to a dropdown or horizontally scrollable list if space 
is limited. 
Visual Hierarchy & Styling 
●  Color Scheme: 
○  A neutral background (white or light gray) for clarity. 
○  Distinct but subtle colors for active states (e.g., selected conversation or 
active tab). 
●  Typography: 
○  Bold, larger fonts for titles and headings (e.g., event name, conversation 
titles). 
○  Lighter, smaller fonts for supporting text and timestamps. 
●  Spacing & Padding: 
○  Ample spacing between conversation entries and content sections to 
enhance readability and touch interaction. 
 
Frontend Implementation 
File Structure 
●  Components: 
○  Auth: Login and Register components. 
○  Chat: ChatInput.tsx and ChatHistory.tsx for event descriptions. 
○  RFP: RFPView.tsx and RFPEditor.tsx for displaying and editing RFPs. 
○  Floorplan: 
■  FloorPlanEditor.tsx for the canvas. 
■  FloorPlanItem.tsx for individual objects. 
■  FloorPlanControls.tsx for the customization menu. 
○  Shared: Common components like Button, Loader, and ErrorMessage. 
●  State Management: 
○  Use React Context (or a similar solution) to handle UI state, such as sidebar 
visibility and active tabs. 
●  Styling: 
○  CSS/SCSS modules or styled-components for modular, self-documenting 
styles. 
UI Technologies 
●  React with TypeScript: 
Build maintainable, strongly typed components. 
●  Konva.js: 
Render interactive floor plan objects with drag-and-drop support. 
●  Supabase Client: 
Manage authentication and data retrieval, ensuring a seamless connection between 
UI and backend. 
 
Interaction & User Flow 
1.  User Authentication: 
○  The user logs in via the Auth components, managed by Supabase. 
2.  Navigating Conversations: 
○  The left sidebar lists conversations. Users click an entry to view details. 
○  The sidebar can be toggled to maximize the main content area. 
3.  Viewing Event Details: 
○  The right content area shows the event name and tab navigation. 
○  Users select between RFP, Floorplan, and Vendors. 
4.  Floorplan Editing: 
○  When the Floorplan tab is active, the dedicated menu bar appears. 
○  Users drag and reposition floor plan objects, adjust settings (e.g., table type, 
seating style), and see real-time layout updates. 
5.  RFP & Vendors: 
○  The RFP tab shows a generated RFP with options to edit and save. 
○  The Vendors tab lists potential vendors (or other related data). 
 
Final Notes 
●  Simplicity & Consistency: 
The UI should be easy to navigate and maintain, with a clear, minimalistic design. 
●  Referencing Attached Material: 
The visual and interaction guidelines are based on the IntelliPlan UI materia