<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Diverxen Studio — Project Rules & Guidelines

## 1. Brand Tokens
- **Brand Red**: `#E50914` (`--color-brand-red`)
- **Jet Black**: `#080808` (`--color-brand-dark`)
- **Surface**: `#121212` (`--color-brand-surface`)
- **Text**: `#FFFFFF` (`--color-brand-text`)
- **Neutral Gray**: `#8E8E93` (`--color-brand-gray`)

## 2. Typography & Tagline
- **Font**: Google Font `Outfit` (weights: `400`, `500`, `600`, `700`) mapped to `--font-outfit` / `--font-sans`.
- **Headlines**:
  - Letter-spacing: `-4%` (`tracking-[-0.04em]`)
  - Line-height: `83%` (`leading-[0.83]`)
- **Tagline**: "Discover. Differentiate. Deliver."

## 3. GSAP & Animation Rules
- **Container Scoping**: Always use `useGSAP` from `@gsap/react` scoped to a container ref (`useGSAP(() => { ... }, { scope: containerRef })`).
- **No Raw `useEffect`**: Never use raw `useEffect` for GSAP animations.
- **ScrollTrigger Registration**: Always register `ScrollTrigger` at the module level (`gsap.registerPlugin(ScrollTrigger)`).
- **Responsive Animations**: Wrap responsive scroll animations in `gsap.matchMedia()`.
- **Performance**: Only animate `transform` (e.g. `x`, `y`, `scale`, `rotation`) and `opacity` properties to prevent layout thrashing and maintain 60/120fps.
