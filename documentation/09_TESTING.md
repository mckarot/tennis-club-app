# 09. Testing Strategy

## Testing & Firebase Emulator Workflow

This document defines the complete testing strategy and development workflow using Firebase Emulator Suite.

---

## 1. Testing Pyramid

```
        /\
       /  \
      / E2E \       ~10% - Playwright/Cypress
     /--------\
    /   Integration \   ~30% - Service layer tests
   /----------------\
  /    Unit Tests    \  ~60% - Components, hooks, utils
 /--------------------\
```

---

## 2. Development Workflow

### Daily Development Loop

```bash
# Terminal 1: Start Firebase Emulators
firebase emulators:start

# Terminal 2: Start Vite Dev Server
npm run dev

# Terminal 3: Run tests in watch mode
npm run test:watch
```

### Emulator Suite Access

| Service | URL | Port |
|---------|-----|------|
| Firestore Emulator | http://localhost:4000/firestore | 8080 |
| Auth Emulator | http://localhost:4000/auth | 9099 |
| Emulator UI | http://localhost:4000 | 4000 |

---

## 3. Unit Testing

### Setup

**Install Dependencies:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Vite Config (`vite.config.ts`):**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    css: true,
  },
});
```

**Test Setup (`src/tests/setup.ts`):**
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

---

### Component Tests

#### Button Component Test

**File:** `src/components/common/Button/Button.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading...</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('Loading...');
  });

  it('applies variant classes', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    expect(container.firstChild).toHaveClass('from-primary');
  });

  it('applies size classes', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    expect(container.firstChild).toHaveClass('px-8', 'py-4');
  });
});
```

---

#### Card Component Test

**File:** `src/components/common/Card/Card.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';

describe('Card', () => {
  it('renders with default styling', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('bg-surface-container-lowest');
    expect(card).toHaveClass('rounded-xl');
  });

  it('applies hoverable class', () => {
    render(<Card hoverable>Hoverable</Card>);
    const card = screen.getByText('Hoverable').parentElement;
    expect(card).toHaveClass('hover:shadow-xl');
  });

  it('renders CardHeader', () => {
    render(
      <Card>
        <CardHeader><span>Header</span></CardHeader>
      </Card>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('renders CardTitle', () => {
    render(
      <Card>
        <CardTitle>Title</CardTitle>
      </Card>
    );
    expect(screen.getByText('Title')).toHaveClass('font-headline');
  });

  it('renders CardFooter with actions', () => {
    render(
      <Card>
        <CardFooter actions={<button>Action</button>}>
          Footer
        </CardFooter>
      </Card>
    );
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Action');
  });
});
```

---

### Hook Tests

#### useAuth Hook Test

**File:** `src/hooks/useAuth.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import * as userService from '@/services/userService';

vi.mock('@/services/userService');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides user context', async () => {
    const mockUser = { uid: '123', name: 'Test User', role: 'client' };
    vi.mocked(userService.onAuthStateChange).mockImplementation((callback) => {
      callback(mockUser);
      return vi.fn();
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
    expect(result.current.loading).toBe(false);
  });

  it('calls signOut service', async () => {
    vi.mocked(userService.signOutUser).mockResolvedValue();

    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.signOut();

    expect(userService.signOutUser).toHaveBeenCalledTimes(1);
  });
});
```

---

### Service Tests (Mocked)

**File:** `src/services/reservationService.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createReservation,
  checkCourtAvailability,
  cancelReservation
} from './reservationService';
import { db } from '@/config/firebase.config';
import { runTransaction, doc, getDoc } from 'firebase/firestore';

vi.mock('firebase/firestore');
vi.mock('@/config/firebase.config');

describe('reservationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkCourtAvailability', () => {
    it('returns available when no conflicts', async () => {
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
      
      const result = await checkCourtAvailability('court_01', new Date(), new Date());
      
      expect(result.available).toBe(true);
    });

    it('returns unavailable when conflict exists', async () => {
      const mockConflict = {
        id: 'res_123',
        court_id: 'court_01',
        start_time: { toMillis: () => Date.now() }
      };
      
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => mockConflict
      } as any);
      
      const result = await checkCourtAvailability('court_01', new Date(), new Date());
      
      expect(result.available).toBe(false);
      expect(result.conflict).toBeDefined();
    });
  });

  describe('createReservation', () => {
    it('creates reservation successfully', async () => {
      vi.mocked(runTransaction).mockResolvedValue('res_123');
      
      const result = await createReservation({
        court_id: 'court_01',
        user_id: 'user_123',
        start_time: { toDate: () => new Date() } as any,
        end_time: { toDate: () => new Date() } as any,
        type: 'location_libre',
        status: 'confirmed'
      });
      
      expect(result.success).toBe(true);
      expect(result.reservationId).toBe('res_123');
    });

    it('fails when court is not available', async () => {
      vi.mocked(runTransaction).mockRejectedValue(
        new Error('Court already reserved')
      );
      
      const result = await createReservation({
        court_id: 'court_01',
        user_id: 'user_123',
        start_time: { toDate: () => new Date() } as any,
        end_time: { toDate: () => new Date() } as any,
        type: 'location_libre',
        status: 'confirmed'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already reserved');
    });
  });
});
```

---

## 4. Integration Testing

### Firebase Emulator Integration

**File:** `src/tests/integration/reservation.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { initializeTestEnvironment, RulesTestContext } from '@firebase/rules-unit-testing';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { createReservation, getCourtReservations } from '@/services/reservationService';

