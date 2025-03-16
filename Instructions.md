# Comprehensive Development Plan for Rebuilding "IntelliPlan"

This document outlines a comprehensive development plan to rebuild the "IntelliPlan" web application from scratch. The plan uses **TypeScript**, **Supabase**, and emphasizes a clean, maintainable architecture. It is broken down into sequential, executable phases with enough detail for an AI agent to act upon.

---

## Overall Project Goals

### Functionality
- **Event Planning Web Application** featuring:
  - AI-powered RFP generation.
  - Interactive floor plan design.
  - Document analysis (AskElli).
  - Conversational AI assistant.
  - Future: Venue and Vendor recommendations.

### Technology Stack
- **Frontend:** React (with TypeScript)
- **Backend:** Node.js/Express (with TypeScript)
- **Database/Auth/Storage:** Supabase
- **AI:** Primarily OpenAI, with a potential fallback to Google Gemini
- **OCR:** Google Cloud Vision API (preferred) or AWS Textract

### Design Principles
- **Simplicity:** Minimal dependencies and clear code.
- **Maintainability:** Well-structured, fully typed code with clear separation of concerns.
- **Scalability:** API-centric design leveraging managed services.
- **Testability:** Designed with unit and integration tests in mind.
- **User Experience:** Intuitive and responsive UI.

---

## Project Structure

The project will be structured as follows:

```plaintext
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
│   │   └── types.ts      (Shared types for the backend)
│   ├── package.json
│   └── tsconfig.json
├── supabase/         (Supabase configuration and migrations)
│   └── migrations/
├── .env              (Environment variables)
├── package.json      (Root-level dependencies and scripts)
└── README.md
