PROJECT RULES

- Vanilla HTML, CSS, and JavaScript only. Preserve the existing project structure.
- Never delete existing content or functionality. Content may only be summarized when necessary for responsive layout.
- No inline CSS/styles. Follow the existing CSS architecture:
  - Global/theme tokens stay in the root/global CSS.
  - Responsive rules stay in the responsive CSS.
  - Page/component styles stay in their appropriate CSS files.
- Reuse existing CSS variables, components, colors, typography, spacing, buttons, cards, icons, and design patterns. Do not hard-code values that already have project tokens.
- Keep all pages visually consistent. Do not introduce unrelated design changes.
- Use the existing responsive strategy/breakpoints. Do not fix one viewport by breaking another.
- Avoid layout hacks such as unnecessary fixed sizes, negative margins, excessive absolute positioning, transforms, or forced overflow.
- Diagnose the root cause before changing code. Make the smallest correct change.
- Work on ONE issue at a time. Do not refactor or modify unrelated files/features.
- Before changing JavaScript, determine whether the problem is actually caused by JavaScript.
- Do not claim a fix is complete until it has been verified.