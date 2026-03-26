# 10. Complete Implementation Roadmap (0-100%)

## Tennis Club du François - Project Todo List

This document provides a complete task breakdown for implementing the Tennis Club application from scratch to production deployment.

---

## Phase 1: Project Setup & Configuration (Days 1-3) ✅ COMPLETED

### 1.1 Initial Setup (Day 1) ✅ COMPLETED
- [x] Create Firebase project at console.firebase.google.com
- [x] Enable Firestore Database
- [x] Enable Authentication (Email/Password)
- [x] Install Firebase CLI: `npm install -g firebase-tools`
- [x] Create Vite + React + TypeScript project
- [x] Install core dependencies (firebase, dayjs, react-router-dom, @tanstack/react-query)
- [x] Install dev dependencies (tailwindcss, typescript, vitest, playwright)
- [x] Initialize Firebase project locally
- [x] Configure Firebase Emulator Suite
- [x] Set up environment variables (.env, .env.example)
- [x] Create project directory structure

### 1.2 TypeScript & ESLint Configuration (Day 1) ✅ COMPLETED
- [x] Configure tsconfig.json with strict mode
- [x] Set up path aliases (@/components, @/services, etc.)
- [x] Configure ESLint for React + TypeScript
- [x] Configure Prettier for code formatting
- [x] Set up Husky for pre-commit hooks

### 1.3 Tailwind CSS Setup (Day 2) ✅ COMPLETED
- [x] Initialize Tailwind CSS
- [x] Configure tailwind.config.js with custom colors
- [x] Add design system color palette
- [x] Configure typography (Lexend, Work Sans)
- [x] Create base CSS with @layer directives
- [x] Set up utility classes for common patterns

### 1.4 Firebase Configuration (Day 2) ✅ COMPLETED
- [x] Create src/config/firebase.config.ts
- [x] Configure Firebase SDK initialization
- [x] Set up Emulator connections
- [x] Create firestore.rules
- [x] Create firestore.indexes.json
- [x] Test Emulator Suite connection

### 1.5 Initial Testing Setup (Day 3) ✅ COMPLETED
- [x] Configure Vitest
- [x] Set up Testing Library
- [x] Create test setup file
- [ ] Write first component test (Button)
- [ ] Configure Playwright for E2E
- [ ] Write first E2E test (Landing page)

**Deliverables:**
- ✅ Working development environment
- ✅ Firebase Emulator Suite running
- ✅ Tailwind CSS configured with design tokens
- ✅ Basic test infrastructure
- ✅ Build compiles successfully
- ✅ TypeScript type-check passes

---

## Phase 2: Core Infrastructure (Days 4-7) ✅ COMPLETED

### 2.1 Type Definitions (Day 4) ✅ COMPLETED
- [x] Create src/types/user.types.ts
- [x] Create src/types/court.types.ts
- [x] Create src/types/reservation.types.ts
- [x] Create src/types/slot.types.ts
- [x] Create src/types/service.types.ts
- [x] Create src/types/error.types.ts
- [x] Export all types from src/types/index.ts

### 2.2 Utility Functions (Day 4) ✅ COMPLETED
- [x] Create src/utils/timezone.ts (America/Martinique handling)
- [x] Create src/utils/classNames.ts (cn helper)
- [x] Create src/utils/validators.ts (form validation)
- [x] Create src/utils/errorUtils.ts (error classification)
- [ ] Write unit tests for utilities

### 2.3 Auth Context (Day 5) ✅ COMPLETED
- [x] Create src/contexts/AuthContext.tsx
- [x] Implement useAuth hook
- [x] Add session management
- [x] Add role-based access checks
- [ ] Write unit tests for AuthContext

### 2.4 Custom Hooks (Day 5-6) ✅ COMPLETED
- [x] Create src/hooks/useNavigation.ts
- [x] Create src/hooks/useRouteGuard.ts
- [x] Create src/hooks/useCourts.ts
- [x] Create src/hooks/useReservations.ts
- [x] Create src/hooks/useAvailability.ts
- [ ] Write unit tests for hooks

### 2.5 Service Layer - User Service (Day 6) ✅ COMPLETED
- [x] Create src/services/userService.ts
- [x] Implement registerUser function
- [x] Implement signInUser function
- [x] Implement signOutUser function
- [x] Implement getUserProfile function
- [x] Implement updateUserProfile function
- [ ] Write unit tests for user service

### 2.6 Service Layer - Court Service (Day 7) ✅ COMPLETED
- [x] Create src/services/courtService.ts
- [x] Implement getAllCourts function
- [x] Implement getActiveCourts function
- [x] Implement getCourtById function
- [x] Implement createCourt function (admin)
- [x] Implement updateCourt function (admin)
- [ ] Write unit tests for court service

### 2.7 Service Layer - Reservation Service (Day 7) ✅ COMPLETED
- [x] Create src/services/reservationService.ts
- [x] Implement checkCourtAvailability function (avec transaction)
- [x] Implement createReservation function (avec transaction anti-conflit)
- [x] Implement getUserReservations function
- [x] Implement getCourtReservations function
- [x] Implement updateReservation function
- [x] Implement cancelReservation function
- [ ] Write unit tests for reservation service

