# Design System Document

## 1. Overview & Creative North Star: "The Modern Clay Court"
This design system is a high-end digital translation of the precision and prestige found in professional tennis. The Creative North Star, **"The Modern Clay Court,"** rejects generic athletic templates in favor of an editorial, sophisticated experience that mirrors the lush environment of Martinique and the tactile quality of the court. 

We break the "standard grid" through intentional asymmetry and tectonic layering. The UI is not a flat canvas but a series of precision-cut surfaces that overlap, much like the layout of a sports complex. We prioritize breathing room, high-contrast typography, and a strict "no-line" philosophy to ensure the interface feels organic yet authoritative.

## 2. Colors
Our palette is rooted in the physical reality of the sport—the deep, vibrant Court Green (`primary: #006b3f`) and the sun-baked Clay Ocre (`secondary: #9d431b`).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Layout boundaries must be defined exclusively through background color shifts. For example, a content area using `surface-container-low` should sit directly on a `surface` (`#f5fbf3`) background. Use the Spacing Scale (e.g., `spacing-12`) to allow the eye to perceive separation through negative space rather than structural lines.

### Surface Hierarchy & Nesting
Treat the UI as physical layers. Each container should use the Material tiered system to define importance:
- **Base Layer:** `surface` (#f5fbf3)
- **Secondary Sections:** `surface-container-low` (#f0f5ee)
- **Interactive Cards:** `surface-container-highest` (#dee4dd) or `surface-container-lowest` (#ffffff) depending on the desired contrast.
Nesting an "In-Progress" court schedule within a container requires moving up one tier in the hierarchy to create a soft, natural lift.

### Glass & Gradient Rule
To achieve a premium "Editorial" feel, floating elements (like navigation bars or hovering match stats) should utilize **Glassmorphism**. Use a semi-transparent `surface` color with a `backdrop-blur` of 12px-20px. 
**Signature Textures:** For Hero CTAs and primary buttons, use a subtle linear gradient from `primary` (#006b3f) to `primary_container` (#008751) at a 135-degree angle. This mimics the light reflecting off a fresh court surface.

## 3. Typography
The system uses a dual-font strategy to balance athletic energy with editorial clarity.

*   **Display & Headlines (Lexend):** A geometric, wide-aperture typeface that conveys "Athletic Precision." It is used for scoreboards, court titles, and big marketing moments. Large scales like `display-lg` (3.5rem) should be used with tight letter-spacing to create a "bold" impact.
*   **Body & Titles (Work Sans):** A highly legible grotesque that handles technical data—like match times (America/Martinique context) and player stats—with professional ease.

**The Hierarchy Note:** High-end design lives in the contrast. Use `display-md` for headers paired with a significantly smaller `label-md` for metadata to create a sophisticated, unbalanced scale that feels custom-designed.

## 4. Elevation & Depth
We eschew traditional drop shadows for **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." A card using `surface-container-lowest` (#ffffff) placed on a `surface-container-low` (#f0f5ee) background creates an effortless, sophisticated lift.
*   **Ambient Shadows:** If a floating action is necessary, use a "Martinique Sun" shadow: large blur (32px+), low opacity (6%), and tinted with `on-surface` (#171d19). Avoid pure black shadows.
*   **The Ghost Border Fallback:** Only if accessibility requires it, use `outline-variant` (#bdcabe) at **15% opacity**. High-contrast 100% opaque borders are strictly forbidden as they clutter the "sporty" clean aesthetic.

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `on-primary` text, `rounded-md` (0.375rem). Use for "Book a Court."
- **Secondary:** Ocre (`secondary`) ghost style with a `ghost border`. Use for "View Tournament Brackets."
- **Tertiary:** `workSans` label-md with no background; uses an underline on hover.

### Interactive Cards & Grids
- **Constraint:** No dividers. Use `spacing-6` or background shifts between `surface-container-low` and `surface-container-high`.
- **Layout:** Use asymmetrical card sizes in a CSS Grid to display "Live Match Updates" vs "Club News," giving the interface a dynamic, magazine-style rhythm.

### Selection Chips
- **Style:** `rounded-full` (9999px). Unselected chips should use `surface-container-highest`. Selected chips must use `primary` with `on-primary` text.

### Court Booking Inputs
- **Input Fields:** Use `surface-container-lowest` as the fill. The active state is indicated by a 2px bottom-bar of `primary` rather than a full bounding box.

### Timezone Display
- All match times must clearly denote the `America/Martinique` context using `label-sm` in `secondary` (Ocre) to ensure players never miss a match due to regional confusion.

## 6. Do's and Don'ts

### Do
- **Do** use `primary_fixed_dim` (#70db9d) for subtle background accents behind court icons.
- **Do** lean into the "Clay Ocre" (`secondary`) for action-oriented micro-copy and callouts to break the sea of green.
- **Do** use large, bold `display-lg` typography for court numbers (e.g., "COURT 01").

### Don't
- **Don't** use any shades of pink or magenta. This is a strict brand prohibition.
- **Don't** use standard "Material Design" cards with heavy shadows and 1px borders.
- **Don't** clutter the grid. If a screen feels full, increase the spacing token (e.g., from `spacing-8` to `spacing-12`) and remove a container background.
- **Don't** use dividers (`px: 1px`) to separate list items; use vertical padding and subtle `surface` transitions.