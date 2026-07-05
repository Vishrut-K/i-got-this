# DESIGN PHILOSOPHY

> "Data first. Decoration second."

This document serves as the true north for the **i-got-it** application. Any future feature, component, or redesign must adhere strictly to these principles.

## The Core Principles

- Every page answers ONE question.
- Every page has ONE primary action.
- No feature without purpose.
- Whitespace before decoration.
- Motion should communicate, never distract.
- Keyboard first. Accessible by default.
- Data first. Beauty supports usability.
- Fast > Fancy.
- Mobile is not desktop shrunk.

## The One Question Rule

- **Today:** What should I do today?
- **Journal:** What am I thinking today?
- **Journey:** How have I grown?
- **Profile:** Who am I becoming?

## The One Action Rule

- **Today:** Complete habits.
- **Journal:** Write.
- **Journey:** Reflect.
- **Profile:** Manage account.

## Technical & UX Guidelines

1. **No Popups:** Never use popups unless absolutely necessary (e.g., destructive actions). Use inline expansion.
2. **Colors:** Constants only. Never use more than three accent colors.
3. **Animations:** Under 250ms.
4. **Data Integrity:** `createdAt` and `updatedAt` on every single model. Soft deletes (`archivedAt`) instead of hard deletes. 

## Empty States

Empty states are a feature, not a fallback. They must inspire action:
- *No habits:* "The first habit you create could change your life."
- *No journal:* "A blank page isn't empty. It's waiting."
