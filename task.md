# prep. — Design Context & Maintenance Guide

> Design intent for **prep.**, the self-hosted system design interview practice tool.
> This document is the source of truth for the interface. When adding or changing UI,
> preserve the principles below and the tokens in `src/index.css`.

## Design Context

### Users

- **Who**: Anyone with an invite code — from the self-hosters' close friends to a wider community of candidates practicing system design interviews. Not a public product; access is invite-gated.
- **Context**: A candidate sits down to run a timed mock interview (HLD or LLD). They read a problem brief, converse with an AI interviewer, draw/store diagrams, and finish with a scored evaluation. Often short, focused sessions; users return repeatedly to track progress across conversations.
- **Job to be done**: Get realistic interview practice and honest scoring with zero friction — no fighting the interface, no distracting chrome. The tool should feel like a calm workspace, not another chat app.

### Brand Personality

- **Three words**: Precise, clean, important — with a touch of charm (a quiet wink, never loud).
- **Voice**: Calm, confident, matter-of-fact. The product is a serious practice instrument; the voice is the interviewer's — neutral, encouraging, never salesy or playful-to-a-fault.
- **Emotional goal**: The interface should make candidates feel *prepared and focused* — like walking into a well-organized study room, not a video game lobby and not a sterile exam hall.
- **References**: Notion (clean, easy to navigate, calm information density), Apple (simple, classy, restrained detail). Both signal: *refined utility*.
- **Anti-references**: Crazy color schemes, "AI slop" aesthetics (glassmorphism everywhere, neon-on-dark, purple-blue gradients, gradient text, generic rounded cards), and anything that reads as "another chatbot." If someone mistakes the UI for a generic AI chat tool, the design has failed.

### Aesthetic Direction

- **Theme**: Clean light theme today (warm off-whites, not pure white). Intended growth path: automatic light/dark (system preference) — when dark is added, it must keep the same warm-neutral tinting and indigo accent discipline, never slide into neon-on-dark.
- **Tone**: Refined minimalism with editorial precision. Intentionality over intensity. Left-aligned, asymmetric rhythm; generous whitespace with varied spacing — not the same padding everywhere.
- **Typography**: Inter (UI, weights 400–700) for reading; JetBrains Mono (400–600) used *sparingly and deliberately* for labels, eyebrows, tags, and identifiers — never as lazy "technical" shorthand. Tight letter-spacing on large headings (`letter-spacing: -0.5` to `-2.1`).
- **Color discipline**: Tinted neutrals (warm gray family in `--bg`/`--text-*`, never pure black or pure white). One dominant accent — **blueprint indigo** (`#3652d9`) — plus a small, semantic set: difficulty green/amber/orange and danger red. Neutrals carry the layout; accent is applied where it means something.
- **Layout**: Content maxes out around 960px; pages breathe with 56–80px vertical padding. Cards are used *where a discrete surface genuinely helps* (problem cards, profile panels) — never nested, never a card for everything. Asymmetry: two-column layouts use unequal fractions (e.g. `1.1fr / 0.9fr`), never identical halves.
- **Details**: Subtle, quiet shadows (`--shadow-sm/md`), small radii (6/10/14px), thin 1px borders. Micro-labels (mono, uppercase, letter-spaced) act as section eyebrows. Difficulty is always signaled with a colored dot + tinted pill.
- **Iconography**: `lucide-react`, 14–20px, `strokeWidth={2}`. Icons are helpers, never decoration; no big rounded-icon blocks stacked over headings.

### Design Principles

1. **Calm utility over decoration.** Every element earns its place. If something doesn't help a candidate practice, answer, or review, it doesn't ship. The interface recedes; the interview is the product.
2. **Precision in every detail.** Consistent tokens, exact alignment, deliberate type scale and spacing rhythm. A product about engineering interviews must itself feel engineered. Match existing conventions exactly when extending the UI.
3. **One accent, many neutrals.** Blueprint indigo is the single dominant color; everything else is a tinted neutral or a semantic difficulty color. Restraint in the palette is what makes the accent sharp.
4. **Tinted, never pure.** No `#000`/`#fff`. Warm off-whites for surfaces, and text colors chosen from the tinted neutral family — never raw gray on colored backgrounds.
5. **Maintainable, token-driven.** All colors, type, radius, and shadow live in `src/index.css` `:root`. New UI must reference these tokens, not hard-code values. Extend the token set (e.g. a future dark palette) rather than scattering ad-hoc literals.
6. **Accessible by default.** WCAG AA contrast, visible focus states, `prefers-reduced-motion` respected (already implemented globally). Interactions give immediate feedback via transform/opacity transitions with fast easings (120ms), never bounce.
