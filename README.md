# RetroVoice

RetroVoice is an AI-powered retrospective board application that transforms the collected meeting transcript files into anonymized, categorized insights. Built with Google Cloud infrastructure, it leverages the Gemini AI model to automatically analyze team discussions and extract actionable retrospective feedback, while also allowing humans to add their own insights to the retrospective board.

## Overview

RetroVoice streamlines the retrospective process by:
- **Automatically analyzing** sprint transcript files (`.txt` and `.vtt` WebVTT subtitle formats)
- **Extracting insights** using Google's Gemini AI model via Vertex AI
- **Categorizing feedback** into "What Went Well" and "What Didn't Go Well" (AI-generated)
- **Anonymizing data** by removing personal names and attribution while preserving feature context
- **Enabling manual additions** allowing teams to supplement AI insights with manual feedback
- **Tracking action items** with completion status

## Architecture

### Technology Stack

**Backend:**
- **Express.js 5.1** - Lightweight REST API framework
- **TypeScript 5.9** - Type-safe backend implementation with full type checking
- **Google Cloud Storage** - GCS for sprint and transcript file storage and organization
- **Google Vertex AI (Gemini 3.8-Flash)** - AI-powered analysis with structured JSON output
- **@google/genai 2.24** - Official Google AI SDK for Vertex AI API integration
- **Multer 1.4.5** - Multipart file upload handling (2MB / 10-file limits)
- **Zod 4.1** - Runtime validation for environment variables and sprint names
- **Vitest 3.2** - Fast unit and integration test runner
- **tsx & TypeScript Compiler** - Development and production TypeScript compilation

**Frontend:**
- **React 18.2** - Component-based UI library with hooks
- **Vite 5.4** - Lightning-fast build tool and dev server with HMR
- **TypeScript 5.9** - Type-safe React components
- **Tailwind CSS 4.3** - Utility-first CSS framework for responsive design
- **@tailwindcss/vite 4.3** - Vite plugin for Tailwind CSS
- **Vitest 3.2** - Unit testing framework

**Infrastructure:**
- **Google Cloud Storage (GCS)** - Centralized transcript and sprint storage
- **Google Vertex AI** - Managed Gemini model service (gemini-3.8-flash)
- **Cloud Run** - Serverless backend deployment
- **Firebase Hosting** - Frontend hosting (deployed via `npm run deploy:hosting`)

### Design & Prototyping

- **Stitch** - UI brainstorming and logo design; used for initial ideation and visual direction
- **Figma** - Functional prototype and design system; all UI components and workflows designed in Figma before development
- **Antigravity** - Converts Figma prototypes into production React code; bridges the gap between design and implementation

## Workspace structure

```
retro-voice/
├── backend/                          # Express + TypeScript REST API
│   ├── src/
│   │   ├── controllers/             # HTTP request handlers (SprintController)
│   │   ├── services/                # Business logic (Analysis, Gemini, Storage)
│   │   ├── routes/                  # API endpoint definitions (sprint, health routes)
│   │   ├── middleware/              # CORS, error handling, Multer file upload
│   │   ├── validators/              # Input validation (sprint, files, analysis response)
│   │   ├── prompts/                 # Gemini system and user prompts with JSON schema
│   │   ├── utils/                   # VTT subtitle parser for transcript extraction
│   │   ├── types/                   # TypeScript domain types (RetroAnalysisSchema, etc.)
│   │   ├── config/                  # Environment configuration with Zod validation
│   │   ├── app.ts                   # Express app factory with dependency injection
│   │   └── index.ts                 # Server entry point with graceful shutdown
│   ├── test/                        # Integration and unit tests
│   ├── dist/                        # Compiled TypeScript output (created by npm run build)
│   ├── package.json                 # Dependencies and scripts
│   └── tsconfig.json                # TypeScript configuration
│
├── frontend/                         # React + Vite + TypeScript UI application
│   ├── src/
│   │   ├── components/
│   │   │   ├── pages/              # Page-level components (Create, Board, Home, etc.)
│   │   │   ├── board/              # Retrospective board components (Column, Cards, Modals)
│   │   │   ├── layout/             # Header and footer layout components
│   │   │   └── common/             # Shared UI components (Button, Input, Toast, Icons)
│   │   ├── lib/                    # API client and validation utilities
│   │   ├── types/                  # TypeScript type definitions (RetroAnalysisResponse, etc.)
│   │   ├── App.tsx                 # Root component with state management and page routing
│   │   ├── main.tsx                # React entry point with ToastProvider
│   │   └── index.css               # Global Tailwind CSS styles
│   ├── public/                     # Static assets (logos, icons)
│   ├── dist/                       # Built frontend output (created by npm run build)
│   ├── package.json                # Dependencies and scripts
│   ├── vite.config.ts              # Vite build configuration with React plugin
│   ├── tsconfig.app.json           # App TypeScript configuration
│   └── index.html                  # HTML entry point
│
├── dataset/                         # Sample VTT transcript files for testing
│   └── sprint-transcripts/         # Example sprint-01-day-01.vtt, etc.
│
└── README.md                        # This file
```

