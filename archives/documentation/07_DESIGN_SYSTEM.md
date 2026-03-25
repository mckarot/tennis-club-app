# 07. Design System

## "The Modern Clay Court" - Design System for Tennis Club du François

This document defines the complete visual design system based on the PRD specifications.

---

## 1. Creative North Star

### Theme: "The Modern Clay Court"

An editorial, sophisticated experience that captures the essence of clay court tennis in Martinique.

**Key Principles:**
1. **No-Line Philosophy**: Boundaries defined by color shifts, not borders
2. **Tonal Layering**: Depth through color tiers, not shadows
3. **Glassmorphism**: Semi-transparent surfaces with backdrop blur
4. **Asymmetrical Layouts**: Dynamic, athletic-inspired compositions
5. **Gradient CTAs**: Vibrant call-to-action buttons

---

## 2. Color Palette

### Primary Colors (Court Green)

```css
/* Tailwind Config */
colors: {
  primary: {
    DEFAULT: '#006b3f',    /* Deep court green */
    container: '#008751',  /* Lighter green for containers */
    fixed: '#8df8b7',      /* Light accent green */
    fixedDim: '#70db9d',   /* Muted accent */
  }
}
```

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#006b3f` | Primary buttons, active states, links |
| `primary-container` | `#008751` | Secondary backgrounds, hover states |
| `primary-fixed` | `#8df8b7` | Light accents, highlights |
| `primary-fixed-dim` | `#70db9d` | Background accents, subtle highlights |

### Secondary Colors (Clay Ocre)

```css
colors: {
  secondary: {
    DEFAULT: '#9d431b',    /* Clay ocre */
    container: '#fe8c5e',  /* Vibrant ocre */
    fixed: '#ffdbce',      /* Light ocre tint */
  }
}
```

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary` | `#9d431b` | Secondary buttons, warnings |
| `secondary-container` | `#fe8c5e` | Accent backgrounds, badges |
| `secondary-fixed` | `#ffdbce` | Light backgrounds, highlights |

### Tertiary Colors (Accent Red)

```css
colors: {
  tertiary: {
    DEFAULT: '#9d3d43',    /* Accent red */
  }
}
```

| Token | Hex | Usage |
|-------|-----|-------|
| `tertiary` | `#9d3d43` | Danger states, errors, notifications |

### Surface Colors (Backgrounds)

```css
colors: {
  surface: {
    DEFAULT: '#f5fbf3',         /* Base layer */
    containerLow: '#f0f5ee',    /* Secondary sections */
    containerLowest: '#ffffff', /* Cards, modals */
    containerHighest: '#dee4dd', /* Interactive elements */
  },
  onSurface: '#171d19',         /* Text color */
}
```

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#f5fbf3` | Page background |
| `surface-container-low` | `#f0f5ee` | Section backgrounds |
| `surface-container-lowest` | `#ffffff` | Cards, modals, dialogs |
| `surface-container-highest` | `#dee4dd` | Borders, dividers, interactive |
| `on-surface` | `#171d19` | Primary text |

### Complete Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006b3f',
          container: '#008751',
          fixed: '#8df8b7',
          fixedDim: '#70db9d',
        },
        secondary: {
          DEFAULT: '#9d431b',
          container: '#fe8c5e',
          fixed: '#ffdbce',
        },
        tertiary: {
          DEFAULT: '#9d3d43',
        },
        surface: {
          DEFAULT: '#f5fbf3',
          containerLow: '#f0f5ee',
          containerLowest: '#ffffff',
          containerHighest: '#dee4dd',
        },
        onSurface: '#171d19',
      },
    },
  },
}
```

---

## 3. Typography

### Font Families

```css
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Work+Sans:wght@400;500;600&display=swap');
```

| Usage | Font | Weights |
|-------|------|---------|
| Headlines | `Lexend` | 400, 500, 600, 700 |
| Body | `Work Sans` | 400, 500, 600 |

### Type Scale

```css
/* Tailwind Config */
fontSize: {
  'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
  'display-md': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
  'headline-lg': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
  'headline-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
  'headline-sm': ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }],
  'title-lg': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
  'title-md': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
  'body-lg': ['1.125rem', { lineHeight: '1.6' }],
  'body': ['1rem', { lineHeight: '1.6' }],
  'body-sm': ['0.875rem', { lineHeight: '1.5' }],
  'label': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
}
```

### Usage Examples

```tsx
// Display text (Hero sections)
<h1 className="font-headline text-display-lg font-bold">
  Precision on the Clay
