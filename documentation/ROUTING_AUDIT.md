# 🔍 Routing Audit Report

**Date:** 2026-03-26  
**Application:** Tennis Club du François  
**Framework:** React Router DOM v7.13.2  
**Auditor:** React Architect

---

## Executive Summary

This audit identifies **critical routing gaps** in the Tennis Club application. The current routing implementation uses **legacy BrowserRouter** instead of the required **createBrowserRouter** (React Router v6.4+ data router pattern), and many expected routes are either missing or not properly configured.

### Key Findings

| Category | Count |
|----------|-------|
| ✅ Functional Routes | 8 |
| ⚠️ Partial Routes (exist but not in router) | 12 |
| ❌ Missing Routes | 15 |
| 🔄 Redirect Routes | 3 |

---

## État des Lieux

### Routes Actives (✅ Functional)

These routes are declared in `App.tsx` and functional:

| Route | Component | Role | Status |
|-------|-----------|------|--------|
| `/` | `LandingPage` | Public | ✅ |
| `/login` | `LoginPage` | Public | ✅ |
| `/register` | `RegisterPage` | Public | ✅ |
| `/admin` | `AdminDashboard` | Admin | ✅ (redirects to `/admin/dashboard`) |
| `/admin/dashboard` | `AdminDashboard` | Admin | ✅ |
| `/client` | `ClientDashboard` | Client | ✅ (redirects to `/client/dashboard`) |
| `/client/dashboard` | `ClientDashboard` | Client | ✅ |
| `/moniteur` | `MoniteurDashboard` | Moniteur | ✅ (redirects to `/moniteur/dashboard`) |
| `/moniteur/dashboard` | `MoniteurDashboard` | Moniteur | ✅ |
| `*` | `NotFoundPage` | Public | ✅ (404 fallback) |

### Routes avec Fichiers Pages mais NON Déclarées (⚠️ Partial)

These page files exist but are **NOT declared in the router**:

| Route | Component File | Expected Role | Router Status |
|-------|---------------|---------------|---------------|
| `/admin/courts` | `src/pages/admin/Courts.tsx` | Admin | ❌ Not in routes |
| `/admin/users` | `src/pages/admin/Users.tsx` | Admin | ❌ Not in routes |
| `/admin/reservations` | `src/pages/admin/Reservations.tsx` | Admin | ❌ Not in routes |
| `/admin/settings` | `src/pages/admin/Settings.tsx` | Admin | ❌ Not in routes |
| `/admin/courts` (new) | `src/pages/admin/AdminCourtsPage/index.tsx` | Admin | ❌ Not in routes |
| `/admin/reservations` (new) | `src/pages/admin/AdminReservationsPage/index.tsx` | Admin | ❌ Not in routes |
| `/admin/users` (new) | `src/pages/admin/AdminUsersPage/index.tsx` | Admin | ❌ Not in routes |
| `/client/bookings` | `src/pages/client/Bookings.tsx` | Client | ❌ Not in routes |
| `/client/profile` | `src/pages/client/Profile.tsx` | Client | ❌ Not in routes |
| `/client/reservations` | `src/pages/client/MyReservationsPage.tsx` | Client | ❌ Not in routes |
| `/moniteur/schedule` | `src/pages/moniteur/Schedule.tsx` | Moniteur | ❌ Not in routes |
| `/moniteur/students` | `src/pages/moniteur/Students.tsx` | Moniteur | ❌ Not in routes |
| `/moniteur/profile` | `src/pages/moniteur/Profile.tsx` | Moniteur | ❌ Not in routes |

### Routes avec Erreurs Potentielles (🔴 Critical)

