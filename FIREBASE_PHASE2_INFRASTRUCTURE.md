# Firebase Phase 2 Core Infrastructure

## Overview

This document describes the Firebase Firestore infrastructure created for Phase 2 of the Tennis Club du François application.

---

## Files Created

### 1. `firestore.indexes.json` - Composite Indexes
### 2. `firestore.rules` - Security Rules
### 3. `src/config/firebase.config.ts` - Firebase Singleton Configuration
### 4. `src/scripts/seedData.ts` - Database Seeding Script

---

## 1. Firestore Indexes (`firestore.indexes.json`)

### Index Summary

| # | Collection | Fields | Query Scope | Justification |
|---|------------|--------|-------------|---------------|
| 1 | `users` | `role`, `status` | COLLECTION | Get users by role and status |
| 2 | `courts` | `is_active`, `number` | COLLECTION | Get active courts ordered by number |
| 3 | `courts` | `status`, `type` | COLLECTION | Filter courts by status and type |
| 4 | `reservations` | `court_id`, `start_time`, `status` | COLLECTION | Get court reservations by date with status filter |
| 5 | `reservations` | `user_id`, `start_time` | COLLECTION | Get user's reservations chronologically |
| 6 | `reservations` | `moniteur_id`, `start_time` | COLLECTION | Get instructor's lessons chronologically |
| 7 | `reservations` | `start_time`, `status` | COLLECTION | Get reservations by date range and status |
| 8 | `reservations` | `court_id`, `end_time`, `start_time` | COLLECTION | Advanced court scheduling queries |
| 9 | `slots_moniteurs` | `moniteur_id`, `date` | COLLECTION | Get instructor's availability by date |
| 10 | `slots_moniteurs` | `date`, `status`, `type` | COLLECTION | Find available slots by date and type |
| 11 | `slots_moniteurs` | `status`, `date` | COLLECTION | Get slots by status ordered by date |

### Detailed Index Justifications

#### Index 1: `users[role + status]`
```json
{
  "collectionGroup": "users",
  "fields": [
    { "fieldPath": "role", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```
**Query Optimized:**
```typescript
// Get all active moniteurs
const q = query(
  collection(db, 'users'),
  where('role', '==', 'moniteur'),
  where('status', '==', 'online')
);
```
**Use Case:** Admin dashboard showing active instructors.

---

#### Index 2: `courts[is_active + number]`
```json
{
  "collectionGroup": "courts",
  "fields": [
    { "fieldPath": "is_active", "order": "ASCENDING" },
    { "fieldPath": "number", "order": "ASCENDING" }
  ]
}
```
**Query Optimized:**
```typescript
// Get all active courts ordered by court number
const q = query(
  collection(db, 'courts'),
  where('is_active', '==', true),
  orderBy('number', 'asc')
);
```
**Use Case:** Court selection dropdown showing only available courts.

---

#### Index 3: `courts[status + type]`
```json
{
  "collectionGroup": "courts",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "type", "order": "ASCENDING" }
  ]
}
```
**Query Optimized:**
```typescript
// Get all active Quick courts
const q = query(
  collection(db, 'courts'),
  where('status', '==', 'active'),
  where('type', '==', 'Quick')
);
```
**Use Case:** Filter courts by surface type for booking.

---

#### Index 4: `reservations[court_id + start_time + status]`
```json
{
  "collectionGroup": "reservations",
  "fields": [
    { "fieldPath": "court_id", "order": "ASCENDING" },
    { "fieldPath": "start_time", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```
**Query Optimized:**
```typescript
// Get confirmed reservations for a court on a specific date
const startOfDay = dayjs(date).startOf('day').toISOString();
const endOfDay = dayjs(date).endOf('day').toISOString();

const q = query(
  collection(db, 'reservations'),
  where('court_id', '==', courtId),
  where('start_time', '>=', startOfDay),
  where('start_time', '<=', endOfDay),
  where('status', '==', 'confirmed')
);
```
**Use Case:** Court calendar view showing booked slots.

