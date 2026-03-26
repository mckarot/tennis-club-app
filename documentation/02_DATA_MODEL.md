# 02. Data Model

## Firestore Database Schema

This document defines the complete data model for the Tennis Club du François application.

---

## 1. Collections Overview

| Collection | Description | Read Access | Write Access |
|------------|-------------|-------------|--------------|
| `users` | User profiles and roles | Authenticated users | Admin only |
| `courts` | Court inventory and status | Public | Admin only |
| `reservations` | Court bookings and events | Authenticated users | Authenticated users (create), Admin/Owner (update/delete) |
| `slots_moniteurs` | Instructor availability slots | Authenticated users | Moniteur (own), Admin (all) |

---

## 2. Collection Details

### 2.1 `users` Collection

User profiles with role-based access control.

#### Document Structure
```typescript
interface User {
  uid: string;                    // Firebase Auth UID (also document ID)
  name: string;                   // Full name
  email: string;                  // Email address (unique)
  role: UserRole;                 // User role
  phone?: string;                 // Phone number
  status: UserStatus;             // Online/Away/Inactive
  avatar?: string;                // Profile picture URL
  createdAt: Timestamp;           // Account creation date
  updatedAt: Timestamp;           // Last profile update
  lastLoginAt?: Timestamp;        // Last login timestamp
}

type UserRole = 'admin' | 'moniteur' | 'client';
type UserStatus = 'online' | 'away' | 'inactive';
```

#### Example Document
```javascript
// Path: users/admin_001
{
  uid: "admin_001",
  name: "Admin Martinique",
  email: "admin@tennis.mq",
  role: "admin",
  phone: "+596 696 12 34 56",
  status: "online",
  avatar: "https://storage.googleapis.com/...",
  createdAt: Timestamp(2024-01-01T00:00:00Z),
  updatedAt: Timestamp(2024-01-15T10:30:00Z),
  lastLoginAt: Timestamp(2024-01-15T08:00:00Z)
}
```

#### Indexes
```json
{
  "collectionGroup": "users",
  "fields": [
    { "fieldPath": "role", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```

#### Queries
```typescript
// Get all users with role
query(collection(db, "users"), where("role", "==", "moniteur"));

// Get active users
query(collection(db, "users"), where("status", "==", "online"));

// Search by email (requires composite index)
query(collection(db, "users"), where("email", "==", email));
```

---

### 2.2 `courts` Collection

Court inventory with surface type and availability status.

#### Document Structure
```typescript
interface Court {
  id: string;                     // Document ID (court_01, court_02, etc.)
  number: number;                 // Court number (1-6)
  name: string;                   // Display name
  type: CourtType;                // Surface category
  surface: SurfaceType;           // Detailed surface description
  status: CourtStatus;            // Current status
  is_active: boolean;             // Availability toggle
  image?: string;                 // Court photo URL
  description?: string;           // Optional description
  createdAt: Timestamp;           // Creation date
  updatedAt: Timestamp;           // Last update
}

type CourtType = 'Quick' | 'Terre';
type SurfaceType = 'Hard' | 'Clay' | 'Grass' | 'Synthetic';
type CourtStatus = 'active' | 'maintenance' | 'closed';
```

#### Example Documents
```javascript
// Path: courts/court_01
{
  id: "court_01",
  number: 1,
  name: "Grand Court East",
  type: "Quick",
  surface: "Hard",
  status: "active",
  is_active: true,
  image: "https://storage.googleapis.com/tennis-francois/courts/court_01.jpg",
  description: "Premium hard court with professional lighting",
  createdAt: Timestamp(2024-01-01T00:00:00Z),
  updatedAt: Timestamp(2024-01-15T10:00:00Z)
}

// Path: courts/court_05
{
  id: "court_05",
  number: 5,
  name: "Clay Court North",
  type: "Terre",
  surface: "Clay",
  status: "active",
  is_active: true,
  image: "https://storage.googleapis.com/tennis-francois/courts/court_05.jpg",
  description: "Traditional red clay court",
  createdAt: Timestamp(2024-01-01T00:00:00Z),
  updatedAt: Timestamp(2024-01-15T10:00:00Z)
}
```

