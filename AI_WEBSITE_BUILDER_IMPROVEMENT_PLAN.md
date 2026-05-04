# AI Website Builder — Unique Design Generation Plan

## Problem Statement

The AI website builder generates nearly identical layouts for every website regardless of input. A fashion store, a restaurant, and a portfolio all get the same: announcement bar → centered hero → 4-column product grid → features → newsletter. The root causes are:

1. **AI prompts are too rigid** — forced into a narrow JSON schema with limited section types
2. **`sanitizeSections()` kills AI creativity** — overwrites AI-generated props with hardcoded defaults
3. **Only ecommerce sections exist** — Portfolio, Corporate, Blog, Restaurant section types are listed in the AI prompt but NOT implemented in the rendering engine
4. **No per-section theming** — colors/spacing are global; can't make one section dark and another light
5. **Section components have few visual variants** — HeroSection only has 5 styles, most sections have 1-2
6. **Fallback is always identical** — same green/red colors, same sections, same layout

---

## Architecture Overview (Current)

```
User Input (Image/Prompt/URL)
        ↓
   API Route (/api/ai/*)
        ↓
   @bdesh/ai package
   ├── analyzeDesign()          → DesignAnalysisResult
   ├── generateTemplateFromImage()  → GenerateFromImageResponse
   ├── generateTemplateFromPrompt() → GenerateFromPromptResponse
   └── cloneWebsiteFromURL()    → CloneWebsiteResponse
        ↓
   GeneratedTemplateConfig (JSON)
        ↓
   ConfigTemplate.tsx (renders any TemplateConfig)
   ├── ConfigHomePage.tsx → SectionRenderer switch
   │   ├── HeroSection (5 styles: centered/split/fullwidth/minimal/video/parallax)
   │   ├── FeaturedProductsSection
   │   ├── CollectionsSection
   │   └── ... 20 section types (all ecommerce-focused)
   ├── ConfigNavbar
   ├── ConfigFooter
   └── useTemplateTheme (CSS variables from config)
```

---

## Phased Improvement Plan

### Phase 1: Fix AI Prompts & Sanitization (Quick Win — No Structural Changes)

**Goal:** Make the AI generate genuinely different TemplateConfigs for different inputs.

**Files to modify:**
- `packages/ai/src/services/design.ts` — AI prompts + sanitization
- `packages/ai/src/types.ts` — Add per-section theming fields

#### 1.1 Overhaul AI System Prompts

Current prompts ask for the same JSON structure every time. New prompts should:

- **Vary section selection by industry/vibe** — A luxury fashion store gets: hero(split) → brandLogos → featuredProducts(carousel,3-col) → testimonials(minimal) → newsletter(fullwidth). A restaurant gets: hero(fullwidth) → about → menu → gallery → reservation → map.
- **Vary section props aggressively** — Different hero styles, different column counts, different card styles, different section backgrounds
- **Include 3-5 example configs** in the prompt for different vibes (luxury, playful, minimal, bold, natural) so the AI has reference points
- **Ask AI to generate a `sectionTheme` per section** — dark/light/primary/gradient override

#### 1.2 Make `sanitizeSections()` Less Aggressive

Current behavior: overwrites AI props with hardcoded defaults. New behavior:
- Only fill in **missing** required props, never overwrite AI-provided values
- Remove the hardcoded default sections — let AI be creative
- If AI returns 0 sections, THEN fall back to industry-specific defaults (not generic ecommerce defaults)

#### 1.3 Add Industry-Specific Default Presets

Replace the single `defaultSections()` with per-industry presets:

```
fashionDefaultSections()    → split hero, brand logos, carousel products, testimonials
restaurantDefaultSections() → fullwidth hero, menu, gallery, reservation, map
portfolioDefaultSections()  → minimal hero, projects grid, skills, contact
corporateDefaultSections()  → centered hero, services, clients, team, cta
groceryDefaultSections()    → announcement, hero with categories, product grid, features
clinicDefaultSections()     → hero with CTA, services, team, testimonials, faq
```

#### 1.4 Add Per-Section Background/Theme Override to Types

Extend `HomeSectionConfig` to support per-section theming:

```typescript
// Add to each section's props:
interface SectionThemeOverride {
  background?: 'default' | 'dark' | 'light' | 'primary' | 'gradient' | 'surface'
  textColor?: 'default' | 'light' | 'dark'
  padding?: 'compact' | 'normal' | 'spacious' | 'none'
}

// Each section props gets:
interface HeroSectionProps {
  // ... existing fields
  sectionTheme?: SectionThemeOverride
}
```