### 2.8 Service Layer - Slot Service (Day 8) ✅ COMPLETED
- [x] Create src/services/slotService.ts
- [x] Implement getMoniteurSlots function
- [x] Implement getAvailableSlots function
- [x] Implement createSlot function
- [x] Implement updateSlot function
- [x] Implement bookSlot function
- [x] Implement cancelSlotBooking function
- [ ] Write unit tests for slot service

### 2.9 Error Boundaries (Day 8) ✅ COMPLETED
- [x] Create src/components/ui/ErrorBoundary/ErrorBoundary.tsx
- [x] Create src/components/ui/ErrorBoundary/RootErrorBoundary.tsx
- [x] Implement Firebase error classification
- [x] Add user-friendly error messages

### 2.10 Router Configuration (Day 8) ✅ COMPLETED
- [x] Create src/router.tsx
- [x] Implement data router with loaders
- [x] Add protected routes by role
- [x] Add error elements

**Deliverables:**
- ✅ Complete TypeScript type system (7 type files)
- ✅ Auth context with session management
- ✅ 7 custom hooks created
- ✅ 4 service layers (user, court, reservation, slot)
- ✅ Error boundaries with Firebase error handling
- ✅ React Router v6.4+ data router
- ✅ Firestore indexes (11 composite indexes)
- ✅ Security rules (role-based)
- ✅ Seed script for emulator

---

## Phase 3: Common Components (Days 8-12) ✅ COMPLETED

### 3.1 Button Component (Day 8) ✅ COMPLETED
- [x] Create src/components/ui/Button/Button.tsx
- [x] Create Button.types.ts
- [x] Implement variants (primary, secondary, tertiary, ghost, danger)
- [x] Implement sizes (sm, md, lg)
- [x] Add loading state
- [x] Add animations (hover scale, active scale down)

### 3.2 Card Component (Day 8) ✅ COMPLETED
- [x] Create src/components/ui/Card/Card.tsx
- [x] Create CardHeader, CardTitle, CardContent, CardFooter sub-components
- [x] Implement elevation variants
- [x] Implement hoverable state
- [x] Add animations (hover elevation)

### 3.3 Input Components (Day 9) ✅ COMPLETED
- [x] Create src/components/ui/Input/Input.tsx
- [x] Create src/components/ui/Icon/Icon.tsx
- [x] Create src/components/ui/Chip/Chip.tsx
- [x] Add validation states (error, success)

### 3.4 Feedback Components (Day 9) ✅ COMPLETED
- [x] Create src/components/ui/Badge/Badge.tsx
- [x] Create src/components/ui/Avatar/Avatar.tsx
- [x] Create src/components/common/Skeleton/Skeleton.tsx
- [x] Create src/components/common/EmptyState/EmptyState.tsx
- [x] Add animations (pulse, fade in)

### 3.5 Navigation Components (Day 10) ✅ COMPLETED
- [x] Create src/components/layout/TopNavBar/TopNavBar.tsx
- [x] Create src/components/layout/SideNavBar/SideNavBar.tsx
- [x] Create src/components/layout/BottomNavBar/BottomNavBar.tsx
- [x] Add animations (glassmorphism, slide)

### 3.6 Layout Components (Day 10-11) ✅ COMPLETED
- [x] Create src/components/layout/PageContainer/PageContainer.tsx
- [x] Create src/components/layout/HeroSection/HeroSection.tsx
- [x] Create src/components/layout/StatsCard/StatsCard.tsx
- [x] Create src/components/layout/MaintenanceNoteCard/MaintenanceNoteCard.tsx
- [x] Create src/components/layout/LocationCard/LocationCard.tsx

### 3.7 Court Components (Day 11) ✅ COMPLETED
- [x] Create src/components/courts/CourtCard/CourtCard.tsx
- [x] Create src/components/courts/CourtGrid/CourtGrid.tsx
- [x] Create src/components/courts/TimeSlotCell/TimeSlotCell.tsx
- [x] Create src/components/courts/LoadingGrid/LoadingGrid.tsx
- [x] Add animations (entry fade, stagger)

### 3.8 Reservation Components (Day 12) ✅ COMPLETED
- [x] Create src/components/reservations/ReservationCard/ReservationCard.tsx
- [x] Create src/components/reservations/DateFilter/DateFilter.tsx
- [x] Create src/components/reservations/ViewToggle/ViewToggle.tsx
- [x] Add animations (entry fade, dropdown)

### 3.9 Common Components (Day 12) ✅ COMPLETED
- [x] Create src/components/common/FAB/FAB.tsx
- [x] Create src/components/common/FacilitiesCard/FacilitiesCard.tsx
- [x] Create src/components/common/PricingCard/PricingCard.tsx
- [x] Create src/components/common/ClubInsights/ClubInsights.tsx

### 3.10 Custom Hooks (Day 12) ✅ COMPLETED
- [x] Create src/hooks/useCourtGrid.ts
- [x] Create src/hooks/useDateFilter.ts
- [x] Create src/hooks/useViewToggle.ts
- [x] Create src/hooks/useReservations.ts

### 3.11 UI Animations (Day 12) ✅ COMPLETED
- [x] Install framer-motion
- [x] Add Tailwind animations (hover, focus, scale)
- [x] Add Framer Motion animations (entry/exit, stagger)
- [x] Respect prefers-reduced-motion