#### Default Courts (6 Courts)
| ID | Number | Name | Type | Surface |
|----|--------|------|------|---------|
| court_01 | 1 | Grand Court East | Quick | Hard |
| court_02 | 2 | Center Stage | Quick | Hard |
| court_03 | 3 | Shadow View | Quick | Hard |
| court_04 | 4 | Training Zone | Quick | Hard |
| court_05 | 5 | Clay Court North | Terre | Clay |
| court_06 | 6 | West End | Terre | Clay |

#### Indexes
```json
{
  "collectionGroup": "courts",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "is_active", "order": "ASCENDING" }
  ]
}
```

#### Queries
```typescript
// Get all active courts
query(collection(db, "courts"), where("is_active", "==", true));

// Get courts by type
query(collection(db, "courts"), where("type", "==", "Terre"));

// Get courts available for booking
query(
  collection(db, "courts"),
  where("status", "==", "active"),
  where("is_active", "==", true)
);
```

---

### 2.3 `reservations` Collection

Court bookings, lessons, and events.

#### Document Structure
```typescript
interface Reservation {
  id?: string;                    // Auto-generated document ID
  court_id: string;               // Reference to courts/{courtId}
  user_id: string;                // Reference to users/{userId}
  moniteur_id?: string;           // Reference to users/{moniteurId} (for lessons)
  start_time: Timestamp;          // Booking start time
  end_time: Timestamp;            // Booking end time
  type: ReservationType;          // Type of reservation
  status: ReservationStatus;      // Booking status
  title?: string;                 // Display title (customer name or lesson title)
  description?: string;           // Optional notes
  participants?: number;          // Number of players
  is_paid?: boolean;              // Payment status
  created_at: Timestamp;          // Creation timestamp
  updated_at?: Timestamp;         // Last update timestamp
}

type ReservationType = 
  | 'location_libre'              // Free play
  | 'cours_collectif'             // Group lesson
  | 'cours_private'               // Private lesson
  | 'individual'                  // Individual practice
  | 'doubles'                     // Doubles match
  | 'training'                    // Training session
  | 'tournament'                  // Tournament match
  | 'maintenance';                // Court maintenance

type ReservationStatus = 
  | 'confirmed'                   // Confirmed booking
  | 'pending'                     // Awaiting confirmation
  | 'pending_payment'             // Awaiting payment
  | 'cancelled'                   // Cancelled booking
  | 'completed';                  // Completed session
```

#### Example Documents
```javascript
// Path: reservations/res_001 (Client booking)
{
  court_id: "court_01",
  user_id: "client_001",
  start_time: Timestamp(2024-01-20T10:00:00-04:00),
  end_time: Timestamp(2024-01-20T11:00:00-04:00),
  type: "location_libre",
  status: "confirmed",
  title: "Jean Dupont",
  participants: 2,
  is_paid: true,
  created_at: Timestamp(2024-01-18T14:30:00Z)
}

// Path: reservations/res_002 (Group lesson)
{
  court_id: "court_05",
  user_id: "client_002",
  moniteur_id: "moniteur_001",
  start_time: Timestamp(2024-01-20T14:00:00-04:00),
  end_time: Timestamp(2024-01-20T15:30:00-04:00),
  type: "cours_collectif",
  status: "confirmed",
  title: "Group Lesson - Intermediate",
  description: "Forehand and backhand drills",
  participants: 6,
  is_paid: false,
  created_at: Timestamp(2024-01-17T09:00:00Z)
}

// Path: reservations/res_003 (Maintenance)
{
  court_id: "court_03",
  user_id: "admin_001",
  start_time: Timestamp(2024-01-21T06:00:00-04:00),
  end_time: Timestamp(2024-01-21T12:00:00-04:00),
  type: "maintenance",
  status: "confirmed",
  title: "Court Resurfacing",
  description: "Scheduled maintenance - Court closed",
  created_at: Timestamp(2024-01-15T16:00:00Z)
}
```