This allows AI to say "hero section has dark background with light text" while the rest is light.

---

### Phase 2: Enhance Section Visual Variants

**Goal:** Each section component should render meaningfully different layouts based on props.

**Files to modify:**
- `apps/web/lib/store-templates/engine/sections/*.tsx` — All 20 section components
- `apps/web/lib/store-templates/engine/types.ts` — Extended props
- `apps/web/lib/store-templates/engine/hooks/useTemplateTheme.ts` — Per-section theming

#### 2.1 Add Section Theme Support to SectionRenderer

In `ConfigHomePage.tsx`, wrap each section with a theme context provider:

```tsx
function SectionWrapper({ section, children }) {
  const theme = section.props.sectionTheme
  if (!theme || theme.background === 'default') return children
  
  const bgClass = {
    dark: 'bg-[var(--tpl-text)] text-white',
    light: 'bg-white text-[var(--tpl-text)]',
    primary: 'bg-[var(--tpl-primary)] text-white',
    gradient: 'bg-gradient-to-r from-[var(--tpl-primary)] to-[var(--tpl-secondary)] text-white',
    surface: 'bg-[var(--tpl-surface)]',
  }[theme.background]
  
  return <div className={bgClass}>{children}</div>
}
```

#### 2.2 Enhance HeroSection Variants

Current: 5 styles. Add meaningful visual differences:

| Style | Visual | Unique Elements |
|-------|---------|-----------------|
| centered | Classic centered text + CTA | Stats row, feature badges |
| split | 50/50 text + image | Feature list, trust badges |
| fullwidth | Full-bleed image + overlay | Gradient overlay, large typography |
| minimal | Text-only, no image | Subtle animation, clean CTA |
| video | Background video | Play button, overlay |
| parallax | Parallax background | Scroll indicator |
| **NEW: magazine** | Editorial layout | Large headline, asymmetric grid |
| **NEW: shopify-style** | Image carousel + text | Product preview thumbnails |

#### 2.3 Enhance Product Section Variants

- Add `cardStyle` variants: standard, overlay, minimal, hover-reveal
- Add `layout` variants: grid, carousel, list, masonry
- Add `showQuickView` modal support
- Add `showColorSwatches` on cards

#### 2.4 Add Dark/Light Section Alternation

The AI should be able to specify alternating section backgrounds:
- Hero: primary gradient
- Features: surface
- Products: white
- Testimonials: dark
- Newsletter: primary

This alone creates dramatically different-looking websites.

---

### Phase 3: Add Non-Ecommerce Section Types

**Goal:** Support Portfolio, Corporate, Blog, Restaurant, Education, Nonprofit website types with dedicated sections.

**Files to create/modify:**
- `apps/web/lib/store-templates/engine/sections/` — New section components
- `apps/web/lib/store-templates/engine/types.ts` — New section type definitions
- `apps/web/lib/store-templates/engine/pages/ConfigHomePage.tsx` — New section cases
- `packages/ai/src/services/design.ts` — Updated section lists in prompts

#### 3.1 New Section Types to Implement

**Portfolio sections:**
| Type | Component | Props |
|------|-----------|-------|
| `projects` | ProjectsSection | layout: grid/masonry/carousel, columns, showFilters, items[] |
| `gallery` | GallerySection | layout: grid/masonry/lightbox, columns, gap, items[] |
| `skills` | SkillsSection | layout: bars/tags/cards, items[] |
| `experience` | ExperienceSection | layout: timeline/cards, items[] |
| `contact` | ContactSection | layout: split/centered, showMap, showForm, info[] |

**Corporate sections:**
| Type | Component | Props |
|------|-----------|-------|
| `about` | AboutSection | layout: split/centered/image-left, title, description, image |
| `services` | ServicesSection | layout: grid/cards/icons, columns, items[] |
| `clients` | ClientsSection | layout: grid/carousel, items[] |
| `partners` | PartnersSection | layout: grid/carousel, items[] |
| `mission` | MissionSection | layout: centered/split, title, description, values[] |

**Blog sections:**
| Type | Component | Props |
|------|-----------|-------|
| `blogPosts` | BlogPostsSection | layout: grid/list/featured, columns, limit |
| `featuredPost` | FeaturedPostSection | layout: hero/split, post data |

**Restaurant sections:**
| Type | Component | Props |
|------|-----------|-------|
| `menu` | MenuSection | layout: cards/list/tabs, categories[], items[] |
| `hours` | HoursSection | layout: table/cards, schedule[] |
| `reservation` | ReservationSection | layout: form/split, fields |

