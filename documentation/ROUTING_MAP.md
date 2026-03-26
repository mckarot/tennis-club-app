# 🗺️ Routing Map - Visual Guide

**Date:** 2026-03-26  
**Legend:** ✅ Works | ❌ 404 Error | ⚠️ Page exists but not routed

---

## Complete Routing Tree

```
/
├── ✅ /                          (LandingPage)
├── ✅ /login                     (LoginPage)
├── ✅ /register                  (RegisterPage)
├── ❌ /forgot-password           (Page exists, not routed)
├── ❌ /pricing                   (Missing)
├── ⚠️ /courts                    (Page exists, not routed)
├── ❌ /unauthorized              (Page exists, not routed)
├── ❌ *                          (404 - Works but overused due to missing routes)
│
├── /admin ──────────────────────┐
│   ├── ✅ /admin                (Redirects to /admin/dashboard)
│   ├── ✅ /admin/dashboard      (AdminDashboard)
│   ├── ❌ /admin/courts         (DUPLICATE PAGES - Not routed)
│   │   ├── src/pages/admin/Courts.tsx (OLD)
│   │   └── src/pages/admin/AdminCourtsPage/ (NEW)
│   ├── ❌ /admin/users          (DUPLICATE PAGES - Not routed)
│   │   ├── src/pages/admin/Users.tsx (OLD)
│   │   └── src/pages/admin/AdminUsersPage/ (NEW)
│   ├── ❌ /admin/reservations   (DUPLICATE PAGES - Not routed)
│   │   ├── src/pages/admin/Reservations.tsx (OLD)
│   │   └── src/pages/admin/AdminReservationsPage/ (NEW)
│   ├── ⚠️ /admin/settings       (Page exists, not routed)
│   ├── ⚠️ /admin/slots          (Page exists, not routed)
│   ├── ❌ /admin/tournaments    (Missing)
│   ├── ❌ /admin/finance        (Missing)
│   └── ❌ /admin/help           (Missing)
│
├── /client ─────────────────────┐
│   ├── ✅ /client               (Redirects to /client/dashboard)
│   ├── ✅ /client/dashboard     (ClientDashboard)
│   ├── ❌ /client/courts        (Missing - Dashboard navigates here!)
│   ├── ⚠️ /client/bookings      (Page exists, not routed)
│   ├── ❌ /client/slots         (Missing - Dashboard navigates here!)
│   ├── ⚠️ /client/reservations  (Page exists, not routed)
│   ├── ❌ /client/reservations/:id (Missing - Dashboard navigates here!)
│   ├── ⚠️ /client/profile       (Page exists, not routed)
│   ├── ❌ /client/cancel        (Missing)
│   └── ❌ /client/support       (Missing)
│
└── /moniteur ───────────────────┐
    ├── ✅ /moniteur             (Redirects to /moniteur/dashboard)
    ├── ✅ /moniteur/dashboard   (MoniteurDashboard)
    ├── ⚠️ /moniteur/schedule    (Page exists, not routed)
    ├── ⚠️ /moniteur/students    (Page exists, not routed)
    ├── ⚠️ /moniteur/profile     (Page exists, not routed)
    ├── ❌ /moniteur/slots       (Missing - Dashboard navigates here!)
    ├── ❌ /moniteur/calendar    (Missing)
    ├── ❌ /moniteur/attendance  (Missing)
    └── ❌ /moniteur/reports     (Missing)
```

---

## Navigation Flow by User Role

### Admin User Flow

```
Login → /admin/dashboard
         ├── ✅ Dashboard (works)
         ├── ❌ Court Management (404)
         ├── ❌ User Directory (404)
         ├── ❌ Reservations (404)
         ├── ❌ Settings (404)
         └── ❌ Help (404)
```

**Problem:** Admin can see dashboard but cannot access any management features.

### Client User Flow