#### Indexes (Critical for Performance)
```json
[
  {
    "collectionGroup": "reservations",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "court_id", "order": "ASCENDING" },
      { "fieldPath": "start_time", "order": "ASCENDING" },
      { "fieldPath": "status", "order": "ASCENDING" }
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
    "collectionGroup": "reservations",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "moniteur_id", "order": "ASCENDING" },
      { "fieldPath": "start_time", "order": "ASCENDING" }
    ]
  },
  {
    "collectionGroup": "reservations",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "start_time", "order": "ASCENDING" },
      { "fieldPath": "status", "order": "ASCENDING" }
    ]
  }
]
```

#### Queries
```typescript
// Get reservations for a specific court on a date
const startOfDay = dayjs(date).startOf('day').toISOString();
const endOfDay = dayjs(date).endOf('day').toISOString();

query(
  collection(db, "reservations"),
  where("court_id", "==", courtId),
  where("start_time", ">=", startOfDay),
  where("start_time", "<=", endOfDay),
  where("status", "==", "confirmed")
);

// Get user's reservations
query(
  collection(db, "reservations"),
  where("user_id", "==", userId),
  where("start_time", ">=", dayjs().toISOString()),
  orderBy("start_time", "asc")
);

// Get instructor's lessons
query(
  collection(db, "reservations"),
  where("moniteur_id", "==", moniteurId),
  where("type", "in", ["cours_collectif", "cours_private"]),
  orderBy("start_time", "asc")
);

// Real-time listener for today's reservations
onSnapshot(
  query(
    collection(db, "reservations"),
    where("start_time", ">=", dayjs().startOf('day').toISOString()),
    where("start_time", "<=", dayjs().endOf('day').toISOString())
  ),
  (snapshot) => { /* handle updates */ }
);
```

---

### 2.4 `slots_moniteurs` Collection

Instructor availability slots for lessons.

#### Document Structure
```typescript
interface MoniteurSlot {
  id?: string;                    // Auto-generated document ID
  moniteur_id: string;            // Reference to users/{moniteurId}
  date: string;                   // Date in YYYY-MM-DD format
  start_time: string;             // Start time (HH:MM format)
  end_time: string;               // End time (HH:MM format)
  type: SlotType;                 // Private or Group
  court_id?: string;              // Preferred court (optional)
  status: SlotStatus;             // Availability status
  max_participants?: number;      // Max students for group slots
  current_participants?: number;  // Current student count
  description?: string;           // Slot description
  created_at: Timestamp;          // Creation timestamp
  updated_at?: Timestamp;         // Last update timestamp
}

type SlotType = 'PRIVATE' | 'GROUP';
type SlotStatus = 'available' | 'booked' | 'cancelled';
```

#### Example Document
```javascript
// Path: slots_moniteurs/slot_001
{
  moniteur_id: "moniteur_001",
  date: "2024-01-20",
  start_time: "14:00",
  end_time: "15:30",
  type: "GROUP",
  court_id: "court_05",
  status: "available",
  max_participants: 6,
  current_participants: 2,
  description: "Intermediate forehand techniques",
  created_at: Timestamp(2024-01-15T10:00:00Z),
  updated_at: Timestamp(2024-01-18T14:30:00Z)
}
```

#### Indexes
```json
[
  {
    "collectionGroup": "slots_moniteurs",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "moniteur_id", "order": "ASCENDING" },
      { "fieldPath": "date", "order": "ASCENDING" }
    ]
  },
  {
    "collectionGroup": "slots_moniteurs",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "date", "order": "ASCENDING" },
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "type", "order": "ASCENDING" }
    ]
  }
]
```

