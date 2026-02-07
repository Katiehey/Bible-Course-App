# Architecture Documentation
## Bible Course App

**Version:** 1.0  
**Last Updated:** 2026-02-07

---

## 1. System Overview

### 1.1 Product Type
Bible Course App is an **offline-first, audio-driven, curriculum-based learning application** that delivers structured theology education through short, bounded sessions.

### 1.2 Core Architectural Principles
- **Offline-first:** All core functionality works without network
- **Audio-first:** Primary interaction is listening, not reading
- **State-driven:** Session flow follows strict finite state machine
- **Curriculum-bound:** No content generation, only predefined lesson delivery
- **Privacy-focused:** No telemetry, no cloud sync, local-only data

### 1.3 Technology Constraints
- Must run on iOS (primary) and Android (secondary)
- Audio playback and TTS required
- Voice command recognition (on-device preferred)
- Local SQLite or equivalent for data persistence
- No authentication or user accounts required

---

## 2. System Architecture

### 2.1 High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                 │
│  (Voice Commands, Audio Playback, Minimal Visual UI)    │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                  Session Controller                      │
│    (State Machine, Command Router, Flow Enforcer)       │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                 Content Delivery Engine                  │
│      (Lesson Loader, Segment Sequencer, TTS/Audio)      │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│                    Data Layer                            │
│        (Curriculum Store, Progress Tracker, Local DB)   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Component Responsibilities

#### User Interface Layer
**Responsibilities:**
- Capture voice commands via microphone
- Display minimal visual feedback (lesson title, progress indicator)
- Play audio segments (TTS or pre-recorded)
- Handle user confirmation for knowledge-check questions

**Does NOT:**
- Generate conversational responses
- Allow free-form text input
- Display extensive visual content

#### Session Controller
**Responsibilities:**
- Maintain current session state (see state machine in Section 3)
- Route voice commands to appropriate handlers
- Enforce session flow rules (no skipping, no backtracking)
- Trigger session termination

**Does NOT:**
- Make content decisions
- Modify lesson structure
- Allow out-of-order segment access

#### Content Delivery Engine
**Responsibilities:**
- Load lesson JSON from local storage
- Sequence segments in order
- Generate or play audio for each segment
- Present knowledge-check questions
- Record user answers

**Does NOT:**
- Generate new content
- Adapt content based on user performance
- Skip segments

#### Data Layer
**Responsibilities:**
- Store all lesson JSON files locally
- Track lesson completion status
- Record user progress (which lessons completed)
- Store knowledge-check answers (optional)

**Does NOT:**
- Sync to cloud
- Share data externally
- Collect analytics

---

## 3. Session State Machine

### 3.1 State Definitions

```
┌─────────────┐
│    IDLE     │ ← Default state, no lesson active
└──────┬──────┘
       │ "Begin the lesson"
       ▼
┌─────────────┐
│  LESSON_    │ ← Lesson loaded, orientation pending
│  LOADED     │
└──────┬──────┘
       │ Auto-play orientation OR "Read the passage"
       ▼
┌─────────────┐
│ ORIENTATION │ ← Playing orientation segment
│  _PLAYING   │
└──────┬──────┘
       │ Segment complete
       ▼
┌─────────────┐
│  READING_   │ ← Playing Scripture reading segment
│  READY      │
└──────┬──────┘
       │ "Read the passage" OR auto-advance
       ▼
┌─────────────┐
│  READING_   │ ← Playing passage audio
│  PLAYING    │
└──────┬──────┘
       │ Segment complete
       ▼
┌─────────────┐
│  CONTEXT_   │ ← Ready for context segment
│  READY      │
└──────┬──────┘
       │ "Explain the context" OR auto-advance
       ▼
┌─────────────┐
│  CONTEXT_   │ ← Playing context segment
│  PLAYING    │
└──────┬──────┘
       │ Segment complete
       ▼
┌─────────────┐
│ ANALYSIS_   │ ← Ready for analysis segment
│  READY      │
└──────┬──────┘
       │ "Analyze the structure" OR auto-advance
       ▼
┌─────────────┐
│ ANALYSIS_   │ ← Playing analysis segment
│  PLAYING    │
└──────┬──────┘
       │ Segment complete
       ▼
┌─────────────┐
│  THEMES_    │ ← Ready for themes segment
│  READY      │
└──────┬──────┘
       │ "Summarize the key themes" OR auto-advance
       ▼
┌─────────────┐
│  THEMES_    │ ← Playing themes segment
│  PLAYING    │
└──────┬──────┘
       │ Segment complete
       ▼
┌─────────────┐
│ QUESTION_   │ ← Ready for knowledge-check
│  READY      │
└──────┬──────┘
       │ "Ask the review question"
       ▼
┌─────────────┐
│ QUESTION_   │ ← Presenting question, awaiting answer
│  ASKED      │
└──────┬──────┘
       │ User provides answer
       ▼
┌─────────────┐
│ QUESTION_   │ ← Answer evaluated, feedback given
│ ANSWERED    │
└──────┬──────┘
       │ Auto-advance to close
       ▼
┌─────────────┐
│   CLOSE_    │ ← Ready for close segment
│   READY     │
└──────┬──────┘
       │ "End the lesson" OR auto-advance
       ▼
┌─────────────┐
│   CLOSE_    │ ← Playing close segment
│  PLAYING    │
└──────┬──────┘
       │ Segment complete
       ▼
┌─────────────┐
│  SESSION_   │ ← Lesson complete, awaiting final command
│  COMPLETE   │
└──────┬──────┘
       │ "End the lesson" OR timeout (10 sec)
       ▼
┌─────────────┐
│    IDLE     │ ← Back to default state
└─────────────┘
```