</h1>

// Headlines (Section titles)
<h2 className="font-headline text-headline-lg font-semibold">
  Live Court Availability
</h2>

// Body text
<p className="font-body text-body text-on-surface/80">
  Book your court in seconds
</p>

// Labels (Buttons, badges)
<span className="font-body text-label uppercase tracking-wide">
  Available
</span>
```

---

## 4. Component Styles

### Buttons

#### Primary Button
```css
.btn-primary {
  @apply bg-gradient-to-br from-primary to-primary-container 
         text-white font-semibold py-3 px-6 rounded-lg 
         hover:opacity-90 transition-opacity duration-200
         focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply bg-secondary-container/10 text-secondary 
         font-semibold py-3 px-6 rounded-lg 
         hover:bg-secondary-container/20 transition-colors duration-200
         focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2;
}
```

#### Tertiary Button
```css
.btn-tertiary {
  @apply bg-transparent text-primary underline 
         hover:opacity-80 transition-opacity duration-200
         focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
}
```

#### Button Sizes
```tsx
// Small
<button className="px-3 py-1.5 text-sm rounded-lg">Button</button>

// Medium (default)
<button className="px-6 py-3 text-base rounded-lg">Button</button>

// Large
<button className="px-8 py-4 text-lg rounded-lg">Button</button>
```

---

### Cards

#### Standard Card
```css
.card {
  @apply bg-surface-container-lowest rounded-xl p-6 
         transition-shadow duration-200;
}

.card-hoverable {
  @apply hover:shadow-xl cursor-pointer;
}

.card-elevated {
  @apply shadow-md;
}
```

#### Card Variants
```tsx
// Basic card
<Card>
  <CardHeader>
    <CardTitle>Court Name</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Description text</p>
  </CardContent>
  <CardFooter>
    <Button>Book Now</Button>
  </CardFooter>
</Card>

// Hoverable card
<Card hoverable onClick={handleClick}>
  {/* Content */}
</Card>

// Elevated card
<Card elevation="raised">
  {/* Content */}
</Card>
```

---

### Input Fields

```css
.input {
  @apply w-full bg-surface-container-lowest border-b-2 border-surface-container-highest
         text-on-surface px-4 py-3 rounded-t-lg
         focus:outline-none focus:border-primary transition-colors duration-200
         placeholder:text-on-surface/40;
}

.input-error {
  @apply border-tertiary focus:border-tertiary;
}
```

#### Input Example
```tsx
<div className="space-y-2">
  <label className="text-label text-on-surface/70">Email</label>
  <input
    type="email"
    className="input"
    placeholder="you@example.com"
  />
  <p className="text-sm text-on-surface/60">
    We'll never share your email
  </p>
</div>
```

---

### Badges

```tsx
// Success badge
<Badge variant="success">Available</Badge>

// Warning badge
<Badge variant="warning">In Use</Badge>

// Primary badge
<Badge variant="primary">Confirmed</Badge>

// Secondary badge
<Badge variant="secondary">Pending</Badge>

// Danger badge
<Badge variant="danger">Cancelled</Badge>
```

#### Badge Styles
```css
.badge {
  @apply inline-flex items-center gap-1 font-medium rounded-full;
}

.badge-sm {
  @apply px-2 py-0.5 text-xs;
}

.badge-md {
  @apply px-3 py-1 text-sm;
}

.badge-lg {
  @apply px-4 py-1.5 text-base;
}
```

---

### Selection Chips

```css
.chip {
  @apply inline-flex items-center px-4 py-2 rounded-full 
         bg-surface-container-highest text-on-surface
         hover:bg-surface-container-highest/70
         transition-colors duration-200 cursor-pointer;
}

.chip-selected {
  @apply bg-primary text-white;
}
```

#### Usage
```tsx
<div className="flex gap-2 flex-wrap">
  <Chip selected>All Courts</Chip>
  <Chip>Quick</Chip>
  <Chip>Terre</Chip>
</div>
```

---

## 5. Layout Patterns

### Grid Layouts

#### Court Grid (Asymmetrical)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Featured court - spans 2 columns */}
  <CourtCard className="md:col-span-2" featured />
  
  {/* Regular courts */}
  <CourtCard />
  <CourtCard />
  <CourtCard />
  <CourtCard />
</div>
```

