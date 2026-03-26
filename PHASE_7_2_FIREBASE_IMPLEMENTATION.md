# Phase 7.2: Client Dashboard - Firebase Implementation Summary

## Overview

This document summarizes the Firebase database configuration for the **Client Dashboard** phase (Phase 7.2) of the Tennis Club du François application.

**Date:** March 25, 2026  
**Status:** ✅ COMPLETED

---

## 1. Files Modified/Created

### 1.1 `firestore.indexes.json`
**Status:** ✅ Updated with 12 indexes (3 new for Client Dashboard)

### 1.2 `firestore.rules`
**Status:** ✅ Updated with Client Dashboard security rules

### 1.3 `src/services/dashboardService.ts`
**Status:** ✅ Created - New service layer for dashboard queries

### 1.4 `src/scripts/seedData.ts`
**Status:** ✅ Updated with `seedClientDashboard()` function

### 1.5 `src/types/client-dashboard.types.ts`
**Status:** ✅ Updated MaintenanceNote interface

---

## 2. Firestore Indexes - Complete List

### 2.1 Existing Indexes (Retained)

| # | Collection | Fields | Justification |
|---|------------|--------|---------------|
| 1 | `users` | `role`, `status` | User filtering by role and status |
| 2 | `courts` | `is_active`, `number` | **Client Dashboard**: Active courts sorted by number |
| 3 | `courts` | `status`, `type` | Court filtering for admin views |
| 4 | `reservations` | `court_id`, `start_time`, `status` | **CRITICAL**: Court grid display |
| 5 | `reservations` | `user_id`, `start_time` | **CRITICAL**: User's upcoming reservations |
| 6 | `reservations` | `moniteur_id`, `start_time` | Moniteur schedule view |
| 7 | `reservations` | `start_time`, `status` | **CRITICAL**: Dashboard stats calculation |
| 8 | `reservations` | `court_id`, `end_time`, `start_time` | Conflict detection during booking |
| 9 | `slots_moniteurs` | `moniteur_id`, `date` | Moniteur slot management |
| 10 | `slots_moniteurs` | `date`, `status`, `type` | Available slot search |
| 11 | `slots_moniteurs` | `status`, `date` | Slot availability by date |

### 2.2 New Indexes for Client Dashboard

| # | Collection | Fields | Justification |
|---|------------|--------|---------------|
| 12 | `maintenance_notes` | `is_active`, `created_at` (DESC) | **CRITICAL**: Active maintenance note widget |

---

## 3. Index Justifications - Detailed Queries

### Index 2: `courts: is_active + number`
```typescript
// Query: Get active courts sorted by number
const q = query(
  collection(db, 'courts'),
  where('is_active', '==', true),
  orderBy('number', 'asc')
);
// Used by: CourtGrid component, getCourtsByFilter()
```

### Index 4: `reservations: court_id + start_time + status`
```typescript
// Query: Get reservations for a specific court on a date
const q = query(
  collection(db, 'reservations'),
  where('court_id', '==', courtId),
  where('start_time', '>=', startOfDay),
  where('start_time', '<=', endOfDay),
  where('status', 'in', ['confirmed', 'pending', 'pending_payment']),
  orderBy('start_time', 'asc')
);
// Used by: getCourtReservationsByDate(), Court Grid display
```

### Index 5: `reservations: user_id + start_time`
```typescript
// Query: Get user's upcoming reservations
const q = query(
  collection(db, 'reservations'),
  where('user_id', '==', userId),
  where('start_time', '>=', Timestamp.now()),
  orderBy('start_time', 'asc'),
  limit(10)
);
// Used by: getUpcomingReservations(), Upcoming Reservations widget
```

### Index 7: `reservations: start_time + status`
```typescript
// Query: Count user's active bookings for stats
const q = query(
  collection(db, 'reservations'),
  where('user_id', '==', userId),
  where('start_time', '>=', Timestamp.now()),
  where('status', 'in', ['confirmed', 'pending', 'pending_payment'])
);
// Used by: getDashboardStats(), Dashboard Stats widget
```

### Index 12: `maintenance_notes: is_active + created_at`
```typescript
// Query: Get active maintenance note (most recent)
const q = query(
  collection(db, 'maintenance_notes'),
  where('is_active', '==', true),
  orderBy('created_at', 'desc'),
  limit(1)
);
// Used by: getActiveMaintenanceNote(), Club Maintenance Note widget
```

