```md
# Phase 2: Core API Endpoints (RFP Generation - No Persistence)

This phase focuses on implementing the core API endpoints to enable basic RFP generation using OpenAI. There is no database persistence at this stage; the emphasis is on handling requests, interacting with the AI, and formatting responses.

---

## Overall Goal

- **Objective:**  
  Implement the core API endpoints for RFP generation using OpenAI. The generated content is returned directly without storing it in a database.
  
- **Focus Areas:**
  - Isolate OpenAI-specific logic in a dedicated service.
  - Create an Express controller to handle incoming RFP requests.
  - Define API routes and integrate them into the backend.
  - Update the frontend to interact with the new API endpoint.
  - Enhance type safety with explicit request/response interfaces.

---

## 2.1 OpenAI Service Setup

**Goal:**  
Create a service module to interact with the OpenAI API.

**Implementation Details:**

1. **Install the OpenAI Node.js Library:**  
   In the `backend` directory, run:
   ```bash
   npm install openai
   ```

2. **Create the Service Module:**  
   Create the file `backend/src/services/openaiService.ts` with the following content:
   ```typescript
   import OpenAI from 'openai';
   import dotenv from 'dotenv';
   import { ErrorTypes, logger } from '../utils/errorHandler';

   dotenv.config();

   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
   });

   export async function generateRFP(prompt: string): Promise<string> {
     try {
       const chatCompletion = await openai.chat.completions.create({
         messages: [{ role: 'user', content: prompt }],
         model: 'gpt-3.5-turbo', // Or another suitable model, gpt-4 if needed.
         temperature: 0.7,       // Tune for creativity vs. consistency
         max_tokens: 2048,       // Adjust as needed
       });

       if (!chatCompletion.choices[0]?.message?.content) {
         logger.warn("OpenAI returned an empty response.");
         throw ErrorTypes.ExternalService("Received empty response from OpenAI", "OpenAI");
       }
       return chatCompletion.choices[0].message.content;
     } catch (error: any) {
       logger.error("Error in OpenAI service:", error);
       if (error.code === 'invalid_api_key') {
         throw ErrorTypes.ExternalService("Invalid OpenAI API Key.", "OpenAI");
       } else {
         throw ErrorTypes.ExternalService(`OpenAI API Error: ${error.message}`, "OpenAI");
       }
     }
   }
   ```

**Outcome:**  
A reusable function `generateRFP` that accepts a prompt and returns a generated RFP text from OpenAI, with built-in error handling.

---

## 2.2 RFP Controller

**Goal:**  
Create an Express controller to process RFP generation requests.

**Implementation Details:**

1. **Create the Controller File:**  
   Create `backend/src/controllers/rfpController.ts` with:
   ```typescript
   import { Request, Response, NextFunction } from 'express';
   import { generateRFP } from '../services/openaiService';
   import { asyncHandler, ErrorTypes } from '../utils/errorHandler';

   export const createRFP = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
     const { prompt } = req.body;  // Extract the prompt from the request body.

     if (!prompt) {
       throw ErrorTypes.BadRequest("Prompt is required for RFP generation.");
     }

     const rfpText = await generateRFP(prompt);
     res.status(200).json({ success: true, rfp: rfpText });
   });
   ```

**Outcome:**  
The `createRFP` controller takes a prompt from the request body, invokes the OpenAI service to generate the RFP, and returns the generated text in a JSON response.

---

## 2.3 RFP Routes

**Goal:**  
Define the API route for RFP generation and integrate it into the backend.

**Implementation Details:**

1. **Create the Routes File:**  
   Create `backend/src/routes/rfpRoutes.ts` with:
   ```typescript
   import express from 'express';
   import { createRFP } from '../controllers/rfpController';

   const router = express.Router();

   // POST request to /api/rfp
   router.post('/', createRFP);

   export default router;
   ```

2. **Integrate the Routes:**  
   Update `backend/src/index.ts` to mount the RFP routes:
   ```typescript
   // ... existing imports ...
   import rfpRoutes from './routes/rfpRoutes';

   // ... other middleware ...

   // Mount the RFP routes under /api/rfp
   app.use('/api/rfp', rfpRoutes);

   // ... error handling middleware ...
   ```

**Outcome:**  
The `/api/rfp` endpoint is set up to handle POST requests, routing them to the `createRFP` controller.

---

## 2.4 Frontend Integration

**Goal:**  
Update the frontend to send RFP generation requests to the backend and display the response.

**Implementation Details:**

1. **Modify the Frontend Application:**  
   Update `frontend/src/App.tsx` as follows:
   ```typescript
   import React, { useState, useEffect } from 'react';
   import axios from 'axios';

   function App() {
     const [health, setHealth] = useState('');
     const [prompt, setPrompt] = useState('');
     const [generatedRFP, setGeneratedRFP] = useState('');
     const [loading, setLoading] = useState(false);

     useEffect(() => {
       axios.get('/api/health')
         .then(response => {
           setHealth(response.data.status);
         })
         .catch(error => {
           console.error("Error fetching health:", error);
           setHealth('error');
         });
     }, []);

     const handleGenerateRFP = async () => {
       setLoading(true);
       try {
         const response = await axios.post('/api/rfp', { prompt });
         setGeneratedRFP(response.data.rfp);
       } catch (error) {
         console.error("Error generating RFP:", error);
         setGeneratedRFP('Error generating RFP. See console for details.');
       } finally {
         setLoading(false);
       }
     };

     return (
       <div className="App">
         <h1>IntelliPlan</h1>
         <p>Backend Health: {health}</p>

         <div>
           <textarea
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="Enter your RFP prompt here..."
             rows={4}
             cols={50}
           />
           <button onClick={handleGenerateRFP} disabled={loading}>
             {loading ? 'Generating...' : 'Generate RFP'}
           </button>
         </div>

         {generatedRFP && (
           <div>
             <h2>Generated RFP:</h2>
             <pre>{generatedRFP}</pre>
           </div>
         )}
       </div>
     );
   }

   export default App;
   ```

**Outcome:**  
The frontend now includes:
- A textarea for entering an RFP prompt.
- A button to trigger RFP generation.
- Display of the generated RFP and a loading indicator during the request.

---

## 2.5 API Request/Response Typing

**Goal:**  
Enhance type safety by defining interfaces for the RFP request and response.

**Implementation Details:**

1. **Define Interfaces:**  
   In `backend/src/types.ts` (or extend the existing file), add:
   ```typescript
   import { Request } from 'express';

   // Interface for RFP request
   export interface RfpRequest extends Request {
     body: {
       prompt: string;
     };
   }

   // Interface for RFP response
   export interface RfpResponse {
     success: boolean;
     rfp: string;
   }
   ```

2. **Update the Controller:**  
   Modify `backend/src/controllers/rfpController.ts` to use these interfaces:
   ```typescript
   import { RfpRequest, RfpResponse } from '../types';
   import { Response, NextFunction } from 'express';
   import { generateRFP } from '../services/openaiService';
   import { asyncHandler, ErrorTypes } from '../utils/errorHandler';

   export const createRFP = asyncHandler(async (req: RfpRequest, res: Response<RfpResponse>, next: NextFunction) => {
     const { prompt } = req.body;

     if (!prompt) {
       throw ErrorTypes.BadRequest("Prompt is required for RFP generation.");
     }

     const rfpText = await generateRFP(prompt);
     res.status(200).json({ success: true, rfp: rfpText });
   });
   ```

**Outcome:**  
The API endpoints for RFP generation are now strongly typed, ensuring better development-time checks and code clarity.

---

## Testing

1. **Start the Backend:**  
   In the `backend` directory, run:
   ```bash
   npm run dev
   ```
2. **Start the Frontend:**  
   In the `frontend` directory, run:
   ```bash
   npm start
   ```
3. **Verify Functionality:**  
   - Open the app in your browser (usually at [http://localhost:3000](http://localhost:3000)).
   - Enter an RFP prompt in the textarea and click "Generate RFP".
   - Confirm that the generated RFP text appears.
   - Test with an empty prompt to verify that the error handling is working.

---

# Conclusion

Phase 2 successfully implements the core functionality for RFP generation by:
- Setting up an OpenAI service for AI interactions.
- Creating a dedicated controller and routes for processing RFP generation requests.
- Integrating the API with the frontend to enable user interactions.
- Improving code reliability with strong type definitions.

The application can now generate RFPs using OpenAI. Persistence will be added in a later phase.
```