| Route | Issue | Impact |
|-------|-------|--------|
| `/admin/courts` | **Duplicate components**: `Courts.tsx` AND `AdminCourtsPage/index.tsx` exist | Confusion, maintenance issue |
| `/admin/reservations` | **Duplicate components**: `Reservations.tsx` AND `AdminReservationsPage/index.tsx` exist | Confusion, maintenance issue |
| `/admin/users` | **Duplicate components**: `Users.tsx` AND `AdminUsersPage/index.tsx` exist | Confusion, maintenance issue |
| `/client/courts` | Referenced in `ClientDashboard` but no route defined | Navigation breaks |
| `/client/slots` | Referenced in `ClientDashboard` but no route defined | Navigation breaks |
| `/client/reservations/:id` | Referenced in `ClientDashboard` but no route defined | Navigation breaks |

### Routes Manquantes (❌ Missing)

These routes are expected but have **no page file AND no route declaration**:

| Route | Expected Role | Priority |
|-------|--------------|----------|
| `/admin/tournaments` | Admin - Tournament management | Medium |
| `/admin/finance` | Admin - Financial reports | Medium |
| `/admin/help` | Admin - Help & Support | Low |
| `/client/cancel` | Client - Cancel reservation | Medium |
| `/client/support` | Client - Contact support | Low |
| `/moniteur/calendar` | Moniteur - Weekly calendar view | Medium |
| `/moniteur/slots` | Moniteur - Define slots | Medium |
| `/moniteur/attendance` | Moniteur - Attendance tracking | Low |
| `/moniteur/reports` | Moniteur - Reports | Low |
| `/pricing` | Public - Pricing page | Medium |
| `/forgot-password` | Public - Password recovery | High |
| `/unauthorized` | Public - 403 error page | High |

---

## Analyse par Rôle

### Admin Routes

| Route | Status | Page Exists | Route Defined | Notes |
|-------|--------|-------------|---------------|-------|
| `/admin` | ✅ | ✅ | ✅ | Redirects to `/admin/dashboard` |
| `/admin/dashboard` | ✅ | ✅ | ✅ | Dashboard fonctionnel |
| `/admin/courts` | ❌ | ✅ (×2) | ❌ | **DUPLICATE**: `Courts.tsx` + `AdminCourtsPage/` |
| `/admin/users` | ❌ | ✅ (×2) | ❌ | **DUPLICATE**: `Users.tsx` + `AdminUsersPage/` |
| `/admin/reservations` | ❌ | ✅ (×2) | ❌ | **DUPLICATE**: `Reservations.tsx` + `AdminReservationsPage/` |
| `/admin/settings` | ⚠️ | ✅ | ❌ | Page exists (stub), not in routes |
| `/admin/slots` | ❌ | ✅ | ❌ | `Slots.tsx` exists, not in routes |
| `/admin/tournaments` | ❌ | ❌ | ❌ | Missing entirely |
| `/admin/finance` | ❌ | ❌ | ❌ | Missing entirely |
| `/admin/help` | ❌ | ❌ | ❌ | Referenced in sidebar, missing |

**Admin Route Issues:**
1. 🔴 **Critical**: Three routes have duplicate page implementations
2. 🔴 **Critical**: No routes declared for existing pages
3. ⚠️ **Major**: Sidebar navigation references routes that don't exist

### Moniteur Routes

| Route | Status | Page Exists | Route Defined | Notes |
|-------|--------|-------------|---------------|-------|
| `/moniteur` | ✅ | ✅ | ✅ | Redirects to `/moniteur/dashboard` |
| `/moniteur/dashboard` | ✅ | ✅ | ✅ | Dashboard fonctionnel |
| `/moniteur/schedule` | ⚠️ | ✅ | ❌ | Page exists (stub), not in routes |
| `/moniteur/students` | ⚠️ | ✅ | ❌ | Page exists (stub), not in routes |
| `/moniteur/profile` | ⚠️ | ✅ | ❌ | Page exists (stub), not in routes |
| `/moniteur/calendar` | ❌ | ❌ | ❌ | Referenced in sidebar, missing |
| `/moniteur/slots` | ❌ | ❌ | ❌ | Referenced in dashboard, missing |
| `/moniteur/attendance` | ❌ | ❌ | ❌ | Referenced in sidebar, missing |
| `/moniteur/reports` | ❌ | ❌ | ❌ | Referenced in sidebar, missing |