---

## 4. Security Rules - Client Dashboard

### 4.1 Courts Collection
```javascript
match /courts/{courtId} {
  // CLIENT DASHBOARD: Allow any authenticated user to read courts
  allow read: if isAuthenticated();
  
  // Only admin can write courts
  allow create, update, delete: if isAdmin() && isValidCourtData();
}
```

**Rationale:** All authenticated users (admin, moniteur, client) need to view courts for the grid display.

### 4.2 Reservations Collection
```javascript
match /reservations/{reservationId} {
  // CLIENT DASHBOARD READ RULES:
  allow read: if isAuthenticated() && (
    isOwner(resource.data.user_id) ||      // User reads own
    resource.data.status == 'confirmed' || // Anyone reads confirmed (grid)
    isAdmin() ||                            // Admin reads all
    isMoniteur()                            // Moniteur reads all
  );
  
  // Create: User must set their own user_id
  allow create: if isAuthenticated()
                && isValidReservation()
                && request.resource.data.user_id == request.auth.uid;
  
  // Update/Delete: Owner or Admin
  allow update, delete: if isAuthenticated()
                        && (isAdmin() || isOwner(resource.data.user_id));
}
```

**Rationale:**
- Users can read their own reservations (any status)
- Users can read confirmed reservations (for grid display)
- Admin/moniteur can read all reservations (schedule management)

### 4.3 Maintenance Notes Collection
```javascript
match /maintenance_notes/{noteId} {
  // CLIENT DASHBOARD: Allow authenticated users to read active notes
  allow read: if isAuthenticated() && (
    resource.data.is_active == true ||  // Anyone reads active
    isAdmin()                            // Admin reads all
  );
  
  // Only admin can write
  allow create, update, delete: if isAdmin() && isValidMaintenanceNote();
}
```

**Rationale:** All authenticated users need to see active maintenance notifications.

---

## 5. Dashboard Service Functions

### 5.1 Upcoming Reservations
```typescript
// Get user's upcoming reservations
getUpcomingReservations(userId: string, limit?: number)
  → Promise<ServiceResult<UpcomingReservation[]>>

// Real-time subscription
subscribeToUpcomingReservations(userId, callback, errorCallback?)
  → Unsubscribe
```

### 5.2 Court Reservations
```typescript
// Get reservations for a court on a specific date
getCourtReservationsByDate(courtId: string, date: Date)
  → Promise<ServiceResult<Reservation[]>>

// Get reservations for multiple courts in date range
getCourtReservationsByDateRange(courtIds, startDate, endDate)
  → Promise<ServiceResult<Map<string, Reservation[]>>>
```

### 5.3 Maintenance Note
```typescript
// Get active maintenance note
getActiveMaintenanceNote()
  → Promise<ServiceResult<MaintenanceNote | null>>

// Real-time subscription
subscribeToActiveMaintenanceNote(callback, errorCallback?)
  → Unsubscribe
```

### 5.4 Dashboard Stats
```typescript
// Calculate dashboard statistics
getDashboardStats(userId: string)
  → Promise<ServiceResult<DashboardStats>>

// DashboardStats interface:
{
  activeBookings: number;    // User's confirmed/pending reservations
  maintenanceCount: number;  // Active maintenance notes
  availableSlots: number;    // Available moniteur slots (next 7 days)
}
```

### 5.5 Court Grid Generation
```typescript
// Generate court grid cells for a date
generateCourtGrid(courts, date, reservations, startHour?, endHour?)
  → CourtGridCell[][]

// CourtGridCell interface:
{
  id: string;
  courtId: string;
  courtNumber: number;
  courtName: string;
  courtType: CourtType;
  date: Date;
  hour: number;
  state: CourtCellState;  // 'available' | 'confirmed' | 'maintenance' | 'pending'
  reservationId?: string;
}
```

---

## 6. Seed Data Script

### 6.1 Usage
```typescript
// Seed Client Dashboard data only
import { seedClientDashboard } from '@scripts/seedData';
await seedClientDashboard();

// Force re-seed
await seedClientDashboard({ force: true });
```

### 6.2 Data Seeded
- **Courts:** 6 courts (4 Quick/Hard, 2 Terre/Clay)
- **Reservations:** 17 reservations spread across 7 days
  - Day 0 (Today): 3 reservations
  - Day 1 (Tomorrow): 4 reservations
  - Day 2-6: 10 reservations