**Deliverables:**
- ✅ 31 UI components implemented
- ✅ 4 custom hooks created
- ✅ All components < 200 lines
- ✅ TypeScript strict (zero any)
- ✅ Tailwind Design System tokens
- ✅ ARIA labels for accessibility
- ✅ Framer Motion animations (14 components)
- ✅ Build successful (587 KB, 290ms)
- ✅ Type-check passed (0 errors)
- ✅ Audit PASS (0 critical, 0 major)
- ✅ Design conformity: 100/100

---

## Phase 4: Authentication Pages (Days 13-15) ✅ COMPLETED

### 4.1 Login Page (Day 13) ✅ COMPLETED
- [x] Create src/pages/auth/LoginPage/index.tsx
- [x] Create LoginForm component
- [x] Implement form validation
- [x] Add error handling
- [x] Add "Forgot Password" link
- [x] Add animations (entry fade, stagger inputs, error slide)
- [ ] Write unit tests
- [ ] Write E2E test for login flow

### 4.2 Registration Page (Day 13) ✅ COMPLETED
- [x] Create src/pages/auth/RegisterPage/index.tsx
- [x] Create RegisterForm component
- [x] Implement form validation
- [x] Add password strength indicator
- [x] Add terms acceptance checkbox
- [x] Add animations (entry fade, stagger inputs, strength meter)
- [ ] Write unit tests

### 4.3 Password Reset (Day 14) ✅ COMPLETED
- [x] Create src/pages/auth/ForgotPasswordPage/index.tsx
- [x] Create ForgotPasswordForm component
- [x] Implement email sending logic
- [x] Implement success message
- [x] Add animations (entry fade, success scale)
- [ ] Write unit tests

### 4.4 Auth Integration (Day 15) ✅ COMPLETED
- [x] Connect forms to useAuth hook
- [x] Handle auth errors
- [x] Add loading states
- [x] Implement redirect after login
- [x] Test with Firebase Emulator
- [x] Add Framer Motion animations
- [ ] Write E2E tests for auth flows

**Deliverables:**
- ✅ Complete authentication system
- ✅ Login, Register, Password Reset pages
- ✅ Framer Motion animations (14 components)
- ✅ TypeScript strict (zero any)
- ✅ ARIA labels for accessibility
- ✅ Error boundaries
- ✅ Role-based redirects
- ✅ Build successful
- ✅ Type-check passed
- ✅ Audit PASS (0 critical, 0 major)

---

## Phase 5: Court Components (Days 16-18) ✅ COMPLETED

### 5.1 Court Components (Day 16) ✅ COMPLETED
- [x] Create src/components/courts/CourtGrid/CourtGrid.tsx
- [x] Create src/components/courts/TimeSlotCell/TimeSlotCell.tsx (4 states)
- [x] Create src/components/courts/CourtHeader/CourtHeader.tsx
- [x] Create src/components/courts/TimeColumn/TimeColumn.tsx
- [x] Create src/components/courts/ViewToggle/ViewToggle.tsx
- [x] Create src/components/courts/AvailabilityLegend/AvailabilityLegend.tsx
- [x] Add Framer Motion animations (entry, stagger, hover)
- [ ] Write unit tests

### 5.2 Courts Page (Day 17) ✅ COMPLETED
- [x] Create src/components/courts/CourtCard/CourtCard.tsx (Admin)
- [x] Create src/components/courts/CourtCard/CourtCardClient.tsx
- [x] Create src/components/courts/StatusBadge/StatusBadge.tsx
- [x] Create src/components/courts/SurfacePreview/SurfacePreview.tsx
- [x] Implement court filtering (by type, status)
- [x] Add animations (card entry, hover scale)
- [ ] Write unit tests

### 5.3 Court Integration (Day 18) ✅ COMPLETED
- [x] Create src/components/courts/UpcomingPanel/UpcomingPanel.tsx
- [x] Create src/components/courts/UpcomingPanel/ReservationCard.tsx
- [x] Connect to courtService (read-only)
- [x] Handle loading states (LoadingGrid)
- [x] Handle error states
- [x] Add Framer Motion animations
- [ ] Write E2E tests

**Deliverables:**
- ✅ 12 court components implemented
- ✅ TypeScript strict (zero any)
- ✅ Tailwind Design System tokens
- ✅ ARIA labels for accessibility
- ✅ Framer Motion animations (grid stagger, hover, entry)
- ✅ PNG audit compliance (colors, spacing, states)
- ✅ Build successful
- ✅ Type-check passed
- ✅ Audit PASS (0 critical, 0 major)
- ✅ Design conformity: 95/100

---

## Phase 6: Reservation System (Days 19-24) ✅ COMPLETED

### 6.1 Reservation Service (Day 19) ✅ COMPLETED
- [x] Extend src/services/reservationService.ts
- [x] Implement createReservation with transaction
- [x] Implement updateReservation
- [x] Implement cancelReservation
- [x] Implement checkCourtAvailability
- [x] Implement subscribeToUserReservations (onSnapshot)
- [x] Add real-time subscriptions
- [ ] Write unit tests

