# Panel Discussion — All Five Reviewers

---

**Moderator:** You've all reviewed independently. Let's find the consensus. What are the top issues?

---

**Rohit (Investor):** I'll start with the elephant in the room. The placeholder testimonials. Every single one of us flagged it. Shreya called them "obviously fake." Marcus flagged the visible placeholder text in monospace. Meera said they made her *more cautious*. I said it's a "credibility emergency." This is the single highest-priority fix. Either remove the section entirely or replace with real content. There is no middle ground.

**Shreya (Brand):** Agreed. And I'll add — removing them is actually better than keeping fake ones. A testimonial section with placeholder text signals "I built a template." No testimonial section signals "I let my work speak." For a launch, the latter is stronger.

**Ankit (Growth):** I'll co-sign that. But I want to escalate the form issue. Marcus caught that the form goes nowhere. I flagged that "Book" implies immediacy but lands on a form. Put those together: **the primary conversion mechanism on this site is broken.** A visitor fills out the form, thinks they've made contact, and gets ghosted. That's a P0 alongside testimonials.

**Marcus (Design):** The form is a technical fix — either hook it up to Formspree/Netlify Forms or replace the CTA with a Calendly link. But I want to flag the broken icon (¤ character for location) and the missing favicon too. These are small things that accumulate into a "this site isn't finished" impression.

**Meera (Customer):** From my perspective, the biggest strategic issue — beyond the testimonials and form — is that **I can't tell if Ananya is independent or still at Tata Steel.** The copy says "I've spent 15 years inside Tata Steel" in past tense, but there's no clear "I now run an independent practice" statement. For an enterprise buyer, this is a blocking question. I can't engage someone whose availability I'm unsure of.

**Shreya:** That's a copy fix. One sentence in the About section. "After 15 years at Tata Steel, I now..." — done. But Meera's right that it's a blocker.

**Ankit:** The other conversion issue I want to raise: there's no low-commitment entry point. No email capture, no downloadable resource. The site's only conversion action is "Book a Call" — which is high-friction for enterprise buyers who've just found you. Rohit, you'd agree?

**Rohit:** Absolutely. Enterprise buyers don't convert on first visit. They need a reason to come back. A lead magnet or newsletter opt-in would solve this. But I'd call that P1, not P0. For launch, the form needs to work and the testimonials need to go.

**Marcus:** Let me raise the accessibility issue. The amber text on dark backgrounds fails WCAG AA for small text. The monospace labels, eyebrow text, section labels — all using amber (#d4920a) on near-black. That's a ~4.2:1 ratio. Needs 4.5:1. For enterprise clients who may run accessibility audits on vendors, this is a real risk. Bump the amber or add a lighter variant for small text.

**Shreya:** I want to flag something nobody else explicitly said: **no photo of Ananya.** This is a personal brand site. The copy is in first person. The About section tells her story. But there's no face. For coaching especially — where trust and human connection are the product — this is a significant gap. I'd put it at P1.

**Meera:** I agree. When I'm evaluating a coach, I want to see the person. It's not vanity — it's trust-building.

**Ankit:** One more from me — the Open Graph meta tags are missing. If Ananya shares this on LinkedIn (which is probably her primary distribution channel), it'll show a generic preview with no image, no description. For launch, that's leaving discoverability on the table.

**Marcus:** And the mobile nav z-index bug. When you open the hamburger menu, the toggle disappears behind the overlay. You literally can't close the menu on some devices without refreshing. That's a P0 for mobile users.

**Rohit:** Let me add one more P1: Tata Steel should be mentioned above the fold. It's her single strongest credibility signal for Indian enterprise buyers, and right now you have to scroll to the About section to find it. Even a subtle "15 years at Tata Steel" in the hero subhead or stat bar would transform first-impression trust.

**Moderator:** Let's compile the fix list. Priorities?

**All:** [see fix-list.md]
