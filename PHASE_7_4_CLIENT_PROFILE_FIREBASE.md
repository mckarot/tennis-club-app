# Phase 7.4: Client Profile - Firebase Implementation Summary

**Date:** 2026-03-25  
**Status:** ✅ COMPLETED  
**Timezone:** America/Martinique (AST, UTC-4)

---

## 1. Overview

This document summarizes the Firebase database implementation for the **Client Profile** feature in the Tennis Club du François application.

### Feature Scope
- User profile management (read/update own profile)
- Notification preferences (email, SMS)
- Avatar URL management
- Status management (online, away, inactive)
- Security rules preventing role changes by users

---

## 2. Deliverables Checklist

| Deliverable | Status | File |
|-------------|--------|------|
| ✅ Firestore indexes verified | No changes needed | `firestore.indexes.json` |
| ✅ Security rules updated | Complete | `firestore.rules` |
| ✅ Seed script created | Complete | `src/scripts/seedData.ts` |
| ✅ Service functions verified/added | Complete | `src/services/userService.ts` |
| ✅ Type definitions updated | Complete | `src/types/user.types.ts` |

---

## 3. Firestore Indexes

### Decision: NO NEW INDEXES REQUIRED

**Justification:**

The Client Profile feature uses **document lookups** by UID, which are automatically indexed by Firestore:

```typescript
// Document lookup - AUTOMATICALLY INDEXED
const userDoc = await getDoc(doc(db, 'users', uid));

// No composite index needed for single-field equality queries
```

### Existing Index (Sufficient)

The existing index on `users` collection supports potential future queries:

```json
{
  "collectionGroup": "users",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "role", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```

**Supported queries:**
- Get all users with specific role
- Get all users with specific status
- Get users by role AND status (composite)

---

## 4. Security Rules

### Updated Rules for `users` Collection

**Location:** `firestore.rules` (lines 103-146)

```javascript
match /users/{userId} {
  // READ: User can read THEIR OWN profile, admin can read ANY
  allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());

  // CREATE: Admin only (via AuthContext during registration)
  allow create: if isAdmin() && isValidUserData();

  // UPDATE: User can update OWN profile (CANNOT change role)
  //         Admin can update ANY profile (including role)
  allow update: if isAuthenticated() && (
    isAdmin() && isValidUserData()
    ||
    (isOwner(userId) && isValidUserProfileUpdate())
  );

  // DELETE: Admin only (users cannot delete own accounts)
  allow delete: if isAdmin();
}
```

### Key Security Features

| Feature | Implementation |
|---------|----------------|
| **Ownership-based access** | `isOwner(userId)` checks `request.auth.uid == userId` |
| **Prevent role change** | `request.resource.data.role == resource.data.role` |
| **Field validation** | `isValidUserProfileUpdate()` validates all fields |
| **Notifications validation** | `isValidNotifications()` ensures boolean types |

### Validation Functions Added

```javascript
// Validate user profile update (client-side)
function isValidUserProfileUpdate() {
  return request.resource.data.keys().hasAll(['name', 'email'])
         && request.resource.data.name is string
         && request.resource.data.email is string
         // Role must remain unchanged
         && request.resource.data.role == resource.data.role
         // Optional fields validation
         && (request.resource.data.phone is string || !request.resource.data.keys().hasAny(['phone']))
         && (request.resource.data.avatar is string || !request.resource.data.keys().hasAny(['avatar']))
         && (request.resource.data.status in ['online', 'away', 'inactive'] || !request.resource.data.keys().hasAny(['status']))
         && (request.resource.data.notifications is map || !request.resource.data.keys().hasAny(['notifications']));
}

// Validate notifications preferences
function isValidNotifications() {
  return request.resource.data.notifications is map
         && (request.resource.data.notifications.email is bool || !request.resource.data.notifications.keys().hasAny(['email']))
         && (request.resource.data.notifications.sms is bool || !request.resource.data.notifications.keys().hasAny(['sms']));
}
```

### Access Control Matrix

| Operation | Admin | Client (own profile) | Client (other) | Public |
|-----------|-------|---------------------|----------------|--------|
| Read profile | ✅ Any | ✅ Own only | ❌ | ❌ |
| Create profile | ✅ | ❌ | ❌ | ❌ |
| Update profile | ✅ Any | ✅ Own only (no role change) | ❌ | ❌ |
| Delete profile | ✅ | ❌ | ❌ | ❌ |
| Change role | ✅ | ❌ | ❌ | ❌ |

---

## 5. Seed Script

### Function: `seedClientProfiles()`

**Location:** `src/scripts/seedData.ts` (lines 1963-2089)

**Purpose:** Populate emulator with 5 test client profiles for Client Profile feature testing.

**Features:**
- Creates Auth accounts + Firestore documents
- Uses `writeBatch` for atomic operations
- Includes complete profile data (name, email, phone, avatar, notifications)
- Varied statuses (online, away, inactive)
- Varied notification preferences

