# Curriculum Specification
## Bible Course App

**Version:** 1.0  
**Last Updated:** 2026-02-07

---

## 1. Core Principles

### 1.1 Pedagogical Foundation
- **Curriculum-driven:** All content follows predefined lesson sequences
- **Historical-grammatical method:** Default interpretive framework
- **Instructional, not devotional:** Teaching *how* to study, not *what* to feel
- **Finite sessions:** 5–10 minutes, bounded, no open loops
- **Academic tone:** Neutral instructor explaining theological material

### 1.2 Non-Negotiable Constraints
- Scripture studied as text before application
- No personalization of doctrine
- No emotional processing or spiritual direction
- Linear progression—no skipping or reordering
- Authority resides in text, not AI

---

## 2. Lesson JSON Schema

### 2.1 Lesson Object Structure

```json
{
  "lesson_id": "bf01_lesson_03",
  "course_id": "biblical_foundations_01",
  "sequence": 3,
  "title": "Covenant in Genesis",
  "objective": "Identify covenant as a structuring theme in Genesis",
  "duration_estimate": "7 minutes",
  "prerequisite": "bf01_lesson_02",
  "required_passages": [
    {
      "passage_id": "gen_12_1_3",
      "reference": "Genesis 12:1-3",
      "translation": "ESV"
    },
    {
      "passage_id": "gen_15_1_6",
      "reference": "Genesis 15:1-6",
      "translation": "ESV"
    }
  ],
  "segments": [
    {
      "type": "orientation",
      "sequence": 1,
      "audio_script": "This is lesson three in Biblical Foundations. You are studying covenant structure in Genesis. Previous lessons covered creation and fall narratives.",
      "word_count": 24
    },
    {
      "type": "reading",
      "sequence": 2,
      "passage_id": "gen_12_1_3",
      "audio_script": "Listen to Genesis 12, verses 1 through 3. [PASSAGE AUDIO]",
      "word_count": 12
    },
    {
      "type": "context",
      "sequence": 3,
      "audio_script": "Genesis 12 marks a narrative shift. The author moves from universal judgment to particular promise. Abraham receives three covenant elements: land, descendants, and blessing.",
      "word_count": 27
    },
    {
      "type": "analysis",
      "sequence": 4,
      "audio_script": "Notice the repetition of blessing in verses 2 and 3. The structure is imperative followed by promise. This pattern becomes foundational for understanding Israel's theology.",
      "word_count": 28
    },
    {
      "type": "themes",
      "sequence": 5,
      "audio_script": "Key theological themes: covenant initiation, unconditional promise, divine election. These terms describe God's action independent of human merit or response.",
      "word_count": 24
    },
    {
      "type": "question",
      "sequence": 6,
      "audio_script": "What three elements does God promise to Abraham in Genesis 12?",
      "correct_answer": "Land, descendants, and blessing",
      "acceptable_variants": [
        "land, offspring, blessing",
        "territory, descendants, divine favor"
      ],
      "word_count": 11
    },
    {
      "type": "close",
      "sequence": 7,
      "audio_script": "This completes lesson three. You studied covenant structure in Genesis 12. Next lesson examines Genesis 15 and covenant formalization.",
      "word_count": 22
    }
  ],
  "vocabulary": [
    {
      "term": "covenant",
      "definition": "A formal agreement establishing relationship between parties with defined obligations or promises"
    },
    {
      "term": "unconditional promise",
      "definition": "A divine commitment not dependent on human action or response"
    }
  ],
  "study_notes": "Genesis 12:1-3 is foundational for understanding biblical theology. Covenant structure here is unilateral—God initiates, God promises, no conditions stated.",
  "metadata": {
    "created": "2026-02-07",
    "version": "1.0",
    "content_reviewed": true,
    "audio_recorded": false
  }
}
```

### 2.2 Segment Types (Fixed Order)

| Type | Purpose | Required | Max Words |
|------|---------|----------|-----------|
| `orientation` | Situate lesson in course sequence | Yes | 30 |
| `reading` | Scripture reading directive | Yes | 15 |
| `context` | Historical/literary background | Yes | 50 |
| `analysis` | Structural/textual observation | Yes | 50 |
| `themes` | Theological concepts identified | Yes | 40 |
| `question` | Knowledge-check comprehension | Yes | 20 |
| `close` | Session termination statement | Yes | 30 |