#### Queries
```typescript
// Get instructor's slots for a week
query(
  collection(db, "slots_moniteurs"),
  where("moniteur_id", "==", moniteurId),
  where("date", ">=", startDate),
  where("date", "<=", endDate),
  orderBy("date", "asc")
);

// Get available group slots for a date
query(
  collection(db, "slots_moniteurs"),
  where("date", "==", date),
  where("status", "==", "available"),
  where("type", "==", "GROUP")
);

// Real-time listener for instructor's weekly schedule
onSnapshot(
  query(
    collection(db, "slots_moniteurs"),
    where("moniteur_id", "==", moniteurId),
    where("date", ">=", weekStart),
    where("date", "<=", weekEnd)
  ),
  (snapshot) => { /* handle updates */ }
);
```

---

## 3. Entity Relationship Diagram

```
┌─────────────┐
│   users     │
│ (profiles)  │
└──────┬──────┘
       │
       │ uid (FK)
       ├────────────────────────────┐
       │                            │
       ▼                            ▼
┌──────────────┐          ┌─────────────────┐
│ reservations │          │ slots_moniteurs │
│  (bookings)  │          │  (availability) │
└──────┬───────┘          └────────┬────────┘
       │                           │
       │ court_id (FK)             │ court_id (FK)
       ▼                           ▼
┌─────────────┐            ┌─────────────┐
│   courts    │◄───────────┤   courts    │
│ (inventory) │            │ (inventory) │
└─────────────┘            └─────────────┘
```

---

## 4. Data Relationships

### One-to-Many Relationships

1. **User → Reservations**
   - A user can have multiple reservations
   - Each reservation belongs to one user (via `user_id`)

2. **User → Moniteur Slots**
   - A moniteur can have multiple availability slots
   - Each slot belongs to one moniteur (via `moniteur_id`)

3. **Court → Reservations**
   - A court can have multiple reservations
   - Each reservation is for one court (via `court_id`)

### Reference Patterns

```typescript
// Direct reference (recommended for simple queries)
const userRef = doc(db, "users", userId);

// Collection group queries (for cross-collection searches)
const allReservations = collectionGroup(db, "reservations");

// Subcollections (if needed for complex hierarchies)
const userReservations = collection(db, "users", userId, "reservations");
```

---

## 5. Data Validation Rules

### Client-Side Validation (TypeScript)

```typescript
// src/types/validation.types.ts

interface ReservationInput {
  court_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  type: ReservationType;
  participants?: number;
}

function validateReservation(data: ReservationInput): ValidationResult {
  // Check court exists
  // Check times are valid
  // Check end_time > start_time
  // Check duration <= 2 hours
  // Check participants <= court capacity
  // Check no conflicts with existing reservations
}
```

### Server-Side Validation (Firestore Rules)

See [03_FIREBASE_RULES.md](./03_FIREBASE_RULES.md) for complete security rules.

---

## 6. Timezone Handling

All datetime operations use **America/Martinique** timezone (AST, UTC-4).

### Day.js Configuration

```typescript
// src/utils/timezone.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'America/Martinique';

export const toLocalTime = (date: Date | string) => {
  return dayjs(date).tz(TIMEZONE);
};

export const toISO = (date: dayjs.Dayjs) => {
  return date.toISOString();
};

export const startOfDay = (date: Date) => {
  return dayjs(date).tz(TIMEZONE).startOf('day').toISOString();
};

export const endOfDay = (date: Date) => {
  return dayjs(date).tz(TIMEZONE).endOf('day').toISOString();
};
```

---

## 7. Sample Data Seeding

See the seed script in the reference documents for populating the emulator with test data.

### Quick Seed Command

```typescript
// Run this in browser console or via a seed button
import { seedDatabase } from './scripts/seedData';
await seedDatabase();
```

---

## 8. Next Steps

After understanding the data model:
1. ✅ Review Firestore indexes for query optimization
2. ✅ Understand timezone handling for America/Martinique
3. 📖 Proceed to [03_FIREBASE_RULES.md](./03_FIREBASE_RULES.md)
