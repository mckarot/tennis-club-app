# ✅ Routing Fix - Action Plan Checklist

**Created:** 2026-03-26  
**Priority:** 🔴 **CRITICAL**  
**Estimated Effort:** 8-12 hours  
**Owner:** Development Team

---

## Phase 1: Immediate Fixes (Day 1) - 4 hours

### 1.1 Clean Duplicate Files ⏱️ 15 min

- [ ] Delete `src/pages/admin/Courts.tsx`
- [ ] Delete `src/pages/admin/Users.tsx`
- [ ] Delete `src/pages/admin/Reservations.tsx`
- [ ] Delete `src/pages/admin/Slots.tsx`

**Verification:**
```bash
ls src/pages/admin/
# Should show: AdminCourtsPage/, AdminUsersPage/, AdminReservationsPage/, components/, Dashboard.tsx, Settings.tsx
```

---

### 1.2 Add Admin Routes to App.tsx ⏱️ 30 min

- [ ] Import `AdminCourtsPage` in `App.tsx`
- [ ] Import `AdminUsersPage` in `App.tsx`
- [ ] Import `AdminReservationsPage` in `App.tsx`
- [ ] Import `AdminSettingsPage` in `App.tsx`
- [ ] Add child routes under `/admin`:

```typescript
<Route path="courts" element={<AdminCourtsPage />} />
<Route path="users" element={<AdminUsersPage />} />
<Route path="reservations" element={<AdminReservationsPage />} />
<Route path="settings" element={<AdminSettingsPage />} />
```

**Verification:**
- [ ] Navigate to `http://localhost:5173/admin/courts` → Should show court management page
- [ ] Navigate to `http://localhost:5173/admin/users` → Should show user management page
- [ ] Navigate to `http://localhost:5173/admin/reservations` → Should show reservations page
- [ ] Navigate to `http://localhost:5173/admin/settings` → Should show settings page

---

### 1.3 Add Client Routes to App.tsx ⏱️ 30 min

- [ ] Import `ClientBookings` in `App.tsx` (rename to `ClientBookingsPage`)
- [ ] Import `ClientProfile` in `App.tsx` (rename to `ClientProfilePage`)
- [ ] Import `ClientReservations` or `MyReservationsPage` in `App.tsx`
- [ ] Add child routes under `/client`:

```typescript
<Route path="courts" element={<ClientCourtsPage />} />
<Route path="bookings" element={<ClientBookingsPage />} />
<Route path="reservations" element={<ClientReservationsPage />} />
<Route path="reservations/:id" element={<ClientReservationDetails />} />
<Route path="profile" element={<ClientProfilePage />} />
```

**Note:** `ClientCourtsPage` and `ClientReservationDetails` need to be created (see 1.5)

**Verification:**
- [ ] Navigate to `http://localhost:5173/client/bookings` → Should show bookings page
- [ ] Navigate to `http://localhost:5173/client/reservations` → Should show reservations list
- [ ] Navigate to `http://localhost:5173/client/profile` → Should show profile page

---

### 1.4 Add Moniteur Routes to App.tsx ⏱️ 30 min

- [ ] Import `MoniteurSchedule` in `App.tsx`
- [ ] Import `MoniteurStudents` in `App.tsx`
- [ ] Import `MoniteurProfile` in `App.tsx`
- [ ] Add child routes under `/moniteur`:

```typescript
<Route path="schedule" element={<MoniteurSchedulePage />} />
<Route path="students" element={<MoniteurStudentsPage />} />
<Route path="profile" element={<MoniteurProfilePage />} />
<Route path="slots" element={<MoniteurSlotsPage />} />
```

**Note:** `MoniteurSlotsPage` needs to be created (see 1.5)

**Verification:**
- [ ] Navigate to `http://localhost:5173/moniteur/schedule` → Should show schedule page
- [ ] Navigate to `http://localhost:5173/moniteur/students` → Should show students page
- [ ] Navigate to `http://localhost:5173/moniteur/profile` → Should show profile page

---