**Total session word count target:** 150–250 words (5–8 minutes spoken)

### 2.3 Lesson ID Naming Convention

**Format:** `{course_code}_lesson_{number}`

Examples:
- `bf01_lesson_01` (Biblical Foundations I, Lesson 1)
- `herm01_lesson_12` (Hermeneutics I, Lesson 12)
- `paul01_lesson_05` (Pauline Epistles I, Lesson 5)

### 2.4 Passage ID Naming Convention

**Format:** `{book}_{chapter}_{verse_start}_{verse_end}`

Examples:
- `gen_12_1_3` (Genesis 12:1-3)
- `rom_3_21_26` (Romans 3:21-26)
- `john_1_1_18` (John 1:1-18)

---

## 3. Course Structure

### 3.1 Course Object Schema

```json
{
  "course_id": "biblical_foundations_01",
  "title": "Biblical Foundations I",
  "subtitle": "Scripture as Unified Narrative",
  "description": "Introduction to reading the Bible as a coherent theological story structured by covenant.",
  "total_lessons": 24,
  "estimated_duration": "3–4 weeks (daily study)",
  "prerequisites": null,
  "learning_outcomes": [
    "Identify major covenants in biblical narrative",
    "Explain canon structure and genre categories",
    "Describe historical-grammatical reading method",
    "Trace theological themes across Old Testament"
  ],
  "units": [
    {
      "unit_id": "bf01_unit_01",
      "title": "Introduction to Biblical Study",
      "lessons": ["bf01_lesson_01", "bf01_lesson_02", "bf01_lesson_03"]
    },
    {
      "unit_id": "bf01_unit_02",
      "title": "Covenant Framework in Genesis",
      "lessons": ["bf01_lesson_04", "bf01_lesson_05", "bf01_lesson_06", "bf01_lesson_07", "bf01_lesson_08"]
    }
  ],
  "metadata": {
    "difficulty_level": "foundational",
    "theological_tradition": "evangelical reformed",
    "target_audience": "adult self-learners"
  }
}
```

---

## 4. Lesson Dependency Rules

### 4.1 Linear Progression (Mandatory)
- Lessons must be completed in sequence order
- Prerequisite lesson must be marked complete before next lesson unlocks
- No skipping ahead
- No repeating completed lessons in same course run

### 4.2 Completion Criteria
A lesson is marked complete when:
1. All segments have been played sequentially
2. Knowledge-check question has been answered
3. "End the lesson" command issued

### 4.3 Course Completion
A course is complete when:
- All lessons in all units marked complete
- Final assessment passed (if applicable)

---

## 5. First 3 Lessons: Biblical Foundations I

### Lesson 1: Introduction to Biblical Study

**Objective:** Understand the Bible as a library of texts requiring method

**Segments:**
1. **Orientation:** "This is lesson one in Biblical Foundations. You are beginning a structured study of Scripture as unified narrative."
2. **Reading:** [No passage—introductory lesson]
3. **Context:** "The Bible is a collection of 66 books written across 1500 years. These texts include historical narrative, poetry, law, prophecy, and letters."
4. **Analysis:** "Each genre requires different reading strategies. Historical narrative describes events. Poetry uses symbolic language. Law establishes covenant terms."
5. **Themes:** "Key concept: canon. Canon means the authoritative collection of texts recognized as Scripture. This defines the boundaries of biblical theology."
6. **Question:** "How many books are in the Protestant biblical canon?"
7. **Close:** "This completes lesson one. You learned basic canon structure and genre categories. Next lesson introduces the historical-grammatical method."

---

### Lesson 2: Historical-Grammatical Method

**Objective:** Explain the interpretive approach used throughout this course

**Required Passages:** None (methodological lesson)

**Segments:**
1. **Orientation:** "This is lesson two in Biblical Foundations. You are learning the historical-grammatical method for reading Scripture."
2. **Reading:** [No passage]
3. **Context:** "Historical-grammatical method reads texts in their original historical setting and according to normal grammatical rules. This method seeks authorial intent."
4. **Analysis:** "Historical context includes author, audience, date, and cultural setting. Grammatical analysis examines syntax, word meaning, and literary structure."
5. **Themes:** "This method assumes texts have stable meaning determined by original context. Interpretation precedes application. Observation comes before reflection."
6. **Question:** "What two elements does the historical-grammatical method prioritize?"
7. **Close:** "This completes lesson two. You learned the historical-grammatical interpretive approach. Next lesson applies this method to Genesis 12."

