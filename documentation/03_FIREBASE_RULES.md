# 03. Firebase Security Rules

## Firestore Security Rules for Tennis Club du François

This document defines the complete security rules for protecting Firestore data based on user roles.

---

## 1. Security Model Overview

### User Roles
| Role | Description | Access Level |
|------|-------------|--------------|
| `admin` | Club administrator | Full access to all collections |
| `moniteur` | Tennis instructor | Manage own slots, view all reservations |
| `client` | Club member | Create/view own reservations, view courts |

### Security Principles
1. **Authentication Required**: All write operations require authentication
2. **Role-Based Access**: Read/write permissions based on user role
3. **Data Ownership**: Users can only modify their own data (except admins)
4. **Validation**: All writes must include valid data formats

---

## 2. Complete Security Rules

### `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Get user's role from users collection
    function getUserRole() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return userDoc.role;
    }
    
    // Check if user has specific role
    function hasRole(role) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    // Check if user is admin
    function isAdmin() {
      return hasRole('admin');
    }
    
    // Check if user is moniteur
    function isMoniteur() {
      return hasRole('moniteur');
    }
    
    // Check if user is client
    function isClient() {
      return hasRole('client');
    }
    
    // Check if user owns the resource
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Validate reservation data
    function isValidReservation() {
      return request.resource.data.keys().hasAll(['court_id', 'user_id', 'start_time', 'end_time', 'type', 'status'])
             && request.resource.data.court_id is string
             && request.resource.data.user_id is string
             && request.resource.data.start_time is timestamp
             && request.resource.data.end_time is timestamp
             && request.resource.data.end_time > request.resource.data.start_time
             && request.resource.data.type in ['location_libre', 'cours_collectif', 'cours_private', 
                                                'individual', 'doubles', 'training', 'tournament', 'maintenance']
             && request.resource.data.status in ['confirmed', 'pending', 'pending_payment', 'cancelled', 'completed'];
    }
    
    // Validate user data
    function isValidUserData() {
      return request.resource.data.keys().hasAll(['name', 'email', 'role'])
             && request.resource.data.name is string
             && request.resource.data.email is string
             && request.resource.data.role in ['admin', 'moniteur', 'client'];
    }
    
    // Validate court data
    function isValidCourtData() {
      return request.resource.data.keys().hasAll(['number', 'name', 'type', 'status', 'is_active'])
             && request.resource.data.number is number
             && request.resource.data.name is string
             && request.resource.data.type in ['Quick', 'Terre']
             && request.resource.data.status in ['active', 'maintenance', 'closed']
             && request.resource.data.is_active is bool;
    }
    
    // Validate moniteur slot data
    function isValidSlotData() {
      return request.resource.data.keys().hasAll(['moniteur_id', 'date', 'start_time', 'end_time', 'type', 'status'])
             && request.resource.data.moniteur_id is string
             && request.resource.data.date is string
             && request.resource.data.start_time is string
             && request.resource.data.end_time is string
             && request.resource.data.type in ['PRIVATE', 'GROUP']
             && request.resource.data.status in ['available', 'booked', 'cancelled'];
    }
    
    // ==========================================
    // USERS COLLECTION
    // ==========================================
    
    match /users/{userId} {
      // Allow reading own profile or if admin
      allow read: if isAuthenticated() && (isOwner(userId) || isAdmin());
      
      // Allow creation only by admin
      allow create: if isAdmin() && isValidUserData();
      
      // Allow update only by admin (users can't change their own role)
      allow update: if isAdmin() && isValidUserData();
      
      // Allow delete only by admin
      allow delete: if isAdmin();
    }
    
    // ==========================================
    // COURTS COLLECTION
    // ==========================================
    
    match /courts/{courtId} {
      // Anyone can read courts (public availability)
      allow read: if true;
      
      // Only admin can write courts
      allow create, update, delete: if isAdmin() && isValidCourtData();
    }
    
    // ==========================================
    // RESERVATIONS COLLECTION
    // ==========================================
    
    match /reservations/{reservationId} {
      // Allow authenticated users to read all reservations (view schedule)
      allow read: if isAuthenticated();
      
      // Allow any authenticated user to create reservations
      allow create: if isAuthenticated() 
                    && isValidReservation()
                    && request.resource.data.user_id == request.auth.uid;
      
      // Allow update if:
      // - User is admin, OR
      // - User owns the reservation
      allow update: if isAuthenticated() 
                    && (isAdmin() || resource.data.user_id == request.auth.uid)
                    && isValidReservation();
      
      // Allow delete if:
      // - User is admin, OR
      // - User owns the reservation
      allow delete: if isAuthenticated() 
                    && (isAdmin() || resource.data.user_id == request.auth.uid);
    }
    
    // ==========================================
    // SLOTS_MONITEURS COLLECTION
    // ==========================================
    
    match /slots_moniteurs/{slotId} {
      // Allow authenticated users to read all slots
      allow read: if isAuthenticated();
      
      // Allow moniteurs to create their own slots
      allow create: if isAuthenticated() 
                    && (isMoniteur() || isAdmin())
                    && isValidSlotData()
                    && request.resource.data.moniteur_id == request.auth.uid;
      
      // Allow update if:
      // - User is admin, OR
      // - User owns the slot (is the moniteur)
      allow update: if isAuthenticated() 
                    && (isAdmin() || resource.data.moniteur_id == request.auth.uid)
                    && isValidSlotData();
      
      // Allow delete if:
      // - User is admin, OR
      // - User owns the slot
      allow delete: if isAuthenticated() 
                    && (isAdmin() || resource.data.moniteur_id == request.auth.uid);
    }
    
    // ==========================================
    // ADDITIONAL COLLECTIONS (Future)
    // ==========================================
    
    // Example: Payments collection
    match /payments/{paymentId} {
      allow read: if isAuthenticated() 
                  && (isAdmin() || resource.data.user_id == request.auth.uid);
      allow create: if isAuthenticated() && isValidPaymentData();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Example: Reviews collection
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isAuthenticated() && isValidReviewData();
      allow update, delete: if isAdmin() || (isAuthenticated() && resource.data.author_id == request.auth.uid);
    }
  }
}
```

---

## 3. Access Control Matrix

### Users Collection

| Operation | Admin | Moniteur | Client | Public |
|-----------|-------|----------|--------|--------|
| Read own profile | ✅ | ✅ | ✅ | ❌ |
| Read other profiles | ✅ | ❌ | ❌ | ❌ |
| Create user | ✅ | ❌ | ❌ | ❌ |
| Update any user | ✅ | ❌ | ❌ | ❌ |
| Delete user | ✅ | ❌ | ❌ | ❌ |

### Courts Collection

| Operation | Admin | Moniteur | Client | Public |
|-----------|-------|----------|--------|--------|
| Read courts | ✅ | ✅ | ✅ | ✅ |
| Create court | ✅ | ❌ | ❌ | ❌ |
| Update court | ✅ | ❌ | ❌ | ❌ |
| Delete court | ✅ | ❌ | ❌ | ❌ |

### Reservations Collection

| Operation | Admin | Moniteur | Client | Public |
|-----------|-------|----------|--------|--------|
| Read all reservations | ✅ | ✅ | ✅ | ❌ |
| Create reservation | ✅ | ✅ | ✅ | ❌ |
| Update own reservation | ✅ | ✅ | ✅ | ❌ |
| Update other reservation | ✅ | ❌ | ❌ | ❌ |
| Delete own reservation | ✅ | ✅ | ✅ | ❌ |
| Delete other reservation | ✅ | ❌ | ❌ | ❌ |

### Slots Moniteurs Collection

| Operation | Admin | Moniteur | Client | Public |
|-----------|-------|----------|--------|--------|
| Read all slots | ✅ | ✅ | ✅ | ❌ |
| Create own slot | ✅ | ✅ | ❌ | ❌ |
| Update own slot | ✅ | ✅ | ❌ | ❌ |
| Update other slot | ✅ | ❌ | ❌ | ❌ |
| Delete own slot | ✅ | ✅ | ❌ | ❌ |
| Delete other slot | ✅ | ❌ | ❌ | ❌ |

---

## 4. Usage Examples

### Testing Rules in Firebase Console

1. Go to Firebase Console → Firestore Database → Rules
2. Click "Simulate" to test rules
3. Use the following test scenarios:

#### Test 1: Client Creating Reservation
```javascript
// Should SUCCEED
match /reservations/test_res {
  allow create: if request.auth.uid == "client_001"
                && request.resource.data.user_id == "client_001";
}
```

#### Test 2: Client Trying to Update Another's Reservation
```javascript
// Should FAIL
match /reservations/test_res {
  allow update: if request.auth.uid == "client_002"
                && resource.data.user_id == "client_001";
}
```

#### Test 3: Admin Blocking Court
```javascript
// Should SUCCEED
match /courts/court_01 {
  allow update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## 5. Development vs Production

### Development Mode (Emulator)

For local development with the emulator, you can use relaxed rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

⚠️ **WARNING**: Never deploy relaxed rules to production!

### Production Mode

Always deploy with full security rules:

```bash
# Deploy rules to production
firebase deploy --only firestore:rules

# Verify deployed rules
firebase firestore:rules:list
```

---

## 6. Rule Validation Best Practices

### Input Validation

```javascript
// Validate required fields
function isValidReservation() {
  return request.resource.data.keys().hasAll(['court_id', 'user_id', 'start_time', 'end_time'])
         && request.resource.data.end_time > request.resource.data.start_time;
}

// Validate enum values
function isValidRole() {
  return request.resource.data.role in ['admin', 'moniteur', 'client'];
}

// Validate string format (email)
function isValidEmail() {
  return request.resource.data.email.matches('^[^@]+@[^@]+\\.[^@]+$');
}

// Validate number ranges
function isValidParticipants() {
  return request.resource.data.participants >= 1 
         && request.resource.data.participants <= 10;
}
```

### Preventing Privilege Escalation

```javascript
// Users cannot change their own role
allow update: if isAdmin()  // Only admin can update user roles
              && request.resource.data.role == resource.data.role;  // Prevent role change

// Users cannot assign themselves as moniteur
allow create: if isAdmin()
              && !(request.resource.data.role == 'moniteur' && request.auth.uid == request.resource.uid);
```

---

## 7. Common Security Pitfalls

### ❌ Pitfall 1: Missing Authentication Check
```javascript
// BAD: Anyone can read
allow read: if true;

// GOOD: Only authenticated users
allow read: if request.auth != null;
```

### ❌ Pitfall 2: Incomplete Validation
```javascript
// BAD: Missing field validation
allow create: if request.auth != null;

// GOOD: Validate all required fields
allow create: if request.auth != null 
              && isValidReservation();
```

### ❌ Pitfall 3: Overly Permissive Update Rules
```javascript
// BAD: User can update any field
allow update: if isOwner(resource.data.user_id);

// GOOD: Prevent role changes
allow update: if isAdmin()
              || (isOwner(resource.data.user_id) 
                  && request.resource.data.role == resource.data.role);
```

---

## 8. Testing Security Rules

### Unit Testing with Firebase Emulator

```typescript
// src/tests/security.rules.test.ts
import { describe, it, before, after } from 'node:test';
import { assert } from 'chai';
import { initializeTestEnvironment, RulesTestContext } from '@firebase/rules-unit-testing';

let testEnv: RulesTestContext;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'tennis-francois-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

after(async () => {
  await testEnv.cleanup();
});

describe('Security Rules', () => {
  it('should allow admin to read all users', async () => {
    const adminDb = testEnv.authenticatedContext('admin_001', { role: 'admin' }).firestore();
    await assert.succeeds(adminDb.collection('users').get());
  });

  it('should prevent client from reading other users', async () => {
    const clientDb = testEnv.authenticatedContext('client_001', { role: 'client' }).firestore();
    await assert.fails(clientDb.collection('users').get());
  });

  it('should allow client to create own reservation', async () => {
    const clientDb = testEnv.authenticatedContext('client_001').firestore();
    await assert.succeeds(
      clientDb.collection('reservations').add({
        user_id: 'client_001',
        court_id: 'court_01',
        start_time: new Date(),
        end_time: new Date(Date.now() + 3600000),
        type: 'location_libre',
        status: 'confirmed'
      })
    );
  });
});
```

---

## 9. Deployment Checklist

Before deploying security rules:

- [ ] Test all rules in Firebase Emulator
- [ ] Verify admin can perform all operations
- [ ] Verify moniteur can manage own slots
- [ ] Verify client can only access own data
- [ ] Test edge cases (missing fields, invalid data)
- [ ] Run unit tests for security rules
- [ ] Backup current production rules
- [ ] Deploy during low-traffic period
- [ ] Monitor logs after deployment

---

## 10. Next Steps

After configuring security rules:
1. ✅ Test rules in Firebase Emulator Suite
2. ✅ Verify access control for all user roles
3. 📖 Proceed to [04_SERVICES.md](./04_SERVICES.md)