---

#### Index 5: `reservations[user_id + start_time]`
```json
{
  "collectionGroup": "reservations",
  "fields": [
    { "fieldPath": "user_id", "order": "ASCENDING" },
    { "fieldPath": "start_time", "order": "ASCENDING" }
  ]
}
```
**Query Optimized:**
```typescript
// Get user's future reservations
const q = query(
  collection(db, 'reservations'),
  where('user_id', '==', userId),
  where('start_time', '>=', Timestamp.now()),
  orderBy('start_time', 'asc')
);
```
**Use Case:** User's "My Reservations" page.

---

#### Index 6: `reservations[moniteur_id + start_time]`
```json
{
  "collectionGroup": "reservations",
  "fields": [
    { "fieldPath": "moniteur_id", "order": "ASCENDING" },
    { "fieldPath": "start_time", "order": "ASCENDING" }
  ]
}
```
**Query Optimized:**
```typescript
// Get instructor's upcoming lessons
const q = query(
  collection(db, 'reservations'),
  where('moniteur_id', '==', moniteurId),
  where('type', 'in', ['cours_collectif', 'cours_private']),
  orderBy('start_time', 'asc')
);
```
**Use Case:** Instructor's schedule dashboard.

---

#### Index 7: `reservations[start_time + status]`
```json
{
  "collectionGroup": "reservations",
  "fields": [
    { "fieldPath": "start_time", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```
**Query Optimized:**
```typescript
// Get today's confirmed reservations
const startOfDay = dayjs().startOf('day').toISOString();
const endOfDay = dayjs().endOf('day').toISOString();

const q = query(
  collection(db, 'reservations'),
  where('start_time', '>=', startOfDay),
  where('start_time', '<=', endOfDay),
  where('status', '==', 'confirmed')
);
```
**Use Case:** Daily schedule overview for admin.

---

#### Index 8: `reservations[court_id + end_time + start_time]`
```json
{
  "collectionGroup": "reservations",
  "fields": [
    { "fieldPath": "court_id", "order": "ASCENDING" },
    { "fieldPath": "end_time", "order": "ASCENDING" },
    { "fieldPath": "start_time", "order": "ASCENDING" }
  ]
}
```
**Query Optimized:**
```typescript
// Check for overlapping reservations
const q = query(
  collection(db, 'reservations'),
  where('court_id', '==', courtId),
  where('end_time', '>=', proposedStartTime),
  where('start_time', '<=', proposedEndTime)
);
```
**Use Case:** Conflict detection when booking a court.

---

#### Index 9: `slots_moniteurs[moniteur_id + date]`
```json
{
  "collectionGroup": "slots_moniteurs",
  "fields": [
    { "fieldPath": "moniteur_id", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "ASCENDING" }
  ]
}
```
**Query Optimized:**
```typescript
// Get instructor's availability for a week
const q = query(
  collection(db, 'slots_moniteurs'),
  where('moniteur_id', '==', moniteurId),
  where('date', '>=', weekStart),
  where('date', '<=', weekEnd),
  orderBy('date', 'asc')
);
```
**Use Case:** Instructor's weekly availability calendar.

---

#### Index 10: `slots_moniteurs[date + status + type]`
```json
{
  "collectionGroup": "slots_moniteurs",
  "fields": [
    { "fieldPath": "date", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "type", "order": "ASCENDING" }
  ]
}
```
**Query Optimized:**
```typescript
// Find available group slots for a specific date
const q = query(
  collection(db, 'slots_moniteurs'),
  where('date', '==', selectedDate),
  where('status', '==', 'available'),
  where('type', '==', 'GROUP')
);
```
**Use Case:** Client browsing available group lessons.

---

