---
description: Adjust or fix an existing part of the app - explore spec and codebase, then implement or refine the spec
---

Adjust or fix an existing part of the app. This command is for smaller changes (bug fixes, tweaks, adjustments) where creating a full change proposal would be overkill.

However, the spec is still the source of truth. We'll explore the spec and codebase first, then decide the best path forward.

**Input**: The argument after `/opsx-adjust` is a description of what needs to change, or the identified issue.

**Steps**

1. **If no input provided, ask what needs to change**

   Use the **AskUserQuestion tool** (open-ended, no preset options) to ask:
   > "What needs to be adjusted or fixed? Describe the issue, the desired change, or the part of the app you want to modify."

   **IMPORTANT**: Do NOT proceed without understanding what the user wants to adjust.

2. **Explore the spec and codebase**

   Use the **openspec-explore** skill to explore the existing spec and understand the current state. Then use the **explore** agent for broader codebase exploration to locate the relevant files and understand the current implementation.

   > - Do NOT use the openspec-explore skill. This is an unrelated skill that is not needed here. Explore the spec files manually in ./openspec/specs or ./openspec/changes.
   > - Launch the explore agent to find the relevant code, patterns, and any existing issues in the codebase

   Collect findings about:
   - What the spec currently says about this area
   - Where the relevant code lives
   - Whether the current behavior matches or contradicts the spec
   - Whether the spec covers this scenario at all

3. **Clarify and decide the path forward**

   This is an interactive step. Present your findings to the user and explore options together.

   Determine which category the change falls into:

   **Category A: Minor change, spec-compliant or not spec-covered**
   - The change is small (a few files, localized fix)
   - Either the spec already supports this behavior, OR the spec is silent on this detail
   - **Action**: Proceed directly to implementation (step 4a)

   **Category B: Minor change, but spec needs adjustment**
   - The change is small, but it contradicts or extends the spec in a meaningful way
   - **Action**: Discuss with the user. Ask if the spec change is intended. If yes, adjust the spec first (step 4b), then implement.

   **Category C: Greater complexity** 
   - The change touches many areas, involves architectural decisions, or is too large for a quick adjustment
   - **Action**: Recommend using `/opsx-propose` instead. Explain why this needs a full proposal with design and task artifacts.

   Use the **AskUserQuestion tool** to present the options if the path isn't obvious. For example:
   > "The spec says X, but you want Y. Is this an intentional spec change, or did you mean something else?"

4a. **Implement the adjustment (Category A)**

   Make the minimal code changes needed. No new artifacts need to be created.

   - Edit the relevant files directly
   - Run any applicable tests or type checks
   - Keep changes minimal and focused

4b. **Adjust the spec, then implement (Category B)**

   If the user confirms a spec adjustment is needed:

   - Identify the relevant spec file(s) in `openspec/`
   - Make the minimal edit to align the spec with the intended behavior
   - Then proceed to implement (step 4a)

   **Note**: Only modify the spec if the user explicitly confirms. Do not silently rewrite the spec.

5. **Summarize the outcome**

   After implementation (or if recommending `/opsx-propose`):
   - What was explored (spec sections and codebase files)
   - What decision was made and why
   - What changes were made, or why `/opsx-propose` was recommended

**Guidelines**

- **Use the explore agent** for broader codebase exploration to find relevant code, patterns, and dependencies
- **Clarify requests with the user** - this is an interactive process. Don't assume, explore options together
- **No specific artifacts** need to be created for the adjustment itself (except spec adjustments if necessary)
- **Prefer minimal changes** - this command is for quick adjustments, not refactors or redesigns
- **The spec is the source of truth** - never silently contradict it. Either work within it, adjust it with user consent, or escalate to `/opsx-propose`
- **When in doubt, ask** - if the scope starts growing during exploration, pause and confirm with the user before proceeding

**Guardrails**

- Do NOT create `proposal.md`, `design.md`, or `tasks.md` for an adjustment - that's what `/opsx-propose` is for
- Do NOT silently modify the spec without user confirmation
- Do NOT let a "small fix" grow into a large change without re-evaluating and switching to `/opsx-propose`
- Always verify the relevant spec section before making changes