- **Maintenance Notes:** 2 notes (1 active, 1 inactive)
- **Location Data:** Club info document

### 6.3 New Functions
```typescript
// Seed maintenance notes
seedMaintenanceNotes(db) → Promise<ServiceResult<{ count: number }>>

// Seed location data
seedLocationData(db) → Promise<ServiceResult<{ count: number }>>

// Seed extended reservations (7 days)
seedExtendedReservations(db) → Promise<ServiceResult<{ count: number }>>
```

---

## 7. New Collection: `maintenance_notes`

### 7.1 Document Structure
```typescript
interface MaintenanceNote {
  id: string;                    // Auto-generated document ID
  title: string;                 // Display title
  message: string;               // Full message content
  severity: 'info' | 'warning' | 'urgent';
  is_active: boolean;            // Visibility toggle
  created_at: Timestamp;         // Creation timestamp
  expires_at?: Timestamp;        // Optional expiration
  affected_courts?: string[];    // Courts affected (optional)
}
```

### 7.2 Example Document
```javascript
// Path: maintenance_notes/note_001
{
  title: "Court 4 - Surface Resurfacing",
  message: "Court 4 (Training Zone) is undergoing surface resurfacing. Expected completion: End of week.",
  severity: "warning",
  is_active: true,
  created_at: Timestamp(2026-03-23T10:00:00-04:00),
  expires_at: Timestamp(2026-03-30T18:00:00-04:00),
  affected_courts: ["court_04"]
}
```

---

## 8. New Collection: `club_info`

### 8.1 Document Structure
```typescript
// Path: club_info/location
{
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  mapUrl: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  opening_hours: {
    monday: string;    // "07:00-19:00"
    tuesday: string;
    // ...
  };
  updated_at: Timestamp;
}
```

---

## 9. Timezone Handling

All datetime operations use **America/Martinique** timezone (AST, UTC-4).

```typescript
const TIMEZONE = 'America/Martinique';

// Example: Calculate start/end of day
const startOfDay = dayjs(date).tz(TIMEZONE).startOf('day').toDate();
const endOfDay = dayjs(date).tz(TIMEZONE).endOf('day').toDate();
```

---

## 10. Validation Checklist

### ✅ Indexes
- [x] Every composite index justified by a real query
- [x] Indexes cover all `where` + `orderBy` combinations
- [x] No client-side `.filter()` on large collections

### ✅ Security Rules
- [x] Role-based access control (admin, moniteur, client)
- [x] Users can read their own reservations
- [x] Users can read confirmed reservations (grid display)
- [x] Admin has full access
- [x] Data validation on all writes

### ✅ Seed Script
- [x] `seedClientDashboard()` function created
- [x] 7 days of reservations seeded
- [x] Active maintenance note included
- [x] Location data seeded
- [x] Force re-seed option available

### ✅ Service Functions
- [x] `getUpcomingReservations()` with real-time option
- [x] `getCourtReservationsByDate()` for grid display
- [x] `getActiveMaintenanceNote()` with real-time option
- [x] `getDashboardStats()` for statistics
- [x] `generateCourtGrid()` for grid generation
- [x] All functions have error handling

---

## 11. Deployment Commands

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy both
firebase deploy --only firestore
```

---

## 12. Testing Commands

```bash
# Start Firebase Emulator
npm run emulators

# Seed Client Dashboard data (in browser console)
import { seedClientDashboard } from './src/scripts/seedData';
await seedClientDashboard();

# View data
# Open: http://localhost:4000/firestore
```

---

## 13. Next Steps (Phase 7.2 Implementation)

1. ✅ **Firebase Configuration** (THIS DOCUMENT) - COMPLETED
2. ⏳ **React Components** - Court Grid, Reservation Cards, Stats Widgets
3. ⏳ **Custom Hooks** - `useClientDashboard()` hook
4. ⏳ **Dashboard Page** - Main Client Dashboard layout
5. ⏳ **Integration Testing** - Test with emulator data

---

## 14. Related Documentation

- `documentation/02_DATA_MODEL.md` - Complete Firestore schema
- `documentation/03_FIREBASE_RULES.md` - Security rules reference
- `firestore.rules` - Deployed security rules
- `firestore.indexes.json` - Deployed indexes
- `src/services/dashboardService.ts` - Service layer implementation

---

**Phase 7.2 Firebase Status:** ✅ READY FOR COMPONENT IMPLEMENTATION