### 6.2 Reservation Components (Day 20-21) ✅ COMPLETED
- [x] Create src/components/reservations/TimeSlotGrid/TimeSlotGrid.tsx
- [x] Create src/components/reservations/CourtSelector/CourtSelector.tsx
- [x] Create src/components/reservations/BookingForm/BookingForm.tsx (3-step wizard)
- [x] Create src/components/reservations/BookingConfirmationModal/BookingConfirmationModal.tsx
- [x] Create src/components/reservations/MyReservationsList/MyReservationsList.tsx
- [x] Create src/components/reservations/ReservationActions/ReservationActions.tsx
- [x] Create src/components/reservations/ReservationFilters/ReservationFilters.tsx
- [x] Create src/components/reservations/StatsCards/StatsCards.tsx
- [x] Create src/components/reservations/RealtimeGrid/RealtimeGrid.tsx
- [x] Create src/components/shared/ConfirmDialog/ConfirmDialog.tsx
- [x] Add Framer Motion animations
- [ ] Write unit tests

### 6.3 Booking Page (Day 22-23) ✅ COMPLETED
- [x] Create src/pages/client/BookingPage/index.tsx
- [x] Implement date selection step
- [x] Implement court selection step
- [x] Implement time slot selection step
- [x] Implement booking confirmation
- [x] Handle conflicts and errors
- [x] Add focus trap in modals
- [x] Add keyboard navigation (Escape, Tab)
- [ ] Write unit tests
- [ ] Write E2E test for booking flow

### 6.4 My Reservations Page (Day 24) ✅ COMPLETED
- [x] Create src/pages/client/MyReservationsPage/index.tsx
- [x] Implement reservation list with filters
- [x] Implement cancel reservation
- [x] Implement reschedule reservation
- [x] Add real-time updates (onSnapshot)
- [x] Handle loading states
- [x] Handle error states
- [ ] Write unit tests

**Deliverables:**
- ✅ 11 reservation components implemented
- ✅ 2 hooks (useBooking, useRealtimeReservations)
- ✅ 2 pages (BookingPage, MyReservationsPage)
- ✅ TypeScript strict (zero any)
- ✅ Tailwind Design System tokens
- ✅ ARIA labels for accessibility
- ✅ Framer Motion animations
- ✅ Focus traps in modals
- ✅ Firebase patterns (onSnapshot + unsubscribe)
- ✅ Build successful
- ✅ Type-check passed
- ✅ Audit PASS (0 critical, 0 major)
- ✅ Design conformity: 95/100

---

## Phase 7: Client & Moniteur Dashboards (Days 25-32)

### 7.1 Landing Page (Day 25) ✅ COMPLETED
- [x] Create src/components/landing/HeroSection/HeroSection.tsx
- [x] Create src/components/landing/CourtCard/CourtCard.tsx
- [x] Create src/components/landing/LiveAvailabilityGrid/LiveAvailabilityGrid.tsx
- [x] Create src/components/landing/PricingCard/PricingCard.tsx
- [x] Create src/components/landing/PricingSection/PricingSection.tsx
- [x] Create src/components/landing/FacilitiesBentoGrid/FacilitiesBentoGrid.tsx
- [x] Create src/components/landing/TopNavBar/TopNavBar.tsx
- [x] Create src/components/landing/Footer/Footer.tsx
- [x] Create src/hooks/useLandingData.ts
- [x] Create src/utils/courtAvailability.ts
- [x] Refactor src/pages/LandingPage.tsx (6 sections)
- [x] Add Framer Motion animations
- [x] PNG audit compliance (Hero, CourtGrid, Pricing, Facilities)
- [ ] Write unit tests
- [ ] Write E2E test

### 7.2 Client Dashboard (Day 26-27) ✅ COMPLETED
- [x] Create src/components/client/DashboardHero/DashboardHero.tsx
- [x] Create src/components/client/StatsCardsGrid/StatsCardsGrid.tsx
- [x] Create src/components/client/StatCard/StatCard.tsx
- [x] Create src/components/client/InteractiveCourtGrid/InteractiveCourtGrid.tsx
- [x] Create src/components/client/CourtGridCell/CourtGridCell.tsx
- [x] Create src/components/client/UpcomingReservationsList/UpcomingReservationsList.tsx
- [x] Create src/components/client/ReservationCard/ReservationCard.tsx
- [x] Create src/components/client/ClubMaintenanceNote/ClubMaintenanceNote.tsx
- [x] Create src/components/client/LocationWidget/LocationWidget.tsx
- [x] Create src/hooks/useClientDashboard.ts
- [x] Update src/pages/client/Dashboard.tsx
- [x] Add Framer Motion animations
- [x] PNG audit compliance (Hero, Stats, CourtGrid, Upcoming)
- [x] TypeScript strict (zero any)
- [x] Tailwind Design System tokens (mint, terracotta, coral)
- [x] Firebase patterns (onSnapshot + unsubscribe)
- [x] Audit PASS (0 critical, 0 major)
- [ ] Write unit tests

