# 08. User Flows & Feature Specifications

## Complete Feature Specifications by User Role

This document details all user flows, features, and interactions for the Tennis Club du François application.

---

## 1. User Roles Overview

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Club administrator | Full system access |
| **Moniteur** | Tennis instructor | Schedule & lesson management |
| **Client** | Club member/guest | Court booking & reservations |

---

## 2. Admin Features

### 2.1 Admin Dashboard (Supervision)

**Route:** `/admin/dashboard`

#### Features
- Real-time court utilization metrics
- Live reservation feed
- Court deployment status
- User directory with search/filter
- Quick actions (block court, add user)

#### Data Sources
- `reservations` - Real-time feed via `onSnapshot`
- `courts` - Court status toggles
- `users` - User directory

#### UI Components
```tsx
<AdminDashboard>
  <StatsCards>
    <StatCard title="Active Bookings" value={activeBookings} trend="+12%" />
    <StatCard title="Maintenance" value={maintenanceCount} trend="-50%" />
    <StatCard title="Available Slots" value={availableSlots} trend="+8%" />
  </StatsCards>
  
  <CourtUtilizationChart data={utilizationData} />
  
  <BlockCourtForm onBlock={handleBlockCourt} />
  
  <CourtDeploymentGrid courts={courts} onToggle={handleToggleCourt} />
  
  <UserDirectory users={users} onAction={handleUserAction} />
</AdminDashboard>
```

#### Actions
1. **Block Court**
   - Select court from dropdown
   - Set start/end time
   - Add reason (optional)
   - Confirm → Creates maintenance reservation

2. **Toggle Court Status**
   - Click toggle switch on court card
   - Active ↔ Maintenance
   - Updates `courts/{id}.is_active`

3. **Manage Users**
   - Search by name/email
   - Filter by role
   - Click action menu → Edit/Delete

---

### 2.2 User Management

**Route:** `/admin/users`

#### Features
- View all users in searchable table
- Filter by role (Admin/Moniteur/Client)
- Filter by status (Online/Away/Inactive)
- Add new user
- Edit user details
- Delete user account

#### User Table Columns
| Column | Description |
|--------|-------------|
| Name | Full name with avatar |
| Email | Email address |
| Role | Badge (Admin/Moniteur/Client) |
| Status | Indicator (🟢 Online/🟡 Away/⚫ Inactive) |
| Actions | Edit/Delete buttons |

#### Add User Flow
```
1. Click "Add User" button
2. Fill form:
   - Name (required)
   - Email (required)
   - Password (required)
   - Role (dropdown: Admin/Moniteur/Client)
   - Phone (optional)
3. Click "Create User"
4. User document created in Firestore
5. Auth account created
```

---

### 2.3 Court Management

**Route:** `/admin/courts`

#### Features
- View all courts in grid
- Edit court details
- Toggle active/maintenance status
- Add new court
- Delete court

#### Court Details Form
```typescript
interface CourtForm {
  number: number;
  name: string;
  type: 'Quick' | 'Terre';
  surface: 'Hard' | 'Clay' | 'Grass' | 'Synthetic';
  status: 'active' | 'maintenance' | 'closed';
  is_active: boolean;
  description?: string;
  image?: string;
}
```

---

### 2.4 Reservations Overview

**Route:** `/admin/reservations`

#### Features
- View all reservations (calendar view)
- Filter by date range
- Filter by court
- Filter by status
- Cancel any reservation
- Edit any reservation

#### Calendar View
- Time grid: 06:00 - 22:00
- Courts as rows
- Color-coded by type:
  - Primary green: Quick courts (1-4)
  - Secondary ocre: Terre courts (5-6)
  - Gray: Maintenance

---

## 3. Moniteur Features

### 3.1 Moniteur Dashboard

**Route:** `/moniteur/dashboard`

#### Features
- Today's schedule overview
- Upcoming lessons list
- Quick stats (occupancy, students)
- Define new slot panel

#### UI Components
```tsx
<MoniteurDashboard>
  <WeeklyCalendar slots={slots} onSlotClick={handleSlotClick} />
  
  <UpcomingLessons lessons={lessons}>
    <LessonCard
      time="14:00 - 15:30"
      type="GROUP"
      title="Intermediate Forehand"
      participants={4}
      court="Court 05"
    />
  </UpcomingLessons>
  
  <DefineSlotForm onSubmit={handleCreateSlot} />
  
  <ClubEfficiencyStats
    occupancy={75}
    students={24}
    growth="+15%"
  />
</MoniteurDashboard>
```