#### Bento Grid (Facilities)
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 grid-rows-4 gap-4 h-[600px]">
  {/* Large feature card */}
  <div className="md:col-span-2 md:row-span-2">
    <FacilityCard size="large" />
  </div>
  
  {/* Medium cards */}
  <div className="md:col-span-2 md:row-span-1">
    <FacilityCard size="medium" />
  </div>
  
  {/* Small cards */}
  <FacilityCard size="small" />
  <FacilityCard size="small" />
  <FacilityCard size="small" />
</div>
```

---

## 6. Design Rules

### ✅ DO

1. **Use tonal layering for depth**
```tsx
// Good: Color-based depth
<div className="bg-surface">
  <div className="bg-surface-container-low p-8">
    <Card>{/* Content */}</Card>
  </div>
</div>
```

2. **Apply glassmorphism for overlays**
```tsx
// Good: Glassmorphic modal
<Modal className="backdrop-blur-sm bg-surface-container-lowest/90">
  {/* Content */}
</Modal>
```

3. **Use gradient for primary CTAs**
```tsx
// Good: Gradient button
<Button className="bg-gradient-to-br from-primary to-primary-container">
  Book Now
</Button>
```

### ❌ DON'T

1. **No 1px solid borders**
```tsx
// Bad: Hard border
<div className="border border-gray-300">Content</div>

// Good: Color shift
<div className="bg-surface-container-lowest">
  <div className="bg-surface-container-highest">Content</div>
</div>
```

2. **No heavy shadows**
```tsx
// Bad: Material Design shadow
<Card className="shadow-lg shadow-gray-500/50">Content</Card>

// Good: Subtle elevation
<Card className="shadow-sm">Content</Card>
```

3. **No pink/magenta shades**
```tsx
// Bad: Pink colors
<div className="bg-pink-500">Content</div>

// Good: Clay ocre
<div className="bg-secondary-container">Content</div>
```

---

## 7. Responsive Breakpoints

```javascript
// tailwind.config.js
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
}
```

### Mobile-First Approach

```tsx
// Base styles for mobile
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>
  
  {/* Mobile: Stack, Desktop: Grid */}
  <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Cards */}
  </div>
</div>
```

---

## 8. Animation Guidelines

### Transitions
```css
.transition-base {
  @apply transition-all duration-200 ease-in-out;
}

.transition-slow {
  @apply transition-all duration-300 ease-in-out;
}

.transition-fast {
  @apply transition-all duration-150 ease-out;
}
```

### Hover States
```tsx
// Card hover
<Card className="hover:shadow-xl transition-shadow duration-200">
  Content
</Card>

// Button hover
<Button className="hover:opacity-90 transition-opacity duration-200">
  Click Me
</Button>

// Link hover
<a className="hover:text-primary transition-colors duration-200">
  Link
</a>
```

### Loading States
```tsx
// Skeleton loader
<Skeleton variant="rectangular" height="200px" animation="pulse" />

// Button loading
<Button loading>Processing...</Button>
```

---

## 9. Iconography

### Material Symbols
```html
<!-- Include in index.html -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />
```

#### Common Icons
```tsx
// Dashboard
<span className="material-symbols-outlined">dashboard</span>

// Courts
<span className="material-symbols-outlined">sports_tennis</span>

// Calendar
<span className="material-symbols-outlined">calendar_today</span>

// Users
<span className="material-symbols-outlined">people</span>

// Notifications
<span className="material-symbols-outlined">notifications</span>

// Account
<span className="material-symbols-outlined">person</span>
```

---

## 10. Timezone Display

All times must display timezone context:

```tsx
// Bad: No timezone
<p>10:00 - 11:00</p>

// Good: With timezone
<p>10:00 - 11:00 (America/Martinique)</p>

// Better: With icon
<div className="flex items-center gap-2">
  <span className="material-symbols-outlined text-sm">schedule</span>
  <span>10:00 - 11:00 AST</span>
</div>
```

---

## 11. Next Steps

After implementing design system:
1. ✅ Apply color palette to all components
2. ✅ Implement typography scale
3. ✅ Follow no-line philosophy
4. 📖 Proceed to [08_USER_FLOWS.md](./08_USER_FLOWS.md)
