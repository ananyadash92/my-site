# Prioritized Fix List

Compiled from 5 independent reviews + panel discussion.

---

## P0: Launch Blockers — Fix Before Deploying

| # | Issue | Flagged By | Fix |
|---|---|---|---|
| P0-1 | **Placeholder testimonials destroy credibility** — fake quotes with generic titles ("Senior Stakeholder, Enterprise Transformation") are instantly detectable. The visible "Testimonial placeholders" monospace note makes it worse. | All 5 reviewers | Remove testimonial quotes entirely. Replace with a credibility/proof section: years of experience, domains, methodology, Tata Steel mention. Keep the section structure for when real testimonials come. |
| P0-2 | **Contact form submits to nowhere** — shows "Message Sent ✓" but data is discarded. Visitors believe they've made contact; they haven't. Trust-destroying. | Marcus, Ankit, Rohit | Add Formspree/Netlify Forms action, or replace with a mailto: link + clear next-step copy until a backend is ready. The fake success state must go. |
| P0-3 | **Mobile nav z-index bug** — hamburger toggle disappears behind the fullscreen overlay when menu opens. Users cannot close the menu without refresh. | Marcus | Add `z-index: 300` to `.nav__toggle` when `.open`, or restructure the overlay to not cover the toggle. |
| P0-4 | **Broken location icon** — `&curren;` renders as ¤ (currency symbol), not a location marker. Looks like a rendering bug. | Marcus | Replace with a proper unicode pin character (&#x1F4CD; or &#9679;) or SVG icon, or simply use the text "LOC" in mono style. |
| P0-5 | **LinkedIn link is dead** — footer LinkedIn link points to `#`. A dead link on a personal brand site signals "not ready." | Rohit | Replace `#` with actual LinkedIn profile URL, or remove the link until available. |

---

## P1: Important — Fix Soon After Launch

| # | Issue | Flagged By | Fix |
|---|---|---|---|
| P1-1 | **Availability ambiguity — Tata Steel vs. independent** — copy says "spent 15 years inside Tata Steel" but doesn't clarify current status. Enterprise buyers can't engage someone whose availability is unknown. | Meera, Rohit | Add one clear sentence in About: "I now work independently..." or clarify the dual arrangement. |
| P1-2 | **No photo of Ananya** — personal brand site with no face. Coaching buyers especially need human connection. | Shreya, Meera | Add a professional headshot in the About section or hero. |
| P1-3 | **Tata Steel not visible above the fold** — strongest credibility signal is buried in paragraph 1 of About. Indian enterprise buyers would trust instantly if they saw it early. | Rohit, Ankit | Add "Tata Steel" to the hero stat-bar or subhead. |
| P1-4 | **Amber small-text fails WCAG AA** — #d4920a on #0d0d0f is ~4.2:1 ratio. Monospace labels, eyebrow text, section labels all fail for small text (need 4.5:1). | Marcus | Bump small-text amber to #e0a020 or lighter (~4.8:1), or use charcoal-300 for small labels and reserve amber for large text only. |
| P1-5 | **About section too long** — 5 paragraphs is an essay. The coaching origin story (the most differentiating content) is in paragraph 4 where nobody reads it. | Shreya, Ankit | Cut to 3 paragraphs max. Lead with the bridge metaphor, move coaching origin higher, cut redundancy. |
| P1-6 | **Missing Open Graph / social meta tags** — LinkedIn shares show generic preview. For a personal brand site where LinkedIn is the primary channel, this kills shareability. | Ankit | Add og:title, og:description, og:image, og:type, and twitter:card meta tags. |
| P1-7 | **No favicon** — browser tab shows blank default icon. | Marcus | Add a simple favicon — amber square or the "A" from the logo. |
| P1-8 | **"Clarity Call" is undefined** — CTA says "Book" but doesn't explain what happens, what the output is, or what the visitor gets. | Shreya, Meera | Add 1-2 lines below the CTA: "In 30 minutes, you'll walk away with: [concrete deliverable]." |
| P1-9 | **Hero eyebrow is generic** — "Transformation Consulting & Leadership Coaching" reads like a LinkedIn headline. | Shreya | Replace with something sharper or remove — the headline carries the weight. |
| P1-10 | **Select dropdown has no visual arrow** — `-webkit-appearance: none` removes native arrow but no custom one is added. Users may not know it's a dropdown. | Marcus | Add a CSS pseudo-element arrow or background-image chevron to the select wrapper. |

---

## P2: Nice to Have — Future Iterations

| # | Issue | Flagged By | Fix |
|---|---|---|---|
| P2-1 | No low-commitment entry point (lead magnet, email capture) | Ankit, Rohit | Add a downloadable resource or newsletter opt-in |
| P2-2 | No pricing signals | Ankit, Meera | Add engagement model descriptions or "starting from" ranges |
| P2-3 | No case studies or work samples | Meera | Add one anonymized Before/After artifact |
| P2-4 | Dual-track positioning creates friction for single-intent visitors | Meera | Consider audience-gated entry or tabbed services |
| P2-5 | CTA section and Contact section feel redundant back-to-back | Marcus | Merge or add visual breathing room |
| P2-6 | Service cards too long for side-by-side comparison on desktop | Marcus | Collapse detail into expandable sections |
| P2-7 | No "Who This Is NOT For" section | Ankit | Add a qualifying statement to sharpen conversion |
| P2-8 | aria-expanded missing on mobile toggle | Marcus | Add JS to toggle aria-expanded attribute |
| P2-9 | Contact section copy is generic vs rest of site | Shreya | Rewrite "Start a Conversation" to match brand voice |