### 3.2 State Transition Rules

**IDLE → LESSON_LOADED**
- Trigger: User says "Begin the lesson"
- Condition: Next lesson in sequence is available
- Action: Load lesson JSON, set current_segment = 1 (orientation)

**LESSON_LOADED → ORIENTATION_PLAYING**
- Trigger: Automatic on load
- Action: Play orientation audio

**ORIENTATION_PLAYING → READING_READY**
- Trigger: Orientation audio completes
- Action: Set current_segment = 2 (reading)

**READING_READY → READING_PLAYING**
- Trigger: User says "Read the passage" OR auto-advance after 2 seconds
- Action: Play passage audio (TTS or pre-recorded)

**[Pattern repeats for CONTEXT, ANALYSIS, THEMES]**

**QUESTION_READY → QUESTION_ASKED**
- Trigger: User says "Ask the review question"
- Action: Play question audio, activate answer capture

**QUESTION_ASKED → QUESTION_ANSWERED**
- Trigger: User provides verbal answer
- Action: Evaluate answer (exact match or acceptable variant), provide feedback

**QUESTION_ANSWERED → CLOSE_READY**
- Trigger: Automatic after 1 second
- Action: Set current_segment = 7 (close)

**CLOSE_PLAYING → SESSION_COMPLETE**
- Trigger: Close audio completes
- Action: Mark lesson as complete in database

**SESSION_COMPLETE → IDLE**
- Trigger: User says "End the lesson" OR 10-second timeout
- Action: Clear current lesson, unlock next lesson, return to idle

### 3.3 Invalid Transitions (Blocked)

**From ANY state:**
- ❌ "Skip to question" → No effect
- ❌ "Go back to context" → No effect
- ❌ "Repeat that" → No effect (not implemented)
- ❌ Any conversational input → "Please use a valid command"

**From IDLE:**
- ❌ "Read the passage" → "No lesson is active. Say 'Begin the lesson' first."

**From SESSION_COMPLETE:**
- ❌ "Read the passage" → "This lesson is complete. Say 'End the lesson' to return."

---

## 4. Voice Command Processing

### 4.1 Command Parser Architecture

```
Voice Input (Raw Audio)
        ↓
Speech-to-Text (On-Device or Cloud STT)
        ↓
Text Normalization (lowercase, punctuation removal)
        ↓
Command Matcher (exact phrase matching)
        ↓
Command Router (based on current state)
        ↓
Action Handler (state transition + content delivery)
```

### 4.2 Valid Command Set (Exhaustive)

