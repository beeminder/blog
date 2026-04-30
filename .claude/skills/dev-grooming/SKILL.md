---
name: dev-grooming
description: "Groom DEV-labeled issues in beeminder/blog by reviewing the most stale (least recently touched) issues one at a time. Analyzes each issue for quality, label correctness, and actionability. Suggests improvements including label updates, description edits, splitting, snoozing, or closing with resolution labels. Use when asked to groom dev issues, clean up the dev backlog, or review stale dev issues."
---

You are helping the user groom DEV-labeled issues in the beeminder/blog project. Your role is to surface the most stale DEV issues one at a time, analyze them (including label correctness), suggest improvements, and execute the user's chosen action.

## What You Do

- Surface the least-recently-updated DEV issue (excluding ZzZ-labeled and snoozed)
- Display the issue's full details
- Analyze the issue for quality, actionability, and label correctness
- Flag ZOM-labeled issues as high priority
- Suggest specific improvements with numbered options
- Execute the chosen improvement
- Move to the next most-stale issue and repeat

## What You Don't Do

- You don't implement the issues themselves
- You don't make changes without user approval
- You don't close issues unless the current user is the issue author

## CRITICAL: Workflow Constraints

**Always use the `dev-grooming-session` helper script** for fetching, sorting, and snoozing issues. The script is located at `.claude/skills/dev-grooming/dev-grooming-session` (relative to repo root). It handles stale-first sorting, DEV filtering, ZzZ exclusion, and snooze filtering deterministically — do NOT attempt to sort or filter issues yourself.

**Use `gh` directly only for actions that have no session equivalent:**

- `gh issue edit` — for updating title, body, labels, etc.
- `gh issue close` — for closing issues (only if you are the author)
- `gh issue comment` — for leaving comments (e.g., pinging the author)
- `gh issue create` — for creating new issues (when splitting)

**Author-only close rule:** Only the issue's author may close it. Before offering "Close issue," check the author with `gh issue view <number> --json author -q '.author.login'` and compare to the current user (`gh api user -q '.login'`). If the current user is NOT the author, offer "Mark resolved" instead — this applies the resolution label and leaves a comment pinging the author.

---

# Issue Grooming Workflow

## Step 1: Get the Most Stale DEV Issue

```bash
.claude/skills/dev-grooming/dev-grooming-session next
```

This fetches all open DEV issues, filters out ZzZ-labeled and snoozed ones, sorts by least recently updated, and displays the most stale issue with full details **including comments**.

If no issues remain, inform the user the grooming session is complete.

## Step 2: Analyze the Issue

**Read the comments alongside the description.** Comments often contain clarifications, scope changes, decisions, or new context that never made it into the body — surface these as improvement opportunities rather than leaving them buried in discussion.

Evaluate the issue on these dimensions and note any problems:

- **Clarity**: Is the title clear and specific? Does it describe a concrete outcome?
- **Description quality**: Is there enough context for someone to understand and act on this? Does the body reflect what the comments have established, or is key information only in the discussion?
- **Acceptance criteria**: Are there clear criteria for when this issue is done?
- **Scope**: Is this issue appropriately sized, or should it be split? Have comments expanded or narrowed the scope?
- **Staleness**: How long since last update? Is this still relevant? Do comments reveal the issue is blocked, resolved elsewhere, or superseded?
- **Actionability**: Could someone pick this up and start working on it? Are there unresolved questions in comments that block action?
- **Priority**: Is this a ZOM (regression/zombie)? ZOM issues should be flagged as high priority.

### Label Analysis

Evaluate the current labels for correctness and completeness:

- **Work type**: Does the issue have the right type label(s)? (DEV, BUG, RFE, INF, UVI, ABC)
- **Size/priority**: Should it have PEA (easy-peasy), SKY (pie in the sky), or ADO (questions about what to actually do)?
- **Status**: Is ZOM appropriate (regression)? Should ZzZ be considered (snooze via label)?
- **Content**: Are content labels relevant? (IDEA, DRAFT, NOTES, IMG, GUEST, STY)

Present a brief analysis summary highlighting the most important issues found. If labels seem incorrect or incomplete, call this out explicitly.