**Moniteur Route Issues:**
1. 🔴 **Critical**: Dashboard references `/moniteur/slots` which doesn't exist
2. ⚠️ **Major**: Sidebar references 4 routes that don't exist
3. ⚠️ **Major**: Existing pages are stubs with "en cours de développement"

### Client Routes

| Route | Status | Page Exists | Route Defined | Notes |
|-------|--------|-------------|---------------|-------|
| `/client` | ✅ | ✅ | ✅ | Redirects to `/client/dashboard` |
| `/client/dashboard` | ✅ | ✅ | ✅ | Dashboard fonctionnel |
| `/client/courts` | ❌ | ❌ | ❌ | Referenced in dashboard, missing |
| `/client/bookings` | ⚠️ | ✅ | ❌ | Page exists (stub), not in routes |
| `/client/slots` | ❌ | ❌ | ❌ | Referenced in dashboard, missing |
| `/client/reservations` | ⚠️ | ✅ | ❌ | Page exists, not in routes |
| `/client/reservations/:id` | ❌ | ❌ | ❌ | Referenced in dashboard, missing |
| `/client/profile` | ⚠️ | ✅ | ❌ | Page exists, not in routes |
| `/client/cancel` | ❌ | ❌ | ❌ | Referenced in sidebar, missing |
| `/client/support` | ❌ | ❌ | ❌ | Referenced in sidebar, missing |

**Client Route Issues:**
1. 🔴 **Critical**: Dashboard navigates to `/client/courts` which doesn't exist
2. 🔴 **Critical**: Dashboard navigates to `/client/slots` which doesn't exist
3. 🔴 **Critical**: Dashboard navigates to `/client/reservations/:id` which doesn't exist
4. ⚠️ **Major**: Existing pages are not connected to router

### Public Routes

| Route | Status | Page Exists | Route Defined | Notes |
|-------|--------|-------------|---------------|-------|
| `/` | ✅ | ✅ | ✅ | Landing page functional |
| `/login` | ✅ | ✅ | ✅ | Login functional |
| `/register` | ✅ | ✅ | ✅ | Register functional |
| `/forgot-password` | ❌ | ✅ | ❌ | Page exists, not in routes |
| `/pricing` | ❌ | ❌ | ❌ | Missing entirely |
| `/courts` | ⚠️ | ✅ | ❌ | Page exists, not in routes |
| `/unauthorized` | ❌ | ✅ | ❌ | `UnauthorizedPage.tsx` exists, not in routes |

---

## Problèmes Identifiés

### Critical (❌) - Must Fix Before Production

1. **BrowserRouter instead of createBrowserRouter**
   - Current: Uses legacy `BrowserRouter` pattern
   - Required: React Router v6.4+ `createBrowserRouter` with loaders
   - Impact: No data loading optimization, no error boundaries per route

2. **Duplicate Page Implementations**
   - `/admin/courts`: `Courts.tsx` vs `AdminCourtsPage/index.tsx`
   - `/admin/users`: `Users.tsx` vs `AdminUsersPage/index.tsx`
   - `/admin/reservations`: `Reservations.tsx` vs `AdminReservationsPage/index.tsx`
   - Impact: Code maintenance nightmare, confusion

3. **Navigation Breaks in Production**
   - Client Dashboard navigates to `/client/courts` → 404
   - Client Dashboard navigates to `/client/slots` → 404
   - Client Dashboard navigates to `/client/reservations/:id` → 404
   - Moniteur Dashboard navigates to `/moniteur/slots` → 404
   - Impact: **Application is unusable for end users**

4. **No Route Protection for Nested Routes**
   - Child routes under `/admin`, `/client`, `/moniteur` are not individually protected
   - Impact: Security vulnerability

5. **Missing Error Pages**
   - `/unauthorized` route not declared
   - No error boundaries for routes
   - Impact: Poor UX on errors

### Major (⚠️) - Should Fix Soon

1. **Pages Not Connected to Router**
   - 13 page files exist but not declared in routes
   - Impact: Features inaccessible

