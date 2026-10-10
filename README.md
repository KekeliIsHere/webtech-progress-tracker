# Web Tech Progress Tracker

A lightweight, multi-user web application designed to monitor lesson progress, compute task deliverables, and dynamically evaluate terminal quiz eligibility across 30 course lessons.

**Live Application:** [https://kekeliishere.github.io/webtech-progress-tracker/](https://kekeliishere.github.io/webtech-progress-tracker/)

## Features

- **Asynchronous Authentication & Self-Registration:** Authenticates student IDs asynchronously against a JSON data store using `fetch()` and Promises. Automatically creates and persists new profiles when an unknown ID is provided.
- **Client-Side Data Isolation:** Uses browser `localStorage` keyed by unique Student ID (`tracker_data_<ID>`), ensuring multiple students can test and track progress independently without data collision.
- **Dynamic Quiz Eligibility Engine:** Evaluates completion of prerequisites (Reading Quiz, Lab, and Discussion) using boolean logic to unlock the Terminal Quiz checkbox and update visual status indicators.
- **Dynamic Analytics Dashboard:** Automatically recalculates aggregate metrics (Lessons Completed, Progress Percentage, and Quizzes Unlocked) on every checkbox interaction.
- **Responsive Layout:** Optimized with CSS Grid and Flexbox, featuring horizontally scrollable matrix tables for mobile compatibility.

## Tech Stack & Architecture

- **Frontend:** Semantic HTML5, CSS3 (Custom Variables, Flexbox, Grid), Vanilla JavaScript (ES6+).
- **Storage:** Browser `localStorage` for synchronous state persistence and session management.
- **Typography:** Inter & JetBrains Mono via Google Fonts.

## Code Concepts (Robin Nixon Chapters 13–15)

1. **Chapter 13 (Syntax & Variables):**
   - Clean variable declarations using block-scoped `let` and `const`.
   - String concatenation and ES6 template literals for DOM injection.
2. **Chapter 14 (Expressions, Control Flow & Conditionals):**
   - Logical operators (`&&`, `||`, `!`) for multi-condition eligibility checks (`readingQuiz && lab && discussion`).
   - `for` loops for array searches and metric summations.
3. **Chapter 15 (Functions, Objects & Arrays):**
   - Modular helper functions (`checkEligibility()`, `updateMetrics()`, `render()`).
   - Array filtering methods (`filter()`) and event delegation on parent container nodes.

## Local Development

To run the application locally without browser CORS restrictions on `fetch()`:

```bash
# Using Python
python -m http.server 8000

# Or open using VS Code "Live Server" extension