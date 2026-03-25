# Tennis Club du François - Application

Progressive Web App (PWA) for managing and booking tennis courts at the municipal tennis club of Le François, Martinique.

## 🚀 Quick Start

### Prerequisites
- Node.js v20.x or higher
- npm v10.x or higher
- Java v11 or higher (for Firebase Emulator Suite)

### Installation

1. **Navigate to the project:**
```bash
cd tennis-club-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start Firebase Emulators:**
```bash
# In terminal 1
npx firebase emulators:start
```

4. **Start Development Server:**
```bash
# In terminal 2
npm run dev
```

5. **Open your browser:**
- Application: http://localhost:5173
- Firebase Emulator UI: http://localhost:4000

---

## 📁 Project Structure

```
tennis-club-app/
├── src/
│   ├── config/              # Firebase configuration
│   ├── types/               # TypeScript interfaces
│   ├── services/            # Firebase/API services
│   ├── components/          # React components
│   │   ├── common/          # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   ├── courts/          # Court-related components
│   │   ├── reservations/    # Reservation components
│   │   ├── users/           # User components
│   │   └── slots/           # Time slot components
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── client/          # Client pages
│   │   └── moniteur/        # Instructor pages
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React contexts
│   ├── utils/               # Utility functions
│   └── assets/              # Static assets
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
├── firestore.indexes.json   # Database indexes
├── .env                     # Environment variables
└── package.json
```

---

## 🎨 Design System

### Colors
- **Primary (Court Green):** `#006b3f`
- **Secondary (Clay Ocre):** `#9d431b`
- **Tertiary (Accent Red):** `#9d3d43`
- **Surface:** `#f5fbf3`

### Typography
- **Headlines:** Lexend
- **Body:** Work Sans

---

## 👥 User Roles

| Role | Description | Access |
|------|-------------|--------|
| **Admin** | Club administrator | Full system access |
| **Moniteur** | Tennis instructor | Schedule & lesson management |
| **Client** | Club member/guest | Court booking & reservations |

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once |
| `npm run format` | Format code with Prettier |

---

## 📚 Documentation

Complete technical documentation is available in the `/documentation` folder:

1. [Project Setup](../documentation/01_PROJECT_SETUP.md)
2. [Data Model](../documentation/02_DATA_MODEL.md)
3. [Firebase Rules](../documentation/03_FIREBASE_RULES.md)
4. [Services](../documentation/04_SERVICES.md)
5. [Components](../documentation/05_COMPONENTS.md)
6. [Routing](../documentation/06_ROUTING.md)
7. [Design System](../documentation/07_DESIGN_SYSTEM.md)
8. [User Flows](../documentation/08_USER_FLOWS.md)
9. [Testing](../documentation/09_TESTING.md)
10. [TODO List](../documentation/10_TODO_LIST.md)

---

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=tennis-francois.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tennis-francois
VITE_FIREBASE_STORAGE_BUCKET=tennis-francois.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Emulator Configuration
VITE_USE_EMULATOR=true
```

---

## 📊 Firebase Emulator Suite

| Service | URL | Port |
|---------|-----|------|
| Firestore Emulator | http://localhost:4000/firestore | 8080 |
| Auth Emulator | http://localhost:4000/auth | 9099 |
| Emulator UI | http://localhost:4000 | 4000 |

---

## 🌍 Timezone

All times use **America/Martinique** (AST, UTC-4) timezone.

---

## 📝 License

This project is proprietary software for Tennis Club du François.

---

## 🤝 Contributing

Please read the documentation before contributing.

---

## 📞 Support

For support, contact the development team.
