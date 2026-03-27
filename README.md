# StudyFlow

## Problem Statement

Students often use separate tools for focus sessions, revision, quizzes, notes, and progress tracking. This makes studying fragmented and makes it harder to identify weak areas, stay consistent, and revise efficiently from one place.

## Solution

StudyFlow is a student-focused web app that brings together:

- a Pomodoro study timer
- topic explanations in multiple difficulty levels
- MCQ quiz generation
- flashcard generation
- weak-area detection
- progress tracking

The app is designed to give students one workspace for focused study, self-testing, revision, and performance review.

## Tech Stack

- Frontend: React + Vite
- Styling: CSS
- Authentication: Firebase Auth with Google Sign-In
- Database: Firebase Firestore
- Backend: Firebase Cloud Functions
- AI Integration:
  - Claude API via Firebase Functions
  - free local demo AI fallback for testing and demo use

## Features

- Google login and logout using Firebase Authentication
- Protected dashboard for signed-in users only
- Pomodoro timer with start, pause, reset, and completed session tracking
- Topic explanation in:
  - simple
  - medium
  - advanced
- MCQ quiz generator with:
  - configurable number of questions
  - score tracking
  - correct and wrong answer summary
- Flashcard generation for revision
- Weak-area analysis based on quiz results
- Firestore storage for:
  - user profiles
  - quiz attempts
  - flashcards
  - Pomodoro sessions
  - dashboard stats
- Dark/light mode
- Responsive student-friendly UI
- Free demo AI mode so the app can still work without paid AI deployment

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
|-- package.json
`-- README.md
```

## Run Instructions

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Add environment variables

Create `client/.env`:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
VITE_DEMO_AI=true
```

Create `functions/.env` only if you want live Claude-backed Firebase Functions:

```bash
ANTHROPIC_API_KEY=
```

### 3. Firebase setup

- Create a Firebase project
- Enable Google Sign-In in Firebase Authentication
- Create Firestore Database
- Add `localhost` to authorized domains if needed

### 4. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

### 5. Optional live AI backend

If you want to use Claude through Firebase Functions instead of demo AI mode:

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only functions
```

Then set:

```bash
VITE_DEMO_AI=false
```

## Notes

- For free testing and demos, keep `VITE_DEMO_AI=true`
- Do not commit real `.env` files to GitHub
- Commit `.env.example` files instead