2. **Sidebar Navigation Broken**
   - Sidebar references routes that don't exist
   - Impact: Navigation UI is misleading

3. **Missing Dynamic Route Parameters**
   - `/client/reservations/:id` not defined
   - Impact: Can't view reservation details

4. **Inconsistent Route Naming**
   - Some use plural (`/admin/courts`), some use singular
   - Some use `/booking`, some use `/bookings`
   - Impact: Developer confusion

### Minor (ℹ️) - Nice to Have

1. **Missing Optional Features**
   - `/admin/tournaments`
   - `/admin/finance`
   - `/moniteur/attendance`
   - `/moniteur/reports`

2. **No Route-Level Loading States**
   - All loading handled at component level
   - Impact: Slower perceived performance

3. **No Route Analytics**
   - No page view tracking
   - Impact: Can't measure feature usage

---

## Test Results: Browser Navigation

### Tested URLs (Simulated)

| URL | Expected Behavior | Actual Behavior | Status |
|-----|-------------------|-----------------|--------|
| `http://localhost:5173/admin/courts` | Show court management page | **404** (route not defined) | ❌ |
| `http://localhost:5173/admin/bookings` | Show bookings management | **404** (route not defined) | ❌ |
| `http://localhost:5173/admin/users` | Show user management | **404** (route not defined) | ❌ |
| `http://localhost:5173/admin/reservations` | Show reservations management | **404** (route not defined) | ❌ |
| `http://localhost:5173/admin/settings` | Show settings page | **404** (route not defined) | ❌ |
| `http://localhost:5173/moniteur/schedule` | Show weekly schedule | **404** (route not defined) | ❌ |
| `http://localhost:5173/moniteur/players` | Show players list | **404** (route not defined) | ❌ |
| `http://localhost:5173/moniteur/sessions` | Show sessions list | **404** (route not defined) | ❌ |
| `http://localhost:5173/client/bookings` | Show booking page | **404** (route not defined) | ❌ |
| `http://localhost:5173/client/profile` | Show profile page | **404** (route not defined) | ❌ |
| `http://localhost:5173/client/courts` | Show court booking | **404** (route not defined) | ❌ |
| `http://localhost:5173/forgot-password` | Show password reset | **404** (route not defined) | ❌ |
| `http://localhost:5173/unauthorized` | Show access denied | **404** (route not defined) | ❌ |

---

## Plan d'Action

### Phase 1: Critical Fixes (Week 1)

- [ ] **Migrate to createBrowserRouter**
  - Convert `App.tsx` to use data router pattern
  - Add loaders for each route
  - Add error elements for each route

- [ ] **Fix Navigation Breaks**
  - Add `/client/courts` route
  - Add `/client/slots` route
  - Add `/client/reservations/:id` route
  - Add `/moniteur/slots` route

- [ ] **Resolve Duplicate Pages**
  - Choose one implementation for `/admin/courts` (recommend `AdminCourtsPage/`)
  - Choose one implementation for `/admin/users` (recommend `AdminUsersPage/`)
  - Choose one implementation for `/admin/reservations` (recommend `AdminReservationsPage/`)
  - Delete unused duplicates

- [ ] **Add Missing Error Pages**
  - Add `/unauthorized` route
  - Add `/forgot-password` route

### Phase 2: Missing Pages (Week 2)

- [ ] **Declare Existing Pages in Router**
  ```typescript
  // Admin routes
  { path: 'courts', element: <AdminCourtsPage /> }
  { path: 'users', element: <AdminUsersPage /> }
  { path: 'reservations', element: <AdminReservationsPage /> }
  { path: 'settings', element: <AdminSettingsPage /> }
  
  // Client routes
  { path: 'courts', element: <ClientCourtsPage /> }
  { path: 'bookings', element: <ClientBookingsPage /> }
  { path: 'reservations', element: <ClientReservationsPage /> }
  { path: 'reservations/:id', element: <ClientReservationDetails /> }
  { path: 'profile', element: <ClientProfilePage /> }
  
  // Moniteur routes
  { path: 'schedule', element: <MoniteurSchedulePage /> }
  { path: 'students', element: <MoniteurStudentsPage /> }
  { path: 'profile', element: <MoniteurProfilePage /> }
  { path: 'slots', element: <MoniteurSlotsPage /> }
  ```

