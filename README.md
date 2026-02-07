# Bible Course App

**An offline-first, audio-driven, curriculum-based Bible study application**

---

## Overview

Bible Course App is a structured theology education tool that delivers short, guided study sessions following a defined syllabus. It functions like a Bible college course, not a devotional or reflection app.

### What This Is
- ✅ A structured, curriculum-based Bible study tool
- ✅ Audio-first with guided sessions (5–10 minutes)
- ✅ Instructional and progressive, following a predefined syllabus
- ✅ Teaching **how** to study Scripture, not **what** to feel about it

### What This Is NOT
- ❌ A devotional or reflection app
- ❌ A chatbot or conversational partner
- ❌ Pastoral counseling or spiritual direction
- ❌ A preaching or sermon generator
- ❌ A social or discussion platform

---

## Core Philosophy

1. **Scripture studied as text before application**
2. **Curriculum over spontaneity**
3. **Historical-grammatical method as default**
4. **Finite, linear sessions**
5. **Authority resides in the text, not the AI**
6. **No personalization of doctrine**
7. **Privacy and restraint over engagement**

---

## Project Structure

```
bible-course-app/
├── docs/                           # All documentation
│   ├── curriculum-spec.md          # Lesson schema, content guidelines
│   ├── course-outline-bf01.md      # Biblical Foundations I (24 lessons)
│   ├── ARCHITECTURE.md             # System design, state machine
│   ├── SESSION-FLOW.md             # 7-segment flow, commands
│   └── AI-GUARDRAILS.md            # AI behavioral constraints
│
├── curriculum/                     # Course content (offline-first)
│   └── courses/
│       └── biblical-foundations-01/
│           ├── course.json         # (to be created)
│           └── lessons/
│               ├── bf01_lesson_01.json
│               ├── bf01_lesson_02.json
│               └── bf01_lesson_03.json
│
├── src/                            # Source code (to be developed)
│   ├── components/                 # UI components
│   ├── controllers/                # Session controller, command router
│   ├── services/                   # Audio playback, TTS, storage
│   └── utils/                      # Helpers, validators
│
├── README.md                       # This file
└── .gitignore
```

---

## Current Status

### ✅ Completed (Pomodoros 1–3)

**Pomodoro 1: Curriculum Architecture**
- Comprehensive curriculum specification
- Complete 24-lesson course outline (Biblical Foundations I)
- First 3 lesson JSON files created

**Pomodoro 2: Core Documentation**
- System architecture with state machine
- Session flow with 7-segment structure
- AI guardrails and behavioral constraints

**Pomodoro 3: Repository Setup**
- Git repository initialized
- README and documentation
- Project structure established

### 🚧 Next Steps

**Immediate (Next 3 Pomodoros):**
1. Complete remaining lesson JSON files (Lessons 4–24)
2. Create course.json for Biblical Foundations I
3. Build session state machine (JavaScript/TypeScript)

**Short-term:**
4. Implement voice command parser
5. Develop audio playback system (TTS integration)
6. Build UI (minimal, voice-first)

**Medium-term:**
7. Add database layer (SQLite)
8. Implement progress tracking
9. Test complete lesson flow

**Long-term:**
10. Add Hermeneutics I course (18 lessons)
11. Pre-record audio with professional voice talent
12. iOS/Android app deployment

---

## Pedagogical Model

Each lesson follows a **fixed 7-segment structure**:

1. **Orientation** — Where this lesson fits in the course
2. **Text Reading** — Scripture passage
3. **Historical & Literary Context** — Background information
4. **Structural Observation** — Textual analysis
5. **Key Theological Themes** — Concepts and terminology
6. **Knowledge-Check Question** — Comprehension assessment
7. **Session Close** — Summary and preview

**No open-ended reflection loops. No emotional processing. No spiritual direction.**

---

## Voice Command Set

Users may **ONLY** say:

- `"Begin the lesson"`
- `"Read the passage"`
- `"Explain the context"`
- `"Analyze the structure"`
- `"Summarize the key themes"`
- `"Ask the review question"`
- `"End the lesson"`

**No conversational drift. No deviation.**

