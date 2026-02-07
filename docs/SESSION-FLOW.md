# Session Flow Documentation
## Bible Course App

**Version:** 1.0  
**Last Updated:** 2026-02-07

---

## 1. Session Flow Overview

Bible Course App delivers lessons through a **strict, linear, bounded session flow**. Each session progresses through exactly 7 segments in fixed order. Users cannot skip, reorder, or repeat segments within a single session run.

### 1.1 Core Flow Principles
- **Linear:** Segments play in sequence 1 → 2 → 3 → 4 → 5 → 6 → 7
- **Bounded:** Session has clear start (orientation) and end (close)
- **Non-repeatable:** Once a segment plays, it cannot be replayed in same session
- **Command-gated:** User advances via voice commands (or auto-advance)
- **Completable:** Session marks lesson complete only when all segments finish

---

## 2. The 7-Segment Structure

### 2.1 Segment Type Overview

| # | Segment Type | Purpose | User Interaction |
|---|--------------|---------|------------------|
| 1 | `orientation` | Situate lesson in course sequence | Auto-play on lesson start |
| 2 | `reading` | Play Scripture passage | "Read the passage" or auto-advance |
| 3 | `context` | Historical/literary background | "Explain the context" or auto-advance |
| 4 | `analysis` | Structural/textual observation | "Analyze the structure" or auto-advance |
| 5 | `themes` | Key theological concepts | "Summarize the key themes" or auto-advance |
| 6 | `question` | Knowledge-check comprehension | "Ask the review question" then answer |
| 7 | `close` | Session termination statement | Auto-play, then "End the lesson" |

### 2.2 Detailed Segment Descriptions

#### Segment 1: Orientation
**Purpose:** Establish context for current lesson in course progression

**Script Template:**
> "This is lesson [N] in [Course Name]. You are studying [topic]. Previous lesson(s) covered [prior content]."

**Duration:** 20–30 words  
**Auto-play:** Yes (immediately after lesson load)  
**User Action:** Listen only

**Example:**
> "This is lesson three in Biblical Foundations. You are studying covenant structure in Genesis. Previous lessons covered canon and method."

---

#### Segment 2: Reading
**Purpose:** Present Scripture text for study

**Script Template:**
> "Listen to [Book] [Chapter], verses [X] through [Y]."
> [PASSAGE AUDIO PLAYS]

**Duration:** 10–15 words (intro) + passage audio  
**User Trigger:** "Read the passage" OR auto-advance after 2 seconds  
**User Action:** Listen to Scripture reading

**Example:**
> "Listen to Genesis 12, verses 1 through 3."
> [Audio plays: "Now the LORD said to Abram..."]

**Special Case: No Passage Required**
Some lessons (introductory, methodological) have no Scripture reading.
> "This lesson introduces foundational concepts. No passage reading is required for this session."

---

#### Segment 3: Context
**Purpose:** Provide historical, cultural, or literary background

**Script Template:**
> [2–3 sentences explaining setting, author, audience, genre, or narrative position]

**Duration:** 35–50 words  
**User Trigger:** "Explain the context" OR auto-advance after 2 seconds  
**User Action:** Listen and absorb information

**Example:**
> "Genesis 12 marks a narrative shift. The author moves from universal judgment to particular promise. Abraham receives three covenant elements. Chapters 1 through 11 describe creation, fall, and spreading human rebellion. Chapter 12 begins a new section focused on one family line."

**Tone:** Declarative, instructional, neutral

---

#### Segment 4: Analysis
**Purpose:** Direct attention to textual structure, repetition, or literary features

**Script Template:**
> "Notice [literary feature]. The structure is [pattern]. [Key observation about text]."

**Duration:** 40–55 words  
**User Trigger:** "Analyze the structure" OR auto-advance after 2 seconds  
**User Action:** Listen and consider textual observations

