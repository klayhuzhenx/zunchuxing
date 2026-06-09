---
name: Ethereal Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5f5f'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0e0'
  on-secondary-container: '#616363'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001550'
  on-tertiary-container: '#517aff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#dce1ff'
  tertiary-fixed-dim: '#b6c4ff'
  on-tertiary-fixed: '#001550'
  on-tertiary-fixed-variant: '#003ab2'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  obsidian-deep: '#000000'
  slate-surface: '#F2F2F2'
  premium-blue: '#0057FF'
  heritage-gold: '#D4AF37'
  status-error: '#FF4D4F'
  text-secondary: '#86868B'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 24px
  gutter-md: 16px
  stack-xl: 48px
  stack-lg: 32px
  stack-md: 20px
  stack-sm: 12px
---

## Brand & Style

The design system is engineered for the "Zun Chu Xing" (尊出行) high-end travel platform, specifically targeting an elite demographic expecting exclusivity and technological sophistication. Inspired by the **HarmonyOS Next** aesthetic, the style is defined as **Modern Minimalism with Tactile Precision**.

The brand personality is **composed, authoritative, and frictionless**. It prioritizes a "breathing" interface where luxury is expressed through the absence of noise rather than the presence of decoration. 

Key visual principles:
- **Spatial Luxury:** Generous whitespace (padding and margins) to signify high-value content.
- **Structural Integrity:** Heavy reliance on solid, high-contrast black and white foundations.
- **Human-Centric Fluidity:** Large corner radii (24px+) to soften the technical precision, making the interface feel approachable yet solid.
- **Restrained Accents:** The use of Premium Blue is strictly functional, reserved for critical interactive pathways and secure status indicators.

## Colors

The palette is monochromatic and high-contrast to evoke a sense of timeless luxury. 

- **Primary (Obsidian Black):** Used for primary actions, headings, and core structural elements. It represents strength and exclusivity.
- **Secondary (Pure White):** The canvas. Used to create vast "negative space" that allows the vehicle images (like the S800) to stand out.
- **Neutral (Slate Grey):** Employed for secondary surfaces, input backgrounds, and subtle containers. It provides depth without introducing visual clutter.
- **Tertiary (Premium Blue):** A strategic accent color used for text links (e.g., policy links), active states, and verification indicators.
- **Heritage Gold:** A reserved accent for "Member Only" or "Exclusive" badges, used sparingly to maintain the minimalist ethos.

## Typography

The system utilizes **Hanken Grotesk** (serving as a premium alternative to system-ui) for its clean, sharp, and contemporary feel. 

- **Hierarchy:** Use `display-lg` for brand intros and hero vehicle names. Headings use `600` weight to ensure authority without being overly "heavy."
- **Tracking:** Headings and labels use generous letter spacing (up to 0.05em) to enhance the "premium" and "airy" feel.
- **Readability:** Body text is set at 17px/15px to ensure high legibility for a broad range of high-end users, following modern mobile standards.
- **Scale:** On mobile, large displays are slightly scaled down to maintain balance within the WeChat Mini Program viewport.

## Layout & Spacing

This design system follows a **Fixed-Fluid Hybrid** model optimized for mobile verticality.

- **Margins:** A strict 24px horizontal margin is enforced across all screens to create a high-end "frame" for the content.
- **Stacking:** Elements are grouped using a vertical rhythm: 48px for major section breaks (e.g., Brand Logo to Form), 32px for functional groups, and 12px for internal component spacing (e.g., Label to Input).
- **Safe Areas:** Adheres strictly to WeChat Mini Program top navigation heights and bottom "Home Indicator" areas, ensuring no interactive elements are obscured.
- **Alignment:** Centralized alignment for brand moments; left-alignment for functional forms to ensure speed and clarity.

## Elevation & Depth

To maintain the "Modern / HarmonyOS" feel, the system uses **Tonal Layering** and **Micro-Shadows** rather than heavy depth.

- **Surfaces:** The primary background is Pure White (`#FFFFFF`). Secondary containers (cards, inputs) use Slate Grey (`#F2F2F2`) with 0px elevation.
- **Shadows:** When elevation is required (e.g., for floating action buttons or the bottom protocol sheet), use a highly diffused "Ambient Shadow": `0px 10px 40px rgba(0, 0, 0, 0.04)`.
- **Modals:** Bottom sheets use a soft backdrop blur (20px) to maintain context while focusing the user on the task at hand.
- **Interactive States:** Buttons don't "lift" on press; instead, they use a subtle opacity shift (80%) to simulate a physical "press" without breaking the flat aesthetic.

## Shapes

The shape language is characterized by **Generous Radii**, reflecting the industrial design of modern premium EVs (like the S800).

- **Standard Components:** Buttons and Input fields use a **24px** corner radius.
- **Large Containers:** Cards and Bottom Sheets use **32px** (`rounded-xl`) to create a soft, protective feel for content.
- **Chips & Badges:** These use a full **Pill-shape** for maximum distinction from functional inputs.
- **Icons:** Use a 2px stroke width with slightly rounded terminals to match the typography's softness.

## Components

### Buttons
- **Primary:** Solid Obsidian Black, white text, 24px radius, 56px height. Full width.
- **Secondary (WeChat):** Pure White with a 1px Slate Grey border or subtle WeChat Green icon/text. 
- **Ghost:** No background, Blue or Black text. Used for "Forget Password" or "Go to Register."

### Input Fields
- **Style:** Filled Slate Grey (`#F2F2F2`) background, 24px radius. 
- **Typography:** Text begins 20px from the left edge.
- **States:** Active state uses a 1.5px Black border. Error state uses a 1px Red border with a small error label below.

### Cards (Enterprise/Status)
- Large white surfaces with 32px corners. Use subtle 1px Slate Grey borders instead of shadows to maintain the "light" feel.

### Bottom Sheets (Protocols/Agreements)
- 32px top-corner radius. High-transparency backdrop blur. "Agree" and "Disagree" buttons are stacked or side-by-side depending on length, but always follow the 24px radius rule.

### Checkboxes
- Custom-styled circles (20px diameter). When checked, they fill with Obsidian Black and a white micro-check, avoiding the default system look for a more bespoke feel.