#### Index 11: `slots_moniteurs[status + date]`
```json
{
  "collectionGroup": "slots_moniteurs",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "date", "order": "ASCENDING" }
  ]
}
```
**Query Optimized:**
```typescript
// Get all available slots ordered by date
const q = query(
  collection(db, 'slots_moniteurs'),
  where('status', '==', 'available'),
  orderBy('date', 'asc')
);
```
**Use Case:** Admin dashboard showing all available instructor slots.

---

## 2. Firestore Security Rules (`firestore.rules`)

### Helper Functions

| Function | Description | Usage |
|----------|-------------|-------|
| `isAuthenticated()` | Check if user is logged in | Base check for all protected operations |
| `getUserRole()` | Get user's role from users collection | Role-based access control |
| `hasRole(role)` | Check if user has specific role | Permission checks |
| `isAdmin()` | Check if user is admin | Admin-only operations |
| `isMoniteur()` | Check if user is instructor | Instructor-specific features |
| `isClient()` | Check if user is client | Client-specific features |
| `isOwner(userId)` | Check if user owns the resource | Data ownership validation |
| `isValidReservation()` | Validate reservation data structure | Create/update validation |
| `isValidUserData()` | Validate user data structure | User creation/update validation |
| `isValidCourtData()` | Validate court data structure | Court management validation |
| `isValidSlotData()` | Validate moniteur slot data structure | Slot management validation |

### Access Control Matrix

#### Users Collection

| Operation | Admin | Moniteur | Client | Public |
|-----------|-------|----------|--------|--------|
| Read own profile | ✅ | ✅ | ✅ | ❌ |
| Read other profiles | ✅ | ❌ | ❌ | ❌ |
| Create user | ✅ | ❌ | ❌ | ❌ |
| Update any user | ✅ | ❌ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ | ❌ |

#### Courts Collection

| Operation | Admin | Moniteur | Client | Public |
|-----------|-------|----------|--------|--------|
| Read courts | ✅ | ✅ | ✅ | ✅ |
| Create court | ✅ | ❌ | ❌ | ❌ |
| Update court | ✅ | ❌ | ❌ | ❌ |
| Delete court | ✅ | ❌ | ❌ | ❌ |

#### Reservations Collection

| Operation | Admin | Moniteur | Client | Public |
|-----------|-------|----------|--------|--------|
| Read all reservations | ✅ | ✅ | ✅ | ❌ |
| Create reservation | ✅ | ✅ | ✅ | ❌ |
| Update own reservation | ✅ | ✅ | ✅ | ❌ |
| Update other reservation | ✅ | ❌ | ❌ | ❌ |
| Delete own reservation | ✅ | ✅ | ✅ | ❌ |
| Delete other reservation | ✅ | ❌ | ❌ | ❌ |

#### Slots Moniteurs Collection

| Operation | Admin | Moniteur | Client | Public |
|-----------|-------|----------|--------|--------|
| Read all slots | ✅ | ✅ | ✅ | ❌ |
| Create own slot | ✅ | ✅ | ❌ | ❌ |
| Update own slot | ✅ | ✅ | ❌ | ❌ |
| Update other slot | ✅ | ❌ | ❌ | ❌ |
| Delete own slot | ✅ | ✅ | ❌ | ❌ |
| Delete other slot | ✅ | ❌ | ❌ | ❌ |

---

## 3. Firebase Configuration (`src/config/firebase.config.ts`)

### Singleton Pattern

The configuration uses a singleton pattern to prevent:
- Multiple Firebase app initializations
- Double emulator connections
- Memory leaks from duplicate instances

### Key Features

```typescript
// Singleton instances
let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let emulatorsConnected = false; // Guard flag
```

### Automatic Emulator Connection

```typescript
if (import.meta.env.DEV && !emulatorsConnected) {
  if (import.meta.env.VITE_USE_EMULATOR === 'true') {
    connectFirestoreEmulator(dbInstance, 'localhost', 8080);
    connectAuthEmulator(authInstance, 'http://localhost:9099');
  }
}
```

