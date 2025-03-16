```md
# Phase 3: Supabase Persistence and User Authentication

In this phase, we integrate Supabase to persist generated RFPs and implement user authentication using Supabase Auth. This allows us to store generated RFPs in the database and ensures that only authenticated users can create and view their RFPs.

---

## 3.1 Database Schema Design (Supabase)

**Goal:**  
Design the database tables for storing users and RFPs.

**Requirements:**  
- Supabase project is already set up (from Phase 1).

**Implementation Details:**

1. **Create the `rfps` Table:**

   - Open your Supabase project dashboard.
   - Navigate to the **SQL Editor**.
   - Execute the following SQL script:
     
   ```sql
   -- Create the rfps table
   CREATE TABLE rfps (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
       prompt TEXT NOT NULL,
       rfp_text TEXT NOT NULL
   );

   -- Enable Row Level Security (RLS)
   ALTER TABLE rfps ENABLE ROW LEVEL SECURITY;

   -- Policy: Users can insert their own RFPs
   CREATE POLICY "Users can insert their own RFPs" ON rfps
   FOR INSERT TO authenticated
   WITH CHECK (auth.uid() = user_id);

   -- Policy: Users can select their own RFPs
   CREATE POLICY "Users can select their own RFPs" ON rfps
   FOR SELECT TO authenticated
   USING (auth.uid() = user_id);

   -- Policy: Users can update their own RFPs
   CREATE POLICY "Users can update their own RFPs" ON rfps
   FOR UPDATE TO authenticated
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);

   -- Policy: Users can delete their own RFPs
   CREATE POLICY "Users can delete their own RFPs" ON rfps
   FOR DELETE TO authenticated
   USING (auth.uid() = user_id);
   ```

2. **Update the Supabase Type File:**

   - Run the following command in the `backend` directory to regenerate the types:
     
   ```bash
   npx supabase gen types typescript --project-id YOUR_SUPABASE_PROJECT_ID --schema public > src/utils/types.ts
   ```
     
   Replace `YOUR_SUPABASE_PROJECT_ID` with your actual Supabase project ID.

**Outcome:**  
A new `rfps` table is created in your Supabase database with proper Row Level Security policies. The type file is updated to include the new table for use in the application.

---

## 3.2 Backend Service for RFP Persistence

**Goal:**  
Create a service to handle database operations for RFPs.

**Implementation Details:**

Create the file `backend/src/services/rfpService.ts` with the following content:

```typescript
import { supabase } from '../utils/supabaseClient';
import { ErrorTypes, logger } from '../utils/errorHandler';
import { Tables } from '../utils/types';

export async function saveRFP(userId: string, prompt: string, rfpText: string): Promise<Tables<'rfps'>> {
  try {
    const { data, error } = await supabase
      .from('rfps')
      .insert([{ user_id: userId, prompt, rfp_text: rfpText }])
      .select();

    if (error) {
      logger.error("Error saving RFP to database:", error);
      throw ErrorTypes.Database(error.message);
    }
    if (!data || data.length === 0) {
      // This case shouldn't normally happen since we expect data to be returned.
      throw ErrorTypes.Database("Failed to save RFP. No data returned.", true);
    }

    return data[0]; // Return the newly created RFP.
  } catch (error: any) {
    logger.error("Error in rfpService saveRFP:", error);
    throw error; // Re-throw the error to be handled by the caller.
  }
}

