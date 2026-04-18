```markdown
# Design System Document

## 1. Overview & Creative North Star: "The Sensory Sommelier"

This design system is built to transform a standard landing page into a high-end editorial experience. We are moving away from the "commodity coffee" look toward a digital space that feels like a curated boutique. Our Creative North Star is **"The Sensory Sommelier."** 

The system prioritizes tactile depth over digital flatness. We achieve this through **Organic Asymmetry**—where text and imagery overlap to create a sense of movement—and **Tonal Architecture**, where depth is defined by shifts in warmth rather than harsh lines. We are not just selling beans; we are designing the ritual of the morning pour.

### Brand Inspiration: GLOPET

GLOPET is inspired by the Mediterranean coffee ritual: long **sobremesas**, natural coastal light, artisan craft, and slow-living rhythms. The brand narrative is not centered on technical coffee specs, but on choosing a moment of the day and an emotion. Every visual decision should reinforce this feeling of a warm, intentional pause.

---

## 2. Color & Tonal Architecture

Our palette is inspired by the lifecycle of coffee: the deep forest green of the coffee cherry leaf, the rich umber of a roasted bean, and the silken cream of frothed milk.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define sections. Traditional borders create a "boxed-in" feeling that cheapens the brand. Instead, define boundaries through:
- **Background Color Shifts:** Transition from `surface` to `surface-container-low`.
- **Typographic Anchors:** Use large `display-lg` headings to "hold" a section's weight.
- **Negative Space:** Use the spacing scale to create clear air between concepts.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper. 
- **Base Layer:** `surface` (#e7fff2).
- **Secondary Section:** `surface-container` (#c4fae1).
- **Interactive Cards:** `surface-container-lowest` (#ffffff) to provide a "pop" of clean light.
- **Deep Impact Sections:** Use `primary-container` (#245644) with `on-primary` text for high-conversion "Buy Now" moments.

### The Glass & Gradient Rule
To prevent the design from looking "flat-web," use Glassmorphism for floating elements (like a sticky navigation bar or a "Quick Add" cart). 
- **Recipe:** Use `surface-variant` at 60% opacity with a `backdrop-filter: blur(20px)`.
- **Signature Texture:** Apply a subtle radial gradient on Hero backgrounds, transitioning from `primary` (#063f2e) to `primary-container` (#245644) at a 45-degree angle. This mimics the natural variation of light on a coffee bean's surface.

---

## 3. Typography: The Editorial Voice

We use a high-contrast typographic scale to guide the user’s eye like a magazine editor.

*   **Display (Manrope):** Our "Hero" voice. Use `display-lg` for value propositions. Set with tight letter-spacing (-2%) to feel authoritative and modern.
*   **Headline & Title (Manrope):** Use these for storytelling. `headline-lg` should be used for section titles, often placed asymmetrically (e.g., left-aligned while the body text is tucked into a narrower column on the right).
*   **Body (Manrope):** Optimized for readability. Use `body-lg` for product descriptions to maintain a premium feel.
*   **Labels (Space Grotesk):** Our "Technical" voice. Use `label-md` for data points (e.g., "Origin: Ethiopia," "Roast: Medium"). The monospace-adjacent feel of Space Grotesk adds a layer of precision and craft.

---

## 4. Elevation & Depth

We convey hierarchy through **Tonal Layering** rather than traditional drop shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container-low` section. This creates a natural "lift" that feels sophisticated and calm.
*   **Ambient Shadows:** If a floating element (like a modal) is required, use a shadow with a blur of `40px`, an opacity of `6%`, and a color derived from `on-surface` (#002116). Never use pure black shadows.
*   **The "Ghost Border" Fallback:** For accessibility in form fields, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism & Depth:** Use `surface-tint` with low opacity for hover states on cards, allowing the underlying textures to bleed through.

---

## 5. Components

### Buttons
*   **Primary:** Background: `secondary` (#7b5800); Text: `on-secondary` (#ffffff). Shape: `full` (pill-shaped). Padding: `1rem 2rem`. No shadow.
*   **Secondary (Ghost):** Background: Transparent; Border: `Ghost Border` (outline-variant at 20%); Text: `primary`.
*   **Interaction:** On hover, primary buttons should scale slightly (1.02x) rather than changing color drastically.

### Cards (The "Sommelier" Card)
*   **Construction:** No borders. Background: `surface-container-lowest`. 
*   **Content:** Image should bleed to the edges or be inset with generous padding (`xl`). 
*   **Separation:** Use `surface-container-high` for a subtle hover state change. Forbid the use of divider lines inside cards; use `24px` vertical spacing between elements instead.

### Input Fields
*   **Style:** Minimalist. Background: `surface-container-low`. Bottom-border only (using the `Ghost Border` rule).
*   **Focus State:** Transition the bottom border to `primary` (#063f2e) with a `2px` thickness.

### Coffee-Specific Components
*   **Roast Level Indicator:** Use a series of `Selection Chips` using `secondary-container`. The active state should be the full `secondary` color.
*   **The "Floating Cart" Bubble:** A Glassmorphic circle in the bottom right using `primary` with 80% opacity and a `backdrop-blur`.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Whitespace:** If a section feels crowded, double the padding. Premium brands breathe.
*   **Use Tonal Shifts:** Define a product grid by placing items on alternating `surface` and `surface-container-low` backgrounds.
*   **Center-Align sparingly:** Use left-aligned editorial layouts for body copy to maintain a high-end magazine feel.

### Don't:
*   **Don't use 1px black borders:** This is the quickest way to make the design look like a template.
*   **Don't use standard shadows:** Avoid the "fuzzy grey" look. If it doesn't look like natural ambient light, remove it.
*   **Don't crowd the imagery:** Coffee is a visual product. Give photography 50-60% of the screen real estate.
*   **Don't use generic icons:** If using icons, ensure they are ultra-thin (1pt to 1.5pt stroke) to match the refinement of the typography.