# Student Finance Tracker

A simple, responsive and accessible app for recording student spending, searching it with regex, and staying under a spending cap. Built with plain HTML, CSS and JavaScript.

- **Theme:** Student Finance Tracker
- **Demo video (unlisted):** PASTE-YOUR-VIDEO-LINK-HERE
- **Author:** [aubin-karaha](https://github.com/aubin-karaha) · c.karaha@alustudent.com

## Features

- Pages: About, Dashboard, Records, Add Expense, Settings
- Add, edit and delete records (delete asks first), saved automatically in `localStorage`
- Form checks with 5 regex rules and clear error messages
- Regex search with a case switch 
- Sorting by date, description and amount
- Dashboard: total records, total spent, top category, 7-day chart
- Spending cap with polite (under) and assertive (over) screen reader messages
- Three currencies with rates I set by hand, and editable categories
- JSON export and import (import checks every record first)
- Light and dark theme button, and the choice is saved
- Mobile-first layout with 3 breakpoints (768px, 1024px)

## Regex catalog

| Use | Pattern | Passes | Fails |
|---|---|---|---|
| Description | `^\S(?:.*\S)?$` | `Bus pass` | ` Bus pass` |
| Amount | `^(0\|[1-9]\d*)(\.\d{1,2})?$` | `12.50` | `012` |
| Date | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | `2025-09-29` | `2025-13-01` |
| Category | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | `Part-time job` | `Food1` |
| Repeated word (back-reference) | `\b(\w+)\s+\1\b` | blocks `the the cat` | allows `the cat` |

Search ideas: `\.\d{2}\b` (amounts with cents), `(coffee\|tea)`, `^Bus`.

## Keyboard map

| Key | Action |
|---|---|
| `Tab` / `Shift + Tab` | Move between links, buttons and boxes (the first `Tab` shows "Skip to content") |
| `Enter` / `Space` | Press a button or link, or tick a box |
| `Enter` in New category | Add the category |

## Accessibility notes

- Landmarks (`header`, `nav`, `main`, `section`, `footer`), proper headings and a skip link
- Every input has a label; errors use `aria-describedby`
- `role="status"` and `aria-live` for messages (polite under the cap, assertive over it)
- Visible focus outline; animations turn off for reduced-motion users

## How to run

The app uses JavaScript modules, so it needs a local server (double-clicking `index.html` will not work).

1. Open a terminal in the project folder.
2. Run `python3 -m http.server 8000`
3. Open `http://localhost:8000`


Starter snippets (`compileRegex`, `highlight`, `load` and `save`) come from the assignment brief. I used an AI assistant (Claude) for guidance and debugging, and I tested and edited the code myself.
