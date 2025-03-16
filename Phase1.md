```md
# Phase 1: Project Setup and Core Structure

This phase lays the foundational work for the IntelliPlan application by establishing the core structure and essential services. It includes setting up the frontend, backend, and Supabase integration, as well as implementing error handling and logging.

---

## 1.1 Project Initialization

**Goal:**  
Set up the basic project structure, including the frontend, backend, and Supabase integration. Establish essential utilities for error handling and logging.

**Steps:**
- Create the main `intelliplan` directory.
- Inside `intelliplan`, create the `frontend` and `backend` directories.
- **Frontend:**
  - Navigate into the `frontend` directory and run:
    ```bash
    npx create-react-app . --template typescript
    ```
    *(Do not use Vite for initial simplicity.)*
- **Backend:**
  - Navigate into the `backend` directory and run:
    ```bash
    npm init -y
    ```
- Create a `supabase` directory inside `intelliplan` and, within it, a `migrations` directory.
- Create a root-level `package.json` to include scripts such as `install-all`, `build`, `start`, `dev`, and `kill-servers`.

**Outcome:**  
Basic project scaffolding with React and Node.js initialized.

---

## 1.2 Backend Setup (TypeScript, Express)

**Goal:**  
Set up a basic Express server with TypeScript.

**Steps:**

1. **Install Dependencies:**  
   In the `backend` directory, run:
   ```bash
   npm install express cors dotenv
   npm install --save-dev typescript @types/node @types/express @types/cors ts-node nodemon
   ```

2. **Create `tsconfig.json`:**  
   Create `backend/tsconfig.json` with the following content:
   ```json
   {
     "compilerOptions": {
       "target": "es2016",
       "module": "commonjs",
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules"]
   }
   ```

3. **Create Express Server:**  
   Create `backend/src/index.ts` with the following code:
   ```typescript
   import express from 'express';
   import cors from 'cors';
   import dotenv from 'dotenv';

   dotenv.config();

   const app = express();
   const port = process.env.PORT || 3001;

   app.use(cors());
   app.use(express.json());

   app.get('/api/health', (req, res) => {
     res.status(200).json({ status: 'ok' });
   });

   app.listen(port, () => {
     console.log(`Server is running on port ${port}`);
   });
   ```

4. **Update Package Scripts:**  
   In `backend/package.json`, add:
   ```json
   {
     "scripts": {
       "build": "tsc",
       "start": "node dist/index.js",
       "dev": "nodemon src/index.ts"
     }
   }
   ```

**Outcome:**  
A simple Express server that responds to a health check endpoint, built with TypeScript.

---

## 1.3 Frontend Setup (React, TypeScript)

**Goal:**  
Set up the basic React application structure.

**Steps:**

1. **Install Dependencies:**  
   In the `frontend` directory, run:
   ```bash
   npm install axios
   ```

2. **Modify App Component:**  
   Update `frontend/src/App.tsx` with:
   ```typescript
   import React, { useState, useEffect } from 'react';
   import axios from 'axios';

   function App() {
     const [health, setHealth] = useState('');

     useEffect(() => {
       axios.get('/api/health') // Not http://localhost:3001/api/health
         .then(response => {
           setHealth(response.data.status);
         })
         .catch(error => {
           console.error("Error fetching health:", error);
           setHealth('error');
         });
     }, []);

     return (
       <div className="App">
         <h1>IntelliPlan</h1>
         <p>Backend Health: {health}</p>
       </div>
     );
   }

   export default App;
   ```

3. **Configure Proxy:**  
   In `frontend/package.json`, add or update:
   ```json
   "proxy": "http://localhost:3001"
   ```

**Outcome:**  
A basic React app that displays the backend health status.

---

## 1.4 Supabase Setup

**Goal:**  
Initialize Supabase and set up a basic connection.

**Steps:**

1. **Install Supabase Client:**  
   In the `backend` directory, run:
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase Client:**  
   Create `backend/src/utils/supabaseClient.ts` with:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   import dotenv from 'dotenv';
   import { Database } from './types';
   dotenv.config();

   const supabaseUrl = process.env.SUPABASE_URL;
   const supabaseKey = process.env.SUPABASE_KEY;

   if (!supabaseUrl || !supabaseKey) {
       throw new Error("Missing Supabase URL or key. Check your .env file.");
   }

   export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

   // Function to check database connection
   export const checkConnection = async (): Promise<boolean> => {
     try {
         const { data, error } = await supabase.from('tests').select('status').eq('id', 1);
         if (error) {
           console.error("Error connecting to the database:", error.message);
           return false;
         }
         console.log("Database connection successful:");
         return true;
     } catch (error: any) {
         console.error("Error during database connection test:", error.message);
         return false;
     }
   };
   ```

3. **Define Database Types:**  
   Create `backend/src/utils/types.ts` with:
   ```typescript
   export type Json =
     | string
     | number
     | boolean
     | null
     | { [key: string]: Json | undefined }
     | Json[];

   export interface Database {
     public: {
       Tables: {
         tests: {
           Row: {
             id: number;
             status: boolean;
           };
           Insert: {
             id: number;
             status: boolean;
           };
           Update: {
             id?: number;
             status?: boolean;
           };
         };
         conversations: {
           Row: {
             created_at: string;
             event_id: string | null;
             id: string;
             last_updated: string;
             name: string | null;
             snippet: string | null;
             user_id: string;
           };
           Insert: {
             created_at?: string;
             event_id?: string | null;
             id?: string;
             last_updated?: string;
             name?: string | null;
             snippet?: string | null;
             user_id: string;
           };
           Update: {
             created_at?: string;
             event_id?: string | null;
             id?: string;
             last_updated?: string;
             name?: string | null;
             snippet?: string | null;
             user_id?: string;
           };
         };
       };
       Views: {
         [_ in never]: never;
       };
       Functions: {
         [_ in never]: never;
       };
       Enums: {
         [_ in never]: never;
       };
       CompositeTypes: {
         [_ in never]: never;
       };
     };
   }

   export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
   export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
   ```

4. **Configure Environment Variables:**  
   Create a file `backend/.env` and add:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   OPENAI_API_KEY=your_openai_api_key
   PORT=3001
   ```

5. **Integrate Connection Check:**  
   Modify `backend/src/index.ts` to import and call `checkConnection` before starting the server:
   ```typescript
   // Existing imports...
   import { checkConnection } from './utils/supabaseClient';

   // Check connection at startup
   checkConnection();

   app.listen(port, () => {
     console.log(`Server is running on port ${port}`);
   });
   ```

**Outcome:**  
Supabase client is configured and the connection is validated.

---

## 1.5 Error Handling and Logging

**Goal:**  
Implement a basic error handling and logging system for debugging and maintenance.

**Steps:**

1. **Create Error Handling Module:**  
   Create `backend/src/utils/errorHandler.ts` with:
   ```typescript
   import { Request, Response, NextFunction } from 'express';

   // Custom error class
   export class AppError extends Error {
     statusCode: number;
     isOperational: boolean;
     code?: string;

     constructor(message: string, statusCode: number, isOperational: boolean, code?: string) {
       super(message);
       this.statusCode = statusCode;
       this.isOperational = isOperational;
       this.code = code;
       Error.captureStackTrace(this, this.constructor);
     }
   }

   // Pre-defined error types
   export const ErrorTypes = {
     NotFound: (message: string) => new AppError(message, 404, true, 'NOT_FOUND'),
     BadRequest: (message: string) => new AppError(message, 400, true, 'BAD_REQUEST'),
     Unauthorized: (message: string) => new AppError(message, 401, true, 'UNAUTHORIZED'),
     Forbidden: (message: string) => new AppError(message, 403, true, 'FORBIDDEN'),
     Conflict: (message: string) => new AppError(message, 409, true, 'CONFLICT'),
     Internal: (message: string) => new AppError(message, 500, false, 'INTERNAL_SERVER_ERROR'),
     Database: (message: string, isOperational = false) => new AppError(message, 503, isOperational, 'DATABASE_ERROR'),
     ExternalService: (message: string, serviceName: string) =>
       new AppError(message, 502, true, `EXTERNAL_SERVICE_${serviceName.toUpperCase()}`)
   };

   // Basic logger (replace with a more robust logging library in production)
   export const logger = {
     info: (message: string) => console.log(`[INFO] ${message}`),
     warn: (message: string) => console.warn(`[WARN] ${message}`),
     error: (message: string, error?: any) => {
       console.error(`[ERROR] ${message}`);
       if (error) {
         if (error instanceof AppError && error.isOperational) {
           return; // Don't log operational errors
         }
         console.error(error);
       }
     }
   };

   // Error handling middleware
   export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
     if (err instanceof AppError) {
       const clientError = {
         success: false,
         message: err.isOperational ? err.message : "Internal Server Error",
         ...(process.env.NODE_ENV !== 'production' && !err.isOperational ? { stack: err.stack } : {})
       };
       return res.status(err.statusCode).json(clientError);
     }

     logger.error('Unhandled Error:', err);

     return res.status(500).json({
       success: false,
       message: 'Internal Server Error',
       ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
     });
   };

   // Wrapper for async route handlers
   export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
     return (req: Request, res: Response, next: NextFunction) => {
       fn(req, res, next).catch(next);
     };
   };
   ```

2. **Integrate Error Handling Middleware:**  
   Modify `backend/src/index.ts` to use the error handler after your route definitions:
   ```typescript
   // Import errorHandler from './utils/errorHandler'
   // At the end of your route definitions:
   app.use(errorHandler);
   ```

**Outcome:**  
Centralized error handling and basic logging are implemented.

---

## 1.6 Create a Test Table in Supabase

**Goal:**  
Create a test table in Supabase to validate the connection.

**Steps:**

1. Open the Supabase dashboard for your project.
2. Click on **SQL Editor** in the left sidebar.
3. Copy and paste the following SQL code, then run it:
   ```sql
   -- Create a simple table for connection testing
   CREATE TABLE IF NOT EXISTS tests (
     id SERIAL PRIMARY KEY,
     status BOOLEAN NOT NULL DEFAULT FALSE
   );

   -- Insert a test row if none exists
   INSERT INTO tests (status)
   SELECT FALSE
   WHERE NOT EXISTS (SELECT 1 FROM tests);
   ```

**Outcome:**  
The `tests` table is created in Supabase, allowing the connection to be validated via the `checkConnection` function in `backend/src/utils/supabaseClient.ts`.

---

# Conclusion

Phase 1 establishes the core architecture and setup for the IntelliPlan application by:

- Creating the basic project scaffolding.
- Setting up the backend with an Express server using TypeScript.
- Building the frontend using React with TypeScript.
- Integrating Supabase with a connection check.
- Implementing centralized error handling and logging.

This phase lays the groundwork for further feature development and ensures a clean, maintainable, and scalable codebase.
```