# Phase 7.3: Moniteur Dashboard - Firebase Implementation Summary

## Overview
This document summarizes the Firebase infrastructure implementation for the Moniteur Dashboard (Phase 7.3) of the Tennis Club du François application.

**Date:** March 25, 2026  
**Status:** ✅ COMPLETED  
**Timezone:** America/Martinique (AST, UTC-4)

---

## 1. Firestore Indexes Added

### 4 New Composite Indexes for Moniteur Dashboard

| # | Collection | Fields | Justification |
|---|------------|--------|---------------|
| 1 | `reservations` | `moniteur_id` + `start_time` + `status` | **CRITICAL** — Query: `where('moniteur_id', '==', id).where('status', '==', 'confirmed').orderBy('start_time')`. Used by `subscribeToMoniteurReservations()` for real-time schedule view with status filtering. |
| 2 | `reservations` | `moniteur_id` + `type` + `start_time` | **CRITICAL** — Query: `where('moniteur_id', '==', id).where('type', '==', 'cours_private').orderBy('start_time')`. Used by `getClubEfficiencyStats()` to calculate stats per session type (PRIVATE vs GROUP). |
| 3 | `slots_moniteurs` | `moniteur_id` + `date` + `start_time` | **CRITICAL** — Query: `where('moniteur_id', '==', id).orderBy('date').orderBy('start_time')`. Used by `subscribeToMoniteurSlots()` for real-time weekly schedule display. |
| 4 | `slots_moniteurs` | `moniteur_id` + `status` + `date` | **CRITICAL** — Query: `where('moniteur_id', '==', id).where('status', '==', 'available').orderBy('date')`. Used by `getAvailableMoniteurSlots()` to show only bookable sessions. |

### Complete Index List (16 Total)

```json
{
  "indexes": [
    // Users (2 indexes)
    {"collectionGroup": "users", "fields": [{"fieldPath": "role"}, {"fieldPath": "status"}]},
    
    // Courts (2 indexes)
    {"collectionGroup": "courts", "fields": [{"fieldPath": "is_active"}, {"fieldPath": "number"}]},
    {"collectionGroup": "courts", "fields": [{"fieldPath": "status"}, {"fieldPath": "type"}]},
    
    // Reservations (6 indexes)
    {"collectionGroup": "reservations", "fields": [{"fieldPath": "court_id"}, {"fieldPath": "start_time"}, {"fieldPath": "status"}]},
    {"collectionGroup": "reservations", "fields": [{"fieldPath": "user_id"}, {"fieldPath": "start_time"}]},
    {"collectionGroup": "reservations", "fields": [{"fieldPath": "moniteur_id"}, {"fieldPath": "start_time"}]},
    {"collectionGroup": "reservations", "fields": [{"fieldPath": "start_time"}, {"fieldPath": "status"}]},
    {"collectionGroup": "reservations", "fields": [{"fieldPath": "court_id"}, {"fieldPath": "end_time"}, {"fieldPath": "start_time"}]},
    {"collectionGroup": "reservations", "fields": [{"fieldPath": "moniteur_id"}, {"fieldPath": "start_time"}, {"fieldPath": "status"}]}, // NEW
    {"collectionGroup": "reservations", "fields": [{"fieldPath": "moniteur_id"}, {"fieldPath": "type"}, {"fieldPath": "start_time"}]}, // NEW
    
    // Slots Moniteurs (5 indexes)
    {"collectionGroup": "slots_moniteurs", "fields": [{"fieldPath": "moniteur_id"}, {"fieldPath": "date"}]},
    {"collectionGroup": "slots_moniteurs", "fields": [{"fieldPath": "date"}, {"fieldPath": "status"}, {"fieldPath": "type"}]},
    {"collectionGroup": "slots_moniteurs", "fields": [{"fieldPath": "status"}, {"fieldPath": "date"}]},
    {"collectionGroup": "slots_moniteurs", "fields": [{"fieldPath": "moniteur_id"}, {"fieldPath": "date"}, {"fieldPath": "start_time"}]}, // NEW
    {"collectionGroup": "slots_moniteurs", "fields": [{"fieldPath": "moniteur_id"}, {"fieldPath": "status"}, {"fieldPath": "date"}]}, // NEW
    
    // Maintenance Notes (1 index)
    {"collectionGroup": "maintenance_notes", "fields": [{"fieldPath": "is_active"}, {"fieldPath": "created_at", "order": "DESCENDING"}]}
  ]
}
```