### 1.5 Create Missing Page Components ⏱️ 2 hours

#### Create ClientCourtsPage

- [ ] Create directory: `src/pages/client/CourtsPage/`
- [ ] Create file: `src/pages/client/CourtsPage/index.tsx`
- [ ] Implement court booking interface
- [ ] Add route in App.tsx (if not done in 1.3)

#### Create ClientReservationDetails

- [ ] Create directory: `src/pages/client/ReservationDetails/`
- [ ] Create file: `src/pages/client/ReservationDetails/index.tsx`
- [ ] Implement reservation details view
- [ ] Add route in App.tsx with `:id` parameter

#### Create MoniteurSlotsPage

- [ ] Create directory: `src/pages/moniteur/SlotsPage/`
- [ ] Create file: `src/pages/moniteur/SlotsPage/index.tsx`
- [ ] Implement slot definition interface
- [ ] Add route in App.tsx (if not done in 1.4)

**Verification:**
- [ ] Navigate to `http://localhost:5173/client/courts` → Should show court booking page
- [ ] Navigate to `http://localhost:5173/client/reservations/123` → Should show reservation details
- [ ] Navigate to `http://localhost:5173/moniteur/slots` → Should show slot creation page

---

### 1.6 Add Error Pages ⏱️ 30 min

- [ ] Import `UnauthorizedPage` in `App.tsx`
- [ ] Import `ForgotPasswordPage` in `App.tsx`
- [ ] Add public routes:

```typescript
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/unauthorized" element={<UnauthorizedPage />} />
```

**Verification:**
- [ ] Navigate to `http://localhost:5173/forgot-password` → Should show password reset page
- [ ] Navigate to `http://localhost:5173/unauthorized` → Should show 403 page
- [ ] Try to access admin route as client → Should redirect to unauthorized page

---

## Phase 2: Testing & Validation (Day 2) - 2 hours

### 2.1 Test All Admin Routes ⏱️ 30 min

- [ ] `/admin/dashboard` → Works
- [ ] `/admin/courts` → Works
- [ ] `/admin/users` → Works
- [ ] `/admin/reservations` → Works
- [ ] `/admin/settings` → Works

**Sidebar Test:**
- [ ] Click "Dashboard" in admin sidebar → Works
- [ ] Click "User Directory" → Goes to `/admin/users` (no 404)
- [ ] Click "Court Management" → Goes to `/admin/courts` (no 404)
- [ ] Click "Reservations" → Goes to `/admin/reservations` (no 404)
- [ ] Click "Configuration" → Goes to `/admin/settings` (no 404)

---

### 2.2 Test All Client Routes ⏱️ 30 min

- [ ] `/client/dashboard` → Works
- [ ] `/client/courts` → Works
- [ ] `/client/bookings` → Works
- [ ] `/client/reservations` → Works
- [ ] `/client/reservations/:id` → Works (test with real ID)
- [ ] `/client/profile` → Works

**Sidebar Test:**
- [ ] Click "Dashboard" in client sidebar → Works
- [ ] Click "Book a Court" → Goes to `/client/courts` (no 404)
- [ ] Click "My Reservations" → Goes to `/client/reservations` (no 404)
- [ ] Click "My Profile" → Goes to `/client/profile` (no 404)

**Dashboard Test:**
- [ ] Click "Book Now" button → Goes to `/client/courts` (no 404)
- [ ] Click "View Schedule" button → Goes to `/client/slots` (should work or be removed)
- [ ] Click on a reservation → Goes to `/client/reservations/:id` (no 404)

---

### 2.3 Test All Moniteur Routes ⏱️ 30 min

- [ ] `/moniteur/dashboard` → Works
- [ ] `/moniteur/schedule` → Works
- [ ] `/moniteur/students` → Works
- [ ] `/moniteur/profile` → Works
- [ ] `/moniteur/slots` → Works