- [ ] **Create Missing Page Components**
  - `ClientCourtsPage` (or rename existing)
  - `ClientReservationDetails`
  - `MoniteurSlotsPage`

### Phase 3: Route Cleanup (Week 3)

- [ ] **Standardize Route Naming**
  - Use plural for collections: `/courts`, `/users`, `/reservations`
  - Use singular for details: `/reservations/:id`
  - Document naming convention

- [ ] **Add Route Guards**
  - Implement per-route role checking
  - Add loader-level authorization

- [ ] **Add Error Boundaries**
  - Create `AdminErrorBoundary`
  - Create `ClientErrorBoundary`
  - Create `MoniteurErrorBoundary`

- [ ] **Add Route-Level Loading**
  - Implement Suspense boundaries
  - Add skeleton loaders per route

### Phase 4: Optional Features (Week 4)

- [ ] Create `/admin/tournaments`
- [ ] Create `/admin/finance`
- [ ] Create `/moniteur/attendance`
- [ ] Create `/moniteur/reports`
- [ ] Create `/pricing` (public)

---

## Recommandations

### Architecture

1. **Adopt React Router v6.4+ Data Router Pattern**
   ```typescript
   import { createBrowserRouter } from 'react-router-dom';
   
   const router = createBrowserRouter([
     {
       path: '/admin',
       element: <AdminLayout />,
       errorElement: <AdminErrorBoundary />,
       children: [
         {
           path: 'courts',
           loader: adminCourtsLoader,
           element: <AdminCourtsPage />,
           errorElement: <CourtsErrorBoundary />,
         },
       ],
     },
   ]);
   ```

2. **Implement Route-Level Code Splitting**
   ```typescript
   const AdminCourtsPage = lazy(() => 
     import('./pages/admin/AdminCourtsPage')
   );
   ```

3. **Create Route Configuration File**
   - Move routes out of `App.tsx`
   - Create `src/router.tsx` with all route definitions
   - Export router instance

4. **Implement Route Metadata**
   ```typescript
   interface RouteMeta {
     title: string;
     requiredRole?: UserRole;
     allowRoles?: UserRole[];
     requiresAuth: boolean;
   }
   ```

### Navigation

1. **Fix Sidebar Navigation**
   - Update sidebar to only show accessible routes
   - Add runtime route availability checking
   - Remove hardcoded links to non-existent routes

2. **Implement Breadcrumbs**
   - Add breadcrumb navigation per route
   - Show current location in hierarchy

3. **Add Route Transitions**
   - Implement page transition animations
   - Add loading indicators for route changes

### Error Handling

1. **Implement Hierarchical Error Boundaries**
   ```
   RootErrorBoundary (app-level)
   ├── AdminErrorBoundary
   │   ├── CourtsErrorBoundary
   │   └── UsersErrorBoundary
   ├── ClientErrorBoundary
   │   └── ReservationsErrorBoundary
   └── MoniteurErrorBoundary
   ```

2. **Create Comprehensive Error Pages**
   - `404.tsx` - Page not found
   - `403.tsx` - Unauthorized
   - `500.tsx` - Server error
   - `offline.tsx` - Network error

3. **Add Error Recovery**
   - Retry buttons on error pages
   - Graceful degradation for partial failures

---

## Appendix A: Complete Route Map (Target State)

### Public Routes
```
/                           → LandingPage
/login                      → LoginPage
/register                   → RegisterPage
/forgot-password            → ForgotPasswordPage
/pricing                    → PricingPage
/courts                     → PublicCourtsPage
/unauthorized               → UnauthorizedPage
*                           → NotFoundPage
```