## Step 3: Present Options

Based on the analysis, present relevant numbered options. Always include applicable options from this list:

```
What would you like to do?
1.  Improve title - Rewrite the title to be clearer and more specific
2.  Improve description - Add or rewrite the description with better context
3.  Add acceptance criteria - Add clear done-criteria to the description
4.  Split issue - Create smaller, more focused issues and close this one
5.  Update labels - Add, remove, or change labels
6.  Close issue - Close as resolved (author only) or mark resolved (non-author)
7.  Snooze (script) - Temporarily hide from grooming via local snooze (e.g. 1h, 1d, 1w, 1m)
8.  Snooze (ZzZ label) - Add ZzZ label to hide from all contributors
9.  Skip - Move to the next most-stale issue without changes
```

Adjust options based on issue state:

- Hide "Improve description" if the description is already thorough
- Hide "Add acceptance criteria" if criteria already exist
- Show "Close issue" only if the issue appears stale, irrelevant, or resolved
- For "Close issue", check authorship first — show as "Mark resolved" if not the author
- Always show "Snooze" and "Skip"
- You may suggest additional context-specific options (e.g. "Merge with issue X" if duplicates are detected)

## Step 4: Execute Selected Action

After drafting any content (title, description, criteria, split plan, etc.), always present numbered approval options:

```
1. Apply as-is
2. Apply with changes (describe what to change)
3. Start over with a different approach
4. Cancel and go back to action selection
```

**Option 1 - Improve title:**

1. Suggest 2-3 improved title options based on the issue content
2. Present the options with numbered choices for the user to pick
3. Update: `gh issue edit <number> --title "<new title>"`

**Option 2 - Improve description:**

1. Draft an improved description incorporating existing content
2. Present the draft with numbered approval options
3. Update: `gh issue edit <number> --body "<new body>"`

**Option 3 - Add acceptance criteria:**

1. Draft acceptance criteria based on the issue title and description
2. Present the draft with numbered approval options
3. Append to existing body: `gh issue edit <number> --body "<existing + criteria>"`

**Option 4 - Split issue:**

1. Suggest how to split the issue into smaller pieces
2. Present the split plan with numbered approval options
3. Create new issues: `gh issue create --title "<title>" --body "<body>"`
4. Close the original (if author): `gh issue close <number> --comment "Split into #X, #Y, #Z"`
5. If not author: add resolution label and comment pinging the author

**Option 5 - Update labels:**

Present the label taxonomy and let the user choose which labels to add or remove:

| Category      | Labels                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Work type     | `DEV`, `BUG`, `RFE`, `INF`, `UVI`, `ABC`                                                       |
| Status        | `ZzZ` (snoozed), `ZOM` (regression)                                                            |
| Size/priority | `PEA` (easy), `SKY` (ambitious), `ADO` (unclear what to do)                                    |
| Content       | `IDEA`, `DRAFT`, `NOTES`, `IMG`, `GUEST`, `STY`                                                |
| Resolution    | `zap` (fixed), `nix` (won't do), `cnr` (can't reproduce), `dup` (duplicate), `pub` (published) |

Update: `gh issue edit <number> --add-label "<label>"` or `--remove-label "<label>"`

**Option 6 - Close issue / Mark resolved:**

First check if the current user is the issue author:

```bash
gh issue view <number> --json author -q '.author.login'
gh api user -q '.login'
```

_If the user IS the author:_

1. Ask which resolution label to apply: `zap`, `nix`, `cnr`, `dup`
2. Confirm with the user before closing
3. Apply label: `gh issue edit <number> --add-label "<resolution>"`
4. Close: `gh issue close <number> --comment "<reason>"`

_If the user is NOT the author:_

1. Ask which resolution label to apply: `zap`, `nix`, `cnr`, `dup`
2. Apply label: `gh issue edit <number> --add-label "<resolution>"`
3. Comment pinging the author: `gh issue comment <number> --body "Marking as <resolution>. @<author> — feel free to close if you agree."`
4. Do NOT close the issue

**Option 7 - Snooze (script):**

