# SlayPoints

A simple web application for tracking loyalty points (SlayPoints!), built with React (using Vite) and Firebase.

## Description

This application allows users to sign up, log in, and manage their SlayPoints balance. It uses Firebase for authentication (Email/Password) and Firestore to store user points data securely. It also features a dark mode toggle.

## Features

*   User Signup with Email/Password
*   User Login with Email/Password
*   Password Reset ("Forgot Password") functionality
*   Display current SlayPoints balance for logged-in users
*   Adjust points balance (add or subtract) via an input field
*   Points data persisted in Firestore
*   Secure access using Firestore Security Rules (users can only access their own points)
*   Dark/Light mode theme toggle
*   Basic error handling and user feedback messages

## Tech Stack

*   **Frontend Framework:** React 18+
*   **Build Tool:** Vite
*   **Backend Services:** Firebase
    *   Firebase Authentication (Email/Password)
    *   Firebase Firestore (Database)
*   **Language:** JavaScript (ES6+)
*   **Styling:** CSS (with CSS Variables for theming)

## Setup and Installation

**Prerequisites:**

*   Node.js (v18 or later recommended)
*   npm (usually comes with Node.js)
*   A Firebase account

**Steps:**

1.  **Clone the Repository (Optional):**
    ```bash
     git clone https://github.com/vencordthemer/slaypoints
     cd slaypoints
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Firebase Setup:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).
    *   **Authentication:** In your Firebase project, go to `Authentication` > `Sign-in method` and enable the `Email/Password` provider.
    *   **Firestore:** Go to `Firestore Database` > `Create database`. Choose `Production mode` and select a location close to your users.
    *   **Get Config:** Go to `Project settings` (gear icon) > `General`. Scroll down to `Your apps`. If you haven't registered a web app, click the web icon (`</>`) to create one. Copy the `firebaseConfig` object provided.
    *   **Configure App:** Create a file named `src/firebase.js` (if it doesn't exist) and paste your `firebaseConfig` into it, like this:
        ```javascript
        // src/firebase.js
        import { initializeApp } from "firebase/app";
        import { getAuth } from "firebase/auth";
        import { getFirestore } from "firebase/firestore";

        // Paste your actual Firebase project configuration here
        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_STORAGE_BUCKET",
          messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
          appId: "YOUR_APP_ID",
          measurementId: "YOUR_MEASUREMENT_ID" // Optional
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        export { auth, db };
        ```
        *(Make sure this file contains your actual credentials, not the placeholders unless you intend to replace them later).*
    *   **Security Rules:** Go back to `Firestore Database` > `Rules`. Paste the following rules and click `Publish`:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allow users to read and write only their own points document
            match /userPoints/{userId} {
              allow read, update, delete: if request.auth != null && request.auth.uid == userId;
              allow create: if request.auth != null; // Allow any authenticated user to create their own doc
            }
          }
        }
        ```

## Running the Application

1.  **Development Mode:**
    *   Starts a local development server with Hot Module Replacement (HMR).
    ```bash
    npm run dev
    ```
    *   Open your browser to the URL provided (usually `http://localhost:5173`).

2.  **Production Build:**
    *   Bundles the app for production deployment.
    ```bash
    npm run build
    ```
    *   The output will be in the `dist` folder. You can preview the production build locally using:
    ```bash
    npm run preview
    ```
