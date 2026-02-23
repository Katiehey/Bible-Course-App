# Bible Book Coverage Report

Date: 2026-02-23  
Scope: `curriculum/courses/**/*.json` (210 lesson files)

## Result

- Total canonical books checked: 66
- Books with explicit coverage: 66
- Books missing explicit coverage: 0

The curriculum now explicitly names and/or references every book of the Protestant 66-book canon across lesson fields (`title`, `objective`, `metadata.book`, `required_passages`, and segment `audio_script`).

## Method

Coverage detection used:
- Canonical book-name matching (including variants like `Song of Songs` → `Song of Solomon`)
- `metadata.book` normalization (underscore and case normalization)
- `required_passages.reference` and `required_passages.passage_id` abbreviation mapping (e.g., `3jn` → `3 John`)
- Segment script and lesson-level text scanning

## Per-Book Evidence Counts

Format: `Book | evidence_count`

### Old Testament
- Genesis | 82
- Exodus | 68
- Leviticus | 33
- Numbers | 30
- Deuteronomy | 43
- Joshua | 26
- Judges | 34
- Ruth | 7
- 1 Samuel | 12
- 2 Samuel | 12
- 1 Kings | 12
- 2 Kings | 12
- 1 Chronicles | 1
- 2 Chronicles | 3
- Ezra | 2
- Nehemiah | 2
- Esther | 1
- Job | 1
- Psalms | 4
- Proverbs | 1
- Ecclesiastes | 1
- Song of Solomon | 1
- Isaiah | 20
- Jeremiah | 5
- Lamentations | 1
- Ezekiel | 2
- Daniel | 1
- Hosea | 2
- Joel | 3
- Amos | 5
- Obadiah | 1
- Jonah | 2
- Micah | 2
- Nahum | 2
- Habakkuk | 1
- Zephaniah | 1
- Haggai | 1
- Zechariah | 8
- Malachi | 3

### New Testament
- Matthew | 51
- Mark | 47
- Luke | 61
- John | 98
- Acts | 54
- Romans | 22
- 1 Corinthians | 15
- 2 Corinthians | 16
- Galatians | 11
- Ephesians | 11
- Philippians | 11
- Colossians | 11
- 1 Thessalonians | 10
- 2 Thessalonians | 6
- 1 Timothy | 10
- 2 Timothy | 10
- Titus | 6
- Philemon | 6
- Hebrews | 15
- James | 30
- 1 Peter | 11
- 2 Peter | 11
- 1 John | 10
- 2 John | 4
- 3 John | 6
- Jude | 6
- Revelation | 40

## Patch Applied to Reach 66/66

- Added explicit structured `3 John` passage entry in:
  - `curriculum/courses/new-testament-foundations-07-general-epistles-revelation/lessons/ntf07_lesson_13.json`
- Added explicit canonical OT synthesis naming all previously unmentioned OT books in:
  - `curriculum/courses/old-testament-deep-study-01/lessons/otds_lesson_60.json`