**Education sections:**
| Type | Component | Props |
|------|-----------|-------|
| `courses` | CoursesSection | layout: grid/list, items[] |

#### 3.2 Update HomeSectionConfig Union Type

```typescript
export type HomeSectionConfig =
  // Existing ecommerce sections (20)
  | { type: 'announcement'; props: AnnouncementSectionProps }
  | { type: 'hero'; props: HeroSectionProps }
  // ... existing types ...
  | { type: 'categories'; props: CategoriesSectionProps }
  // New portfolio sections
  | { type: 'projects'; props: ProjectsSectionProps }
  | { type: 'gallery'; props: GallerySectionProps }
  | { type: 'skills'; props: SkillsSectionProps }
  | { type: 'experience'; props: ExperienceSectionProps }
  | { type: 'contact'; props: ContactSectionProps }
  // New corporate sections
  | { type: 'about'; props: AboutSectionProps }
  | { type: 'services'; props: ServicesSectionProps }
  | { type: 'clients'; props: ClientsSectionProps }
  | { type: 'partners'; props: PartnersSectionProps }
  | { type: 'mission'; props: MissionSectionProps }
  // New blog sections
  | { type: 'blogPosts'; props: BlogPostsSectionProps }
  | { type: 'featuredPost'; props: FeaturedPostSectionProps }
  // New restaurant sections
  | { type: 'menu'; props: MenuSectionProps }
  | { type: 'hours'; props: HoursSectionProps }
  | { type: 'reservation'; props: ReservationSectionProps }
  // New education sections
  | { type: 'courses'; props: CoursesSectionProps }
```

#### 3.3 Update SectionRenderer Switch

Add cases for all new section types in `ConfigHomePage.tsx`.

---

### Phase 4: Enhanced TemplateConfig for Layout Diversity

**Goal:** Support fundamentally different page layouts, not just different sections.

**Files to modify:**
- `apps/web/lib/store-templates/engine/types.ts` — New layout fields
- `apps/web/lib/store-templates/engine/ConfigTemplate.tsx` — Layout variants
- `apps/web/lib/store-templates/engine/pages/ConfigHomePage.tsx` — Layout rendering

#### 4.1 Page Layout Variants

```typescript
interface TemplateLayout {
  maxWidth: string
  sectionSpacing: 'compact' | 'normal' | 'spacious'
  cardStyle: 'flat' | 'bordered' | 'shadowed' | 'elevated'
  productColumns: 2 | 3 | 4
  // NEW:
  pageLayout?: 'fullwidth' | 'sidebar-left' | 'sidebar-right' | 'boxed' | 'magazine'
  sidebarContent?: 'categories' | 'filters' | 'navigation' | 'custom'
  contentWidth?: 'narrow' | 'normal' | 'wide' | 'full'
}
```

#### 4.2 Navbar Variants

Current: 4 styles. Add:
- `centered-logo` — Logo centered, links on both sides
- `mega-menu` — Full-width dropdown menus
- `minimal` — Just logo + hamburger
- `transparent-over-hero` — Transparent until scroll

#### 4.3 Footer Variants

Current: 3 styles. Add:
- `centered` — Centered layout
- `minimal` — Single row
- `expanded` — Large footer with map
- `newsletter-focus` — Large newsletter CTA at top

---

### Phase 5: AI Prompt Engineering Overhaul

**Goal:** The AI should produce dramatically different configs for different inputs.

**Files to modify:**
- `packages/ai/src/services/design.ts` — Complete prompt rewrite

#### 5.1 Vibe-Based Design Presets in Prompt

Include concrete examples in the system prompt:

```
LUXURY FASHION: dark hero with gold accents, split layout, 3-col products, serif headings, dark footer
PLAYFUL BOUTIQUE: colorful hero, rounded cards, 2-col products, fun fonts, bright footer
MINIMAL TECH: white hero, clean grid, 4-col products, sans-serif, minimal footer
RESTAURANT: fullwidth food photo hero, menu cards, gallery, dark footer with hours
PORTFOLIO: minimal hero, masonry projects grid, skills bars, contact form
CORPORATE: centered hero, services grid, client logos, team cards, cta
```

#### 5.2 Two-Step Generation

Instead of one massive prompt, split into:

1. **Step 1: Design Brief** — AI generates a text description of the website (sections, colors, layout, vibe)
2. **Step 2: TemplateConfig** — AI converts the brief into structured JSON

