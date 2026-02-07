# Git Repository Setup Instructions

## Initial Setup (Run on Your Mac)

**Your current directory:**
```
/Users/admin/Desktop/Web Development Projects/Bible-Course-App
```

### Step 1: Copy Files from Outputs

Download all files from the outputs directory I've created and place them in your `Bible-Course-App` directory.

### Step 2: Initialize Git Repository

```bash
cd "/Users/admin/Desktop/Web Development Projects/Bible-Course-App"

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "chore: initial project setup

- Added curriculum specification and lesson schema
- Created first 3 lesson JSON files (Biblical Foundations I)
- Documented system architecture and session flow
- Defined AI guardrails and behavioral constraints
- Established project structure and README"
```

### Step 3: Create Development Branch

```bash
# Create and switch to development branch
git checkout -b develop

# Create feature branch for lesson content
git checkout -b content/bf01-unit-2
```

### Step 4: (Optional) Connect to Remote Repository

If you want to back up to GitHub:

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/bible-course-app.git

# Push initial commit
git checkout main
git push -u origin main

# Push develop branch
git checkout develop
git push -u origin develop
```

---

## Recommended Commit Workflow

### For Content Additions

```bash
# Create feature branch
git checkout develop
git checkout -b content/bf01-lesson-04

# Make changes (add lesson JSON)
# ... work on files ...

# Stage and commit
git add curriculum/courses/biblical-foundations-01/lessons/bf01_lesson_04.json
git commit -m "content(bf01): add lesson 4 - creation and commission

- Created lesson JSON for Genesis 1-2 study
- Validated segment structure and word counts
- Added vocabulary terms: image of God, dominion mandate"

# Merge back to develop
git checkout develop
git merge content/bf01-lesson-04
git branch -d content/bf01-lesson-04
```

### For Documentation Updates

```bash
git checkout develop
git checkout -b docs/update-session-flow

# Make changes
# ... edit docs/SESSION-FLOW.md ...

git add docs/SESSION-FLOW.md
git commit -m "docs(session-flow): add pause/resume enhancement notes

- Documented future pause/resume feature
- Added state persistence requirements"

git checkout develop
git merge docs/update-session-flow
git branch -d docs/update-session-flow
```

### For Code Implementation

```bash
git checkout develop
git checkout -b feature/session-state-machine

# Implement feature
# ... create src/controllers/SessionController.js ...

git add src/controllers/
git commit -m "feat(session): implement state machine controller

- Created SessionController with finite state machine
- Implemented all state transitions per docs/SESSION-FLOW.md
- Added command parser and routing logic
- Includes unit tests for state transitions"

git checkout develop
git merge feature/session-state-machine
git branch -d feature/session-state-machine
```

---

## Commit Message Convention

### Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style/formatting (no logic change)
- `refactor` — Code refactoring
- `test` — Adding or updating tests
- `chore` — Build process, dependencies, tooling
- `content` — Curriculum content (lessons, courses)

### Scopes
- `curriculum` — Lesson content, course structure
- `session` — Session controller, state machine
- `audio` — TTS, playback, voice commands
- `ui` — User interface components
- `db` — Database, storage
- `docs` — Documentation
- `bf01` — Biblical Foundations I course
- `herm01` — Hermeneutics I course (future)

### Examples

```bash
# Good commits
git commit -m "content(bf01): complete unit 2 lessons (4-8)"
git commit -m "feat(audio): integrate iOS AVSpeechSynthesizer for TTS"
git commit -m "fix(session): prevent state transition when audio playing"
git commit -m "docs(architecture): update database schema for progress tracking"
git commit -m "chore: add SQLite dependency to package.json"

# Bad commits (too vague)
git commit -m "update files"
git commit -m "fixes"
git commit -m "WIP"
```

---

## Git Tags for Releases

When reaching milestones:

```bash
# Tag version
git tag -a v0.1.0 -m "Alpha release: Biblical Foundations I curriculum complete"
git push origin v0.1.0

# Future tags
v0.2.0 — Session controller implemented
v0.3.0 — Audio system integrated
v0.4.0 — UI complete
v1.0.0 — MVP: Full Biblical Foundations I course functional
```

---

## Viewing History

```bash
# View commit log
git log --oneline --graph --all

# View changes in last commit
git show

# View changes in specific file
git log -p docs/curriculum-spec.md
```

---

## Suggested First Commits (After Setup)

```bash
# Commit 1: Initial setup (already done above)

# Commit 2: Complete remaining lessons for Unit 2
git add curriculum/courses/biblical-foundations-01/lessons/bf01_lesson_04.json
git add curriculum/courses/biblical-foundations-01/lessons/bf01_lesson_05.json
git add curriculum/courses/biblical-foundations-01/lessons/bf01_lesson_06.json
git add curriculum/courses/biblical-foundations-01/lessons/bf01_lesson_07.json
git add curriculum/courses/biblical-foundations-01/lessons/bf01_lesson_08.json
git commit -m "content(bf01): add unit 2 lessons (creation to Abraham)

- Lesson 4: Creation and Commission (Gen 1-2)
- Lesson 5: Fall and Consequence (Gen 3)
- Lesson 6: Noah and Universal Covenant (Gen 6, 9)
- Lesson 7: Abraham and Promise (Gen 15, 17)
- Lesson 8: Testing and Confirmation (Gen 22)"

# Commit 3: Add course.json
git add curriculum/courses/biblical-foundations-01/course.json
git commit -m "content(bf01): add course metadata JSON

- Defined course structure with 5 units
- Listed all 24 lessons with dependencies
- Added learning outcomes and course description"
```

---

**Ready to begin!** Run the commands in Step 2 to initialize your repository.