---

### Lesson 3: Covenant in Genesis

**Objective:** Identify covenant as a structuring theme in Genesis

**Required Passages:** 
- Genesis 12:1-3
- Genesis 15:1-6

**Segments:**
1. **Orientation:** "This is lesson three in Biblical Foundations. You are studying covenant structure in Genesis. Previous lessons covered canon and method."
2. **Reading:** "Listen to Genesis 12, verses 1 through 3." [PASSAGE AUDIO]
3. **Context:** "Genesis 12 marks a narrative shift. The author moves from universal judgment to particular promise. Abraham receives three covenant elements."
4. **Analysis:** "Notice the repetition of blessing in verses 2 and 3. The structure is imperative followed by promise. Land, descendants, and blessing define covenant content."
5. **Themes:** "Key theological themes: covenant initiation, unconditional promise, divine election. These terms describe God's action independent of human merit."
6. **Question:** "What three elements does God promise to Abraham in Genesis 12?"
7. **Close:** "This completes lesson three. You studied covenant structure in Genesis 12. Next lesson examines Genesis 15 and covenant formalization."

---

## 6. Content Creation Guidelines

### 6.1 Writing Audio Scripts

**Sentence Structure:**
- 8–16 words per sentence
- Active voice preferred
- Declarative statements (avoid questions except in "question" segment)
- No contractions in formal definitions

**Forbidden Phrases:**
- "God is telling you"
- "This passage means for your life"
- "You should reflect on"
- "How does this make you feel"
- "Apply this by"
- "Let this encourage you"
- "Take comfort in"
- "Imagine yourself"

**Tone:**
- Neutral instructor explaining academic material
- No emotive or pastoral language
- No second-person application
- Lecture-style pacing

### 6.2 Knowledge-Check Questions

**Characteristics:**
- Factual recall or basic comprehension
- Single correct answer
- Answerable from segment content
- No opinion or application questions

**Good Examples:**
- "What three elements does God promise to Abraham?"
- "In what genre is the book of Psalms written?"
- "Who was the audience for Paul's letter to the Romans?"

**Bad Examples:**
- "How does this passage speak to your situation?"
- "What is God teaching you through this text?"
- "How might you apply covenant theology today?"

---

## 7. Vocabulary Standards

### 7.1 Required Terms (Biblical Foundations I)

| Term | Definition |
|------|------------|
| Canon | The authoritative collection of texts recognized as Scripture |
| Covenant | A formal agreement establishing relationship between parties with defined obligations or promises |
| Historical-grammatical method | An interpretive approach reading texts in original historical setting according to normal grammatical rules |
| Genre | Literary category with distinct conventions (narrative, poetry, law, prophecy, epistle) |
| Exegesis | The process of drawing meaning out of the text through careful analysis |
| Typology | Recognizing patterns where persons, events, or institutions in earlier Scripture foreshadow later fulfillment |

### 7.2 Terminology Usage Rules

- Introduce technical terms only when necessary
- Provide definition at first use
- Use consistent terminology across lessons
- Avoid theological jargon when plain language suffices

---

## 8. Data Storage Requirements

### 8.1 Offline-First Mandate
- All lesson content stored locally
- All passage audio stored locally
- No cloud dependency for core functionality

### 8.2 File Structure

```
curriculum/
└── courses/
    └── biblical-foundations-01/
        ├── course.json
        └── lessons/
            ├── bf01_lesson_01.json
            ├── bf01_lesson_02.json
            ├── bf01_lesson_03.json
            └── ...
```

---

## 9. Expansion Roadmap

### Phase 1: Biblical Foundations I (24 lessons)
- Units 1–5 as outlined

### Phase 2: Hermeneutics I (18 lessons)
- Text and context (6 lessons)
- Genre analysis (6 lessons)
- Theological interpretation (6 lessons)

### Phase 3: Gospel Studies (20 lessons)
- Synoptic narrative structure
- Johannine theology
- Kingdom of God themes

### Phase 4: Pauline Epistles I (24 lessons)
- Romans and Galatians focus
- Justification and law themes

---

## 10. Quality Checklist

Before finalizing any lesson:

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

---

**End of Curriculum Specification v1.0**