# 05. Component Architecture

## React Component Structure for Tennis Club du François

This document defines the complete component hierarchy and architecture.

---

## 1. Component Directory Structure

```
src/components/
├── common/                    # Reusable base components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.types.ts
│   │   └── index.ts
│   ├── Card/
│   │   ├── Card.tsx
│   │   ├── Card.types.ts
│   │   └── index.ts
│   ├── Input/
│   │   ├── Input.tsx
│   │   ├── Input.types.ts
│   │   └── index.ts
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   ├── Modal.types.ts
│   │   └── index.ts
│   ├── Badge/
│   │   ├── Badge.tsx
│   │   ├── Badge.types.ts
│   │   └── index.ts
│   ├── Avatar/
│   │   ├── Avatar.tsx
│   │   ├── Avatar.types.ts
│   │   └── index.ts
│   ├── Skeleton/
│   │   ├── Skeleton.tsx
│   │   └── index.ts
│   └── EmptyState/
│       ├── EmptyState.tsx
│       └── index.ts
│
├── layout/                    # Layout components
│   ├── Navbar/
│   │   ├── Navbar.tsx
│   │   └── index.ts
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   ├── Footer/
│   │   ├── Footer.tsx
│   │   └── index.ts
│   ├── MobileNav/
│   │   ├── MobileNav.tsx
│   │   └── index.ts
│   ├── PageContainer/
│   │   ├── PageContainer.tsx
│   │   └── index.ts
│   └── ProtectedRoute/
│       ├── ProtectedRoute.tsx
│       └── index.ts
│
├── courts/                    # Court-related components
│   ├── CourtCard/
│   │   ├── CourtCard.tsx
│   │   ├── CourtCard.types.ts
│   │   └── index.ts
│   ├── CourtGrid/
│   │   ├── CourtGrid.tsx
│   │   ├── CourtGrid.types.ts
│   │   └── index.ts
│   ├── CourtStatus/
│   │   ├── CourtStatus.tsx
│   │   └── index.ts
│   └── CourtAvailability/
│       ├── CourtAvailability.tsx
│       └── index.ts
│
├── reservations/              # Reservation components
│   ├── ReservationCard/
│   │   ├── ReservationCard.tsx
│   │   └── index.ts
│   ├── ReservationForm/
│   │   ├── ReservationForm.tsx
│   │   ├── ReservationForm.types.ts
│   │   └── index.ts
│   ├── TimeSlotGrid/
│   │   ├── TimeSlotGrid.tsx
│   │   ├── TimeSlotGrid.types.ts
│   │   └── index.ts
│   ├── BookingCalendar/
│   │   ├── BookingCalendar.tsx
│   │   └── index.ts
│   └── ReservationList/
│       ├── ReservationList.tsx
│       └── index.ts
│
├── users/                     # User management components
│   ├── UserProfile/
│   │   ├── UserProfile.tsx
│   │   └── index.ts
│   ├── UserDirectory/
│   │   ├── UserDirectory.tsx
│   │   └── index.ts
│   ├── UserCard/
│   │   ├── UserCard.tsx
│   │   └── index.ts
│   └── RoleBadge/
│       ├── RoleBadge.tsx
│       └── index.ts
│
└── slots/                     # Instructor slot components
    ├── SlotCard/
    │   ├── SlotCard.tsx
    │   └── index.ts
    ├── SlotForm/
    │   ├── SlotForm.tsx
    │   └── index.ts
    ├── WeeklyCalendar/
    │   ├── WeeklyCalendar.tsx
    │   └── index.ts
    └── ParticipantList/
        ├── ParticipantList.tsx
        └── index.ts
```

---

## 2. Common Components

### 2.1 Button Component

**File:** `src/components/common/Button/Button.tsx`

```typescript
import React from 'react';
import { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/classNames';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-br from-primary to-primary-container text-white hover:opacity-90 focus:ring-primary',
        secondary: 'bg-secondary-container/10 text-secondary hover:bg-secondary-container/20 focus:ring-secondary',
        tertiary: 'bg-transparent text-primary underline hover:opacity-80 focus:ring-primary',
        ghost: 'bg-transparent text-on-surface hover:bg-surface-container-highest focus:ring-primary',
        danger: 'bg-tertiary text-white hover:opacity-90 focus:ring-tertiary',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      disabled: false,
    },
  }
);

export const Button: React.FC<ButtonProps & VariantProps<typeof buttonVariants>> = ({
  children,
  variant,
  size,
  disabled,
  loading,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size, disabled, className }))}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};
```

