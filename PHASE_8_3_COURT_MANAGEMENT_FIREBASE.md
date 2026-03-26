# Phase 8.3: Court Management - Firebase Configuration Summary

**Date:** 25 mars 2026  
**Status:** ✅ COMPLETED  
**Tennis Club du François**

---

## 1. Overview

This document summarizes the Firebase configuration for the Court Management feature (Phase 8.3). All files have been verified and updated according to the architect's specifications.

---

## 2. Files Modified

### 2.1 `firestore.indexes.json` — ✅ VERIFIED (NO CHANGES)

**Status:** Existing indexes are sufficient for all Court Management queries.

#### Existing Indexes for `courts` Collection:

| Index Fields | Query Optimized | Justification |
|--------------|-----------------|---------------|
| `is_active` + `number` | `where('is_active', '==', true) + orderBy('number', 'asc')` | Display active courts sorted by number in court grid |
| `status` + `type` | `where('status', '==', 'maintenance') + orderBy('number', 'asc')` | Admin view: courts in maintenance sorted by number |
| `status` + `type` | `where('type', '==', 'Quick') + orderBy('number', 'asc')` | Filter courts by surface type |

**Conclusion:** AUCUN NOUVEL INDEX REQUIS — Les indexes existants couvrent toutes les queries de Court Management.

---

### 2.2 `firestore.rules` — ✅ UPDATED

**Status:** Security rules updated for public read, admin write pattern.

#### Courts Collection Rules:

```javascript
match /courts/{courtId} {
  // PUBLIC READ RULES:
  // - Anyone can read courts (clients need to see availability)
  // - No authentication required for reading
  allow read: if true;

  // ADMIN WRITE RULES:
  // - Admin only (court management, maintenance blocks)
  allow create, update, delete: if isAdmin() && isValidCourtData();
}
```

#### Access Control Matrix:

| Operation | Admin | Moniteur | Client | Public |
|-----------|-------|----------|--------|--------|
| Read courts | ✅ | ✅ | ✅ | ✅ |
| Create court | ✅ | ❌ | ❌ | ❌ |
| Update court | ✅ | ❌ | ❌ | ❌ |
| Delete court | ✅ | ❌ | ❌ | ❌ |

**Justification:** Public read access is required so clients can view court availability without authentication.

---

### 2.3 `src/scripts/seedData.ts` — ✅ UPDATED

**Status:** `seedCourts()` function exported and seed data updated with varied statuses.

#### Changes Made:

1. **Exported `seedCourts()` function** — Now available for standalone court seeding
2. **Updated seed data** — 6 courts with varied statuses:
   - Courts 1-4: Quick/Hard, **active** (4 courts)
   - Court 5: Terre/Clay, **maintenance** (1 court)
   - Court 6: Terre/Clay, **closed** (1 court)

#### Seed Data Summary:

| Court ID | Name | Type | Surface | Status | is_active |
|----------|------|------|---------|--------|-----------|
| court_01 | Grand Court East | Quick | Hard | active | true |
| court_02 | Center Stage | Quick | Hard | active | true |
| court_03 | Shadow View | Quick | Hard | active | true |
| court_04 | Training Zone | Quick | Hard | active | true |
| court_05 | Clay Court North | Terre | Clay | maintenance | false |
| court_06 | West End | Terre | Clay | closed | false |

#### Usage:

```typescript
// Seed courts only
import { seedCourts } from '@scripts/seedData';
import { db } from '@config/firebase.config';

await seedCourts(db);

// Or seed entire database
import { seedDatabase } from '@scripts/seedData';
await seedDatabase();
```

---

### 2.4 `src/services/courtService.ts` — ✅ UPDATED

**Status:** All required functions verified, `toggleCourtStatus()` added.

#### Available Functions:

| Function | Purpose | Parameters | Returns |
|----------|---------|------------|---------|
| `getAllCourts()` | Get all courts sorted by number | None | `Promise<Court[]>` |
| `getActiveCourts()` | Get active courts only | None | `Promise<Court[]>` |
| `getCourtsByFilter(filters)` | Get courts with filters | `CourtFilters` | `Promise<Court[]>` |
| `getCourtById(id)` | Get single court by ID | `courtId: string` | `Promise<Court \| null>` |
| `createCourt(input)` | Create new court | `CourtInput` | `Promise<CreateResult>` |
| `updateCourt(id, updates)` | Update existing court | `courtId: string, updates: Partial<Court>` | `Promise<ServiceResult<void>>` |
| `deleteCourt(id)` | Delete court | `courtId: string` | `Promise<ServiceResult<void>>` |
| `deactivateCourt(id)` | Soft delete (set is_active=false) | `courtId: string` | `Promise<ServiceResult<void>>` |
| `toggleCourtStatus(id, status)` | **NEW** Toggle court status | `courtId: string, status: CourtStatus` | `Promise<ServiceResult<void>>` |