### Admin Routes (`/admin`)
```
/admin                      → Redirect to /admin/dashboard
/admin/dashboard            → AdminDashboard
/admin/courts               → AdminCourtsPage
/admin/users                → AdminUsersPage
/admin/reservations         → AdminReservationsPage
/admin/slots                → AdminSlotsPage
/admin/tournaments          → AdminTournamentsPage (TODO)
/admin/finance              → AdminFinancePage (TODO)
/admin/settings             → AdminSettingsPage
/admin/help                 → AdminHelpPage (TODO)
```

### Client Routes (`/client`)
```
/client                     → Redirect to /client/dashboard
/client/dashboard           → ClientDashboard
/client/courts              → ClientCourtsPage (TODO: create/rename)
/client/bookings            → ClientBookingsPage
/client/slots               → ClientSlotsPage (TODO: create)
/client/reservations        → ClientReservationsPage
/client/reservations/:id    → ClientReservationDetails (TODO: create)
/client/profile             → ClientProfilePage
/client/cancel              → ClientCancelPage (TODO: create)
/client/support             → ClientSupportPage (TODO: create)
```

### Moniteur Routes (`/moniteur`)
```
/moniteur                   → Redirect to /moniteur/dashboard
/moniteur/dashboard         → MoniteurDashboard
/moniteur/schedule          → MoniteurSchedulePage
/moniteur/students          → MoniteurStudentsPage
/moniteur/profile           → MoniteurProfilePage
/moniteur/slots             → MoniteurSlotsPage (TODO: create/rename)
/moniteur/calendar          → MoniteurCalendarPage (TODO: create)
/moniteur/attendance        → MoniteurAttendancePage (TODO: create)
/moniteur/reports           → MoniteurReportsPage (TODO: create)
```

---

## Appendix B: File Cleanup Required

### Files to Keep (Recommended)
```
src/pages/admin/AdminCourtsPage/index.tsx     ✅ (modern implementation)
src/pages/admin/AdminUsersPage/index.tsx      ✅ (modern implementation)
src/pages/admin/AdminReservationsPage/index.tsx ✅ (modern implementation)
src/pages/client/Profile.tsx                   ✅ (functional)
src/pages/client/Bookings.tsx                  ✅ (stub, needs completion)
src/pages/moniteur/Schedule.tsx                ✅ (stub, needs completion)
src/pages/moniteur/Students.tsx                ✅ (stub, needs completion)
src/pages/moniteur/Profile.tsx                 ✅ (stub, needs completion)
```

### Files to Delete (Duplicates)
```
src/pages/admin/Courts.tsx                     ❌ (duplicate)
src/pages/admin/Users.tsx                      ❌ (duplicate)
src/pages/admin/Reservations.tsx               ❌ (duplicate)
src/pages/admin/Slots.tsx                      ❌ (unused)
```

### Files to Create
```
src/pages/client/CourtsPage/index.tsx          🆕
src/pages/client/SlotsPage/index.tsx           🆕
src/pages/client/ReservationDetails/index.tsx  🆕
src/pages/moniteur/SlotsPage/index.tsx         🆕
src/pages/public/ForgotPasswordPage/index.tsx  🆕 (or move from auth)
src/pages/public/PricingPage/index.tsx         🆕
src/pages/errors/UnauthorizedPage/index.tsx    🆕 (or move)
```

---

## Appendix C: Router Migration Checklist

- [ ] Install/verify React Router DOM v6.4+ (✅ Already v7.13.2)
- [ ] Create `src/router.tsx` with `createBrowserRouter`
- [ ] Define all routes with loaders
- [ ] Add error elements to all routes
- [ ] Implement route-level code splitting
- [ ] Add route metadata (title, role requirements)
- [ ] Update `main.tsx` to use `RouterProvider`
- [ ] Test all route transitions
- [ ] Test error boundaries
- [ ] Test loader error handling
- [ ] Update sidebar navigation
- [ ] Update all navigation links
- [ ] Document routing conventions

---

**Report Generated:** 2026-03-26  
**Next Review:** After Phase 1 completion  
**Owner:** Development Team