---

### 3.2 Schedule Management

**Route:** `/moniteur/schedule`

#### Features
- Weekly calendar view (Mon-Sun)
- Define availability slots
- Set session type (Private/Group)
- Set court preference
- View booked slots
- Cancel slots

#### Define New Slot Flow
```
1. Click "Add Slot" or empty time cell
2. Fill form:
   - Date picker
   - Start time (dropdown)
   - End time (dropdown)
   - Session type toggle (PRIVATE/GROUP)
   - Court preference (dropdown or "Any")
   - Max participants (for GROUP)
   - Description (optional)
3. Click "Publish Availability"
4. Slot saved to `slots_moniteurs`
5. Real-time update to calendar
```

#### Slot Form Data
```typescript
interface SlotFormData {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  type: 'PRIVATE' | 'GROUP';
  court_id: string | 'any';
  max_participants?: number;
  description?: string;
}
```

---

### 3.3 Student Management

**Route:** `/moniteur/students`

#### Features
- View student roster
- View student details
- Track attendance
- View student progress

#### Student Card
```tsx
<StudentCard>
  <Avatar name={student.name} />
  <div>
    <h4>{student.name}</h4>
    <p>{student.email}</p>
    <Badge variant="secondary">{student.level}</Badge>
  </div>
  <div className="text-sm text-on-surface/60">
    {student.sessionsAttended} sessions
  </div>
</StudentCard>
```

---

### 3.4 Lesson Session View

#### Participants Preview
```tsx
<ParticipantList slotId={slotId}>
  <ParticipantCard
    name="Jean Dupont"
    level="Intermediate"
    status="confirmed"
    avatar="url"
  />
  <ParticipantCard ... />
  {/* +N more indicator */}
</ParticipantList>
```

---

## 4. Client Features

### 4.1 Landing Page

**Route:** `/`

#### Sections
1. **Hero**
   - Tagline: "Precision on the Clay"
   - CTAs: "Book a Court", "View Pricing"

2. **Live Availability Grid**
   - 6 courts with real-time status
   - Next available time
   - Surface type indicators

3. **Facilities Bento Grid**
   - Clubhouse (large card)
   - Restaurant
   - Night Play (LED lighting)
   - Coaching

4. **Pricing Section**
   - Morning Sessions (06:00-10:00): €25/h
   - Prime Time (16:00-22:00): €45/h (Popular)
   - Weekend Pass: €35/h

---

### 4.2 Court Booking

**Route:** `/client/booking`

#### Features
- Interactive time slot grid
- Filter by court type
- Filter by date
- Real-time availability
- Instant confirmation

#### Booking Flow
```
1. Select date (default: today)
2. View time grid (06:00 - 22:00)
3. Click available slot
4. Booking modal opens:
   - Court name & surface
   - Date & time
   - Duration (1h default)
   - Player count
   - Notes (optional)
5. Click "Confirm Booking"
6. Transaction checks for conflicts
7. Reservation created
8. Confirmation shown
```

#### Time Slot Grid
```tsx
<TimeSlotGrid
  courts={courts}
  slots={reservations}
  date={selectedDate}
  onSlotClick={handleSlotClick}
/>
```

---

### 4.3 My Reservations

**Route:** `/client/reservations`

#### Features
- List of upcoming reservations
- Reservation history
- Cancel reservation
- Reschedule reservation

#### Reservation Card
```tsx
<ReservationCard>
  <div className="flex items-start justify-between">
    <div>
      <h4>Court {court.number} - {court.name}</h4>
      <p>{dayjs(start_time).format('dddd, MMMM D')}</p>
      <p>{dayjs(start_time).format('HH:mm')} - {dayjs(end_time).format('HH:mm')}</p>
    </div>
    <Badge variant={status === 'confirmed' ? 'success' : 'warning'}>
      {status}
    </Badge>
  </div>
  <div className="flex gap-2 mt-4">
    <Button variant="secondary" onClick={handleReschedule}>
      Reschedule
    </Button>
    <Button variant="danger" onClick={handleCancel}>
      Cancel
    </Button>
  </div>
</ReservationCard>
```