**Types:** `src/components/common/Button/Button.types.ts`

```typescript
import { HTMLAttributes, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}
```

---

### 2.2 Card Component

**File:** `src/components/common/Card/Card.tsx`

```typescript
import React from 'react';
import { CardProps } from './Card.types';
import { cn } from '@/utils/classNames';

export const Card: React.FC<CardProps> = ({
  children,
  className,
  elevation = 'default',
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-surface-container-lowest rounded-xl p-6 transition-shadow duration-200',
        elevation === 'default' && 'shadow-sm',
        elevation === 'raised' && 'shadow-md',
        elevation === 'overlay' && 'shadow-lg backdrop-blur-sm bg-surface-container-lowest/90',
        hoverable && 'hover:shadow-xl cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <h3 className={cn('font-headline text-xl font-semibold text-on-surface', className)}>
    {children}
  </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('text-body text-on-surface/80', className)}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string; actions?: React.ReactNode }> = ({
  children,
  className,
  actions,
}) => (
  <div className={cn('mt-4 pt-4 border-t border-surface-container-highest flex items-center justify-between', className)}>
    {children}
    {actions && <div className="flex gap-2">{actions}</div>}
  </div>
);
```

---

### 2.3 Badge Component

**File:** `src/components/common/Badge/Badge.tsx`

```typescript
import React from 'react';
import { BadgeProps, BadgeVariant } from './Badge.types';
import { cn } from '@/utils/classNames';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-surface-container-highest text-on-surface',
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary-container text-secondary',
  success: 'bg-primary-container text-white',
  warning: 'bg-secondary text-white',
  danger: 'bg-tertiary text-white',
  info: 'bg-primary-fixed text-primary',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        badgeVariants[variant],
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-4 py-1.5 text-base',
        className
      )}
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </span>
  );
};
```

**Types:** `src/components/common/Badge/Badge.types.ts`

```typescript
import { HTMLAttributes } from 'react';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}
```

---

### 2.4 Skeleton Component

**File:** `src/components/common/Skeleton/Skeleton.tsx`

```typescript
import React from 'react';
import { cn } from '@/utils/classNames';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  return (
    <div
      className={cn(
        'bg-surface-container-highest',
        variant === 'text' && 'rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-none',
        variant === 'rounded' && 'rounded-lg',
        animation === 'pulse' && 'animate-pulse',
        className
      )}
      style={{
        width: width || (variant === 'circular' ? height : '100%'),
        height: height || (variant === 'text' ? '1em' : undefined),
      }}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className,
}) => (
  <div className={className}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        height="1em"
        className={cn('mb-2', i === lines - 1 && 'mb-0', i === lines - 1 && 'w-3/4')}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-surface-container-lowest rounded-xl p-6">
    <Skeleton variant="rectangular" height="160px" className="rounded-lg mb-4" />
    <SkeletonText lines={2} />
    <div className="mt-4 flex gap-2">
      <Skeleton variant="rounded" width="80px" height="36px" />
      <Skeleton variant="rounded" width="80px" height="36px" />
    </div>
  </div>
);
```

---

## 3. Layout Components

### 3.1 Navbar Component

**File:** `src/components/layout/Navbar/Navbar.tsx`

```typescript
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { cn } from '@/utils/classNames';

export const Navbar: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md border-b border-surface-container-highest/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center">
              <span className="text-white font-headline font-bold text-lg">TC</span>
            </div>
            <span className="font-headline font-semibold text-on-surface hidden sm:block">
              Tennis Club du François
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-on-surface/80 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/courts" className="text-on-surface/80 hover:text-primary transition-colors">
              Courts
            </Link>
            <Link to="/pricing" className="text-on-surface/80 hover:text-primary transition-colors">
              Pricing
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-surface-container-highest animate-pulse" />
            ) : user ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-on-surface/80 hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <Badge variant="danger" size="sm" className="absolute top-1 right-1 w-2 h-2 p-0" />
                </button>

                {/* User Menu */}
                <Link to="/dashboard">
                  <Avatar name={user.name} size="md" />
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="primary" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
```

