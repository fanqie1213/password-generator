# Password Generator Design

## Overview

Build a lightweight static password generator website for personal use. The site will live directly on the `master` branch and be deployable with GitHub Pages without any build step or external dependency.

The tool should make it fast to generate strong passwords locally in the browser, copy them to the clipboard, and adjust generation rules without unnecessary UI or marketing content.

## Goals

- Provide a simple single-page password generator that works as a static site.
- Support configurable password rules with practical defaults.
- Keep all logic client-side with no persistence and no network dependency.
- Make the project easy to host with GitHub Pages and easy to maintain manually.

## Non-Goals

- User accounts, sync, or cloud storage
- Password history storage
- Advanced password policy templates for different websites
- Multi-page navigation or showcase-style landing page
- Build tooling such as Vite, React, or bundlers

## Chosen Approach

Use a pure static implementation with `HTML`, `CSS`, and vanilla `JavaScript`.

### Why this approach

- Best fit for GitHub Pages because deployment is just serving static files.
- No installation or build process is needed.
- The code stays small and easy to edit later.
- The project is a private utility rather than a product showcase, so a minimal stack is the right trade-off.

### Alternatives considered

1. Static page with a CSS framework
   - Faster styling setup
   - Rejected because the feature set is small and the extra dependency adds little value

2. React or Vite single-page app
   - Better component structure for larger apps
   - Rejected because it adds unnecessary build and maintenance overhead for a small self-use utility

## User Experience

The page opens directly to a working password generator. A password is generated on initial load so the user can use the tool immediately.

The main interface contains:

- A password output field
- A `Generate Password` button
- A `Copy Password` button
- A length control with a default of `16`
- Character type toggles for lowercase, uppercase, digits, and special characters
- An option to exclude visually ambiguous characters such as `0`, `O`, `1`, `l`, and `I`
- A simple strength indicator
- A short status area for copy feedback or validation messages

## Functional Requirements

### Password generation

- Default length is `16`.
- Allowed length range is `8` to `64`.
- The generator uses cryptographically secure randomness from the browser where available.
- The generator builds the password from only the enabled character groups.
- If multiple groups are enabled, the password must include at least one character from each enabled group.
- The character order is shuffled before display so the required characters are not predictable by position.

### Character groups

Supported groups:

- Lowercase letters
- Uppercase letters
- Digits
- Special characters

Ambiguous character exclusion removes commonly confusing characters from the available pools. The exclusion rule applies consistently across all enabled groups.

### Validation and error handling

- If no character groups are enabled, generation is blocked.
- The UI shows a clear message telling the user to select at least one character type.
- The output field should not display a misleading stale success state when generation is invalid.
- Length input is clamped to the supported range.

### Copy behavior

- Clicking `Copy Password` attempts to copy the current password using the Clipboard API.
- On success, the UI shows a short success message.
- If clipboard access fails or is unavailable, the UI shows a fallback message instructing the user to copy manually.

## Strength Indicator

The strength indicator is intentionally simple and local to the page.

It should use:

- Selected character variety
- Password length

Output levels:

- Weak
- Medium
- Strong

This indicator is a practical cue rather than a formal security audit.

## Architecture

The project will be organized into three main files:

- `index.html`: page structure and controls
- `styles.css`: layout and visual styling
- `script.js`: generator logic, DOM wiring, validation, copy handling, and strength display

Within `script.js`, the logic should be separated into small focused functions so the core password generation rules can be tested independently from the DOM behavior.

Suggested logic units:

- Build character pools from selected options
- Generate a password from selected pools and target length
- Shuffle characters
- Score strength
- Update UI state and status messages
- Handle copy action

## Testing Strategy

Follow test-driven development for the generation logic before implementing the production code.

Core automated tests should cover:

- Generated password length matches the requested length
- Password contains only allowed characters
- Each enabled character group appears at least once in the result
- Ambiguous characters are excluded when that option is enabled
- Generation fails clearly when no character groups are selected

Because this is a static site, the automated test focus is the pure logic rather than browser automation. UI behavior will be verified manually in the browser after implementation.

Manual verification should cover:

- Password is generated on first page load
- Regeneration works after changing options
- Copy button feedback is correct
- Validation messages appear when configuration is invalid
- The page remains usable on desktop and mobile widths

## Deployment

The site will be committed on the `master` branch and kept compatible with GitHub Pages static hosting. No build output directory or special deployment command is required.

## Open Decisions Resolved

- Interface style: practical utility page, not a showcase site
- Hosting target: GitHub Pages
- Stack: pure static files
- Default behavior: generate a password immediately on load

## Implementation Boundaries

The first version should stay intentionally small and focused. If future changes are needed, they can build on this foundation, but the initial delivery should prioritize reliability, clarity, and easy GitHub Pages deployment over extra features.