This produces more coherent, creative designs because the AI first "thinks" about the design, then structures it.

#### 5.3 Temperature Variation

- Use `temperature: 0.5` for image-based (should follow reference closely)
- Use `temperature: 0.7` for prompt-based (should be more creative)
- Use `temperature: 0.3` for URL cloning (should match closely)

---

### Phase 6: Post-Generation Customization UI

**Goal:** Let users tweak the AI-generated design before applying.

**Files to modify:**
- `apps/web/app/dashboard/ai-builder/page.tsx` — Add customization panel

#### 6.1 Quick Customization Options

After AI generates a design, show a "Customize" panel:

- **Color palette** — Click any color to change it (with AI-suggested alternatives)
- **Section order** — Drag-and-drop to reorder sections
- **Section visibility** — Toggle sections on/off
- **Hero style** — Quick switch between hero variants
- **Font pairing** — Choose from 5-6 curated font pairs
- **Spacing** — Compact / Normal / Spacious toggle

#### 6.2 "Regenerate Section" Button

Each section in the preview gets a small "🔄" button that regenerates just that section via AI while keeping the rest.

---

## Implementation Priority

| Phase | Impact | Effort | Priority |
|-------|--------|--------|----------|
| Phase 1: Fix AI prompts & sanitization | 🔴 HIGH | 🟢 LOW | **P0 — Do first** |
| Phase 2: Section visual variants | 🟡 MEDIUM | 🟡 MEDIUM | **P1** |
| Phase 3: Non-ecommerce sections | 🔴 HIGH | 🔴 HIGH | **P1** |
| Phase 4: Layout diversity | 🟡 MEDIUM | 🟡 MEDIUM | **P2** |
| Phase 5: AI prompt overhaul | 🔴 HIGH | 🟢 LOW | **P0 — Do with Phase 1** |
| Phase 6: Customization UI | 🟢 NICE | 🔴 HIGH | **P3** |

**Recommended order:** Phase 1 + 5 together → Phase 3 → Phase 2 → Phase 4 → Phase 6

---

## File Change Summary

### Phase 1+5 (P0 — Immediate)
| File | Change |
|------|--------|
| `packages/ai/src/services/design.ts` | Rewrite AI prompts, fix sanitizeSections, add industry presets |
| `packages/ai/src/types.ts` | Add SectionThemeOverride type, per-section background fields |
| `apps/web/lib/store-templates/engine/types.ts` | Add sectionTheme to section props |

### Phase 3 (P1 — Non-ecommerce sections)
| File | Change |
|------|--------|
| `apps/web/lib/store-templates/engine/sections/` | 12+ new section components |
| `apps/web/lib/store-templates/engine/types.ts` | 12+ new section type definitions |
| `apps/web/lib/store-templates/engine/pages/ConfigHomePage.tsx` | 12+ new switch cases |
| `packages/ai/src/services/design.ts` | Updated section lists in prompts |

### Phase 2 (P1 — Visual variants)
| File | Change |
|------|--------|
| `apps/web/lib/store-templates/engine/sections/*.tsx` | Enhanced visual variants for all 20+ sections |
| `apps/web/lib/store-templates/engine/pages/ConfigHomePage.tsx` | SectionWrapper with per-section theming |

### Phase 4 (P2 — Layout diversity)
| File | Change |
|------|--------|
| `apps/web/lib/store-templates/engine/types.ts` | New layout fields |
| `apps/web/lib/store-templates/engine/ConfigTemplate.tsx` | Layout variant rendering |
| `apps/web/lib/store-templates/engine/components/ConfigNavbar.tsx` | New navbar variants |
| `apps/web/lib/store-templates/engine/components/ConfigFooter.tsx` | New footer variants |

---

## Expected Outcome

After Phase 1+5:
- A fashion store prompt → dark luxury theme, split hero, serif fonts, 3-col products, gold accents
- A restaurant prompt → fullwidth food hero, menu section, gallery, reservation form, dark footer with hours
- A portfolio prompt → minimal hero, masonry projects, skills bars, contact form
- A grocery prompt → colorful hero, category grid, product carousel, features, newsletter
- Same prompt → same result (deterministic with temperature 0.3-0.5)
- Different prompts → dramatically different websites

After Phase 3:
- Full support for 6 website types with dedicated sections
- Each type renders with its own unique layout and components

After Phase 2:
- Same section type can look very different based on props
- Dark/light section alternation creates visual rhythm
- Per-section theming enables creative layouts