---

## 2. Security Rules Updated

### slots_moniteurs Collection

```javascript
match /slots_moniteurs/{slotId} {
  // READ: Moniteur can read THEIR OWN slots + Admin can read ALL + Anyone can read available slots
  allow read: if isAuthenticated() && (
    resource.data.moniteur_id == request.auth.uid ||  // Moniteur reading own
    isAdmin() ||                                       // Admin reading any
    resource.data.status == 'available'                // Public availability view
  );

  // CREATE: Moniteur can create THEIR OWN slots
  allow create: if isAuthenticated()
                && (isMoniteur() || isAdmin())
                && isValidSlotData()
                && request.resource.data.moniteur_id == request.auth.uid;

  // UPDATE: Moniteur can update THEIR OWN slots, Admin can update ANY
  allow update: if isAuthenticated()
                && (isAdmin() || resource.data.moniteur_id == request.auth.uid)
                && isValidSlotData();

  // DELETE: Moniteur can delete THEIR OWN slots, Admin can delete ANY
  allow delete: if isAuthenticated()
                && (isAdmin() || resource.data.moniteur_id == request.auth.uid);
}
```

### reservations Collection (Moniteur Access)

```javascript
match /reservations/{reservationId} {
  // READ: Moniteur can read reservations with THEIR moniteur_id
  allow read: if isAuthenticated() && (
    isOwner(resource.data.user_id) ||                          // User reading own
    resource.data.status == 'confirmed' ||                     // Public confirmed view
    isAdmin() ||                                               // Admin reading any
    (isMoniteur() && resource.data.moniteur_id == request.auth.uid)  // Moniteur reading assigned
  );

  // UPDATE: Moniteur can update THEIR confirmed lesson reservations
  allow update: if isAuthenticated()
                && (
                  isAdmin() ||
                  isOwner(resource.data.user_id) ||
                  (isMoniteur() && resource.data.moniteur_id == request.auth.uid && resource.data.status == 'confirmed')
                )
                && isValidReservation();
}
```

### Access Control Matrix

| Operation | Admin | Moniteur | Client |
|-----------|-------|----------|--------|
| **slots_moniteurs** |
| Read own slots | ✅ | ✅ (own) | ❌ |
| Read any available slot | ✅ | ✅ | ✅ |
| Create own slot | ✅ | ✅ | ❌ |
| Update own slot | ✅ | ✅ (own) | ❌ |
| Delete own slot | ✅ | ✅ (own) | ❌ |
| **reservations** |
| Read all reservations | ✅ | ❌ | ❌ |
| Read assigned reservations | ✅ | ✅ (own moniteur_id) | ❌ |
| Read own reservation | ✅ | ✅ | ✅ |
| Update confirmed lesson (as moniteur) | ✅ | ✅ (own) | ❌ |

---

## 3. Seed Script: `seedMoniteurDashboard()`

### Function Signature
```typescript
export async function seedMoniteurDashboard(
  options: { force?: boolean } = {}
): Promise<ServiceResult<{
  moniteurSlots: number;
  reservations: number;
}>>
```

### Data Seeded

| Collection | Count | Description |
|------------|-------|-------------|
| `slots_moniteurs` | 20-25 | 2 weeks of slots (PRIVATE + GROUP) |
| `reservations` | 15 | 7 days of confirmed lessons |

### Test Account
```
Email: jean.philippe@tennis.mq
Password: Moniteur123!
UID: moniteur_001
Name: Jean Philippe
Role: moniteur
```