## Features

### Core Features
- ✅ **Multi-format Upload** - Support for `.txt` plain text and `.vtt` WebVTT subtitle files
- ✅ **Batch Processing** - Upload up to 10 files per submission
- ✅ **AI Analysis** - Gemini-powered extraction of "What Went Well" and "What Didn't Go Well" insights
- ✅ **Anonymization** - Prompt-enforced removal of personal names while preserving meaningful context
- ✅ **Categorized Board** - Three-column retrospective board (Went Well / Didn't Go Well / Action Items); AI fills the first two, the team adds action items
- ✅ **Manual Entries** - Teams can add their own feedback items to any column
- ✅ **Action Tracking** - Mark action items as completed
- ✅ **Multi-file Analysis** - Combine multiple transcripts for comprehensive insights
- ✅ **Transcript Storage** - Sprint transcripts stored in Google Cloud Storage (one folder per sprint)

### Frontend Features
- 📋 **Sprint List** - Browse existing sprints and create new ones
- 📤 **File Upload** - Select multiple transcript files with the file picker, add more or remove before uploading
- 🔍 **Transcript Check** - See how many transcripts already exist for a sprint name before creating it
- ⚙️ **Analysis Trigger** - Run AI analysis on demand per sprint
- 📊 **Interactive Board** - View and interact with categorized insights
- ✏️ **Manual Editing** - Add, edit, or remove feedback items
- ✓ **Completion Tracking** - Mark action items as done
- 📝 **Help & Contact** - Quick-start guide and support contact page
- 🔄 **Accept/Reject/Edit AI Generated Insights** - Allow users to reject AI-generated insights and edit cards for clarity or additional context

## Local Development Setup

### Prerequisites
- Node.js 20+ and npm
- Google Cloud project with:
    - Vertex AI API enabled
    - Gemini model access
    - Google Cloud Storage bucket configured
- Google Cloud Application Default Credentials (ADC) set up locally

### 1. Configure Google Cloud

```bash
# Set up Application Default Credentials
gcloud auth application-default login

# Set your GCP project ID
export GOOGLE_CLOUD_PROJECT=your-project-id
```

### 2. Start the Backend

```bash
cd backend
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your values:
# GOOGLE_CLOUD_PROJECT=your-project-id
# GCS_BUCKET_NAME=your-gcs-bucket
# GEMINI_MODEL=gemini-3.8-flash
# FRONTEND_ORIGIN=http://localhost:5173

npm run dev
```

The backend will start at `http://localhost:8080`

### 3. Start the Frontend

```bash
cd frontend
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with backend URL (if needed):
# VITE_API_BASE_URL=http://localhost:8080

npm run dev
```

The frontend will start at `http://localhost:5173`

## API Endpoints

### Sprint Management
- `GET /api/sprints` - List all available sprints
    - Returns: `{ sprints: string[] }`

- `GET /api/sprints/:sprintName/transcripts` - List uploaded transcripts for a sprint
    - Returns: `{ sprintName: string, files: TranscriptFileMeta[], count: number }`
    - Used for real-time validation when user enters sprint name in "Pull Existing" mode

- `POST /api/sprints/:sprintName/transcripts` - Upload transcript files for a sprint
    - Multipart form data with files array
    - Validates sprint name (5-15 chars, alphanumeric/hyphens/underscores)
    - Validates each file: .txt or .vtt format, max 2MB, max 10 files
    - Returns: `{ sprintName: string, uploadedFiles: TranscriptFileMeta[], count: number }`

- `POST /api/sprints/:sprintName/analyze` - Trigger AI analysis of transcripts
    - Loads all transcripts for the sprint
    - Calls Gemini API with anonymization and structured output
    - Returns: `{ sprintName: string, summary: { totalFiles: number, generatedAt: ISO8601 }, wentWell: RetroInsight[], didntGoWell: RetroInsight[] }`

### Health & Status
- `GET /api/health` - Service health check
    - Returns: `{ status: string, service: string }`

- `GET /api` - API status endpoint
    - Returns: `{ service: string, status: string }`

### Typical Workflow
1. `GET /api/sprints` - Load list of available sprints
2. User chooses between:
    - **Existing Sprint**: `GET /api/sprints/:sprintName/transcripts` (real-time, debounced)
    - **New Sprint Upload**: `POST /api/sprints/:sprintName/transcripts` with files
3. `POST /api/sprints/:sprintName/analyze` - Analyze transcripts and generate insights
4. Frontend displays results in three-column board with AI insights and manual entry capability

### Response Error Format
All errors return JSON with standardized structure:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common error codes:
- `INVALID_SPRINT_NAME` - Sprint name fails validation
- `FILE_TOO_LARGE` - Single file exceeds 2MB (HTTP 413)
- `TOO_MANY_FILES` - Upload contains more than 10 files
- `UPLOAD_ERROR` - Other multipart upload error
- `UPLOAD_VALIDATION_FAILED` - Files failed validation
- `UPLOAD_FAILED` - Server error during upload
- `TRANSCRIPT_LIST_FAILED` - Failed to list transcripts
- `EMPTY_TRANSCRIPT_SET` - No transcripts found for sprint
- `AI_ANALYSIS_FAILED` - Gemini analysis failed
- `ANALYSIS_SERVICE_UNAVAILABLE` - Analysis service not configured (HTTP 503)
- `INTERNAL_SERVER_ERROR` - Unhandled server error
- `NOT_FOUND` - Route not found (HTTP 404)

## Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/test/production) | `development` | No |
| `PORT` | Backend server port | `8080` | No |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | - | ✅ Yes |
| `GCP_REGION` | GCP region (read into config; used by the deployment commands, not by app code) | `us-central1` | No |
| `GCS_BUCKET_NAME` | Google Cloud Storage bucket name for transcripts | - | ✅ Yes |
| `GEMINI_MODEL` | Gemini model version to use | `gemini-3.8-flash` | No |
| `GOOGLE_GENAI_LOCATION` | Gemini API region (use `global` if model unavailable in region) | `global` | No |
| `FRONTEND_ORIGIN` | CORS allowed frontend origin (must match exactly) | `http://localhost:5173` | No |
| `MAX_FILE_SIZE_BYTES` | Reserved – not currently used; the 2MB limit is hardcoded | `2097152` (2MB) | No |
| `MAX_FILES_PER_UPLOAD` | Reserved – not currently used; the 10-file limit is hardcoded | `10` | No |
| `MAX_ANALYSIS_INPUT_CHARS` | Reserved – not currently enforced | `200000` | No |

**Note on Sprint Name Validation**: Minimum 5 characters, maximum 15 characters. Only alphanumeric, hyphens, and underscores allowed. Names are normalized to lowercase.

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080` |

**Build Time**: Frontend variables are baked in at build time via Vite, so `VITE_API_BASE_URL` must be set before `npm run build`.

## Core Backend Services

### Services Layer

**AnalysisService**
- Orchestrates sprint analysis workflow
- Loads all transcripts for a sprint from storage
- Calls GeminiService to generate insights
- Validates the AI response and adds IDs, file count and a timestamp
- Throws on errors (no retries); the controller maps them to error codes

**GeminiService**
- Integrates with Google Vertex AI Gemini API
- Sends transcript content with detailed system prompt
- Enforces JSON schema validation for structured output
- Applies safety settings for content filtering
- Returns anonymized insights with evidence counts

**StorageService** (Abstract Interface)
- `GoogleCloudStorageService` - Production implementation using GCS
    - Lists all sprints (top-level GCS folders)
    - Uploads transcripts with metadata
    - Retrieves combined transcript content
    - Manages sprint and transcript organization
- `LocalStorageService` - In-memory implementation used by the tests
    - Injected via `createApp(env, { storageService })`; the running server always uses GCS

### Controllers Layer

**SprintController**
- Handles all HTTP request logic for sprint endpoints:
    - `listSprints()` - Returns all available sprints
    - `uploadTranscripts()` - Validates and uploads transcript files for a sprint
    - `listTranscripts()` - Lists uploaded transcripts for a sprint with metadata
    - `analyzeSprint()` - Triggers AI analysis and returns categorized insights
- Validates sprint names and file uploads using dedicated validators
- Orchestrates storage and analysis service calls
- Formats HTTP responses with standardized error handling
- Returns 400 for validation errors, 500 for server errors, 503 if the analysis service isn't configured

### Middleware

- **CORS Middleware** - Enables cross-origin requests from `FRONTEND_ORIGIN` environment variable
- **Error Middleware** - Fallback handler for errors passed to Express; returns JSON with `INTERNAL_SERVER_ERROR` (5xx) or `REQUEST_FAILED` (4xx)
- **Upload Middleware** - Multer configuration for file upload handling with:
    - Memory storage for uploaded files
    - File size limit: 2MB per file
    - File count limit: 10 files per upload
    - Error handling for oversized files and file count exceeding limits

### Validators

- **SprintValidator** - Validates sprint names:
    - Minimum 5 characters
    - Maximum 15 characters
    - Only alphanumeric characters, hyphens, and underscores allowed
    - Returns specific error messages for validation failures
- **UploadValidator** - Validates uploaded files:
    - File types: only `.txt` and `.vtt` (WebVTT subtitle format) allowed
    - File count: maximum 10 files per upload
    - File size: maximum 2MB per file
    - No empty files permitted
    - No path traversal patterns in filenames
- **AnalysisValidator** - Validates Gemini analysis response:
    - Checks for required `wentWell` and `didntGoWell` arrays
    - Validates each insight has title, description, and evidenceCount
    - Ensures evidence arrays are properly formatted
    - Includes a `sanitizeAnalysisResponse` hook for removing personal attribution (currently a placeholder that returns the text unchanged; anonymization relies on the prompt)

## Frontend Experience & State Flow

### State Management (App.tsx)
- **sprints** - List of all available sprint names
- **selectedSprint** - Currently selected sprint (string name)
- **analysis** - Most recent AI analysis result (RetroAnalysisResponse or null); only one is held at a time and it's shown only when it matches the selected sprint
- **sprintManualItems** - User-added feedback items per sprint and column, stored as `{ sprintName: { well: [], improve: [], actions: [] } }`
- **completedActionItems** - Map of completed action item IDs per sprint for tracking completion status
- **sprintAnalysisCardStatus** - Track user interactions with AI cards: pending, accepted, or rejected
- **isAnalyzing** - Loading state for AI analysis operation
- **isUploading** - Loading state for file upload operation
- **analysisError** - Error message from failed analysis attempts

All of this state is held in memory in React and is reset when the page is refreshed.

### Pages

- **HomePage** - Landing page with two main action buttons:
    - "Create Sprint" - Navigate to create/upload workflow
    - "Sprint Retrospective Board" - Navigate to sprint analysis board

- **CreateSprintPage** - Sprint creation and transcript upload workflow:
    - Enter sprint name (minimum 5 characters, alphanumeric/hyphens/underscores)
    - Choose transcript source: "Pull Existing Sprint Transcripts" or "Upload Your Own Transcripts"
    - For existing sprints: Real-time validation showing transcript availability (debounced API call)
    - For uploads: File picker with multiple file selection, visual file list with "Upload more" and per-file remove
    - Max 10 files per upload, .txt and .vtt formats only
    - Clear error messages and status indicators

- **BoardPage** - Main retrospective analysis and collaboration board:
    - Sprint selector dropdown to switch between sprints
    - Three-column layout:
        - "What Went Well" - Positive insights and successes (AI + manual)
        - "What Didn't Go Well" - Challenges, blockers, and issues (AI + manual)
        - "Action Items" - Manually added tasks and follow-ups with completion tracking
    - "Analyze Sprint" / "Analyze Again" button to trigger AI analysis
    - Analysis results displayed as cards with:
        - Title and description ("Title: description"), marked "Added by RetroVoice"
        - Accept/reject buttons to curate AI output (rejected cards are hidden)
        - Pencil button that opens an edit dialog
    - Manual item entry in each column:
        - "Add new feedback" dialog (feedback text + your name)
        - Edit dialog with delete (and delete confirmation)
        - Completion checkbox for action items
    - Pending AI cards are highlighted in blue until accepted
    - Loading states and error handling for analysis

- **HelpPage** - Three-step quick-start guide
- **ContactPage** - Support and contact information for users

## Testing

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npx vitest

# Build for production
npm run build
```

### Backend Tests

```bash
cd backend

# Run tests
npm test

# Run tests in watch mode
npx vitest

# Build for production
npm run build
```

## Deployment

The backend runs on **Cloud Run** and the frontend on **Firebase Hosting**. For step-by-step instructions, see [`DEPLOYMENT.md`](/DEPLOYMENT.md).

## How It Works

### Analysis Flow

1. **Sprint Creation & Transcript Management**
    - User enters sprint name (5-15 chars, alphanumeric/hyphen/underscore)
    - Choice of "Pull Existing Sprint Transcripts" (real-time API validation) or "Upload Your Own Transcripts"
    - For uploads: Select 1-10 transcript files (.txt or .vtt format, max 2MB each)

2. **File Upload & Storage**
    - Files validated on both frontend (UI validation) and backend (strict validation)
    - Files stored in Google Cloud Storage organized by sprint name
    - File metadata (name, path, size) recorded

3. **Transcript Processing**
    - All files for a sprint loaded from storage
    - VTT files (WebVTT subtitle format) automatically parsed to extract clean text (timestamps, cue IDs and `<v Speaker>` tags removed)
    - Plain text files used as-is
    - Combined into one input, with a `--- File: name ---` header before each file

4. **AI Analysis with Gemini**
    - Combined transcript text sent to Google Vertex AI (gemini-3.8-flash model)
    - Detailed system prompt guides AI to:
        - Extract team-level observations (not individual attribution)
        - Preserve feature/workflow context when explicitly mentioned
        - Produce two categories: "What Went Well" and "What Didn't Go Well"
        - Remove personal names and identifying information completely
        - Provide evidence count for each insight
    - Thinking mode set to LOW for cost/latency optimization
    - Safety filters enabled for harmful content
    - JSON schema enforced for structured output

5. **Response Validation**
    - Analysis response validated against the expected structure
    - Evidence counts come from Gemini (number of transcript references it found for each insight)
    - Each insight is given an ID, and the response includes file count and a timestamp

6. **Frontend Board Display**
    - AI-generated insights displayed as cards with:
        - Title and description
        - Accept/Reject/Edit buttons
    - User can manually add feedback to any column
    - Manual and AI items can be edited or deleted
    - Action items tracked with completion status
    - Board changes are kept in memory in the browser and are lost on page refresh

7. **Continuous Refinement**
    - Reject AI cards that don't match sprint reality
    - Edit cards for clarity or additional context
    - Add manual feedback that AI missed
    - Mark action items as completed when done