// Function to get all RFPs for a user
export async function getAllRFPs(userId: string): Promise<Tables<'rfps'>[]> {
  try {
    const { data, error } = await supabase
      .from('rfps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // Get by most recent first.

    if (error) {
      logger.error("Error retrieving RFPs:", error);
      throw ErrorTypes.Database(error.message);
    }

    return data || []; // Return the data or an empty array if null.
  } catch (error: any) {
    logger.error("Error in rfpService getAllRFPs:", error);
    throw error;
  }
}
```

**Outcome:**  
Two functions are now available:
- `saveRFP` to persist a generated RFP.
- `getAllRFPs` to retrieve all RFPs associated with a user.

---

## 3.3 Update RFP Controller to Save RFPs

**Goal:**  
Modify the existing `createRFP` controller to save the generated RFP to the database and add a new endpoint to retrieve a user's RFPs.

**Implementation Details:**

Update `backend/src/controllers/rfpController.ts` with the following code:

```typescript
import { Request, Response, NextFunction } from 'express';
import { generateRFP } from '../services/openaiService';
import { saveRFP, getAllRFPs } from '../services/rfpService';
import { asyncHandler, ErrorTypes } from '../utils/errorHandler';
import { RfpRequest, RfpResponse } from '../types';
import { User } from '@supabase/supabase-js';

// Extend the Request interface to include the user
interface AuthenticatedRequest extends RfpRequest {
  user?: User;
}

export const createRFP = asyncHandler(async (req: AuthenticatedRequest, res: Response<RfpResponse>, next: NextFunction) => {
  const { prompt } = req.body;

  if (!prompt) {
    throw ErrorTypes.BadRequest("Prompt is required for RFP generation.");
  }

  // Get the user ID from the request (added by authentication middleware)
  const userId = req.user?.id;
  if (!userId) {
    throw ErrorTypes.Unauthorized("User not authenticated.");
  }

  const rfpText = await generateRFP(prompt);
  const savedRfp = await saveRFP(userId, prompt, rfpText); // Save to the database

  res.status(200).json({ success: true, rfp: rfpText });
});

export const getRFPs = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) {
    throw ErrorTypes.Unauthorized("User not authenticated.");
  }

  const rfps = await getAllRFPs(userId);
  res.status(200).json({ success: true, rfps });
});
```

**Outcome:**  
The controller now persists generated RFPs to the database and provides an endpoint to retrieve a user's RFPs.

---

## 3.4 Authentication Middleware

**Goal:**  
Create middleware to verify user authentication using Supabase JWTs.

**Implementation Details:**

1. **Create the Authentication Middleware:**

   Create `backend/src/middleware/authMiddleware.ts` with the following content:

   ```typescript
   import { Request, Response, NextFunction } from 'express';
   import { supabase } from '../utils/supabaseClient';
   import { ErrorTypes, logger } from '../utils/errorHandler';
   import { User } from '@supabase/supabase-js';
   import { asyncHandler } from '../utils/errorHandler';

   // Extend the Request interface to include the user
   interface AuthenticatedRequest extends Request {
     user?: User;
   }

   export const authenticate = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
     const authHeader = req.headers.authorization;

     if (!authHeader || !authHeader.startsWith('Bearer ')) {
       throw ErrorTypes.Unauthorized('Authorization header is missing or invalid.');
     }

     const token = authHeader.split(' ')[1];

     const { data: { user }, error } = await supabase.auth.getUser(token);

     if (error || !user) {
       logger.error("Authentication error:", error);
       throw ErrorTypes.Unauthorized('Invalid or expired token.');
     }

     // Attach the user object to the request for use in subsequent middleware/controllers
     req.user = user;
     next();
   });
   ```

2. **Apply the Middleware to Routes:**

   Update `backend/src/routes/rfpRoutes.ts` to protect the routes:

   ```typescript
   import express from 'express';
   import { createRFP, getRFPs } from '../controllers/rfpController';
   import { authenticate } from '../middleware/authMiddleware';

   const router = express.Router();

   // Protect the routes with authentication middleware
   router.post('/', authenticate, createRFP);
   router.get('/', authenticate, getRFPs);

   export default router;
   ```

**Outcome:**  
The `createRFP` and `getRFPs` endpoints are now protected and require a valid Supabase JWT in the `Authorization` header.

---

## 3.5 Frontend Authentication (Sign Up / Sign In)

**Goal:**  
Implement user authentication on the frontend using Supabase Auth, allowing users to sign up, sign in, and sign out. Also, integrate the UI to generate and display RFPs.

**Implementation Details:**

1. **Install Supabase Client:**  
   In the `frontend` directory, run:
   
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create the Authentication Context:**  
   Create `frontend/src/context/AuthContext.tsx` with the following content:

   ```typescript
   import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
   import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
   import { Database } from '../../../../backend/src/utils/types';

   interface AuthContextProps {
     user: User | null;
     session: Session | null;
     signIn: (email: string, password: string) => Promise<void>;
     signUp: (email: string, password: string) => Promise<void>;
     signOut: () => Promise<void>;
     isLoading: boolean;
   }

   const AuthContext = createContext<AuthContextProps | undefined>(undefined);

   interface AuthProviderProps {
     children: ReactNode;
   }

   export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
     const [user, setUser] = useState<User | null>(null);
     const [session, setSession] = useState<Session | null>(null);
     const [isLoading, setIsLoading] = useState(true);

     const supabase: SupabaseClient<Database> = createClient<Database>(
       String(process.env.REACT_APP_SUPABASE_URL),
       String(process.env.REACT_APP_SUPABASE_ANON_KEY)
     );

     useEffect(() => {
       async function getActiveSession() {
         const { data: { session } } = await supabase.auth.getSession();
         setSession(session);
         setUser(session?.user || null);
         setIsLoading(false);
       }
       getActiveSession();

       const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
         setSession(session);
         setUser(session?.user || null);
         setIsLoading(false);
       });

       return () => {
         subscription.unsubscribe();
       };
     }, [supabase]);

     const signIn = async (email: string, password: string) => {
       setIsLoading(true);
       const { error } = await supabase.auth.signInWithPassword({ email, password });
       if (error) {
         setIsLoading(false);
         throw error;
       }
     };

     const signUp = async (email: string, password: string) => {
       setIsLoading(true);
       const { error } = await supabase.auth.signUp({ email, password });
       if (error) {
         setIsLoading(false);
         throw error;
       }
     };

     const signOut = async () => {
       setIsLoading(true);
       const { error } = await supabase.auth.signOut();
       if (error) {
         setIsLoading(false);
         throw error;
       }
     };

     const value = {
       user,
       session,
       signIn,
       signUp,
       signOut,
       isLoading
     };

     return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
   };

   export const useAuth = () => {
     const context = useContext(AuthContext);
     if (context === undefined) {
       throw new Error('useAuth must be used within an AuthProvider');
     }
     return context;
   };
   ```

3. **Configure Environment Variables:**  
   Create a file named `.env` in the `frontend/` directory and add:
   
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   Replace `your_supabase_url` and `your_supabase_anon_key` with your actual Supabase project credentials.

4. **Wrap the App with AuthProvider:**  
   Update `frontend/src/index.tsx`:
   
   ```typescript
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import App from './App';
   import { AuthProvider } from './context/AuthContext';

   const root = ReactDOM.createRoot(
     document.getElementById('root') as HTMLElement
   );
   root.render(
     <React.StrictMode>
       <AuthProvider>
         <App />
       </AuthProvider>
     </React.StrictMode>
   );
   ```

5. **Update the App Component:**  
   Update `frontend/src/App.tsx` to integrate authentication and RFP functionality:

   ```typescript
   import React, { useState, useEffect } from 'react';
   import axios from 'axios';
   import { useAuth } from './context/AuthContext';
   import { Tables } from '../../../../backend/src/utils/types';

   function App() {
     const { user, signIn, signUp, signOut, isLoading, session } = useAuth();
     const [health, setHealth] = useState('');
     const [prompt, setPrompt] = useState('');
     const [generatedRFP, setGeneratedRFP] = useState('');
     const [rfpLoading, setRfpLoading] = useState(false);
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [rfps, setRfps] = useState<Tables<'rfps'>[]>([]);
     const [error, setError] = useState('');

     // Function to fetch all RFPs for the user
     const fetchRFPs = async () => {
       try {
         const response = await axios.get('/api/rfp', {
           headers: {
             Authorization: `Bearer ${localStorage.getItem('sb-token')}`
           }
         });
         setRfps(response.data.rfps);
       } catch (error) {
         console.error("Error fetching RFPs:", error);
         setError("Failed to fetch RFPs");
       }
     };

     useEffect(() => {
       axios.get('/api/health')
         .then(response => {
           setHealth(response.data.status);
         })
         .catch(error => {
           console.error("Error fetching health:", error);
           setHealth('error');
         });

       const storedToken = localStorage.getItem('sb-token');
       if (user && storedToken) {
         fetchRFPs();
       }
     }, [user]);

     // Store the token whenever it changes
     useEffect(() => {
       const token = sessionStorage.getItem("sb-1dovkfnyhvfvpupozbtw-auth-token");
       if (token) {
         const parsed = JSON.parse(token);
         localStorage.setItem('sb-token', parsed?.access_token);
       } else {
         localStorage.removeItem('sb-token');
       }
     }, [sessionStorage.getItem("sb-1dovkfnyhvfvpupozbtw-auth-token")]);

     const handleGenerateRFP = async () => {
       setRfpLoading(true);
       setError('');
       try {
         const response = await axios.post('/api/rfp', { prompt }, {
           headers: {
             Authorization: `Bearer ${localStorage.getItem('sb-token')}`
           }
         });
         setGeneratedRFP(response.data.rfp);
         fetchRFPs(); // Refresh the RFP list after generating a new one.
       } catch (error) {
         console.error("Error generating RFP:", error);
         setError("Failed to generate RFP");
       } finally {
         setRfpLoading(false);
       }
     };

     const handleSignIn = async () => {
       setError('');
       try {
         await signIn(email, password);
       } catch (error: any) {
         setError(error.message);
       }
     };

     const handleSignUp = async () => {
       setError('');
       try {
         await signUp(email, password);
       } catch (error: any) {
         setError(error.message);
       }
     };

     if (isLoading) {
       return <div>Loading...</div>;
     }

     return (
       <div className="App">
         <h1>IntelliPlan</h1>
         <p>Backend Health: {health}</p>
         {error && <p style={{ color: 'red' }}>{error}</p>}
         {!user ? (
           <div>
             <h2>Sign In / Sign Up</h2>
             <input
               type="email"
               placeholder="Email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
             />
             <input
               type="password"
               placeholder="Password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
             />
             <button onClick={handleSignIn} disabled={isLoading}>Sign In</button>
             <button onClick={handleSignUp} disabled={isLoading}>Sign Up</button>
           </div>
         ) : (
           <div>
             <h2>Welcome, {user.email}!</h2>
             <button onClick={signOut}>Sign Out</button>
             <div>
               <textarea
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="Enter your RFP prompt here..."
                 rows={4}
                 cols={50}
               />
               <button onClick={handleGenerateRFP} disabled={rfpLoading}>
                 {rfpLoading ? 'Generating...' : 'Generate RFP'}
               </button>
             </div>
             {generatedRFP && (
               <div>
                 <h2>Generated RFP:</h2>
                 <pre>{generatedRFP}</pre>
               </div>
             )}
             <div>
               <h2>Your RFPs:</h2>
               <ul>
                 {rfps.map((rfp) => (
                   <li key={rfp.id}>
                     <p>Created At: {new Date(rfp.created_at).toLocaleString()}</p>
                     <p>Prompt: {rfp.prompt}</p>
                     <pre>{rfp.rfp_text}</pre>
                   </li>
                 ))}
               </ul>
             </div>
           </div>
         )}
       </div>
     );
   }

   export default App;
   ```

**Outcome:**  
- The frontend now provides forms for user sign-up and sign-in using Supabase Auth.
- Once authenticated, users can generate RFPs and see a list of their previously generated RFPs.
- The Supabase JWT is stored in local storage for maintaining session persistence.

---

## Testing (Phase 3)

1. **Start the Backend:**  
   Run `npm run dev` in the `backend` directory.
2. **Start the Frontend:**  
   Run `npm start` in the `frontend` directory.
3. **Sign Up:**  
   Use the sign-up form to create a new user. The app should automatically sign you in.
4. **Sign Out:**  
   Click the "Sign Out" button to log out and see the sign-in/sign-up forms again.
5. **Sign In:**  
   Use the sign-in form with your credentials.
6. **Generate RFP:**  
   After signing in, enter an RFP prompt and click "Generate RFP". The generated RFP should display, and it should also appear in the "Your RFPs" list.
7. **Refresh:**  
   Refresh the page; you should remain signed in (via the stored token) and see your RFPs.
8. **Re-sign In:**  
   Sign out and sign in again to confirm persistence.
9. **Verify in Supabase:**  
   Check the `rfps` table in your Supabase dashboard to ensure RFPs are correctly associated with the user.
10. **Test Error Handling:**  
    Attempt to generate an RFP while signed out to confirm that unauthorized access is correctly handled.

---

# Conclusion

Phase 3 integrates data persistence and user authentication into the IntelliPlan application. By:

- Creating a new `rfps` table in Supabase with appropriate RLS policies.
- Developing backend services to save and retrieve RFPs.
- Modifying controllers to persist generated RFPs linked to the authenticated user.
- Adding authentication middleware to protect API endpoints.
- Implementing frontend authentication (sign-up, sign-in, sign-out) and integrating these features with the RFP generation UI.

The application now supports persistent storage of generated RFPs and secure user management. Future phases can build on this foundation with additional features such as document analysis (Ask Elli) or further enhancements to the user experience.
```