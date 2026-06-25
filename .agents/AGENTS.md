# Custom UI Styling Rules for Tulie Monorepo

## 🎨 UI/UX Design Standards

- **Forbidden Card Styles (Flat Colored Side Borders)**:
  - Do NOT create cards with flat colored side borders (e.g., using class combinations like `border-l-4 border-l-emerald-500` or similar on rounded cards).
  - This design pattern creates visual fragmentation (flat/sharp border lines overlapping rounded corners).

- **Standard Glassmorphic/Frosted Cards**:
  - Always synchronize stats and card elements with the modern frosted glass / ambient glow design language.
  - Use the `@repo/ui` `Card` component with the `glow` prop (`glow="coral" | "emerald" | "blue" | "violet"`) and a subtle transparent peach-tinted border, which maintains soft, rounded corners and an ambient background mesh glow.