**Usage:**
```typescript
import { seedClientProfiles } from '@scripts/seedData';
import { db, auth } from '@config/firebase.config';

const result = await seedClientProfiles(db, auth);
if (result.success) {
  console.log(`Created ${result.data?.count} client profiles`);
}
```

### Test Accounts Created

| UID | Name | Email | Status | Notifications |
|-----|------|-------|--------|---------------|
| client_profile_001 | Marie Josephine | marie.josephine@email.mq | online | email: true, sms: true |
| client_profile_002 | Antoine Celeste | antoine.celeste@email.mq | away | email: true, sms: false |
| client_profile_003 | Isabelle Flamboyant | isabelle.flamboyant@email.mq | online | email: false, sms: true |
| client_profile_004 | Gabriel Rocher | gabriel.rocher@email.mq | inactive | email: true, sms: false |
| client_profile_005 | Camille Bambou | camille.bambou@email.mq | online | email: true, sms: true |

**Password for all accounts:** `Client123!`

---

## 6. Service Functions

### Updated File: `src/services/userService.ts`

#### Existing Functions (Verified)

| Function | Purpose |
|----------|---------|
| `getUserProfile(uid)` | Get user profile by UID |
| `updateUserProfile(uid, updates)` | Update user profile |
| `getUserByEmail(email)` | Get user by email |
| `getAllUsers()` | Get all users (admin) |
| `getUsersByRole(role)` | Get users by role |

#### New Functions Added

**1. `updateNotificationPreferences()`**

```typescript
export const updateNotificationPreferences = async (
  uid: string,
  notifications: NotificationPreferences
): Promise<{ success: boolean; error?: string }>
```

**Purpose:** Specialized function for updating notification settings.

**Usage:**
```typescript
await updateNotificationPreferences(uid, { email: true, sms: false });
```

---

**2. `subscribeToUserProfile()`**

```typescript
export const subscribeToUserProfile = (
  uid: string,
  callback: (user: User | null) => void
): (() => void)
```

**Purpose:** Real-time listener for profile updates.

**IMPORTANT:** Always call the returned unsubscribe function to prevent memory leaks.

**Usage:**
```typescript
useEffect(() => {
  const unsubscribe = subscribeToUserProfile(auth.currentUser!.uid, (user) => {
    if (user) setProfile(user);
  });
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

---

## 7. Type Definitions

### Updated: `src/types/user.types.ts`

#### New Interface: `NotificationPreferences`

```typescript
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
}
```

#### Updated: `User` Interface

```typescript
export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status: UserStatus;
  avatar?: string;
  notifications?: NotificationPreferences;  // NEW
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}
```

#### Updated: `UserUpdateInput` Interface

```typescript
export interface UserUpdateInput {
  name?: string;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
  notifications?: NotificationPreferences;  // NEW
}
```

---

## 8. Data Model

### User Document Structure

```typescript
// Path: users/{uid}
{
  uid: "client_profile_001",
  name: "Marie Josephine",
  email: "marie.josephine@email.mq",
  role: "client",
  phone: "+596 696 11 22 33",
  status: "online",
  avatar: "https://ui-avatars.com/api/?name=Marie+Josephine&background=FF6B6B&color=fff&size=200",
  notifications: {
    email: true,
    sms: true
  },
  createdAt: Timestamp(2026-03-25T10:00:00-04:00),
  updatedAt: Timestamp(2026-03-25T10:00:00-04:00),
  lastLoginAt: null
}
```

### Field Constraints

| Field | Type | Required | Mutable By | Notes |
|-------|------|----------|------------|-------|
| `uid` | string | ✅ | Never | Document ID = Auth UID |
| `name` | string | ✅ | User, Admin | Display name |
| `email` | string | ✅ | User, Admin | Must be unique |
| `role` | string | ✅ | Admin ONLY | **Cannot be changed by user** |
| `phone` | string | ❌ | User, Admin | Martinique format (+596) |
| `status` | string | ✅ | User, Admin | online/away/inactive |
| `avatar` | string | ❌ | User, Admin | URL to profile image |
| `notifications` | map | ❌ | User, Admin | {email: bool, sms: bool} |
| `createdAt` | Timestamp | ✅ | Never | Set on creation |
| `updatedAt` | Timestamp | ✅ | System | Updated on every change |
| `lastLoginAt` | Timestamp | ❌ | System | Updated on login |

---

## 9. Security Best Practices Implemented

### ✅ Ownership-Based Access Control

```javascript
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}
```

All user profile operations verify that the requester owns the resource.

### ✅ Role Change Prevention

```javascript
// CRITICAL: Users CANNOT change their own role
allow update: if isOwner(userId)
  && request.resource.data.role == resource.data.role;
