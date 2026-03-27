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

## Deploy And Run Online

This project is meant to be used as a deployed web app, not only from a local machine.

### Frontend Deployment

Deploy the `client` app to a static hosting provider such as Render, Vercel, Netlify, or Firebase Hosting.

For Render:

1. Create a new `Static Site`.
2. Connect your GitHub repository.
3. Set the root directory to `client`.
4. Set the build command to:

```bash
npm install && npm run build
```

5. Set the publish directory to:

```bash
dist
```

6. Add these frontend environment variables in Render:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
```

### Backend Deployment

The backend stays fully on Firebase.

Deploy Firebase services:

1. Firebase Authentication with Google provider enabled
2. Firestore database
3. Firebase Cloud Functions
4. Optional Firebase Hosting if you do not use Render for the frontend

Deploy functions with:

```bash
firebase deploy --only functions
```

Deploy Firestore rules with:

```bash
firebase deploy --only firestore:rules
```

Set the Claude API key for Firebase Functions before deploying:

```bash
ANTHROPIC_API_KEY=
```

If you are using Firebase Functions config or secret management, keep the key only on Firebase and never in the frontend.

## Run Locally

1. Install dependencies:
   - `npm install`
   - `npm --prefix client install`
   - `npm --prefix functions install`
2. Start the frontend:
   - `npm run dev`
3. Run Firebase emulators or deploy Firebase Functions before testing AI features.

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
