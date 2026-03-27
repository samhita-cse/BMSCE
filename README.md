# StudyFlow

StudyFlow is a modern student study companion built with React, Firebase, Firestore, Firebase Auth, and Claude via Firebase Cloud Functions.

## Features

- Google sign-in with Firebase Auth
- Pomodoro timer with completed session tracking
- Topic explanations in simple, medium, and advanced levels
- MCQ quiz generation with scoring and weak-area analysis
- Flashcard generation with saved revision sets
- Dashboard with study time, weak areas, progress, and recent activity
- Responsive UI with dark/light theme toggle

## Backend Architecture

- Firebase is the only backend.
- Authentication uses Firebase Auth with Google Sign-In only.
- Firestore stores user profiles, quiz attempts, flashcard decks, dashboard stats, and Pomodoro sessions.
- Claude API calls run only inside Firebase Cloud Functions.
- The frontend uses the modular Firebase SDK (`firebase/auth`, `firebase/firestore`, `firebase/functions`).

## Project Structure

```text
.
|-- client
|   |-- src
|   |   |-- components
|   |   |-- context
|   |   |-- features
|   |   |-- hooks
|   |   |-- lib
|   |   |-- pages
|   |   |-- services
|   |   `-- styles
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- functions
|   |-- src
|   |-- .eslintrc.cjs
|   `-- package.json
|-- firebase.json
|-- firestore.rules
`-- package.json
```

## Environment Variables

### `client/.env`

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
```

### `functions/.env`

```bash
ANTHROPIC_API_KEY=
```

## Run Locally

1. Install dependencies in both workspaces:
   - `npm install`
   - `npm --prefix client install`
   - `npm --prefix functions install`
2. Start the frontend: `npm run dev`
3. Start emulators or deploy Firebase Functions and Hosting as needed.

## Claude Integration

The frontend never calls Claude directly. It calls Firebase HTTPS functions:

- `generateStudyContent`
- `analyzeWeakAreas`

This keeps the Claude API key on the Firebase side only.

## Data Model

- `users/{uid}`: profile data for the signed-in user
- `users/{uid}/meta/stats`: totals, weak areas, and latest quiz progress
- `users/{uid}/quizAttempts/{attemptId}`: quiz scores and answer breakdown
- `users/{uid}/flashcards/{deckId}`: generated flashcard decks
- `users/{uid}/studySessions/{sessionId}`: completed Pomodoro focus sessions
