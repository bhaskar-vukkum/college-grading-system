# GradeFlow — Academic Grading & Performance Platform

A premium, cinematic landing page and login experience with Apple-inspired **Liquid Glass (Glassmorphism)** aesthetics, designed for modern college academic grading management.

## 🌟 Highlights & Design Features

- **Cinematic Video Hero**: Full-viewport ambient video background (`hero.mp4`) with layered dark forest and charcoal gradient overlays, typography with accent gradients, and smooth scroll indicators.
- **Floating Liquid Glass Navbar**: Pill-shaped translucent navigation with live active section tracking, smooth in-page scrolling, and a responsive mobile drawer.
- **Philosophy & Feature Showcase ("Education deserves clarity")**: Three glassmorphism feature cards with numbered indicators, frosted icon containers, hover lift effects, and ambient geometric watermarks.
- **Interactive FAQ Accordion**: Single-expansion glass accordion with fluid Framer Motion animations and animated chevrons.
- **Glassmorphism Sign-In Experience**: Centered modal overlay with role selector (Student Portal / Faculty & Staff), institutional ID validation, show/hide password toggle, remember-me checkbox, and simulated verification states.
- **Refined Nature-Inspired Palette**: Charcoal obsidian (`#070b08`), dark forest greens (`#1b4332`, `#2d6a4f`), muted sage emeralds (`#74c69d`), and warm off-white typography.

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for production
```bash
npm run build
```

## Branch rosters and grading

Student rosters are matched to faculty by branch (the `department` field). All
faculty in the same branch share that branch's roster; section is not used.
Faculty can add exams from **Enter marks**. Publishing requires marks for every
student in the roster and updates each student's published exam entries,
course marks, credits, average and credit-weighted GPA. Firebase-backed student
records receive live updates in the student portal.

The demo accounts and sample grades are defined in `src/lib/seedData.js`. To
load them into the configured Firestore project, run `npm run seed` only on a
demo database; it updates fixed demo document IDs and must not be run against
real student records. The included `firestore.rules.demo` is intentionally
open for demonstration only; use authenticated Firestore rules before storing
real student data.
