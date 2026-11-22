# E-Waste Collection MVP

A full-stack web application for individual store owners to register their stores, manage their store profiles, and manage e-waste collection entries. Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Firebase Authentication**, **Cloud Firestore**, and **Firebase Storage**.

---

## Table of Contents

1. [Features](#features)
2. [Architecture & Security](#architecture--security)
3. [Design System & Theme](#design-system--theme)
4. [Data Model](#data-model)
5. [API Specification](#api-specification)
6. [Environment Variables](#environment-variables)
7. [Getting Started](#getting-started)
8. [Firebase Security Rules](#firebase-security-rules)

---

## 1. Features

- **Store Owner Registration & Authentication**:
  - Email and password registration with password confirmation and client/server validation.
  - Secure email/password login and password reset email dispatch.
  - Server-side session establishment via verified HTTP-only cookies (`__session`).
  - Protected routes redirect unauthenticated users to `/login`.
- **Store Management**:
  - Create and update single store profile per authenticated store owner.
  - Fields: Store Name, Owner Name, Email, Mobile Number, Location (optional text for future Google Maps integration), Address, City, State, Pincode.
  - Owner-scoped data isolation ensuring users can only view and update their own store.
- **E-Waste Entry Management**:
  - Add items with name, category, description, quantity, unit (`pieces`, `kg`, `boxes`), condition (`working`, `non-working`, `damaged`, `mixed`), images, and additional notes.
  - Multiple image upload (1–6 photos) supporting JPEG, PNG, and WebP (up to 5MB each).
  - Server-side Firebase Storage integration using owner-scoped folder paths (`ewaste/{ownerUid}/...`).
  - View details, inline editing, and deletion with confirmation dialogs.
  - Real-time status tracking (`pending`, `under_review`, `approved`, `rejected`, `purchased`).
- **Store Owner Dashboard**:
  - Summary metrics: Total Entries, Pending Entries, Approved Entries, Purchased Entries.
  - Quick action buttons (Add Entry, Store Settings).
  - Store profile summary card.
  - Recent collection entries list with direct navigation.
- **Listing, Search, Filter & Pagination**:
  - Responsive table layout on desktop, clean card layout on mobile.
  - Real-time search by item name and description.
  - Filters by category and status.
  - Paginated browsing with previous/next controls.
- **Live E-Waste Market Prices Section & Full Grid Page**:
  - Real-time rates widget integrated into the existing sidebar (and mobile drawer).
  - Clicking the live pricing widget (or navigating to `/pricing`) opens the dedicated, fully responsive **Live Pricing Grid Page**.
  - Responsive multi-column grid layout adapted for mobile (1 col), tablet (2–3 cols), and laptop/desktop (4 cols).
  - Search by material, filter by unit (kg vs. piece), and filter by trend (gaining vs. declining).
  - Direct quick action button on each pricing card to create an e-waste entry pre-filled with that category.
  - Fetched strictly read-only from the backend (`GET /api/prices`).
  - Reads from Firestore `market_prices` collection when configured.
  - Features real-time auto-refresh polling (every 15s) and manual refresh trigger.
  - Full **Fallback Development Mode** support with dynamic simulated market price movements when Firebase credentials are not set.

---

## 2. Architecture & Security

### Firebase Client SDK
Used **strictly for client-side authentication**:
- User registration (`createUserWithEmailAndPassword`)
- User login (`signInWithEmailAndPassword`)
- Password reset (`sendPasswordResetEmail`)
- Client logout (`signOut`)
- Retrieving ID tokens to exchange for secure server sessions.
- **No direct client-side Firestore or Firebase Storage operations.**

### Server-Side Firebase Admin SDK
All database reads/writes and storage uploads/deletions pass through authenticated **Next.js Route Handlers**:
- Verifies HTTP-only session cookies on every protected API call.
- The authenticated `UID` is always derived from the verified session, never from client input.
- Strict ownership verification before any store or e-waste record is read, updated, or deleted.
- Storage files are scoped to `ewaste/{ownerUid}/` preventing cross-user file access or deletion.

---

## 3. Design System & Theme

- **Strict Black & White Theme**:
  - Clean monochrome palette with neutral greys for borders, subtle backgrounds, and muted text.
  - Extracted from provided reference CSS and layout specifications.
- **Centralized Design Tokens**:
  - Located in `src/styles/tokens/`:
    - `colors.ts`
    - `typography.ts`
    - `spacing.ts`
    - `radius.ts`
    - `index.ts`
- **SVG Icons**:
  - Pure inline SVGs in `src/components/ui/icons.tsx` using `currentColor`.
  - No external icon dependencies (no Lucide React).
- **Responsive Layout**:
  - Desktop sidebar with collapsible rail.
  - Mobile drawer navigation with backdrop blur and touch optimization.

---

## 4. Data Model

### `users` Collection
- `uid`: Firebase Auth UID (Document ID)
- `email`: string
- `fullName`: string
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### `stores` Collection
- `ownerUid`: string (Owner's Firebase UID)
- `storeName`: string
- `ownerName`: string
- `email`: string
- `phone`: string
- `location`: string (optional)
- `address`: string
- `city`: string
- `state`: string
- `pincode`: string
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### `ewaste_entries` Collection
- `storeId`: string
- `ownerUid`: string (Owner's Firebase UID)
- `itemName`: string
- `category`: string
- `description`: string
- `quantity`: number
- `unit`: `"pieces" | "kg" | "boxes"`
- `condition`: `"working" | "non-working" | "damaged" | "mixed"`
- `images`: `Array<{ path: string; url: string }>`
- `additionalNotes`: string (optional)
- `status`: `"pending" | "under_review" | "approved" | "rejected" | "purchased"`
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

---

## 5. API Specification

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/session` | Creates HTTP-only session cookie from ID token & initializes user doc |
| `GET` | `/api/auth/session` | Returns verified session user profile |
| `POST` | `/api/auth/logout` | Clears the session cookie |
| `GET` | `/api/store` | Gets current owner's store profile |
| `POST` | `/api/store` | Creates or updates owner's store profile |
| `GET` | `/api/ewaste` | Lists owner's entries (with search, category, status, pagination) |
| `POST` | `/api/ewaste` | Creates a new e-waste entry |
| `GET` | `/api/ewaste/[id]` | Retrieves single entry (enforces `ownerUid`) |
| `PUT` | `/api/ewaste/[id]` | Updates existing entry (enforces `ownerUid`) |
| `DELETE` | `/api/ewaste/[id]` | Deletes entry (enforces `ownerUid`) |
| `POST` | `/api/ewaste/upload` | Uploads image via server to Firebase Storage |
| `DELETE` | `/api/ewaste/upload` | Deletes image from Firebase Storage (enforces `ownerUid` path prefix) |
| `GET` | `/api/prices` | Read-only live e-waste market rates from Firestore (with fallback mode) |
| `GET` | `/api/dashboard/stats` | Returns owner-specific stats, recent entries, and store summary |

---

## 6. Environment Variables

Create `.env.local` based on `.env.example`:

```env
# Runtime target: prod uses cloud Firebase; any other value uses local emulators.
APP_ENV=local
NEXT_PUBLIC_APP_ENV=local

# Firebase Client Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Emulator endpoints (used whenever APP_ENV is not prod)
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
NEXT_PUBLIC_STORAGE_EMULATOR_HOST=127.0.0.1:9199
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
STORAGE_EMULATOR_HOST=127.0.0.1:9199

# Firebase Admin SDK Configuration (Server-Only Secrets)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Set both `APP_ENV` and `NEXT_PUBLIC_APP_ENV` to `prod` in production. Any other
value selects the local Firebase emulators. Start them with the Firebase CLI
before running the app.

In local mode, the app uses the Firebase Auth, Firestore, and Storage emulators.
The in-memory fallback remains available only when production credentials are
missing.

---

## 7. Getting Started

```bash
# Install dependencies
npm install

# Run type checks
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```

---

## 8. Firebase Security Rules

Strict rules are provided in `firestore.rules` and `storage.rules`:
- Direct client SDK access to Firestore and Firebase Storage is completely locked down (`allow read, write: if false;`).
- All reads and writes must pass through the authenticated server route handlers using the Firebase Admin SDK.