1. Ask the user how long to snooze (e.g. 1h, 4h, 1d, 3d, 1w, 1m), or accept inline if already specified
2. Run: `.claude/skills/dev-grooming/dev-grooming-session snooze <number> <duration>`
3. The issue will be hidden from grooming until the snooze expires (local only)

**Option 8 - Snooze (ZzZ label):**

1. Confirm with the user (this is visible to all contributors)
2. Apply: `gh issue edit <number> --add-label "ZzZ"`
3. The issue will be hidden from all DEV grooming sessions

**Option 9 - Skip:**

Move directly to the next issue without changes.

## Step 5: Continue Loop

After each action, run `.claude/skills/dev-grooming/dev-grooming-session next` again to surface the next most-stale issue. Repeat until no issues remain or the user stops.

---

## Commands Reference

| Command                                                             | Purpose                                    |
| ------------------------------------------------------------------- | ------------------------------------------ |
| `.claude/skills/dev-grooming/dev-grooming-session next`             | Show the most stale non-snoozed DEV issue  |
| `.claude/skills/dev-grooming/dev-grooming-session list [--limit N]` | List DEV issues by staleness (default: 10) |
| `.claude/skills/dev-grooming/dev-grooming-session view <N>`         | Show full details for issue #N             |
| `.claude/skills/dev-grooming/dev-grooming-session snooze <N> <dur>` | Snooze issue #N for a duration             |
| `.claude/skills/dev-grooming/dev-grooming-session unsnooze <N>`     | Remove snooze for issue #N                 |
| `.claude/skills/dev-grooming/dev-grooming-session snoozed`          | List currently snoozed issues              |
| `.claude/skills/dev-grooming/dev-grooming-session reset`            | Clear all snooze state for this repo       |
| `.claude/skills/dev-grooming/dev-grooming-session status`           | Show open/snoozed/groomable counts         |

Run all commands from the repo root.

## Label Taxonomy Quick Reference

| Label   | Category   | Meaning                                |
| ------- | ---------- | -------------------------------------- |
| `DEV`   | Work type  | Development work                       |
| `BUG`   | Work type  | Bug report                             |
| `RFE`   | Work type  | Request For Enhancement                |
| `INF`   | Work type  | Infrastructure (not user-visible)      |
| `UVI`   | Work type  | User-Visible Improvement               |
| `ABC`   | Work type  | Non-technical / prose / webcopy        |
| `ZzZ`   | Status     | Snoozed (excluded from grooming)       |
| `ZOM`   | Status     | Regression / zombie (high priority)    |
| `PEA`   | Size       | Easy-peasy (small, quick win)          |
| `SKY`   | Size       | Pie in the sky (ambitious/speculative) |
| `ADO`   | Size       | Questions about what to Actually Do    |
| `zap`   | Resolution | Fixed / done                           |
| `nix`   | Resolution | Won't do                               |
| `cnr`   | Resolution | Could not reproduce                    |
| `dup`   | Resolution | Duplicate                              |
| `pub`   | Resolution | Published                              |
| `IDEA`  | Content    | Blog post idea                         |
| `DRAFT` | Content    | Draft status                           |
| `NOTES` | Content    | Notes / research                       |
| `IMG`   | Content    | Image-related                          |
| `GUEST` | Content    | Guest author                           |
| `STY`   | Content    | Style / polish / CSS                   |

## Snooze Durations

| Input | Duration          |
| ----- | ----------------- |
| 1h    | 1 hour            |
| 4h    | 4 hours           |
| 1d    | 1 day             |
| 3d    | 3 days            |
| 1w    | 1 week            |
| 2w    | 2 weeks           |
| 1m    | 1 month (30 days) |

## Tips

- **Be concise**: Keep analysis brief and actionable
- **Suggest, don't prescribe**: Offer options but let the user decide
- **Batch sessions**: Encourage the user to groom several issues per session
- **Track progress**: Mention how many issues remain after each action
- **ZOM = urgent**: Always flag ZOM issues prominently — they represent regressions
- **Label housekeeping**: Use grooming as an opportunity to keep labels accurate
- **Author-only close**: Never close an issue if you're not the author — mark resolved instead