#### Cancel Flow
```
1. Click "Cancel" on reservation card
2. Confirmation modal:
   "Are you sure you want to cancel this reservation?"
3. Click "Confirm Cancel"
4. Reservation status updated to 'cancelled'
5. Card removed from upcoming list
```

---

### 4.4 Client Profile

**Route:** `/client/profile`

#### Features
- View profile details
- Edit personal information
- Change password
- View booking history
- Notification preferences

#### Profile Form
```typescript
interface ProfileForm {
  name: string;
  email: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
}
```

---

## 5. Authentication Flows

### 5.1 Login

**Route:** `/login`

#### Flow
```
1. Enter email
2. Enter password
3. Click "Sign In"
4. Firebase Auth validates credentials
5. User document fetched from Firestore
6. Redirect to role-specific dashboard
```

#### Error States
- Invalid credentials → "Incorrect email or password"
- Account disabled → "This account has been disabled"
- Network error → "Connection failed. Please try again."

---

### 5.2 Registration

**Route:** `/register`

#### Flow
```
1. Enter name
2. Enter email
3. Enter password
4. Confirm password
5. Enter phone (optional)
6. Click "Create Account"
7. Firebase Auth creates account
8. User document created with role: 'client'
9. Redirect to client dashboard
```

---

### 5.3 Password Reset

**Route:** `/forgot-password`

#### Flow
```
1. Enter email
2. Click "Send Reset Link"
3. Firebase sends email
4. User clicks link in email
5. Set new password
6. Redirect to login
```

---

## 6. Real-Time Updates

### Subscription Patterns

#### Court Availability (Client)
```typescript
useEffect(() => {
  const unsubscribe = subscribeToCourtReservations(
    courtId,
    selectedDate,
    (reservations) => {
      setAvailableSlots(calculateAvailableSlots(reservations));
    }
  );
  
  return () => unsubscribe();
}, [courtId, selectedDate]);
```

#### Live Dashboard (Admin)
```typescript
useEffect(() => {
  const unsubscribe = subscribeToTodaysReservations((reservations) => {
    setStats(calculateStats(reservations));
    setRecentBookings(reservations);
  });
  
  return () => unsubscribe();
}, []);
```

#### Instructor Schedule (Moniteur)
```typescript
useEffect(() => {
  const unsubscribe = subscribeToMoniteurSlots(
    user.uid,
    weekStart,
    weekEnd,
    (slots) => {
      setWeeklySlots(slots);
    }
  );
  
  return () => unsubscribe();
}, [user.uid, weekStart, weekEnd]);
```

---

## 7. Error Handling

### Client-Side Validation

```typescript
// Reservation form validation
const validateBooking = (data: BookingForm): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.court_id) errors.push('Court is required');
  if (!data.date) errors.push('Date is required');
  if (!data.start_time) errors.push('Start time is required');
  if (data.end_time <= data.start_time) errors.push('End time must be after start time');
  if (data.participants < 1) errors.push('At least 1 participant required');
  if (data.participants > 10) errors.push('Maximum 10 participants');
  
  return {
    valid: errors.length === 0,
    errors
  };
};
```

### Server-Side Error Messages

```typescript
const errorMessages: Record<string, string> = {
  'Court already reserved': 'This court is already reserved for the selected time slot.',
  'Court not active': 'This court is currently under maintenance.',
  'Invalid time slot': 'Please select a time between 06:00 and 22:00.',
  'Maximum duration exceeded': 'Maximum booking duration is 2 hours.',
  'User not found': 'Please log in to make a reservation.',
  'Permission denied': 'You do not have permission to perform this action.'
};
```

---

## 8. Mobile Navigation

### Bottom Navigation (Mobile Only)

#### Client
```
[Home] [Courts] [+ FAB] [Reservations] [Profile]
```

#### Moniteur
```
[Dashboard] [Schedule] [+ FAB] [Students] [Account]
```

#### Admin
```
[Dashboard] [Users] [Courts] [Reservations] [Account]
```

---

## 9. Next Steps

After understanding user flows:
1. ✅ Review all feature specifications
2. ✅ Understand role-based access patterns
3. 📖 Proceed to [09_TESTING.md](./09_TESTING.md)
