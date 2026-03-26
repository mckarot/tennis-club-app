# Tennis Club du François - Technical Documentation

## Project Overview
Progressive Web App (PWA) for managing and booking tennis courts at the municipal tennis club of Le François, Martinique.

**Three User Roles:**
- **Admin**: Full system oversight, court management, user directory, analytics
- **Moniteur (Instructor)**: Schedule management, lesson slots, student rosters
- **Client (Member)**: Court booking, availability viewing, reservation management

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [01_PROJECT_SETUP.md](./01_PROJECT_SETUP.md) | Environment setup, dependencies, Firebase configuration |
| [02_DATA_MODEL.md](./02_DATA_MODEL.md) | Firestore schema, collections, indexes, relationships |
| [03_FIREBASE_RULES.md](./03_FIREBASE_RULES.md) | Security rules by user role |
| [04_SERVICES.md](./04_SERVICES.md) | Backend services (reservation, user, court, slot) |
| [05_COMPONENTS.md](./05_COMPONENTS.md) | React component architecture and hierarchy |
| [06_ROUTING.md](./06_ROUTING.md) | React Router v6.4+ structure, protected routes |
| [07_DESIGN_SYSTEM.md](./07_DESIGN_SYSTEM.md) | Tailwind config, colors, typography, components |
| [08_USER_FLOWS.md](./08_USER_FLOWS.md) | Feature specifications by role |
| [09_TESTING.md](./09_TESTING.md) | Testing strategy, emulator workflow |
| [10_TODO_LIST.md](./10_TODO_LIST.md) | Complete 0-100% implementation roadmap |

### 🔍 Routing Audit (New - 2026-03-26)

| Document | Description |
|----------|-------------|
| [ROUTING_AUDIT.md](./ROUTING_AUDIT.md) | **Complete routing audit** - Missing routes, duplicates, action plan |
| [ROUTING_ISSUES_SUMMARY.md](./ROUTING_ISSUES_SUMMARY.md) | **Executive summary** - Critical issues, business impact |
| [ROUTING_MAP.md](./ROUTING_MAP.md) | **Visual routing map** - Navigation flows, file structure |
| [ROUTING_FIX_CHECKLIST.md](./ROUTING_FIX_CHECKLIST.md) | **Step-by-step checklist** - 4-phase fix plan with testing |

---

## Quick Reference

### Firebase Emulator Suite
- **Firestore Emulator**: `localhost:8080`
- **Auth Emulator**: `http://localhost:9099`
- **Environment Variable**: `VITE_USE_EMULATOR=true`

### Timezone
All times use **America/Martinique** (AST, UTC-4)

### Core Collections
- `users` - User profiles with roles
- `courts` - Court inventory (6 courts)
- `reservations` - Court bookings
- `slots_moniteurs` - Instructor availability slots

### Key Technologies
- React 19+ with Server Components
- TypeScript (strict mode)
- Tailwind CSS 4.0+
- Firebase Emulator Suite
- React Router v6.4+
- Day.js for date/time handling