### Exports

- `app` - Firebase App instance
- `db` - Firestore instance
- `auth` - Auth instance
- `getAppInstance()` - Accessor function
- `getDbInstance()` - Accessor function
- `getAuthInstance()` - Accessor function
- Re-exported Firestore and Auth utilities

---

## 4. Seed Data Script (`src/scripts/seedData.ts`)

### Data Seeded

| Collection | Count | Description |
|------------|-------|-------------|
| `users` | 6 | 1 admin, 2 moniteurs, 3 clients |
| `courts` | 6 | 4 Quick/Hard, 2 Terre/Clay |
| `reservations` | 10 | Client bookings, lessons, maintenance |
| `slots_moniteurs` | 8 | Private and group sessions |

### Features

- **writeBatch**: All operations use batch writes for atomicity and performance
- **Existence Check**: Verifies if data exists before seeding (prevents duplicates)
- **Force Option**: Can re-seed with `{ force: true }` option
- **ServiceResult Pattern**: Type-safe error handling
- **Timezone Aware**: All timestamps use America/Martinique timezone
- **Dynamic Dates**: Reservations and slots generated relative to current date

### Usage

```typescript
import { seedDatabase } from '@scripts/seedData';

// Basic usage
const result = await seedDatabase();
if (result.success) {
  console.log('Seeding completed!', result.data);
}

// Force re-seed
const result = await seedDatabase({ force: true });
```

### Test Credentials (Emulator Only)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tennis.mq | Admin123! |
| Moniteur | jean.philippe@tennis.mq | Moniteur123! |
| Moniteur | marie.claire@tennis.mq | Moniteur123! |
| Client | jean.dupont@email.mq | Client123! |
| Client | sophie.martin@email.mq | Client123! |
| Client | pierre.lagrange@email.mq | Client123! |

---

## Environment Variables

### Required `.env` Configuration

```bash
# Firebase Configuration
VITE_FIREBASE_PROJECT_ID=tennis-francois
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=tennis-francois.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=tennis-francois.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id-here
VITE_FIREBASE_APP_ID=your-app-id-here

# Emulator Configuration (Development)
VITE_USE_EMULATOR=true
VITE_FIREBASE_EMULATOR_HOST=localhost
VITE_FIRESTORE_EMULATOR_PORT=8080
VITE_FIREBASE_AUTH_EMULATOR_PORT=9099
VITE_FIREBASE_EMULATOR_UI_PORT=4000
```

---

## Deployment Checklist

### Before Deploying to Production

- [ ] Set `VITE_USE_EMULATOR=false` in production environment
- [ ] Deploy security rules: `firebase deploy --only firestore:rules`
- [ ] Deploy indexes: `firebase deploy --only firestore:indexes`
- [ ] Verify all indexes are created in Firebase Console
- [ ] Test all queries with real data (not emulator)
- [ ] Review security rules with `firebase firestore:rules:list`
- [ ] Enable Firebase Authentication in Firebase Console
- [ ] Configure production Firebase project settings

### Local Development

```bash
# Start Firebase emulators
firebase emulators:start

# Run the application
npm run dev

# Seed the database (in browser console)
import { seedDatabase } from './src/scripts/seedData';
await seedDatabase();

# View data at http://localhost:4000/firestore
```

---

## Next Steps

After Phase 2 infrastructure:

1. ✅ Firebase configuration with singleton pattern
2. ✅ Security rules with role-based access control
3. ✅ Composite indexes for all queries
4. ✅ Seed data script for development
5. 📖 **Phase 3**: Implement service layer with typed queries
6. 📖 **Phase 4**: Build UI components for reservations
7. 📖 **Phase 5**: Implement real-time listeners with onSnapshot

---

## References

- [Firestore Data Model](../../documentation/02_DATA_MODEL.md)
- [Firebase Security Rules](../../documentation/03_FIREBASE_RULES.md)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