---

### 3.2 ProtectedRoute Component

**File:** `src/components/layout/ProtectedRoute/ProtectedRoute.tsx`

```typescript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/common/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moniteur' | 'client';
  allowRoles?: ('admin' | 'moniteur' | 'client')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowRoles,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton variant="circular" width={64} height={64} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowRoles && !allowRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
```

---

## 4. Court Components

### 4.1 CourtCard Component

**File:** `src/components/courts/CourtCard/CourtCard.tsx`

```typescript
import React from 'react';
import { CourtCardProps } from './CourtCard.types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { CourtStatus } from '../CourtStatus';
import { cn } from '@/utils/classNames';

export const CourtCard: React.FC<CourtCardProps> = ({
  court,
  availability,
  onBook,
  compact = false,
}) => {
  const surfaceIcons: Record<string, string> = {
    Hard: '🏟️',
    Clay: '🟤',
    Grass: '🌱',
    Synthetic: '⚡',
  };

  return (
    <Card
      className={cn(compact ? 'p-4' : '')}
      hoverable={availability === 'available'}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{court.name}</CardTitle>
            <p className="text-sm text-on-surface/60 mt-1">
              Court {court.number} • {court.type}
            </p>
          </div>
          <CourtStatus status={court.status} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{surfaceIcons[court.surface]}</span>
            <span className="text-sm text-on-surface/80">{court.surface}</span>
          </div>
          
          {availability && (
            <Badge
              variant={availability === 'available' ? 'success' : availability === 'occupied' ? 'warning' : 'default'}
              size="sm"
            >
              {availability === 'available' ? 'Open' : availability === 'occupied' ? 'In Use' : 'Reserved'}
            </Badge>
          )}
        </div>

        {!compact && court.description && (
          <p className="mt-3 text-sm text-on-surface/70">{court.description}</p>
        )}
      </CardContent>

      <CardFooter
        actions={
          availability === 'available' && (
            <Button size="sm" onClick={() => onBook?.(court.id)}>
              Book Now
            </Button>
          )
        }
      >
        {availability === 'occupied' && (
          <span className="text-sm text-on-surface/60">
            Next available: {availability.nextAvailable}
          </span>
        )}
      </CardFooter>
    </Card>
  );
};
```

---

### 4.2 TimeSlotGrid Component

**File:** `src/components/reservations/TimeSlotGrid/TimeSlotGrid.tsx`