---

## AI Role

The AI acts as a **neutral theological instructor** explaining academic material.

### AI May:
✅ Explain historical background  
✅ Explain literary structure  
✅ Define theological terms  
✅ Compare passages within canon  
✅ Ask comprehension questions  

### AI May NOT:
❌ Apply the text personally  
❌ Offer moral exhortation  
❌ Offer comfort or encouragement  
❌ Speculate on divine intent toward the user  
❌ Modify theology for accessibility  
❌ Say "this means for your life…"  

See `docs/AI-GUARDRAILS.md` for complete constraints.

---

## Technology Stack (Proposed)

**Platform:**
- Primary: iOS (Swift/SwiftUI)
- Secondary: Android (Kotlin/Jetpack Compose)

**Audio:**
- TTS: On-device (AVSpeechSynthesizer / Android TextToSpeech)
- Voice Recognition: On-device speech-to-text preferred

**Data:**
- Local storage: SQLite
- Offline-first: All curriculum bundled in app

**Framework:**
- State management: Finite state machine
- Architecture: MVVM or Clean Architecture

---

## Documentation

### Core Documents (Read First)
1. **`docs/curriculum-spec.md`** — Lesson schema, content creation guidelines
2. **`docs/ARCHITECTURE.md`** — System design, components, state machine
3. **`docs/SESSION-FLOW.md`** — 7-segment structure, command handling

### Reference Documents
4. **`docs/course-outline-bf01.md`** — Complete Biblical Foundations I outline
5. **`docs/AI-GUARDRAILS.md`** — AI behavioral constraints and testing

---

## Development Workflow

### Adding a New Lesson

1. **Create lesson JSON** following schema in `curriculum-spec.md`
2. **Validate**:
   - All 7 segment types present
   - Word counts within limits
   - No forbidden phrases
   - Prerequisite correctly set
3. **Test**:
   - Load in session controller
   - Play through all segments
   - Verify knowledge-check evaluation

### Modifying AI Behavior

1. **Update** `docs/AI-GUARDRAILS.md` if needed
2. **Add test scenario** to Section 6.1
3. **Update system prompt** template
4. **Re-run all compliance tests**

---

## Quality Standards

### Lesson Content Checklist
- [ ] Lesson ID follows naming convention
- [ ] All 7 segment types present and in order
- [ ] Word counts within limits
- [ ] No forbidden phrases used
- [ ] Knowledge-check question is factual
- [ ] Objective is measurable and clear
- [ ] Prerequisites correctly identified
- [ ] Audio script is 8–16 words per sentence
- [ ] Tone is neutral and instructional
- [ ] No personal application language

### Code Quality
- [ ] Follows state machine strictly
- [ ] No content generation in code
- [ ] Error handling for all edge cases
- [ ] Voice commands exactly matched
- [ ] Offline-first architecture maintained

---

## Success Criteria

### This App Succeeds If:
✅ Users can explain Scripture more clearly to others  
✅ Users understand structure, genre, and theology better  
✅ Sessions feel like a short lecture  
✅ Users progress linearly through material  
✅ The app does not replace real study or teachers  

### This App Fails If:
❌ It becomes devotional  
❌ It becomes motivational  
❌ It personalizes doctrine  
❌ It encourages dependence  
❌ It drifts from curriculum  

---

## Git Workflow

### Branching Strategy
- `main` — Stable, production-ready
- `develop` — Integration branch
- `feature/*` — Individual features
- `content/*` — Lesson content additions

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `content`

**Example:**
```
content(bf01): add lessons 4-8 for Unit 2

- Created lesson JSON files for Genesis covenant framework
- Validated word counts and segment structure
- Updated course outline with completion status

Closes #12
```

---

## Contact & Support

**Developer:** Solo developer (you)  
**Purpose:** Private, personal Bible study tool  
**License:** (To be determined)  

---

## Acknowledgments

Built on the conviction that Scripture deserves rigorous, careful, academic study—not as a replacement for devotion, but as a foundation for it.

---

**Current Version:** 0.1.0-alpha  
**Last Updated:** 2026-02-07