| Command | Valid States | Action |
|---------|--------------|--------|
| "Begin the lesson" | IDLE | Load next lesson, transition to LESSON_LOADED |
| "Read the passage" | READING_READY | Play passage audio, transition to READING_PLAYING |
| "Explain the context" | CONTEXT_READY | Play context audio, transition to CONTEXT_PLAYING |
| "Analyze the structure" | ANALYSIS_READY | Play analysis audio, transition to ANALYSIS_PLAYING |
| "Summarize the key themes" | THEMES_READY | Play themes audio, transition to THEMES_PLAYING |
| "Ask the review question" | QUESTION_READY | Play question audio, transition to QUESTION_ASKED |
| "End the lesson" | SESSION_COMPLETE | Mark complete, transition to IDLE |

**Any other input:** Respond with "Please use a valid command" (TTS), no state change.

### 4.3 Command Matching Strategy

**Exact Match (Preferred):**
```python
VALID_COMMANDS = {
    "begin the lesson": "BEGIN_LESSON",
    "read the passage": "READ_PASSAGE",
    "explain the context": "EXPLAIN_CONTEXT",
    "analyze the structure": "ANALYZE_STRUCTURE",
    "summarize the key themes": "SUMMARIZE_THEMES",
    "ask the review question": "ASK_QUESTION",
    "end the lesson": "END_LESSON"
}

def parse_command(text):
    normalized = text.lower().strip()
    return VALID_COMMANDS.get(normalized, None)
```

**Fuzzy Matching (Optional Enhancement):**
- Allow minor variations: "begin lesson" = "begin the lesson"
- Typo tolerance: Levenshtein distance ≤ 2
- **Critical:** Never match conversational input as valid command

---

## 5. AI Integration (LLM Component)

### 5.1 AI Role Definition

**The AI is NOT:**
- A conversational agent
- A spiritual counselor
- A content generator
- An adaptive tutor

**The AI IS:**
- A neutral theological instructor
- A script reader (for audio segments)
- A question evaluator (for knowledge checks)

### 5.2 AI Usage Points

#### Point 1: Audio Script Delivery (TTS)
- **Input:** Segment JSON `audio_script` field
- **Output:** Spoken audio via TTS
- **Constraints:** Read script verbatim, no improvisation

#### Point 2: Knowledge-Check Answer Evaluation
- **Input:** User's verbal answer + correct answer + acceptable variants
- **Output:** "Correct" or "The answer is [correct_answer]"
- **Constraints:** Binary evaluation only, no extended feedback

**Example:**
```json
{
  "type": "question",
  "audio_script": "What three elements does God promise to Abraham?",
  "correct_answer": "Land, descendants, and blessing",
  "acceptable_variants": [
    "land, offspring, blessing",
    "territory, descendants, divine favor"
  ]
}
```

**AI Evaluation Logic:**
```python
def evaluate_answer(user_answer, correct_answer, variants):
    normalized_user = user_answer.lower().strip()
    
    if normalized_user == correct_answer.lower():
        return "Correct"
    
    for variant in variants:
        if normalized_user == variant.lower():
            return "Correct"
    
    return f"The answer is {correct_answer}"
```

### 5.3 AI Guardrails (CRITICAL)

**The AI must NEVER:**
- Generate content beyond reading prepared scripts
- Provide personal application or spiritual direction
- Use forbidden phrases (see curriculum-spec.md Section 6.1)
- Adapt theology for accessibility
- Respond to conversational prompts
- Offer comfort or encouragement
- Speculate on divine intent toward user

**If user attempts conversation:**
- AI responds: "This is a structured course. Please use a valid command."
- No engagement with conversational content

**If user asks for application:**
- AI responds: "This course teaches interpretation, not application. Please continue with the lesson."

**If user asks theological questions:**
- AI responds: "This course follows a set curriculum. Please consult a pastor or theologian for questions outside the syllabus."

### 5.4 System Prompt Template

```
You are the voice component of Bible Course App, a structured theology curriculum.

ROLE:
- You are a neutral theological instructor reading prepared lesson scripts
- You evaluate knowledge-check answers against predefined correct answers

STRICT RULES:
1. Read audio_script fields verbatim with no additions
2. Do not engage in conversation
3. Do not provide personal application
4. Do not use any phrases from the forbidden list
5. For knowledge checks, only say "Correct" or "The answer is [correct_answer]"
6. If user input is not a valid command, say: "Please use a valid command"

VALID COMMANDS:
- "Begin the lesson"
- "Read the passage"
- "Explain the context"
- "Analyze the structure"
- "Summarize the key themes"
- "Ask the review question"
- "End the lesson"

CURRENT SESSION STATE: {state}
CURRENT LESSON: {lesson_id}
CURRENT SEGMENT: {segment_type}

SEGMENT TO READ:
{audio_script}

READ THE SEGMENT ABOVE IN A NEUTRAL, INSTRUCTIONAL TONE.
```

