# Spec and build

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:
- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification
<!-- chat-id: a9455d20-33e5-4928-9fab-752edbe75368 -->

Assess the task's difficulty, as underestimating it leads to poor outcomes.
- easy: Straightforward implementation, trivial bug fix or feature
- medium: Moderate complexity, some edge cases or caveats to consider
- hard: Complex logic, many caveats, architectural considerations, or high-risk changes

Create a technical specification for the task that is appropriate for the complexity level:
- Review the existing codebase architecture and identify reusable components.
- Define the implementation approach based on established patterns in the project.
- Identify all source code files that will be created or modified.
- Define any necessary data model, API, or interface changes.
- Describe verification steps using the project's test and lint commands.

Save the output to `{@artifacts_path}/spec.md` with:
- Technical context (language, dependencies)
- Implementation approach
- Source code structure changes
- Data model / API / interface changes
- Verification approach

If the task is complex enough, create a detailed implementation plan based on `{@artifacts_path}/spec.md`:
- Break down the work into concrete tasks (incrementable, testable milestones)
- Each task should reference relevant contracts and include verification steps
- Replace the Implementation step below with the planned tasks

Rule of thumb for step size: each step should represent a coherent unit of work (e.g., implement a component, add an API endpoint, write tests for a module). Avoid steps that are too granular (single function).

Important: unit tests must be part of each implementation task, not separate tasks. Each task should implement the code and its tests together, if relevant.

Save to `{@artifacts_path}/plan.md`. If the feature is trivial and doesn't warrant this breakdown, keep the Implementation step below as is.

---

### [ ] Step: Create dev-grooming-session helper script

Create `.claude/skills/dev-grooming/dev-grooming-session` by adapting the personal `grooming-session` script:
- Filter for `DEV`-labeled issues only (`gh issue list --label DEV`)
- Exclude `ZzZ`-labeled issues in addition to script-level snooze
- Include labels in `list` output
- Remove Firefox auto-open behavior
- Make executable (`chmod +x`)
- Verify: run `dev-grooming-session status` and `dev-grooming-session list` against beeminder/blog

### [ ] Step: Create SKILL.md with label-aware workflow

Create `.claude/skills/dev-grooming/SKILL.md` adapting the personal grooming skill:
- Scope to DEV-labeled issues
- Add label-aware analysis (evaluate label correctness, flag ZOM as high priority)
- Add "Update labels" action with the full label taxonomy
- Add resolution label selection when closing (zap, nix, cnr, dup)
- Add ZzZ label option as alternative to script-level snooze
- Reference project-local script path
- Verify: invoke `/dev-grooming` and confirm the full workflow functions

### [ ] Step: Verification and report

- Run the full grooming workflow end-to-end
- Test script commands: status, list, next, snooze, unsnooze
- Verify label filtering works correctly
- Write report to `{@artifacts_path}/report.md`