**Example:**
> "Notice the repetition of blessing in verses 2 and 3. The structure is imperative followed by promise. God commands Abraham to leave. God promises land, descendants, and blessing. Land appears in verse 1. Great nation indicates numerous descendants in verse 2. Blessing occurs three times across verses 2 and 3."

**Focus:** What is in the text, not what it means for the user

---

#### Segment 5: Themes
**Purpose:** Identify and define theological concepts present in the passage

**Script Template:**
> "Key theological themes: [term 1], [term 2], [term 3]. These terms describe [brief definition or explanation]."

**Duration:** 30–40 words  
**User Trigger:** "Summarize the key themes" OR auto-advance after 2 seconds  
**User Action:** Listen to theological terminology

**Example:**
> "Key theological themes: covenant initiation, unconditional promise, divine election. These terms describe God's action independent of human merit. God chooses Abraham without stated reason. The promises depend on divine commitment, not human performance."

**Constraints:**
- Define terms clearly
- Avoid application language
- Focus on what the text teaches about God, humanity, or salvation

---

#### Segment 6: Question
**Purpose:** Assess comprehension via factual knowledge-check

**Script Template:**
> "[Question requiring factual recall from lesson content]"

**Duration:** 8–20 words  
**User Trigger:** "Ask the review question"  
**User Action:** Answer verbally, receive feedback

**Question Characteristics:**
- Factual recall or basic comprehension
- Answerable from segment content alone
- Single correct answer (with acceptable variants)

**Example:**
> "What three elements does God promise to Abraham in Genesis 12?"

**Answer Evaluation:**
- **Correct Answer:** "Land, descendants, and blessing"
- **Acceptable Variants:** 
  - "land, offspring, blessing"
  - "territory, descendants, divine favor"
  - "land, great nation, blessing"

**Feedback:**
- If correct: "Correct."
- If incorrect: "The answer is land, descendants, and blessing."

**No extended feedback.** No encouragement. Binary evaluation only.

---

#### Segment 7: Close
**Purpose:** Signal session completion and preview next lesson

**Script Template:**
> "This completes lesson [N]. You studied [topic summary]. Next lesson examines [next topic]."

**Duration:** 20–30 words  
**Auto-play:** Yes (after question answered)  
**User Action:** Listen, then say "End the lesson"

**Example:**
> "This completes lesson three. You studied covenant structure in Genesis 12. Next lesson examines creation and commission."

**Post-Close:**
After close segment plays, session enters `SESSION_COMPLETE` state. User must say "End the lesson" to return to IDLE (or 10-second timeout).

---

## 3. State Transition Details

### 3.1 Full State Flow with Timing

```
IDLE
  ↓ [User: "Begin the lesson"]
  ↓ [Action: Load lesson JSON, validate prerequisite]
LESSON_LOADED
  ↓ [Auto: Immediate]
  ↓ [Action: Play orientation audio]
ORIENTATION_PLAYING
  ↓ [Event: Audio complete]
  ↓ [Action: Set segment = 2]
READING_READY
  ↓ [User: "Read the passage" OR Auto: 2 sec]
  ↓ [Action: Play passage audio]
READING_PLAYING
  ↓ [Event: Audio complete]
  ↓ [Action: Set segment = 3]
CONTEXT_READY
  ↓ [User: "Explain the context" OR Auto: 2 sec]
  ↓ [Action: Play context audio]
CONTEXT_PLAYING
  ↓ [Event: Audio complete]
  ↓ [Action: Set segment = 4]
ANALYSIS_READY
  ↓ [User: "Analyze the structure" OR Auto: 2 sec]
  ↓ [Action: Play analysis audio]
ANALYSIS_PLAYING
  ↓ [Event: Audio complete]
  ↓ [Action: Set segment = 5]
THEMES_READY
  ↓ [User: "Summarize the key themes" OR Auto: 2 sec]
  ↓ [Action: Play themes audio]
THEMES_PLAYING
  ↓ [Event: Audio complete]
  ↓ [Action: Set segment = 6]
QUESTION_READY
  ↓ [User: "Ask the review question"]
  ↓ [Action: Play question audio, activate answer capture]
QUESTION_ASKED
  ↓ [User: Provides verbal answer]
  ↓ [Action: Evaluate answer, provide feedback]
QUESTION_ANSWERED
  ↓ [Auto: 1 sec after feedback]
  ↓ [Action: Set segment = 7]
CLOSE_READY
  ↓ [Auto: Immediate]
  ↓ [Action: Play close audio]
CLOSE_PLAYING
  ↓ [Event: Audio complete]
  ↓ [Action: Mark lesson complete in DB]
SESSION_COMPLETE
  ↓ [User: "End the lesson" OR Auto: 10 sec timeout]
  ↓ [Action: Unlock next lesson, clear session state]
IDLE
```