```
Login → /client/dashboard
         ├── ✅ Dashboard (works)
         ├── ❌ Book a Court (404) ← CRITICAL
         ├── ❌ My Reservations (404)
         ├── ❌ My Profile (404)
         ├── ❌ Cancel Reservation (404)
         └── ❌ Support (404)
```

**Problem:** Client cannot book courts - core feature is broken.

### Moniteur User Flow

```
Login → /moniteur/dashboard
         ├── ✅ Dashboard (works)
         ├── ❌ Weekly Calendar (404)
         ├── ❌ Define Slots (404) ← Referenced in dashboard
         ├── ❌ My Students (404)
         ├── ❌ Attendance (404)
         └── ❌ Reports (404)
```

**Problem:** Moniteur cannot manage lessons or students.

---

## File Structure vs Route Structure

### What Exists (Files)

```
src/pages/
├── admin/
│   ├── ✅ Dashboard.tsx
│   ├── ❌ Courts.tsx (duplicate)
│   ├── ❌ Users.tsx (duplicate)
│   ├── ❌ Reservations.tsx (duplicate)
│   ├── ⚠️ Settings.tsx
│   ├── ⚠️ Slots.tsx
│   ├── ✅ AdminCourtsPage/
│   │   └── index.tsx
│   ├── ✅ AdminUsersPage/
│   │   └── index.tsx
│   └── ✅ AdminReservationsPage/
│       └── index.tsx
│
├── client/
│   ✅ ├── Dashboard.tsx
│   ⚠️ ├── Bookings.tsx
│   ⚠️ ├── Profile.tsx
│   ⚠️ ├── Reservations.tsx
│   ⚠️ ├── Slots.tsx
│   └── ❌ (missing: CourtsPage, ReservationDetails)
│
├── moniteur/
│   ├── ✅ Dashboard.tsx
│   ├── ⚠️ Schedule.tsx
│   ├── ⚠️ Students.tsx
│   ├── ⚠️ Profile.tsx
│   └── ❌ (missing: SlotsPage)
│
├── auth/
│   ├── ✅ LoginPage/
│   ├── ✅ RegisterPage/
│   └── ✅ ForgotPasswordPage/
│
└── (root)
    ├── ✅ LandingPage.tsx
    ├── ✅ CourtsPage.tsx
    ├── ⚠️ NotFoundPage.tsx
    └── ⚠️ UnauthorizedPage.tsx
```

### What's in Router (App.tsx)

```typescript
Routes declared:
├── ✅ /
├── ✅ /login
├── ✅ /register
├── /admin
│   ├── ✅ (redirect to dashboard)
│   └── ✅ dashboard
├── /client
│   ├── ✅ (redirect to dashboard)
│   └── ✅ dashboard
└── /moniteur
    ├── ✅ (redirect to dashboard)
    └── ✅ dashboard
```

**Gap:** 13 page files exist but are NOT in the router.

---

## Sidebar Navigation Map

### Admin Sidebar (from `Sidebar.tsx`)

```
COMMAND CENTER
├── MANAGEMENT
│   ├── ✅ Dashboard → /admin/dashboard
│   ├── ❌ User Directory → /admin/users (404)
│   ├── ❌ Court Management → /admin/courts (404)
│   └── ❌ Reservations → /admin/reservations (404)
└── SETTINGS
    ├── ❌ Configuration → /admin/settings (404)
    └── ❌ Help & Support → /admin/help (404)
```

**Result:** 5 out of 6 navigation links are broken.

### Client Sidebar (from `Sidebar.tsx`)

```
Court Manager
├── NAVIGATION
│   ├── ✅ Dashboard → /client/dashboard
│   ├── ❌ Book a Court → /client/courts (404)
│   ├── ❌ My Reservations → /client/reservations (404)
│   └── ❌ My Profile → /client/profile (404)
└── QUICK ACTIONS
    ├── ❌ Cancel Reservation → /client/cancel (404)
    └── ❌ Contact Support → /client/support (404)
```

**Result:** 5 out of 6 navigation links are broken.

### Moniteur Sidebar (from `Sidebar.tsx`)

