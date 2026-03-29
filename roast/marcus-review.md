# Marcus Tan — Product Designer Review

**Rating: 7/10 — Polished but with structural issues**

---

## What's Working

1. **Typography system is excellent.** DM Serif Display + DM Sans + JetBrains Mono is a cohesive, well-paired stack. The serif headlines carry editorial authority, the mono labels create a "precision" feel. This is clearly intentional, not default.

2. **Color discipline is tight.** Charcoal + amber is a restrained, professional palette. The amber is used as a true accent — not splashed everywhere. The CSS variables are well-organized. This looks like a real design system.

3. **The scroll-reveal animations are well-timed.** The staggered delays on hero elements (0.2s → 0.4s → 0.6s → 0.8s → 1.0s) create a genuine cinematic reveal. Not overdone.

4. **The nav scroll effect is clean.** Transparent → frosted glass with a subtle amber border-bottom. Professional.

5. **Before/After tables in the services cards are a smart design choice.** They break the monotony of text blocks and create visual rhythm.

## What's NOT Working

1. **The service cards are WAY too long on desktop.** Each card contains: label, title, audience, problem paragraph, a 4-row table, 3 capability items with descriptions, AND engagement types. That's roughly 800px of vertical content per card. On a 1080p screen, you can't see both cards simultaneously. **The comparison — which is the whole point of the two-track layout — is lost.** The user has to scroll one card, then scroll back up to start the other.

2. **No visual break between CTA section and Contact section.** Both are text-heavy sections stacked directly. The CTA says "Book a Clarity Call" which links to #contact, and then you're immediately IN the contact section. It feels redundant — two consecutive asks with no breathing room. Consider merging them or adding a visual separator.

3. **The `&curren;` character (¤) as a location icon is broken.** It renders as the currency symbol ¤, which looks like a bug, not a design choice. Should be a proper icon or at minimum a unicode pin/map marker.

4. **Mobile nav has a z-index conflict.** The hamburger toggle is at z-index implicit (inside z-index 100 nav), but the open menu overlay is z-index 200. The toggle button disappears behind the overlay when menu is open — you can't close it on some mobile browsers. The toggle needs z-index: 300 when open.

5. **The hero stat "ICF" as a number is semantically awkward.** The stat bar uses a pattern of [number] + [label]: "15+" / "5" / "ICF". The first two are quantitative. The third is an acronym pretending to be a stat. It breaks the visual rhythm and reads oddly.

6. **Testimonial placeholder text visible on production.** There's a literal `<p>` tag saying "Testimonial placeholders — replace with verified client quotes" in monospace. If this ships, it screams "unfinished."

7. **No favicon.** The browser tab shows the default blank page icon. For a brand site, this is table stakes.

8. **Form has no actual backend.** The submit handler fakes success with a setTimeout. A visitor fills out the form, sees "Message Sent ✓", and... nothing happens. Their data goes nowhere. **This is a trust-destroying experience if someone actually tries to contact her.**

9. **The select dropdown has no custom arrow styling.** Despite `-webkit-appearance: none`, there's no replacement arrow indicator. On some browsers, it looks like a plain text input — users won't know it's a dropdown.

## Accessibility Issues

- The amber (#d4920a) on charcoal-950 (#0d0d0f) meets WCAG AA for large text but **fails for small text** (contrast ratio ~4.2:1, needs 4.5:1). The mono labels and eyebrow text using amber on dark backgrounds will fail accessibility audits.
- Form inputs have no visible focus indicator beyond the amber border — keyboard users can't easily track focus.
- The mobile hamburger menu has no aria-expanded attribute.

## Net-Net

The design language is strong and cohesive — this is clearly curated, not generated-and-shipped. But the service cards need restructuring for scannability, the broken icon and placeholder text need fixing before launch, and the form needs to actually work or be replaced with a Calendly/Cal.com embed. Accessibility contrast on small amber text is a legal liability for enterprise clients.