**Sidebar Test:**
- [ ] Click "Dashboard" in moniteur sidebar → Works
- [ ] Click "Weekly Calendar" → Goes to `/moniteur/calendar` (should work or be removed)
- [ ] Click "Define Slots" → Goes to `/moniteur/slots` (no 404)
- [ ] Click "My Students" → Goes to `/moniteur/students` (no 404)

**Dashboard Test:**
- [ ] Click "Créer un créneau" button → Goes to `/moniteur/slots` (no 404)
- [ ] Click "Mon emploi du temps" quick action → Goes to `/moniteur/schedule` (no 404)
- [ ] Click "Mes élèves" quick action → Goes to `/moniteur/students` (no 404)
- [ ] Click "Mon profil" quick action → Goes to `/moniteur/profile` (no 404)

---

### 2.4 Test Error Pages ⏱️ 30 min

- [ ] Navigate to random route `/random-route-123` → Shows 404 page
- [ ] Navigate to `/forgot-password` → Shows password reset page
- [ ] Navigate to `/unauthorized` → Shows 403 page
- [ ] Try to access admin route without auth → Redirects to login
- [ ] Try to access admin route as client → Redirects to unauthorized

---

## Phase 3: Router Migration (Day 3-4) - 4-6 hours

### 3.1 Create Router Configuration ⏱️ 1 hour

- [ ] Create `src/router.tsx`
- [ ] Migrate from `BrowserRouter` to `createBrowserRouter`
- [ ] Define all routes with proper structure
- [ ] Add error elements to all routes

```typescript
// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      // ... all other routes
    ],
  },
]);
```

---

### 3.2 Add Route Loaders ⏱️ 2 hours

- [ ] Create loader for admin dashboard
- [ ] Create loader for admin courts page
- [ ] Create loader for admin users page
- [ ] Create loader for admin reservations page
- [ ] Create loader for client dashboard
- [ ] Create loader for client reservations
- [ ] Create loader for moniteur dashboard
- [ ] Create loader for moniteur schedule

```typescript
// Example loader
{
  path: 'courts',
  loader: async () => {
    const courts = await getCourts();
    return { courts };
  },
  element: <AdminCourtsPage />,
}
```

---

### 3.3 Add Error Boundaries ⏱️ 1 hour

- [ ] Create `RootErrorBoundary` component
- [ ] Create `AdminErrorBoundary` component
- [ ] Create `ClientErrorBoundary` component
- [ ] Create `MoniteurErrorBoundary` component
- [ ] Add error elements to all routes

```typescript
{
  path: 'admin',
  element: <AdminLayout />,
  errorElement: <AdminErrorBoundary />,
  children: [/* ... */],
}
```

---

### 3.4 Update Main.tsx ⏱️ 30 min

- [ ] Import router from `src/router.tsx`
- [ ] Replace `BrowserRouter` with `RouterProvider`
- [ ] Remove route definitions from `App.tsx`