### 3.2 Auto-Advance vs. User Command

**Auto-Advance Segments:**
- Orientation (always auto-plays)
- Close (always auto-plays)

**User-Triggered or Auto-Advance (2-second delay):**
- Reading
- Context
- Analysis
- Themes

**User-Triggered Only:**
- Question (must say "Ask the review question")
- Session End (must say "End the lesson" OR 10-second timeout)

**Rationale:**
Auto-advance keeps session moving but allows users to pause before each segment if they need processing time. Question requires explicit command to ensure user is ready to answer.

---

## 4. Command Handling Rules

### 4.1 Valid Commands by State

| State | Valid Commands | Invalid Commands |
|-------|----------------|------------------|
| IDLE | "Begin the lesson" | All others |
| LESSON_LOADED | (none - auto-advances) | All |
| ORIENTATION_PLAYING | (none - playing audio) | All |
| READING_READY | "Read the passage" | All others |
| READING_PLAYING | (none - playing audio) | All |
| CONTEXT_READY | "Explain the context" | All others |
| CONTEXT_PLAYING | (none - playing audio) | All |
| ANALYSIS_READY | "Analyze the structure" | All others |
| ANALYSIS_PLAYING | (none - playing audio) | All |
| THEMES_READY | "Summarize the key themes" | All others |
| THEMES_PLAYING | (none - playing audio) | All |
| QUESTION_READY | "Ask the review question" | All others |
| QUESTION_ASKED | [Free-form answer] | (none - awaiting answer) |
| QUESTION_ANSWERED | (none - auto-advances) | All |
| CLOSE_READY | (none - auto-advances) | All |
| CLOSE_PLAYING | (none - playing audio) | All |
| SESSION_COMPLETE | "End the lesson" | All others |

### 4.2 Handling Invalid Commands

**Scenario: User says invalid command**
- **Response:** "Please use a valid command."
- **No state change**

**Scenario: User says valid command in wrong state**
Example: "Read the passage" while in IDLE

- **Response:** "No lesson is active. Say 'Begin the lesson' first."
- **No state change**

**Scenario: User attempts conversation**
Example: "Can you explain this more?"

- **Response:** "This is a structured course. Please use a valid command."
- **No state change**

**Scenario: User asks question outside curriculum**
Example: "What does this mean for my life?"

- **Response:** "This course teaches interpretation, not application. Please continue with the lesson."
- **No state change**

---

## 5. Lesson Completion Logic

### 5.1 Completion Criteria

A lesson is marked complete when:
1. All 7 segments have been played sequentially
2. Knowledge-check question has been answered (correct or incorrect)
3. Close segment has finished playing
4. Session enters `SESSION_COMPLETE` state

### 5.2 Database Update

**When entering SESSION_COMPLETE state:**

```sql
UPDATE user_progress 
SET completed = 1, 
    completed_at = CURRENT_TIMESTAMP,
    answer_given = '[user answer text]',
    answer_correct = [1 or 0]
WHERE lesson_id = '[current lesson ID]';

-- Unlock next lesson
UPDATE lessons
SET unlocked = 1
WHERE sequence = (SELECT sequence + 1 FROM lessons WHERE lesson_id = '[current lesson ID]')
  AND course_id = '[current course ID]';
```

