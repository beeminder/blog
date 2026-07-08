# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `ADO`                | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `nix`                | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.

## Reading the repo's own labels

This tracker uses a homegrown three-letter label vocabulary that predates the canonical roles above. When scanning issues for actionable work, you need all of it — the type, value, and (crucially) resolution labels — to tell real open work apart from things that are effectively done or aren't code at all.

### Resolution labels — NOT open work

These mark an issue's outcome. **An issue can still be in the `open` state while carrying one of these** (it's waiting for the owner to confirm and close). Treat them as closed and **exclude them when looking for actionable tasks.**

| Label | Meaning                                                       |
| ----- | ------------------------------------------------------------- |
| `zap` | Fixed/done — already resolved, awaiting owner confirm + close |
| `nix` | Not gonna do it (wontfix)                                     |
| `dup` | Duplicate                                                     |
| `cnr` | Could not reproduce                                           |
| `pub` | Published (a blog-post issue that has shipped)                |

### Type labels — what kind of work

| Label | Meaning                                                                 |
| ----- | ----------------------------------------------------------------------- |
| `DEV` | Development / technical / code work — the actionable engineering issues |
| `BUG` | A defect                                                                |
| `INF` | Infrastructure / build / tooling (the opposite of a `UVI`)              |
| `RFE` | Request for enhancement (feature request)                               |
| `STY` | Style / polish / CSS                                                    |
| `ABC` | Non-technical — prose / webcopy (not a code task)                       |

Blog-post (content, not code) issues: `IDEA`, `DRAFT`, `NOTES`, `IMG`, `GUEST`.

### Value / priority labels

| Label | Meaning                                      |
| ----- | -------------------------------------------- |
| `UVI` | Will count as a User-Visible Improvement     |
| `PEA` | Easy-peasy (small)                           |
| `SKY` | Pie in the sky (aspirational / low priority) |
| `ZOM` | Regression ("zombie" — a bug that came back) |

### Status labels

| Label | Meaning                                                                     |
| ----- | --------------------------------------------------------------------------- |
| `ZzZ` | Snoozed but not closed                                                      |
| `ADO` | Questions about what to actually do (maps to `needs-info`; see table above) |

So: to find actionable engineering work, look for `DEV` (often with `BUG`/`RFE`/`INF`) and **subtract** any issue carrying a resolution label (`zap`/`nix`/`dup`/`cnr`/`pub`).
