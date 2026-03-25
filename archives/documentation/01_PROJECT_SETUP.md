# 01. Project Setup

## 1. Prerequisites

### Required Software
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Java**: v11 or higher (for Firebase Emulator Suite)
- **Git**: Latest version

### Firebase Project
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Project ID: `tennis-francois`
3. Enable **Firestore Database**
4. Enable **Authentication** (Email/Password provider)
5. Install Firebase CLI: `npm install -g firebase-tools`

---

## 2. Project Initialization

### Step 1: Create React + TypeScript Project
```bash
npm create vite@latest tennis-club-app -- --template react-ts
cd tennis-club-app
npm install
```

### Step 2: Install Dependencies
```bash
# Core dependencies
npm install firebase dayjs react-router-dom @tanstack/react-query

# Development dependencies
npm install -D @types/node typescript tailwindcss postcss autoprefixer firebase-tools
```

### Step 3: Initialize Firebase
```bash
firebase login
firebase init firestore
firebase init auth
firebase init emulators
```

### Step 4: Initialize Tailwind CSS
```bash
npx tailwindcss init -p
```

---

## 3. Project Structure

```
tennis-club-app/
├── public/
│   ├── favicon.ico
│   └── manifest.json          # PWA manifest
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Generic components (Button, Card, Input)
│   │   ├── layout/            # Layout components (Navbar, Sidebar, Footer)
│   │   ├── courts/            # Court-related components
│   │   ├── reservations/      # Reservation components
│   │   ├── users/             # User management components
│   │   └── slots/             # Instructor slot components
│   ├── pages/                 # Page components (route-level)
│   │   ├── LandingPage.tsx
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── client/            # Client dashboard pages
│   │   └── moniteur/          # Instructor dashboard pages
│   ├── services/              # Firebase service layer
│   │   ├── reservationService.ts
│   │   ├── userService.ts
│   │   ├── courtService.ts
│   │   └── slotService.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useReservations.ts
│   │   ├── useCourts.ts
│   │   └── useUserProfile.ts
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx
│   ├── config/                # Configuration files
│   │   └── firebase.config.ts
│   ├── types/                 # TypeScript type definitions
│   │   ├── user.types.ts
│   │   ├── court.types.ts
│   │   ├── reservation.types.ts
│   │   └── slot.types.ts
│   ├── utils/                 # Utility functions
│   │   ├── timezone.ts
│   │   └── formatters.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── firebase.json              # Firebase configuration
├── firestore.rules            # Firestore security rules
├── .firebaserc                # Firebase project aliases
├── .env                       # Environment variables
├── .env.example               # Environment variables template
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

---

## 4. Environment Configuration

### `.env` File
Create a `.env` file at the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=tennis-francois.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tennis-francois
VITE_FIREBASE_STORAGE_BUCKET=tennis-francois.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Emulator Configuration
VITE_USE_EMULATOR=true
VITE_FIRESTORE_EMULATOR_HOST=localhost:8080
VITE_AUTH_EMULATOR_HOST=http://localhost:9099

# Application Configuration
VITE_TIMEZONE=America/Martinique
VITE_APP_NAME=Tennis Club du François
```

### `.env.example` Template
```env
# Firebase Configuration (Get these from Firebase Console)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Emulator Configuration
VITE_USE_EMULATOR=true
VITE_FIRESTORE_EMULATOR_HOST=localhost:8080
VITE_AUTH_EMULATOR_HOST=http://localhost:9099

# Application Configuration
VITE_TIMEZONE=America/Martinique
VITE_APP_NAME=Tennis Club du François
```

---

## 5. Firebase Configuration

### `src/config/firebase.config.ts`
```typescript
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators in development mode
if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, "http://localhost:9099");
  console.log("🛠️ Connected to Firebase Emulators");
}

export { db, auth };
```

---

## 6. Firebase Emulator Suite Configuration

### `firebase.json`
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### `firestore.indexes.json`
```json
{
  "indexes": [
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "court_id", "order": "ASCENDING" },
        { "fieldPath": "start_time", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "start_time", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "slots_moniteurs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "moniteur_id", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 7. Tailwind CSS Configuration

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006b3f',
          container: '#008751',
          fixed: '#8df8b7',
          fixedDim: '#70db9d',
        },
        secondary: {
          DEFAULT: '#9d431b',
          container: '#fe8c5e',
          fixed: '#ffdbce',
        },
        tertiary: {
          DEFAULT: '#9d3d43',
        },
        surface: {
          DEFAULT: '#f5fbf3',
          containerLow: '#f0f5ee',
          containerLowest: '#ffffff',
          containerHighest: '#dee4dd',
        },
        onSurface: '#171d19',
      },
      fontFamily: {
        headline: ['Lexend', 'sans-serif'],
        body: ['Work Sans', 'sans-serif'],
      },
      timezone: {
        default: 'America/Martinique',
      },
    },
  },
  plugins: [],
}
```

### `src/index.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Work+Sans:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Work Sans', sans-serif;
    background-color: #f5fbf3;
    color: #171d19;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Lexend', sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-gradient-to-br from-primary to-primary-container 
           text-white font-semibold py-3 px-6 rounded-lg 
           hover:opacity-90 transition-opacity duration-200;
  }

  .btn-secondary {
    @apply bg-secondary-container/10 text-secondary 
           font-semibold py-3 px-6 rounded-lg 
           hover:bg-secondary-container/20 transition-colors duration-200;
  }

  .card-surface {
    @apply bg-surface-container-lowest rounded-xl p-6;
  }
}
```

---

## 8. TypeScript Configuration

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@services/*": ["./src/services/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"],
      "@utils/*": ["./src/utils/*"],
      "@config/*": ["./src/config/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 9. Development Commands

### Start Firebase Emulators
```bash
firebase emulators:start
```

### Start Development Server
```bash
npm run dev
```

### Run Both (Recommended)
```bash
# Terminal 1: Firebase Emulators
firebase emulators:start

# Terminal 2: Vite Dev Server
npm run dev
```

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Seed Emulator Data
```bash
# Create a seed script and run it via browser console or:
node src/scripts/seedData.js
```

---

## 10. Firebase Emulator UI

Access the Firebase Emulator UI at: **http://localhost:4000**

Features:
- **Firestore**: View collections, documents, and real-time updates
- **Authentication**: Manage test users
- **Logs**: Monitor all emulator activity

---

## 11. Troubleshooting

### Java Not Found
```bash
# macOS
brew install openjdk@11

# Windows
# Download from https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html
```

### Port Already in Use
```bash
# Kill process on port 8080 (macOS)
lsof -ti:8080 | xargs kill -9

# Kill process on port 9099
lsof -ti:9099 | xargs kill -9
```

### Emulator Not Starting
```bash
# Clear emulator data
firebase emulators:export ./emulator-data
firebase emulators:start --import=./emulator-data
```

---

## 12. Next Steps

After completing setup:
1. ✅ Verify Firebase Emulator Suite is running
2. ✅ Confirm environment variables are loaded
3. ✅ Test Firebase connection in browser console
4. 📖 Proceed to [02_DATA_MODEL.md](./02_DATA_MODEL.md)