```typescript
import React, { useState } from 'react';
import { TimeSlotGridProps, TimeSlot } from './TimeSlotGrid.types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { cn } from '@/utils/classNames';
import dayjs from 'dayjs';

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  courts,
  slots,
  onSlotClick,
  date,
  showLabels = true,
}) => {
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 06:00 - 22:00

  const getSlotStatus = (courtId: string, hour: number): TimeSlot | null => {
    const slotDate = dayjs(date).hour(hour).minute(0);
    return slots.find(slot => {
      const slotStart = dayjs(slot.start_time);
      return slot.court_id === courtId &&
             slotStart.isSame(slotDate, 'hour') &&
             slot.status === 'confirmed';
    }) || null;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header Row */}
        {showLabels && (
          <div className="grid grid-cols-[100px_repeat(16,1fr)] gap-px bg-surface-container-highest border-b border-surface-container-highest">
            <div className="p-3 bg-surface-container-lowest" />
            {hours.map(hour => (
              <div
                key={hour}
                className="p-2 text-xs font-medium text-center text-on-surface/70 bg-surface-container-lowest"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>
        )}

        {/* Court Rows */}
        {courts.map(court => (
          <div
            key={court.id}
            className="grid grid-cols-[100px_repeat(16,1fr)] gap-px bg-surface-container-highest border-b border-surface-container-highest/50"
          >
            {/* Court Label */}
            <div className="p-3 bg-surface-container-lowest flex flex-col justify-center">
              <span className="font-semibold text-on-surface">{court.name}</span>
              <span className="text-xs text-on-surface/60">{court.surface}</span>
            </div>

            {/* Time Slots */}
            {hours.map(hour => {
              const slot = getSlotStatus(court.id, hour);
              const isAvailable = !slot && court.is_active;

              return (
                <div
                  key={hour}
                  className={cn(
                    'p-2 bg-surface-container-lowest min-h-[60px] cursor-pointer transition-colors',
                    isAvailable && 'hover:bg-primary-fixed/20',
                    slot && 'bg-primary/10'
                  )}
                  onClick={() => isAvailable && onSlotClick?.(court, hour)}
                >
                  {slot ? (
                    <div className="h-full flex flex-col justify-center">
                      <Badge variant="primary" size="sm" className="text-xs">
                        {slot.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-on-surface/70 mt-1 truncate">
                        {slot.title}
                      </span>
                    </div>
                  ) : (
                    court.is_active && (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-2xl text-primary/30">+</span>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 5. Page Components

### 5.1 Landing Page

**File:** `src/pages/LandingPage.tsx`

```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { CourtGrid } from '@/components/courts/CourtGrid';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useCourts } from '@/hooks/useCourts';
import { useReservations } from '@/hooks/useReservations';
import { SkeletonCard } from '@/components/common/Skeleton';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { courts, loading: courtsLoading } = useCourts();
  const { reservations, loading: reservationsLoading } = useReservations();

  const pricingTiers = [
    {
      name: 'Morning Sessions',
      time: '06:00 - 10:00',
      price: '€25/hour',
      features: ['Perfect for early birds', 'Cool morning air', 'Less crowded'],
    },
    {
      name: 'Prime Time',
      time: '16:00 - 22:00',
      price: '€45/hour',
      popular: true,
      features: ['Evening slots', 'Professional lighting', 'Peak availability'],
    },
    {
      name: 'Weekend Pass',
      time: 'Sat - Sun',
      price: '€35/hour',
      features: ['Weekend access', 'All day booking', 'Group discounts'],
    },
  ];

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
        <div className="relative z-10 text-center px-4">
          <h1 className="font-headline text-5xl md:text-7xl font-bold text-on-surface mb-6">
            Precision on the Clay
          </h1>
          <p className="text-xl text-on-surface/80 mb-8 max-w-2xl mx-auto">
            Experience world-class tennis facilities in the heart of Martinique
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/booking')}>
              Book a Court
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/pricing')}>
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Live Availability */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold mb-8">Live Court Availability</h2>
          {courtsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <CourtGrid courts={courts} reservations={reservations} />
          )}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card
                key={index}
                className={cn(
                  'relative',
                  tier.popular && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                {tier.popular && (
                  <Badge variant="primary" className="absolute -top-3 right-4">
                    Popular
                  </Badge>
                )}
                <h3 className="font-headline text-xl font-semibold mb-2">{tier.name}</h3>
                <p className="text-on-surface/70 mb-4">{tier.time}</p>
                <p className="font-headline text-3xl font-bold text-primary mb-6">{tier.price}</p>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-on-surface/80">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant={tier.popular ? 'primary' : 'secondary'} className="w-full">
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-headline text-3xl font-bold mb-8">World-Class Facilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Facility cards would go here */}
          </div>
        </div>
      </section>
    </PageContainer>
  );
};
```

---

## 6. Component Composition Patterns

### Dashboard Layout Example

```typescript
// src/pages/admin/AdminDashboard.tsx
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageContainer } from '@/components/layout/PageContainer';
import { CourtGrid } from '@/components/courts/CourtGrid';
import { ReservationList } from '@/components/reservations/ReservationList';
import { UserDirectory } from '@/components/users/UserDirectory';
import { StatsCard } from '@/components/common/StatsCard';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <PageContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard title="Active Bookings" value="14" trend="+12%" />
            <StatsCard title="Maintenance" value="1" trend="-50%" />
            <StatsCard title="Available Slots" value="32" trend="+8%" />
          </div>
          
          <CourtGrid showAdminControls />
          
          <div className="mt-8">
            <ReservationList />
          </div>
          
          <div className="mt-8">
            <UserDirectory />
          </div>
        </PageContainer>
      </div>
    </div>
  );
};
```

---

## 7. Next Steps

After understanding component architecture:
1. ✅ Review design system for styling guidelines
2. ✅ Understand routing structure for page navigation
3. 📖 Proceed to [06_ROUTING.md](./06_ROUTING.md)