---

## 6. Data Persistence

### 6.1 Database Schema (SQLite)

**Table: `courses`**
```sql
CREATE TABLE courses (
    course_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    total_lessons INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Table: `lessons`**
```sql
CREATE TABLE lessons (
    lesson_id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    title TEXT NOT NULL,
    objective TEXT,
    prerequisite TEXT,
    json_path TEXT NOT NULL,  -- Path to lesson JSON file
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);
```

**Table: `user_progress`**
```sql
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    completed_at TIMESTAMP,
    answer_given TEXT,
    answer_correct BOOLEAN,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id)
);
```

**Table: `session_state`**
```sql
CREATE TABLE session_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),  -- Singleton row
    current_lesson_id TEXT,
    current_state TEXT,
    current_segment INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_lesson_id) REFERENCES lessons(lesson_id)
);
```

### 6.2 File System Structure

```
AppDataDirectory/
├── curriculum/
│   └── courses/
│       └── biblical-foundations-01/
│           ├── course.json
│           └── lessons/
│               ├── bf01_lesson_01.json
│               ├── bf01_lesson_02.json
│               └── ...
└── database/
    └── bible_course.db
```

---

## 7. Audio Delivery Strategy

### 7.1 Text-to-Speech (TTS)
**Primary Method:**
- Use on-device TTS (iOS: AVSpeechSynthesizer, Android: TextToSpeech)
- Voice: Neutral, instructional (male or female based on user preference)
- Rate: 0.9x normal speed (clearer for educational content)

**Advantages:**
- No pre-recording required
- Instant updates if lesson content changes
- Smaller app size

**Disadvantages:**
- Less natural than human voice
- Pronunciation inconsistencies (Hebrew names, theological terms)

### 7.2 Pre-Recorded Audio (Future Enhancement)
- Record professional voice talent for all segments
- Store as compressed audio files (AAC/M4A)
- Larger app size but higher quality

### 7.3 Scripture Reading
**Option A: TTS**
- Read passage text from lesson JSON

**Option B: Audio Bible Integration**
- Link to pre-recorded Scripture audio (YouVersion, ESV Audio)
- Requires network for first play, cache locally

---

## 8. Error Handling

### 8.1 Missing Lesson JSON
- **Error:** Lesson file not found at expected path
- **Response:** Display error, log issue, return to IDLE
- **User Message:** "Lesson content unavailable. Please contact support."

### 8.2 Voice Command Not Recognized
- **Error:** STT fails or returns gibberish
- **Response:** Prompt for repeat
- **User Message:** "Command not recognized. Please try again."

### 8.3 Invalid State Transition
- **Error:** User says "Read the passage" while in IDLE
- **Response:** Provide guidance
- **User Message:** "No lesson is active. Say 'Begin the lesson' first."

---

## 9. Privacy & Security

### 9.1 Data Collection
**What we collect:**
- Lesson completion status (local only)
- Knowledge-check answers (local only, optional)

**What we DO NOT collect:**
- Voice recordings
- Transcripts of user answers
- Usage analytics
- Personal information

### 9.2 No Network Requirement
- All core features work offline
- No telemetry or crash reporting
- No cloud sync

### 9.3 User Data Deletion
- User can reset progress at any time
- Deletes all records from `user_progress` table
- Does not delete curriculum content

---

## 10. Future Enhancements (Post-MVP)

### 10.1 Multi-Course Support
- Add course selection screen
- Track progress across multiple courses

### 10.2 Review Mode
- Allow re-listening to completed lessons (read-only)
- No re-answering questions

### 10.3 Vocabulary Flashcards
- Extract vocabulary terms from lessons
- Quiz mode for term definitions

### 10.4 Offline Audio Bible
- Bundle ESV audio for all required passages
- Eliminates TTS for Scripture reading

---

**End of Architecture Documentation v1.0**