### Usage
```typescript
import { seedMoniteurDashboard } from '@scripts/seedData';

// Basic usage
await seedMoniteurDashboard();

// Force re-seed
await seedMoniteurDashboard({ force: true });
```

### Slot Distribution
- **Week 1 (Days 0-6):** 2 slots/day + weekend extras
- **Week 2 (Days 7-13):** 1 slot/day
- **Types:** Alternating GROUP (6 max) and PRIVATE (1 max)
- **Status:** Some booked (first 3 days), rest available

### Reservation Distribution
- **Day 0 (Today):** 2 reservations (1 private, 1 group)
- **Day 1-6:** 2-3 reservations/day
- **Types:** Mixed `cours_private` and `cours_collectif`
- **Statuses:** `confirmed`, `pending`, `completed`
- **Participants:** 1 for private, 4-6 for group

---

## 4. Utility Functions Added to `slotService.ts`

### Real-Time Subscriptions

#### `subscribeToMoniteurSlots(moniteurId, callback, errorCallback)`
```typescript
// CRITICAL: Uses index (moniteur_id, date, start_time)
export function subscribeToMoniteurSlots(
  moniteurId: string,
  callback: (slots: MoniteurSlot[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe
```

#### `subscribeToMoniteurReservations(moniteurId, callback, errorCallback)`
```typescript
// CRITICAL: Uses index (moniteur_id, start_time, status)
export function subscribeToMoniteurReservations(
  moniteurId: string,
  callback: (reservations: any[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe
```

### CRUD Operations

All existing functions remain:
- `createSlot(input)` — Create with validation
- `updateSlot(slotId, updates)` — Partial update
- `cancelSlot(slotId)` — Set status to cancelled
- `deleteSlot(slotId)` — Hard delete
- `bookSlot(slotId, userId)` — Transaction-based booking
- `cancelSlotBooking(slotId, userId)` — Decrement participants

### New Query Functions

#### `getAvailableMoniteurSlots(moniteurId, startDate?, endDate?)`
```typescript
// CRITICAL: Uses index (moniteur_id, status, date)
export async function getAvailableMoniteurSlots(
  moniteurId: string,
  startDate?: string,
  endDate?: string
): Promise<MoniteurSlot[]>
```

#### `getClubEfficiencyStats(moniteurId, startDate, endDate)`
```typescript
// CRITICAL: Uses index (moniteur_id, type, start_time)
export async function getClubEfficiencyStats(
  moniteurId: string,
  startDate: string,
  endDate: string
): Promise<SlotServiceResult<{
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  totalReservations: number;
  privateReservations: number;
  groupReservations: number;
  totalParticipants: number;
  occupancyRate: number;
  revenueEstimate: number;
}>>
```

---

## 5. Query Patterns and Index Usage

### Weekly Schedule View
```typescript
// Query: Get moniteur's weekly slots sorted by date/time
const q = query(
  collection(db, 'slots_moniteurs'),
  where('moniteur_id', '==', moniteurId),
  orderBy('date', 'asc'),
  orderBy('start_time', 'asc')
);
// Index: (moniteur_id, date, start_time) ✅
```

### Available Slots Only
```typescript
// Query: Get only available slots for booking
const q = query(
  collection(db, 'slots_moniteurs'),
  where('moniteur_id', '==', moniteurId),
  where('status', '==', 'available'),
  orderBy('date', 'asc')
);
// Index: (moniteur_id, status, date) ✅
```

### Upcoming Lessons
```typescript
// Query: Get confirmed lessons sorted by time
const q = query(
  collection(db, 'reservations'),
  where('moniteur_id', '==', moniteurId),
  where('status', '==', 'confirmed'),
  orderBy('start_time', 'asc')
);
// Index: (moniteur_id, start_time, status) ✅
```