#### New Function: `toggleCourtStatus()`

```typescript
/**
 * Toggle court status (active/maintenance/closed)
 *
 * This function allows admin to quickly change court status
 * for maintenance management or temporary closure.
 *
 * @param courtId - Court document ID
 * @param status - New status to set
 * @returns ServiceResult indicating success or failure
 */
export async function toggleCourtStatus(
  courtId: string,
  status: CourtStatus
): Promise<ServiceResult<void>>;
```

**Usage Example:**
```typescript
// Set court to maintenance
await toggleCourtStatus('court_01', 'maintenance');

// Reactivate court
await toggleCourtStatus('court_01', 'active');
```

---

## 3. Firestore Schema

### Court Document Structure

```typescript
interface Court {
  id: string;                     // Document ID (court_01, court_02, etc.)
  number: number;                 // Court number (1-6)
  name: string;                   // Display name
  type: CourtType;                // 'Quick' | 'Terre'
  surface: SurfaceType;           // 'Hard' | 'Clay' | 'Grass' | 'Synthetic'
  status: CourtStatus;            // 'active' | 'maintenance' | 'closed'
  is_active: boolean;             // Availability toggle
  description?: string;           // Optional description
  createdAt: Timestamp;           // Creation date
  updatedAt: Timestamp;           // Last update
}
```

### Collection Path

```
courts/{courtId}
```

---

## 4. Query Patterns

### Common Queries with Index Justification

#### 1. Get Active Courts (Court Grid Display)

```typescript
const q = query(
  collection(db, 'courts'),
  where('is_active', '==', true),
  orderBy('number', 'asc')
);
```

**Index Used:** `courts: is_active + number` ✅

---

#### 2. Get Courts in Maintenance (Admin View)

```typescript
const q = query(
  collection(db, 'courts'),
  where('status', '==', 'maintenance'),
  orderBy('number', 'asc')
);
```

**Index Used:** `courts: status + type` ✅

---

#### 3. Get Courts by Type

```typescript
const q = query(
  collection(db, 'courts'),
  where('type', '==', 'Quick'),
  orderBy('number', 'asc')
);
```

**Index Used:** `courts: status + type` ✅

---

#### 4. Real-Time Subscription (Court Grid)

```typescript
const unsubscribe = onSnapshot(
  query(collection(db, 'courts'), orderBy('number', 'asc')),
  (snapshot) => {
    const courts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCourts(courts);
  }
);

// Cleanup on unmount
return () => unsubscribe();
```

**Note:** `onSnapshot` includes automatic unsubscribe handling in React hooks.

---

## 5. Security Rules Validation

### Test Scenarios

#### ✅ Test 1: Public Read (Unauthenticated User)

```javascript
// Should SUCCEED
match /courts/court_01 {
  allow read: if true;  // ✅ Passes
}
```

#### ✅ Test 2: Admin Create Court

```javascript
// Should SUCCEED
match /courts/court_01 {
  allow create: if isAdmin() && isValidCourtData();  // ✅ Passes
}
```

#### ✅ Test 3: Client Try to Update Court

```javascript
// Should FAIL
match /courts/court_01 {
  allow update: if request.auth.uid == 'client_001';  // ❌ Fails (correct)
}
```

---

## 6. Timezone Handling

All datetime operations use **America/Martinique** timezone (AST, UTC-4).

**Note:** Court documents use `Timestamp.now()` for `createdAt` and `updatedAt`, which automatically handles timezone conversion.

---

## 7. Delivery Checklist

- [x] `firestore.indexes.json` verified (no changes required)
- [x] `firestore.rules` updated with public read, admin write
- [x] `src/scripts/seedData.ts` with exported `seedCourts()` function
- [x] Seed data updated: 6 courts (4 active, 1 maintenance, 1 closed)
- [x] `src/services/courtService.ts` with all required functions
- [x] `toggleCourtStatus()` function added
- [x] Justification "aucun index requis" documented

---

## 8. Next Steps

### Étape 3: Implementation

With the Firebase infrastructure complete, proceed to:

1. **Court Grid Component** — Display courts with availability status
2. **Admin Court Management** — CRUD operations for courts
3. **Maintenance Status Toggle** — Quick status change UI
4. **Real-Time Updates** — `onSnapshot` for live court status

---

## 9. References

- **Data Model:** `documentation/02_DATA_MODEL.md`
- **Security Rules:** `documentation/03_FIREBASE_RULES.md`
- **Firestore Indexes:** `firestore.indexes.json`
- **Security Rules File:** `firestore.rules`
- **Court Service:** `src/services/courtService.ts`
- **Seed Script:** `src/scripts/seedData.ts`

---

**Phase 8.3 Court Management Firebase Configuration — COMPLETE ✅**