```
MONITEUR PORTAL
├── SCHEDULE
│   ├── ✅ Dashboard → /moniteur/dashboard
│   ├── ❌ Weekly Calendar → /moniteur/calendar (404)
│   ├── ❌ Define Slots → /moniteur/slots (404)
│   └── ❌ My Students → /moniteur/students (404)
└── TOOLS
    ├── ❌ Attendance → /moniteur/attendance (404)
    └── ❌ Reports → /moniteur/reports (404)
```

**Result:** 5 out of 6 navigation links are broken.

---

## Priority Matrix

### 🔴 Critical (Fix Today)

These break core functionality:

1. `/client/courts` - Cannot book courts (revenue impact)
2. `/client/reservations` - Cannot view reservations
3. `/client/profile` - Cannot update profile
4. `/admin/users` - Cannot manage users
5. `/admin/courts` - Cannot manage courts
6. `/admin/reservations` - Cannot manage bookings

### 🟡 High (Fix This Week)

These block important features:

7. `/moniteur/schedule` - Cannot view schedule
8. `/moniteur/students` - Cannot manage students
9. `/moniteur/slots` - Cannot create slots
10. `/client/reservations/:id` - Cannot view reservation details
11. `/forgot-password` - Cannot reset password
12. `/unauthorized` - No 403 page

### 🟢 Medium (Fix Next Week)

These are nice to have:

13. `/admin/settings`
14. `/pricing`
15. `/client/bookings`
16. `/client/cancel`
17. `/client/support`

### ⚪ Low (Future)

These are optional features:

18. `/admin/tournaments`
19. `/admin/finance`
20. `/admin/help`
21. `/moniteur/attendance`
22. `/moniteur/reports`
23. `/moniteur/calendar`

---

## Resolution Steps

### Step 1: Clean Duplicates

```bash
# Delete old duplicate files
rm src/pages/admin/Courts.tsx
rm src/pages/admin/Users.tsx
rm src/pages/admin/Reservations.tsx
rm src/pages/admin/Slots.tsx
```

### Step 2: Add Routes to App.tsx

```typescript
// Inside /admin route children:
{ path: 'courts', element: <AdminCourtsPage /> },
{ path: 'users', element: <AdminUsersPage /> },
{ path: 'reservations', element: <AdminReservationsPage /> },
{ path: 'settings', element: <AdminSettingsPage /> },

// Inside /client route children:
{ path: 'courts', element: <ClientCourtsPage /> },
{ path: 'bookings', element: <ClientBookingsPage /> },
{ path: 'reservations', element: <ClientReservationsPage /> },
{ path: 'reservations/:id', element: <ClientReservationDetails /> },
{ path: 'profile', element: <ClientProfilePage /> },

// Inside /moniteur route children:
{ path: 'schedule', element: <MoniteurSchedulePage /> },
{ path: 'students', element: <MoniteurStudentsPage /> },
{ path: 'profile', element: <MoniteurProfilePage /> },
{ path: 'slots', element: <MoniteurSlotsPage /> },

// Public routes:
{ path: 'forgot-password', element: <ForgotPasswordPage /> },
{ path: 'unauthorized', element: <UnauthorizedPage /> },
```

### Step 3: Create Missing Pages

Create these files:
- `src/pages/client/CourtsPage/index.tsx`
- `src/pages/client/ReservationDetails/index.tsx`
- `src/pages/moniteur/SlotsPage/index.tsx`

### Step 4: Test

Click every sidebar link and verify no 404 errors.

---

## After Fixing

```
Status after all fixes:
├── ✅ 23 routes working
├── ⚠️ 3 routes with stub pages (need completion)
└── ❌ 0 routes with 404 errors
```

---

**See Also:**
- [ROUTING_AUDIT.md](./ROUTING_AUDIT.md) - Full detailed audit
- [ROUTING_ISSUES_SUMMARY.md](./ROUTING_ISSUES_SUMMARY.md) - Executive summary

**Last Updated:** 2026-03-26