```typescript
// src/main.tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

---

### 3.5 Test Router Migration ⏱️ 1 hour

- [ ] All routes still work after migration
- [ ] Loaders fetch data correctly
- [ ] Error boundaries catch errors
- [ ] Navigation works as expected
- [ ] No console errors

---

## Phase 4: Documentation & Cleanup (Day 5) - 2 hours

### 4.1 Update Documentation ⏱️ 30 min

- [ ] Update `documentation/06_ROUTING.md` with actual routes
- [ ] Add route diagram to README
- [ ] Document route naming conventions
- [ ] Document loader patterns

---

### 4.2 Code Cleanup ⏱️ 30 min

- [ ] Remove unused imports in `App.tsx`
- [ ] Format all files
- [ ] Run TypeScript type check
- [ ] Run linter
- [ ] Fix any warnings

---

### 4.3 Create Route Reference ⏱️ 30 min

- [ ] Create `src/routes.ts` with route constants
- [ ] Export route paths for use in components
- [ ] Use constants in navigation instead of hardcoded strings

```typescript
// src/routes.ts
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
    COURTS: '/admin/courts',
    USERS: '/admin/users',
    RESERVATIONS: '/admin/reservations',
  },
  CLIENT: {
    BASE: '/client',
    DASHBOARD: '/client/dashboard',
    COURTS: '/client/courts',
    RESERVATIONS: '/client/reservations',
    PROFILE: '/client/profile',
  },
  MONITEUR: {
    BASE: '/moniteur',
    DASHBOARD: '/moniteur/dashboard',
    SCHEDULE: '/moniteur/schedule',
    STUDENTS: '/moniteur/students',
  },
} as const;
```

---

### 4.4 Final Verification ⏱️ 30 min

- [ ] Run full test suite
- [ ] Test in development mode
- [ ] Build production version
- [ ] Test production build
- [ ] Verify no 404 errors in console
- [ ] Verify all navigation works

---

## Completion Criteria

### Must Have (Phase 1-2)

- [ ] ✅ Zero 404 errors when clicking sidebar navigation
- [ ] ✅ Zero duplicate page files
- [ ] ✅ All existing pages connected to router
- [ ] ✅ Error pages work (404, 403)
- [ ] ✅ All user roles can access their features

### Should Have (Phase 3)

- [ ] ✅ Using `createBrowserRouter` pattern
- [ ] ✅ Loaders implemented for data fetching
- [ ] ✅ Error boundaries on all routes
- [ ] ✅ Route-level code splitting

### Nice to Have (Phase 4)

- [ ] ✅ Route constants for navigation
- [ ] ✅ Updated documentation
- [ ] ✅ Clean code (no warnings)

---

## Risk Mitigation

### If Short on Time

**Minimum Viable Fix (4 hours):**
1. Delete duplicate files (1.1)
2. Add existing pages to router (1.2, 1.3, 1.4)
3. Test all navigation (2.1, 2.2, 2.3)

**Defer to Later:**
- Router migration to `createBrowserRouter` (Phase 3)
- Creating missing pages (1.5) - use stubs for now
- Documentation updates (4.1, 4.3)

### If Issues Arise

**Common Issues:**
1. **Import errors** → Check file paths are correct
2. **Type errors** → Ensure all components have proper TypeScript types
3. **Route conflicts** → Check for duplicate route paths
4. **Navigation still broken** → Clear browser cache, hard reload

---

## Progress Tracking

| Phase | Tasks | Status | Completed |
|-------|-------|--------|-----------|
| 1.1 | Clean duplicates | ⬜ Not Started | 0/4 |
| 1.2 | Add admin routes | ⬜ Not Started | 0/4 |
| 1.3 | Add client routes | ⬜ Not Started | 0/5 |
| 1.4 | Add moniteur routes | ⬜ Not Started | 0/4 |
| 1.5 | Create missing pages | ⬜ Not Started | 0/3 |
| 1.6 | Add error pages | ⬜ Not Started | 0/2 |
| 2.1 | Test admin routes | ⬜ Not Started | 0/5 |
| 2.2 | Test client routes | ⬜ Not Started | 0/10 |
| 2.3 | Test moniteur routes | ⬜ Not Started | 0/9 |
| 2.4 | Test error pages | ⬜ Not Started | 0/5 |
| 3.1 | Create router config | ⬜ Not Started | 0/1 |
| 3.2 | Add loaders | ⬜ Not Started | 0/8 |
| 3.3 | Add error boundaries | ⬜ Not Started | 0/4 |
| 3.4 | Update main.tsx | ⬜ Not Started | 0/1 |
| 4.1 | Update docs | ⬜ Not Started | 0/4 |
| 4.2 | Code cleanup | ⬜ Not Started | 0/5 |
| 4.3 | Create route constants | ⬜ Not Started | 0/1 |
| 4.4 | Final verification | ⬜ Not Started | 0/6 |

**Total Progress:** 0/77 tasks completed

---

## Sign-Off

- [ ] **Developer:** All tasks completed and tested
- [ ] **QA Lead:** All routes verified working
- [ ] **Tech Lead:** Code review approved
- [ ] **Product Owner:** User acceptance testing passed

---

**Last Updated:** 2026-03-26  
**Next Review:** After Phase 1 completion