let testEnv: RulesTestContext;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'tennis-francois-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Reservation Integration', () => {
  it('allows authenticated user to create reservation', async () => {
    const db = testEnv.authenticatedContext('user_123').firestore();
    
    // Seed court data
    await addDoc(collection(db, 'courts'), {
      id: 'court_01',
      number: 1,
      name: 'Test Court',
      is_active: true
    });
    
    // Create reservation
    const result = await createReservation({
      court_id: 'court_01',
      user_id: 'user_123',
      start_time: new Date(),
      end_time: new Date(Date.now() + 3600000),
      type: 'location_libre',
      status: 'confirmed'
    });
    
    expect(result.success).toBe(true);
  });

  it('prevents double booking same time slot', async () => {
    const db = testEnv.authenticatedContext('user_123').firestore();
    const startTime = new Date();
    const endTime = new Date(Date.now() + 3600000);
    
    // Create first reservation
    await createReservation({
      court_id: 'court_01',
      user_id: 'user_123',
      start_time: startTime,
      end_time: endTime,
      type: 'location_libre',
      status: 'confirmed'
    });
    
    // Try to create conflicting reservation
    const result = await createReservation({
      court_id: 'court_01',
      user_id: 'user_456',
      start_time: startTime,
      end_time: endTime,
      type: 'location_libre',
      status: 'confirmed'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('already reserved');
  });

  it('allows admin to read all reservations', async () => {
    const adminDb = testEnv.authenticatedContext('admin_001', { role: 'admin' }).firestore();
    
    // Seed reservations
    await addDoc(collection(adminDb, 'reservations'), {
      court_id: 'court_01',
      user_id: 'user_123',
      start_time: new Date(),
      type: 'location_libre'
    });
    
    const snapshot = await getDocs(collection(adminDb, 'reservations'));
    expect(snapshot.empty).toBe(false);
  });

  it('prevents client from reading other users data', async () => {
    const clientDb = testEnv.authenticatedContext('client_001', { role: 'client' }).firestore();
    
    // Try to read users collection (should fail)
    const snapshot = await getDocs(collection(clientDb, 'users'));
    
    // Security rules should prevent this
    expect(snapshot.docs.length).toBe(0);
  });
});
```

---

## 5. Security Rules Testing

**File:** `src/tests/security/firestore.rules.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

let testEnv: ReturnType<typeof initializeTestEnvironment>;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'tennis-francois-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore Security Rules', () => {
  describe('Users Collection', () => {
    it('allows admin to read any user', async () => {
      const adminDb = testEnv.authenticatedContext('admin_001', { role: 'admin' }).firestore();
      
      await setDoc(doc(adminDb, 'users', 'user_123'), {
        name: 'Test User',
        role: 'client'
      });
      
      const userDoc = await getDoc(doc(adminDb, 'users', 'user_123'));
      expect(userDoc.exists()).toBe(true);
    });

    it('prevents client from reading other users', async () => {
      const clientDb = testEnv.authenticatedContext('client_001', { role: 'client' }).firestore();
      
      await setDoc(doc(clientDb, 'users', 'user_123'), {
        name: 'Test User',
        role: 'client'
      });
      
      // Client can only read own profile
      const otherUser = await getDoc(doc(clientDb, 'users', 'user_456'));
      expect(otherUser.exists()).toBe(false);
    });

    it('allows only admin to update user role', async () => {
      const adminDb = testEnv.authenticatedContext('admin_001', { role: 'admin' }).firestore();
      
      await setDoc(doc(adminDb, 'users', 'user_123'), {
        name: 'Test User',
        role: 'client'
      });
      
      // Admin can update role
      await updateDoc(doc(adminDb, 'users', 'user_123'), {
        role: 'moniteur'
      });
      
      const updated = await getDoc(doc(adminDb, 'users', 'user_123'));
      expect(updated.data()?.role).toBe('moniteur');
    });
  });

  describe('Courts Collection', () => {
    it('allows anyone to read courts', async () => {
      const publicDb = testEnv.unauthenticatedContext();
      
      await setDoc(doc(publicDb, 'courts', 'court_01'), {
        name: 'Test Court',
        is_active: true
      });
      
      const court = await getDoc(doc(publicDb, 'courts', 'court_01'));
      expect(court.exists()).toBe(true);
    });

    it('prevents non-admin from writing courts', async () => {
      const clientDb = testEnv.authenticatedContext('client_001', { role: 'client' }).firestore();
      
      await expect(
        setDoc(doc(clientDb, 'courts', 'court_02'), {
          name: 'New Court',
          is_active: true
        })
      ).rejects.toThrow('Missing or insufficient permissions');
    });
  });

  describe('Reservations Collection', () => {
    it('allows authenticated user to create own reservation', async () => {
      const clientDb = testEnv.authenticatedContext('client_001').firestore();
      
      await expect(
        setDoc(doc(clientDb, 'reservations', 'res_001'), {
          court_id: 'court_01',
          user_id: 'client_001',
          start_time: new Date(),
          type: 'location_libre',
          status: 'confirmed'
        })
      ).resolves.not.toThrow();
    });

    it('prevents creating reservation for another user', async () => {
      const clientDb = testEnv.authenticatedContext('client_001').firestore();
      
      await expect(
        setDoc(doc(clientDb, 'reservations', 'res_002'), {
          court_id: 'court_01',
          user_id: 'client_456', // Different user
          start_time: new Date(),
          type: 'location_libre',
          status: 'confirmed'
        })
      ).rejects.toThrow('Missing or insufficient permissions');
    });

    it('allows user to update own reservation', async () => {
      const clientDb = testEnv.authenticatedContext('client_001').firestore();
      
      // Create reservation
      await setDoc(doc(clientDb, 'reservations', 'res_001'), {
        court_id: 'court_01',
        user_id: 'client_001',
        start_time: new Date(),
        type: 'location_libre',
        status: 'confirmed'
      });
      
      // Update own reservation
      await updateDoc(doc(clientDb, 'reservations', 'res_001'), {
        status: 'cancelled'
      });
      
      const updated = await getDoc(doc(clientDb, 'reservations', 'res_001'));
      expect(updated.data()?.status).toBe('cancelled');
    });
  });
});
```

---

## 6. E2E Testing

### Playwright Setup

**Install:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Config (`playwright.config.ts`):**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### E2E Test: Client Booking Flow

**File:** `e2e/booking.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Court Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Seed test data
    await page.request.post('/api/seed', {
      data: {
        users: [{ uid: 'client_001', email: 'client@test.com', role: 'client' }],
        courts: [{ id: 'court_01', name: 'Test Court', is_active: true }]
      }
    });
  });

  test('client can book a court', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'client@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to booking
    await page.waitForURL('/client/dashboard');
    await page.click('text=Book Court');
    await page.waitForURL('/client/booking');
    
    // Select date
    await page.click('[data-testid="date-today"]');
    
    // Select time slot
    await page.click('[data-testid="slot-court_01-10:00"]');
    
    // Fill booking form
    await page.fill('[name="participants"]', '2');
    await page.fill('[name="notes"]', 'Friendly match');
    
    // Confirm booking
    await page.click('button:has-text("Confirm Booking")');
    
    // Verify confirmation
    await expect(page.locator('text=Booking Confirmed')).toBeVisible();
    await expect(page.locator('[data-testid="reservation-card"]')).toBeVisible();
  });

  test('client can view upcoming reservations', async ({ page }) => {
    // Login and navigate to reservations
    await page.goto('/login');
    await page.fill('[name="email"]', 'client@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/client/dashboard');
    await page.click('text=My Reservations');
    await page.waitForURL('/client/reservations');
    
    // Verify reservation list
    await expect(page.locator('[data-testid="reservation-card"]')).toHaveCount(1);
    await expect(page.locator('text=Test Court')).toBeVisible();
  });

  test('client can cancel reservation', async ({ page }) => {
    // Login and navigate to reservations
    await page.goto('/client/reservations');
    
    // Click cancel button
    await page.click('button:has-text("Cancel")');
    
    // Confirm cancellation
    await page.click('button:has-text("Confirm Cancel")');
    
    // Verify cancellation
    await expect(page.locator('text=Reservation Cancelled')).toBeVisible();
  });
});
```

---

### E2E Test: Admin Dashboard

**File:** `e2e/admin.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('admin can view all users', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/admin/dashboard');
    
    // Navigate to users
    await page.click('text=Users');
    await page.waitForURL('/admin/users');
    
    // Verify user table
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount.greaterThan(0);
  });

  test('admin can block court for maintenance', async ({ page }) => {
    await page.goto('/admin/courts');
    
    // Click block court button
    await page.click('[data-testid="block-court-btn"]');
    
    // Fill block form
    await page.selectOption('[name="court_id"]', 'court_01');
    await page.fill('[name="start_time"]', '2024-01-20T06:00');
    await page.fill('[name="end_time"]', '2024-01-20T12:00');
    await page.fill('[name="reason"]', 'Scheduled maintenance');
    
    // Submit
    await page.click('button:has-text("Confirm Lockout")');
    
    // Verify court status changed
    await expect(page.locator('[data-testid="court_01-status"]'))
      .toHaveText('Maintenance');
  });
});
```

---

## 7. Test Commands

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

## 8. CI/CD Integration

### GitHub Actions

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload E2E report
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 9. Next Steps

After setting up testing:
1. ✅ Configure Firebase Emulator Suite
2. ✅ Write unit tests for all components
3. ✅ Write integration tests for services
4. ✅ Write E2E tests for critical flows
5. 📖 Proceed to [10_TODO_LIST.md](./10_TODO_LIST.md)