### 5.3 Incomplete Sessions

**If user exits app mid-session:**
- Session state is NOT saved
- Progress is NOT recorded
- Next time app opens, user returns to IDLE
- User must restart lesson from beginning

**Rationale:** Ensures session integrity. Lessons are 5–10 minutes; completing in one sitting is expected.

---

## 6. Prerequisite Enforcement

### 6.1 Linear Progression Rule

Lessons must be completed in sequence order. No skipping ahead.

**When user says "Begin the lesson" in IDLE:**

```python
def can_start_lesson(lesson_id):
    lesson = get_lesson(lesson_id)
    
    # First lesson in course has no prerequisite
    if lesson.prerequisite is None:
        return True
    
    # Check if prerequisite is complete
    prerequisite_complete = check_completion(lesson.prerequisite)
    return prerequisite_complete

if can_start_lesson(next_lesson_id):
    transition_to_LESSON_LOADED()
else:
    respond("You must complete the previous lesson first.")
```

### 6.2 Next Lesson Selection

**When user says "Begin the lesson":**
- System determines next incomplete lesson in sequence
- Does not require user to specify lesson ID

**Example:**
User completed Lessons 1 and 2.
User says "Begin the lesson."
System loads Lesson 3 automatically.

---

## 7. Audio Playback Behavior

### 7.1 Playback Rules

**During audio playback:**
- User input is ignored (except app-level controls: pause, quit)
- No fast-forward or rewind
- Volume control allowed

**Between segments (READY states):**
- User can issue next command
- 2-second auto-advance timer starts (for READING, CONTEXT, ANALYSIS, THEMES)

### 7.2 Interruption Handling

**If user pauses during audio:**
- Audio pauses mid-segment
- Resume continues from pause point
- State does not change

**If user quits app during audio:**
- Session terminates
- Progress not saved
- Next launch returns to IDLE

---

## 8. Error Scenarios

### 8.1 Missing Prerequisite

**User attempts to start Lesson 5 without completing Lesson 4:**

```
User: "Begin the lesson"
App: "You must complete lesson 4 first."
[State remains IDLE]
```

### 8.2 Lesson JSON Not Found

**System cannot load lesson file:**

```
User: "Begin the lesson"
App: [Error logged]
App: "Lesson content unavailable. Please contact support."
[State remains IDLE]
```

### 8.3 Answer Capture Failure

**STT fails to capture user's answer to knowledge-check:**

```
User: [Inaudible or garbled speech]
App: "Answer not recognized. Please try again."
[State remains QUESTION_ASKED]
```

---

## 9. Session Duration

### 9.1 Estimated Timing

**Typical lesson breakdown:**

| Segment | Words | Speech Time (0.9x speed) |
|---------|-------|--------------------------|
| Orientation | 25 | 15 sec |
| Reading | 15 + passage | 30–90 sec |
| Context | 45 | 30 sec |
| Analysis | 50 | 35 sec |
| Themes | 35 | 25 sec |
| Question | 15 + answer | 30 sec |
| Close | 25 | 15 sec |
| **Total** | **210 words** | **5–7 minutes** |

**Range:** 5–10 minutes per lesson depending on passage length

### 9.2 Timeout Rules

**SESSION_COMPLETE state:**
- If user does not say "End the lesson" within 10 seconds
- Auto-transition to IDLE
- Lesson still marked complete

**QUESTION_ASKED state:**
- No timeout
- Wait indefinitely for user answer
- User can quit if stuck

---

## 10. Future Enhancements

### 10.1 Pause and Resume
- Save session state mid-lesson
- Allow user to resume from last segment
- Requires persistence of current state

### 10.2 Variable Speed Playback
- Allow user to adjust TTS speed (0.8x, 1.0x, 1.2x)
- User preference stored in settings

### 10.3 Repeat Last Segment
- Add command "Repeat that" to replay current segment
- Does not break linear flow (can repeat, but not skip)

---

**End of Session Flow Documentation v1.0**