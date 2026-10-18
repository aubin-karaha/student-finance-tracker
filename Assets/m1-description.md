# M1 – Spec, Data Model & Accessibility Plan

**Theme:** Student Finance Tracker (vanilla HTML/CSS/JS)

## Purpose
Help students record spending, search it with regex, and stay under a cap.

## Pages
About · Dashboard · Records · Add/Edit · Settings

## Data model
```json
{ "id": "rec_0001", "description": "Lunch at cafeteria", "amount": 12.50,
  "category": "Food", "date": "2025-09-29",
  "createdAt": "2025-09-29T10:00:00.000Z", "updatedAt": "2025-09-29T10:00:00.000Z" }
```
Settings: `{ cap, unit, rates{}, categories[] }`

## Regex rules
| Field | Pattern |
|---|---|
| Description | `^\S(?:.*\S)?$` |
| Amount | `^(0\|[1-9]\d*)(\.\d{1,2})?$` |
| Date | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` |
| Category | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` |
| Repetition checker | `\b(\w+)\s+\1\b` (repeated word, back-reference) |

Tests to make:
✅ title rejects leading space
✅ title accepts "Lunch at cafe"
✅ number accepts 12.50
✅ number rejects 012
✅ date accepts 2025-09-29
✅ date rejects 2025-13-01
✅ tag accepts "Part-time job"
✅ tag rejects "Food1"
✅ duplicate word found
✅ bad regex returns null
✅ validate ok

## Accessibility plan
- Landmarks used: header, nav, main, section, footer; one h1, h2 per section 
- Skip-to-content link; every input has a bound label
- Colour contrast (I will probably check with browser DevTools)
- Dark theme 
- Reduced-motion media query turns animations off
- Breakpoints: 360px, 768px, 1024px (using media queries)