### 7.3 Moniteur Dashboard (Day 28-32) ✅ COMPLETED
- [x] Étape 0: Audit PNG (17 éléments critiques)
- [x] Étape 1: Architecture (7 sections, 8 composants)
- [x] Étape 2: Firebase (4 indexes, security rules, seed)
- [x] Étape 3: Implémentation (12 fichiers créés/modifiés)
- [x] Étape 4: Audit Code (PASS, 96/100 design)
- [x] Étape 5: Animations Framer Motion (8 composants)
- [x] Create src/types/moniteur.types.ts
- [x] Create src/hooks/useMoniteurDashboard.ts
- [x] Create src/components/moniteur/WeeklyCalendar/WeeklyCalendar.tsx
- [x] Create src/components/moniteur/SessionBlock/SessionBlock.tsx
- [x] Create src/components/moniteur/DefineSlotPanel/DefineSlotPanel.tsx
- [x] Create src/components/moniteur/SessionTypeToggle/SessionTypeToggle.tsx
- [x] Create src/components/moniteur/UpcomingLessonCard/UpcomingLessonCard.tsx
- [x] Create src/components/moniteur/AvatarStack/AvatarStack.tsx
- [x] Create src/components/moniteur/ParticipantsPanel/ParticipantsPanel.tsx
- [x] Create src/components/moniteur/ClubEfficiencyCard/ClubEfficiencyCard.tsx
- [x] Update src/services/slotService.ts (5 fonctions utilitaires)
- [x] Update src/pages/moniteur/Dashboard.tsx
- [x] PNG audit compliance (PRO=#006b3f, GROUP=#9d431b)
- [x] TypeScript strict (zero any, ReservationData, ReservationInput)
- [x] Tailwind Design System tokens
- [x] Firebase patterns (onSnapshot + unsubscribe, try/catch)
- [x] Accessibility WCAG 2.1 AA (ARIA, reduced motion)
- [x] Audit PASS (0 critical, 0 major, 96/100 design)
- [ ] Write unit tests

### 7.4 Client Profile (Day 33-34) ✅ COMPLETED
- [x] Étape 0: Audit PNG (10 éléments critiques, aucun PNG spécifique)
- [x] Étape 1: Architecture (7 sections, 6 composants)
- [x] Étape 2: Firebase (security rules users, seed 5 clients)
- [x] Étape 3: Implémentation (8 fichiers créés/modifiés)
- [x] Étape 4: Audit Code (PASS, 95/100 design)
- [x] Create src/firebase/types.ts (interfaces ClientProfile, NotificationPreferences, PasswordChangeInput)
- [x] Create src/hooks/useClientProfile.ts
- [x] Create src/components/client/ClientProfile/ProfileSection.tsx
- [x] Create src/components/client/ClientProfile/AvatarPicker.tsx
- [x] Create src/components/client/ClientProfile/ProfileForm.tsx
- [x] Create src/components/client/ClientProfile/NotificationPreferences.tsx
- [x] Create src/pages/client/components/PasswordChangeForm.tsx
- [x] Update src/pages/client/Profile.tsx
- [x] Implement profile form (name, email read-only, phone, avatar)
- [x] Implement password change form (re-authentication, strength indicator)
- [x] Implement notification preferences (email/SMS toggles, auto-save)
- [x] TypeScript strict (zero any, explicit types)
- [x] Tailwind Design System tokens (surface-container-lowest, primary, etc.)
- [x] Firebase patterns (onSnapshot + unsubscribe, try/catch)
- [x] Accessibility WCAG 2.1 AA (role="main", ARIA labels, role="switch")
- [x] Audit PASS (0 critical, 0 major, 95/100 design)
- [ ] Write unit tests

**Deliverables:**
- ✅ Landing Page complete (8 components + 1 hook)
- ✅ Client Dashboard complete (10 components + 1 hook)
- ✅ Moniteur Dashboard complete (8 components + 1 hook + 5 services)
- ✅ Client Profile complete (6 components + 1 hook + 3 interfaces)
- ✅ TypeScript strict (zero any)
- ✅ Tailwind Design System tokens (mint, terracotta, coral, stats, court, surface)
- ✅ ARIA labels for accessibility
- ✅ Framer Motion animations (20+ composants total)
- ✅ Firebase patterns (onSnapshot + unsubscribe, getDocs, transactions, updatePassword)
- ✅ Build successful (0 errors)
- ✅ Type-check passed (0 errors)
- ✅ Audit PASS (0 critical, 0 major)
- ✅ Design conformity: 95/100

---

## Phase 8: Admin Features (Days 34-40)

### 8.1 Admin Dashboard (Day 34-36) ✅ COMPLETED
- [x] Étape 0: Audit PNG (16 éléments critiques)
- [x] Étape 1: Architecture (7 sections, 9 composants)
- [x] Étape 2: Firebase (5 indexes, security rules admin, seed)
- [x] Étape 3: Implémentation (13 fichiers créés/modifiés)
- [x] Étape 4: Audit Code (PASS, 96/100 design)
- [x] Create src/components/ui/ErrorBoundary/AdminErrorBoundary.tsx
- [x] Create src/hooks/useAdminDashboard.ts (stats temps réel)
- [x] Create src/hooks/useCourtUtilization.ts (données chart)
- [x] Create src/hooks/useUserDirectory.ts (search/filter/pagination)
- [x] Create src/hooks/useCourtDeployment.ts (toggle maintenance)
- [x] Create src/pages/admin/components/AdminDashboard/LiveTimestamp.tsx
- [x] Create src/pages/admin/components/AdminDashboard/StatsCardsGrid.tsx
- [x] Create src/pages/admin/components/AdminDashboard/CourtUtilizationChart.tsx (8 barres)
- [x] Create src/pages/admin/components/AdminDashboard/BlockCourtPanel.tsx (fond #9d431b)
- [x] Create src/pages/admin/components/AdminDashboard/CourtDeploymentGrid.tsx
- [x] Create src/pages/admin/components/AdminDashboard/CourtDeploymentCard.tsx (border-l-4)
- [x] Create src/pages/admin/components/AdminDashboard/UserDirectoryTable.tsx
- [x] Update src/pages/admin/Dashboard.tsx
- [x] Implement stats cards (Active Bookings, Maintenance, Available Slots)
- [x] Implement court utilization chart (12 barres 06:00-21:00)
- [x] Implement block court form (fond secondary, texte blanc)
- [x] Implement court deployment grid (6 courts avec toggle switches)
- [x] Implement user directory table (searchable, filterable, pagination)
- [x] TypeScript strict (zero any, explicit types)
- [x] Tailwind Design System tokens (primary, secondary, surface)
- [x] Firebase patterns (onSnapshot + unsubscribe, try/catch, transactions)
- [x] Accessibility WCAG 2.1 AA (ARIA labels, roles, keyboard navigation)
- [x] Audit PASS (0 critical, 0 major, 96/100 design)
- [ ] Write unit tests

### 8.2 User Management (Day 36-37) ✅ COMPLETED
- [x] Étape 0: Audit PNG (10 éléments critiques)
- [x] Étape 1: Architecture (7 sections, 9 composants)
- [x] Étape 2: Firebase (4 indexes, security rules, seed 18 users)
- [x] Étape 3: Implémentation (10 fichiers créés)
- [x] Étape 4: Audit Code (PASS)
- [x] Create src/components/users/RoleBadge/RoleBadge.tsx (ADMIN: bg-#ffdbce)
- [x] Create src/components/users/StatusIndicator/StatusIndicator.tsx (🟢🟡⚫)
- [x] Create src/components/users/UserActionsMenu/UserActionsMenu.tsx
- [x] Create src/components/users/UserCard/UserCard.tsx
- [x] Create src/components/users/UserDirectory/UserDirectory.tsx (5 colonnes)
- [x] Create src/pages/admin/AdminUsersPage/components/AddUserModal.tsx
- [x] Create src/pages/admin/AdminUsersPage/components/EditUserModal.tsx
- [x] Create src/pages/admin/AdminUsersPage/components/DeleteConfirmDialog.tsx
- [x] Create src/hooks/useUserDirectory.ts (CRUD + search + filter)
- [x] Create src/pages/admin/AdminUsersPage/index.tsx
- [x] Implement user CRUD operations (create, update, delete)
- [x] Implement search + role/status filters
- [x] Implement pagination (Prev white, Next primary)
- [x] TypeScript strict (zero any, helper function userRoleToRoleType)
- [x] Tailwind Design System tokens (secondary-fixed, primary-fixed)
- [x] Firebase patterns (onSnapshot + unsubscribe, try/catch)
- [x] Accessibility WCAG 2.1 AA (ARIA labels, roles, keyboard navigation, focus trap)
- [x] Build successful (0 errors)
- [ ] Write unit tests

### 8.3 Court Management (Day 37-38) ✅ COMPLETED
- [x] Étape 0: Audit PNG (17 éléments critiques)
- [x] Étape 1: Architecture (7 sections, 8 composants)
- [x] Étape 2: Firebase (0 indexes requis, rules public read/admin write, seed 6 courts)
- [x] Étape 3: Implémentation (9 fichiers créés)
- [x] Étape 4: Audit Code (PASS, 96/100 design)
- [x] Create src/hooks/useAdminCourts.ts (CRUD complet avec getDocs/onSnapshot)
- [x] Create src/components/admin/CourtStatusToggle/CourtStatusToggle.tsx (w-4 h-4 knob)
- [x] Create src/components/admin/CourtCard/CourtCard.tsx (border-l-4 primary/secondary)
- [x] Create src/components/admin/CourtList/CourtList.tsx (grille responsive)
- [x] Create src/components/admin/CourtForm/CourtForm.tsx (formulaire CRUD)
- [x] Create src/pages/admin/AdminCourtsPage/components/AddCourtModal.tsx
- [x] Create src/pages/admin/AdminCourtsPage/components/EditCourtModal.tsx
- [x] Create src/pages/admin/AdminCourtsPage/components/DeleteCourtDialog.tsx
- [x] Create src/pages/admin/AdminCourtsPage/index.tsx
- [x] Implement court management form (number, name, type, surface, description)
- [x] Implement court status toggle (active/maintenance/closed)
- [x] Implement PNG audit compliance (border-l-4, text-3xl, tracking-tighter, w-4 h-4)
- [x] TypeScript strict (zero any, getDocs pour refresh)
- [x] Tailwind Design System tokens (primary, secondary, surface-container-lowest)
- [x] Firebase patterns (onSnapshot + unsubscribe, try/catch, Timestamp.now)
- [x] Accessibility WCAG 2.1 AA (ARIA labels, roles, keyboard navigation, Escape handler)
- [x] Build successful (0 errors)
- [ ] Write unit tests

### 8.4 Reservations Management (Day 38-40) ✅ COMPLETED
- [x] Étape 0: Audit PNG (27 éléments critiques)
- [x] Étape 1: Architecture (7 sections, 10 composants + 3 hooks)
- [x] Étape 2: Firebase (3 indexes, rules admin read/write, seed 25 réservations)
- [x] Étape 3: Implémentation (13 fichiers créés)
- [x] Étape 4: Audit Code (PASS, 95/100 design)
- [x] Create src/hooks/useAdminReservations.ts (CRUD + filtres + pagination)
- [x] Create src/hooks/useTodaysReservations.ts (réservations du jour)
- [x] Create src/pages/admin/components/ViewToggle.tsx (Today/Weekly)
- [x] Create src/pages/admin/components/ReservationCell.tsx (PRO #006b3f, GROUP #9d431b, Libre #f0f5ee)
- [x] Create src/pages/admin/components/ReservationActionsMenu.tsx (Edit/Cancel/Complete)
- [x] Create src/pages/admin/components/ReservationStatsCards.tsx (3 stats cards)
- [x] Create src/pages/admin/components/ReservationFilters.tsx (date, court, status, type + search)
- [x] Create src/pages/admin/components/UpcomingReservationCard.tsx
- [x] Create src/pages/admin/components/UpcomingTodaySidebar.tsx (sidebar 300px)
- [x] Create src/pages/admin/components/ReservationsCalendar.tsx (grille 5 courts × 16 heures)
- [x] Create src/pages/admin/components/EditReservationModal.tsx (focus trap, validation)
- [x] Create src/pages/admin/components/CancelConfirmDialog.tsx (reason field, notification toggle)
- [x] Create src/pages/admin/AdminReservationsPage/index.tsx
- [x] Implement reservations calendar (06:00-22:00, 5 colonnes)
- [x] Implement reservation filters (date range, court, status, type, search)
- [x] Implement admin reservation actions (edit, cancel, complete)
- [x] TypeScript strict (zero any, zero type assertions)
- [x] Tailwind Design System tokens (primary, secondary, surface)
- [x] Firebase patterns (onSnapshot + unsubscribe, try/catch, Timestamp.now)
- [x] Accessibility WCAG 2.1 AA (ARIA labels, roles, focus traps, Escape handlers)
- [x] Build successful (0 errors)
- [ ] Write unit tests

### 8.5 Admin Integration (Day 39-40)
- [ ] Connect all admin features to services
- [ ] Implement real-time updates
- [ ] Handle admin-specific errors
- [ ] Write E2E tests for admin flows

**Deliverables:**
- ✅ Admin dashboard complete (9 components + 4 hooks)
- ✅ User management complete (9 components + 1 hook)
- ✅ Court management complete (8 components + 1 hook)
- ✅ Reservations Management complete (10 components + 2 hooks)

---

## Phase 9: Polish & Refinement (Days 41-44)

### 9.1 Design Polish (Day 41-42)
- [ ] Review all pages against design system
- [ ] Fix color inconsistencies
- [ ] Improve spacing and layout
- [ ] Add loading skeletons
- [ ] Add empty states
- [ ] Add error states
- [ ] Test responsive design

### 9.2 Accessibility (Day 43)
- [ ] Add ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Add focus indicators
- [ ] Test with screen reader
- [ ] Fix color contrast issues
- [ ] Add skip links

### 9.3 Performance (Day 44)
- [ ] Implement code splitting
- [ ] Optimize bundle size
- [ ] Add lazy loading for routes
- [ ] Optimize images
- [ ] Implement service worker (PWA)
- [ ] Run Lighthouse audit

**Deliverables:**
- ⏳ Polished UI
- ⏳ Accessible application
- ⏳ Optimized performance

---

## Phase 10: Testing & QA (Days 45-49)

### 10.1 Unit Test Coverage (Day 45-46)
- [ ] Achieve 80%+ code coverage
- [ ] Test all utility functions
- [ ] Test all hooks
- [ ] Test all services
- [ ] Test all components
- [ ] Fix failing tests

### 10.2 Integration Tests (Day 47)
- [ ] Test service layer with Emulator
- [ ] Test security rules
- [ ] Test real-time subscriptions
- [ ] Fix integration issues

### 10.3 E2E Tests (Day 48)
- [ ] Write E2E tests for all critical flows
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Fix E2E failures

### 10.4 Bug Fixes (Day 49)
- [ ] Review and fix all reported bugs
- [ ] Test edge cases
- [ ] Verify error handling
- [ ] Final QA pass

**Deliverables:**
- ⏳ Comprehensive test suite
- ⏳ All tests passing
- ⏳ Bug-free application

---

## Phase 11: Deployment (Days 50-52)

### 11.1 Production Setup (Day 50)
- [ ] Create production Firebase project
- [ ] Deploy Firestore rules
- [ ] Deploy Firestore indexes
- [ ] Configure production environment variables
- [ ] Set up Firebase Hosting

### 11.2 Build & Deploy (Day 51)
- [ ] Build for production
- [ ] Test production build locally
- [ ] Deploy to Firebase Hosting
- [ ] Verify deployment
- [ ] Test production environment

### 11.3 Monitoring & Analytics (Day 52)
- [ ] Set up Firebase Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Configure logging
- [ ] Set up alerts
- [ ] Create runbook

**Deliverables:**
- ⏳ Production deployment
- ⏳ Monitoring configured
- ⏳ Live application

---

## Phase 13: Post-Launch (Ongoing)

### 13.1 User Feedback
- [ ] Collect user feedback
- [ ] Monitor analytics
- [ ] Track error rates
- [ ] Prioritize improvements

### 13.2 Iterative Improvements
- [ ] Implement requested features
- [ ] Fix reported bugs
- [ ] Optimize performance
- [ ] Update documentation

### 13.3 Maintenance
- [ ] Regular dependency updates
- [ ] Security patches
- [ ] Firebase rule audits
- [ ] Performance monitoring

---

## Summary

| Phase | Duration | Deliverables | Status |
|-------|----------|--------------|--------|
| 1. Project Setup | 3 days | Dev environment, Firebase, Tailwind | ✅ COMPLETED |
| 2. Core Infrastructure | 4 days | Types, hooks, services | ✅ COMPLETED |
| 3. Common Components | 5 days | Component library | ✅ COMPLETED |
| 4. Authentication | 3 days | Login, Register, Reset | ✅ COMPLETED |
| 5. Court Components | 3 days | Court display | ✅ COMPLETED |
| 6. Reservation System | 6 days | Booking system | ✅ COMPLETED |
| 7.1 Landing Page | 1 day | 8 components + 1 hook | ✅ COMPLETED |
| 7.2 Client Dashboard | 2 days | 10 components + 1 hook | ✅ COMPLETED |
| 7.3 Moniteur Dashboard | 5 days | 8 components + 1 hook + 5 services | ✅ COMPLETED |
| 7.4 Client Profile | 2 days | 6 components + 1 hook + 3 interfaces | ✅ COMPLETED |
| 8.1 Admin Dashboard | 3 days | 9 components + 4 hooks | ✅ COMPLETED |
| 8.2 User Management | 2 days | 9 components + 1 hook | ✅ COMPLETED |
| 8.3 Court Management | 2 days | 8 components + 1 hook | ✅ COMPLETED |
| 8.4 Reservations Management | 3 days | 10 components + 2 hooks | ✅ COMPLETED |
| 8.5 Admin Integration | 1 day | Real-time updates, error handling | ⏳ PENDING |
| 9. Polish & Refinement | 4 days | Design, a11y, performance | ⏳ PENDING |
| 10. Testing | 5 days | Test coverage | ⏳ PENDING |
| 11. Deployment | 3 days | Production launch | ⏳ PENDING |
| **Total** | **63 days** | **Complete application** | **~85% COMPLETE** |

---

## Quick Reference

### Key Files Created
```
src/
├── config/
│   └── firebase.config.ts ✅
├── types/
│   ├── user.types.ts ✅
│   ├── court.types.ts ✅
│   ├── reservation.types.ts ✅
│   ├── slot.types.ts ✅
│   ├── service.types.ts ✅
│   ├── error.types.ts ✅
│   └── moniteur.types.ts ✅
├── services/
│   ├── userService.ts ✅
│   ├── courtService.ts ✅
│   ├── reservationService.ts ✅
│   └── slotService.ts ✅
├── components/
│   ├── common/ ✅ (Button, Card, Input, Badge, Avatar, Skeleton, etc.)
│   ├── layout/ ✅ (Navbar, Sidebar, PageContainer, HeroSection, etc.)
│   ├── courts/ ✅ (CourtCard, CourtGrid, TimeSlotCell, etc.)
│   ├── reservations/ ✅ (ReservationCard, BookingForm, etc.)
│   ├── landing/ ✅ (HeroSection, LiveAvailabilityGrid, PricingCard, etc.)
│   ├── client/ ✅ (DashboardHero, StatsCardsGrid, InteractiveCourtGrid, etc.)
│   └── moniteur/ ✅ (WeeklyCalendar, SessionBlock, DefineSlotPanel, etc.)
├── hooks/
│   ├── useAuth.ts ✅
│   ├── useNavigation.ts ✅
│   ├── useCourts.ts ✅
│   ├── useReservations.ts ✅
│   ├── useClientDashboard.ts ✅
│   └── useMoniteurDashboard.ts ✅
├── pages/
│   ├── auth/ ✅ (Login, Register, ForgotPassword)
│   ├── client/ ✅ (Dashboard, BookingPage, MyReservationsPage)
│   └── moniteur/ ✅ (Dashboard)
└── contexts/
    └── AuthContext.tsx ✅
```

### Essential Commands
```bash
# Development
npm run dev
firebase emulators:start

# Testing
npm run test
npm run test:e2e

# Build & Deploy
npm run build
firebase deploy
```

---

## Next Steps

**Current Progress: ~85% COMPLETE**

✅ **Completed Phases (1-8.4):**
- Project setup and infrastructure
- Core services and hooks
- Component library (73+ components)
- Authentication system
- Court and reservation components
- Landing Page
- Client Dashboard
- Moniteur Dashboard
- Client Profile
- Admin Dashboard
- User Management
- Court Management
- **Reservations Management** (NEW ✅)

⏳ **Remaining Phases (8.5-11):**
- **Phase 8.5**: Admin Integration (1 day)
  - Real-time updates
  - Error handling
  - E2E tests
- **Phase 9**: Polish & Refinement (4 days)
- **Phase 10**: Testing & QA (5 days)
- **Phase 11**: Deployment (3 days)

**Prochainement :** Commencer la **Phase 8.5 : Admin Integration**
