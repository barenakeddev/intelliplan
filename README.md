# IntelliPlan

An AI-powered event planning web application featuring RFP generation, interactive floor plan design, document analysis, and a conversational AI assistant.

## Technology Stack

- **Frontend:** React (with TypeScript)
- **Backend:** Node.js/Express (with TypeScript)
- **Database/Auth/Storage:** Supabase
- **AI:** OpenAI (with Google Gemini fallback)
- **OCR:** Google Cloud Vision API (or AWS Textract)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v8+)
- Supabase account with project set up
- OpenAI API key

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm run install-all
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Fill in your Supabase URL, Supabase Key, and OpenAI API Key

4. Run the development server:
   ```
   npm run dev
   ```

## Project Structure

```
intelliplan/
├── frontend/         (React application)
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── App.tsx
│       ├── index.tsx
│       └── styles.css
├── backend/          (Node.js/Express API)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── package.json
│   └── tsconfig.json
├── supabase/         (Supabase configuration and migrations)
│   └── migrations/
├── .env              (Environment variables)
├── package.json      (Root-level dependencies and scripts)
└── README.md
``` 