# Technical Specification: Project-Level Dev Issue Grooming Skill

## Difficulty: Medium

Adapting an existing personal skill to a project-specific context with a non-trivial label taxonomy. Not architecturally complex, but has many label-related edge cases and filtering requirements.

## Technical Context

- **Language**: Bash (helper script), Markdown (skill definition)
- **Dependencies**: `gh` (GitHub CLI), `jq`, standard coreutils
- **Target repo**: `beeminder/blog`
- **Reference implementation**: `~/.claude/skills/grooming/` (personal grooming skill)
- **Project skill pattern**: `.claude/skills/<name>/SKILL.md` (see existing `snapshot-tests`, `optimize-build`)

## Label Taxonomy

The beeminder/blog repo uses a custom label system that the grooming skill must understand:

### Work Type Labels
| Label | Meaning |
|-------|---------|
| `DEV` | Development work (the primary target for this skill) |
| `BUG` | Bug reports |
| `RFE` | Request For Enhancement |
| `INF` | Infrastructure (not user-visible) |
| `UVI` | User-Visible Improvement |
| `ABC` | Non-technical / prose / webcopy |

### Status Labels
| Label | Meaning |
|-------|---------|
| `ZzZ` | Snoozed but not closed (treat as snoozed in grooming) |
| `ZOM` | Regressions aka zombies (high priority) |

### Size/Priority Labels
| Label | Meaning |
|-------|---------|
| `PEA` | Easy-peasy (small, quick wins) |
| `SKY` | Pie in the sky (ambitious/speculative) |
| `ADO` | Questions about what to Actually Do |

### Resolution Labels (used when closing)
| Label | Meaning |
|-------|---------|
| `zap` | Fixed/done |
| `nix` | Not gonna do it |
| `cnr` | Could not reproduce |
| `dup` | Duplicate |
| `pub` | Published |

### Content Labels
| Label | Meaning |
|-------|---------|
| `IDEA` | Blog post ideas |
| `DRAFT` | Draft status |
| `NOTES` | Notes/research |
| `IMG` | Image-related |
| `GUEST` | Guest author posts |
| `STY` | Style / polish / CSS |

## Implementation Approach

Create a project-local grooming skill at `.claude/skills/dev-grooming/` with two files:

### 1. `dev-grooming-session` (Bash helper script)

Forked from `~/.claude/skills/grooming/grooming-session` with these key changes:

- **Default filter**: Only fetch issues labeled `DEV` (via `gh issue list --label DEV`)
- **ZzZ filtering**: Exclude issues labeled `ZzZ` in addition to script-level snooze state. This means issues snoozed via the GitHub label are automatically excluded without needing script-level snooze entries.
- **Snooze state path**: Use project-local data dir derived from repo name (same XDG pattern as personal script, no change needed since it's already per-repo)
- **No Firefox auto-open**: Remove the Firefox auto-open behavior from `cmd_next` (project-local script should not assume browser preference)
- **Label display**: Include labels in `list` output for at-a-glance context

### 2. `SKILL.md` (Skill definition)

Adapted from `~/.claude/skills/grooming/SKILL.md` with these project-specific additions:

- **Scope**: Grooming focuses on `DEV`-labeled issues only
- **Label-aware analysis**: Analysis step should evaluate label correctness (e.g., does this DEV issue also need BUG/RFE/INF? Is it missing PEA/SKY?)
- **Label management option**: Add "Update labels" as a grooming action
- **Close with resolution label**: When closing, prompt for resolution label (zap, nix, cnr, dup) and apply it
- **ZzZ snooze option**: Offer "Add ZzZ label" as an alternative to script-level snooze (persistent, visible to all contributors)
- **ZOM awareness**: Flag ZOM-labeled issues as high priority in analysis
- **Script path**: Reference `.claude/skills/dev-grooming/dev-grooming-session` (project-local)

## Source Code Structure Changes

### New Files
```
.claude/skills/dev-grooming/
  SKILL.md                  # Skill definition with project-specific workflow
  dev-grooming-session      # Bash helper script (executable)
```

### No Modified Files
This is entirely additive - no existing files need to change.

## Interface

The skill will be invoked as `/dev-grooming` (name derived from directory). It presents the same interactive loop as the personal grooming skill:

1. Surface most stale DEV issue (excluding ZzZ-labeled and script-snoozed)
2. Analyze with label-awareness
3. Present options (including label management and resolution labels)
4. Execute chosen action
5. Loop to next issue

## Verification Approach

1. **Script testing**: Run `dev-grooming-session status` to verify it connects to the repo and counts DEV issues correctly
2. **Filter testing**: Run `dev-grooming-session list` and verify only DEV-labeled non-ZzZ issues appear
3. **Snooze testing**: Snooze an issue, verify it disappears from `next`, unsnooze and verify it reappears
4. **Skill invocation**: Run `/dev-grooming` and verify the full workflow functions (next issue shown, analysis presented, actions work)
5. **Label actions**: Test adding/removing labels via the skill's label management option