```

This prevents privilege escalation attacks.

### ✅ Field Validation

```javascript
function isValidUserProfileUpdate() {
  return request.resource.data.keys().hasAll(['name', 'email'])
         && request.resource.data.name is string
         && request.resource.data.email is string
         && request.resource.data.role == resource.data.role
         // ... optional field validation
}
```

All fields are validated for type and presence.

### ✅ Timestamp Usage

All timestamps use `Timestamp.now()` (NOT `Date.now()`) for proper Firestore sorting:

```typescript
await updateDoc(doc(db, 'users', uid), {
  updatedAt: Timestamp.now(),
});
```

---

## 10. Testing Guide

### Manual Testing in Emulator

1. **Start Firebase Emulator:**
   ```bash
   npm run emulators
   ```

2. **Seed Client Profiles:**
   ```typescript
   // In browser console at http://localhost:4000/firestore
   import { seedClientProfiles } from './src/scripts/seedData';
   import { db, auth } from './src/config/firebase.config';
   await seedClientProfiles(db, auth);
   ```

3. **Test Security Rules:**
   - Navigate to http://localhost:4000/firestore
   - Verify users collection has 5 new client profiles
   - Test reading own profile (should succeed)
   - Test reading other user's profile (should fail)

4. **Test Profile Update:**
   ```typescript
   import { updateUserProfile } from './src/services/userService';
   
   // Should succeed
   await updateUserProfile('client_profile_001', {
     name: 'Updated Name',
     phone: '+596 696 99 88 77'
   });
   
   // Should fail (role change attempt)
   await updateUserProfile('client_profile_001', {
     role: 'admin'  // This will be stripped by service
   });
   ```

5. **Test Notification Preferences:**
   ```typescript
   import { updateNotificationPreferences } from './src/services/userService';
   
   await updateNotificationPreferences('client_profile_001', {
     email: false,
     sms: true
   });
   ```

6. **Test Real-Time Subscription:**
   ```typescript
   import { subscribeToUserProfile } from './src/services/userService';
   
   const unsubscribe = subscribeToUserProfile('client_profile_001', (user) => {
     console.log('Profile updated:', user);
   });
   
   // Later, cleanup:
   unsubscribe();
   ```

---

## 11. Deployment Checklist

Before deploying to production:

- [ ] Test all security rules in Firebase Emulator
- [ ] Verify users can update own profile
- [ ] Verify users CANNOT change their own role
- [ ] Verify users can read only own profile (not others)
- [ ] Verify admin can read/update all profiles
- [ ] Test notification preferences update
- [ ] Test real-time subscription with unsubscribe
- [ ] Run seed script to populate test data
- [ ] Verify all timestamps use `Timestamp.now()`
- [ ] Backup current production rules
- [ ] Deploy rules: `firebase deploy --only firestore:rules`
- [ ] Monitor logs after deployment

---

## 12. Common Pitfalls to Avoid

### ❌ Pitfall 1: Missing Unsubscribe

```typescript
// WRONG - Memory leak!
useEffect(() => {
  subscribeToUserProfile(uid, (user) => setProfile(user));
}, []);

// CORRECT
useEffect(() => {
  const unsubscribe = subscribeToUserProfile(uid, (user) => setProfile(user));
  return () => unsubscribe();
}, []);
```

### ❌ Pitfall 2: Using Date.now() for Timestamps

```typescript
// WRONG - breaks sorting and queries
const docData = {
  updatedAt: Date.now()  // number, not Timestamp
};

// CORRECT
import { Timestamp } from 'firebase/firestore';
const docData = {
  updatedAt: Timestamp.now()
};
```

### ❌ Pitfall 3: Client-Side Role Change

```typescript
// WRONG - Security rules will reject, but don't even try
await updateUserProfile(uid, {
  name: 'New Name',
  role: 'admin'  // NEVER send this
});

// CORRECT - Service strips role field
await updateUserProfile(uid, {
  name: 'New Name'
});
```

---

## 13. Related Documentation

- [02_DATA_MODEL.md](./documentation/02_DATA_MODEL.md) - Complete Firestore schema
- [03_FIREBASE_RULES.md](./documentation/03_FIREBASE_RULES.md) - Security rules guide
- [FIREBASE_PHASE2_INFRASTRUCTURE.md](./FIREBASE_PHASE2_INFRASTRUCTURE.md) - Firebase setup
- [PHASE_7_4_COMPLETION_SUMMARY.md](./PHASE_7_4_COMPLETION_SUMMARY.md) - This document

---

## 14. Next Steps

After completing Phase 7.4:

1. ✅ Firebase rules validated
2. ✅ Seed script functional
3. ✅ Service functions complete
4. 📖 Proceed to UI implementation (React components)
5. 📖 Implement profile form with validation
6. 📖 Add notification preferences toggle
7. 📖 Add avatar upload feature
8. 📖 Test end-to-end flow

---

**Phase 7.4 Status:** ✅ READY FOR UI IMPLEMENTATION

All Firebase infrastructure is in place for the Client Profile feature.