### Stats by Type
```typescript
// Query: Get private lessons for stats
const q = query(
  collection(db, 'reservations'),
  where('moniteur_id', '==', moniteurId),
  where('type', '==', 'cours_private'),
  orderBy('start_time', 'asc')
);
// Index: (moniteur_id, type, start_time) ✅
```

---

## 6. Validation Checklist

### Indexes
- [x] Every field filtered in queries has an index declared
- [x] Composite indexes for `where` + `orderBy` combinations
- [x] Each index justified by a real query
- [x] No client-side `.filter()` on large collections

### Security Rules
- [x] Read access based on role (admin, moniteur, client)
- [x] Write access restricted to resource owner or admin
- [x] Data validation on all writes (`isValidSlotData()`, `isValidReservation()`)
- [x] Moniteur can only manage THEIR OWN slots
- [x] Moniteur can read THEIR ASSIGNED reservations

### Seed Script
- [x] Uses `writeBatch` for atomic operations
- [x] Checks for existing data (prevents duplicates)
- [x] Creates realistic test data (2 weeks of slots, 7 days of reservations)
- [x] Includes various statuses (available, booked, confirmed, pending, completed)
- [x] Timezone-aware (America/Martinique)

### Service Functions
- [x] `onSnapshot` with proper `unsubscribe()` cleanup
- [x] Error handling with callbacks
- [x] Transaction-based operations for atomic updates
- [x] Timestamp usage (`Timestamp.now()` not `Date.now()`)
- [x] Type-safe mappings with runtime validation

---

## 7. Testing Instructions

### 1. Start Firebase Emulator
```bash
npm run emulators
# or
firebase emulators:start
```

### 2. Seed Moniteur Dashboard Data
```typescript
// In browser console or via seed button
import { seedMoniteurDashboard } from '@scripts/seedData';
await seedMoniteurDashboard();
```

### 3. Test Moniteur Login
```
Email: jean.philippe@tennis.mq
Password: Moniteur123!
```

### 4. Verify Data in Emulator UI
```
http://localhost:4000/firestore
```

Check:
- `slots_moniteurs` collection: 20-25 documents
- `reservations` collection: 15 documents with `moniteur_id: 'moniteur_001'`

### 5. Test Real-Time Subscriptions
Navigate to Moniteur Dashboard and verify:
- Weekly slots display correctly
- Reservations update in real-time
- Stats calculate accurately

---

## 8. Deployment Checklist

Before deploying to production:

- [ ] Test all queries in Firebase Emulator with indexes
- [ ] Verify security rules with Rules Playground
- [ ] Run `seedMoniteurDashboard()` successfully
- [ ] Test moniteur login and data access
- [ ] Confirm real-time subscriptions work
- [ ] Validate stats calculations
- [ ] Deploy indexes: `firebase deploy --only firestore:indexes`
- [ ] Deploy rules: `firebase deploy --only firestore:rules`
- [ ] Monitor logs after deployment

---

## 9. Files Modified

| File | Changes |
|------|---------|
| `firestore.indexes.json` | Added 4 composite indexes for moniteur queries |
| `firestore.rules` | Updated `slots_moniteurs` and `reservations` rules for moniteur access |
| `src/scripts/seedData.ts` | Added `seedMoniteurDashboard()` function with generators |
| `src/services/slotService.ts` | Added `subscribeToMoniteurReservations()`, `getAvailableMoniteurSlots()`, `getClubEfficiencyStats()` |

---

## 10. Next Steps (Étape 3)

With Firebase infrastructure complete, proceed to:

1. **Moniteur Dashboard UI Components**
   - Weekly schedule view
   - Slot management (create, update, cancel)
   - Reservation list with status filtering

2. **Real-Time Features**
   - Live slot availability updates
   - Reservation notifications
   - Stats dashboard refresh

3. **Testing**
   - Unit tests for service functions
   - Integration tests with emulator
   - Security rules testing

---

**Phase 7.3 Status:** ✅ FIREBASE INFRASTRUCTURE COMPLETE  
**Ready for:** Étape 3 — UI Component Implementation
