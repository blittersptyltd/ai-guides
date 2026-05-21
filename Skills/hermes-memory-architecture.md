---
name: hermes-memory-architecture
description: Use when auditing, repairing, or upgrading Hermes memory architecture, session recall, Obsidian-backed synthesis, built-in memory hygiene, or scheduled dream cycles.
version: 1.0.0
author: Blitters / Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [hermes, memory, session-search, obsidian, cron, dream-cycle, sqlite, profile-aware]
    related_skills: [hermes-agent, obsidian]
---

# Hermes Memory Architecture

## Purpose

Use this skill to audit, repair, and improve a Hermes agent's memory architecture without turning memory into a giant always-loaded file.

The target architecture is layered:

1. **Session recall** — `session_search` backed by Hermes' SQLite session database for detailed prior conversations.
2. **Durable knowledge base** — Obsidian or another human-readable note system for reviewed synthesis, operating knowledge, and architecture notes.
3. **Hermes built-in memory** — compact always-loaded facts only: durable preferences, stable environment facts, and recurring tool/project conventions.
4. **Optional external/deep memory providers** — Honcho, Mem0, Supermemory, Hindsight, holographic memory, or similar providers when deliberately configured.
5. **Scheduled dream cycles** — bounded periodic synthesis that writes reviewable notes and proposes memory candidates, but does not directly mutate always-loaded memory.

Core principle:

> Detailed history belongs in searchable session recall. Durable synthesis belongs in notes. Only compact facts belong in always-loaded memory.

## Field-Tested Findings

This methodology has been validated against live Hermes profiles. The strongest finding is that the architecture is not just conceptual: a disciplined audit can reveal real operational issues without requiring prior conversation context.

Field-tested guardrails that matter most:

- Inspect stored cron prompts, not just cron status.
- Treat model/provider persistence as a first-class audit check.
- Verify Obsidian vault roots before writing; path bugs can silently create sibling folders.
- Review structured/deep memory manually; automated contradiction checks are not enough.
- Separate SQLite integrity from recall completeness.
- Treat gateway staleness as an adjacent operational issue, not proof of memory corruption.

These findings should be translated into generic checks. Do not copy private paths, profile names, or one-off incident details into the reusable core.

## When to Use

Use this skill when:

- Setting up a new Hermes profile or instance with durable memory practices.
- Auditing whether session recall, notes, and built-in memory are being used correctly.
- Fixing broken or stale `session_search` results.
- Diagnosing or repairing a corrupted `$HERMES_HOME/state.db`.
- Creating or improving an Obsidian-backed dream-cycle workflow.
- Migrating knowledge out of oversized memory files.
- Reviewing whether scheduled synthesis is safe, bounded, and useful.
- Preparing a public or reusable memory-architecture guide.

Do **not** use this skill for:

- One-off memory additions. Use the `memory` tool directly and keep entries compact.
- One-off prior-session lookups. Use `session_search` directly.
- Raw transcript archival. Session transcripts already belong in the session store.
- Sensitive secret storage. Credentials belong in `.env`, auth stores, or secret managers, not memory or reusable notes.

## Architecture

### 1. Session Recall

**Purpose:** Detailed historical recall without stuffing old conversations into the system prompt.

**Primary interface:** `session_search` tool
**Typical storage:** `$HERMES_HOME/state.db` and `$HERMES_HOME/sessions/`
**Implementation detail:** SQLite with FTS indexing in current Hermes versions

Use session recall for questions like:

- "What did we decide about X?"
- "Where did we leave Y?"
- "Find the session where Z happened."
- "What were the key implementation choices from last week?"

Operational rules:

- Search past sessions before asking the user to repeat known context.
- Prefer targeted search queries over broad raw transcript dumps.
- Use session recall as evidence, then synthesize the durable takeaway into notes or compact memory when appropriate.
- Treat table names and schema details as implementation-specific. Inspect the live schema before writing repair scripts.

### 2. Durable Knowledge Base

**Purpose:** Human-readable, reviewable, searchable synthesis.

Obsidian is the recommended knowledge base, but the same layer can be another filesystem-backed note system.

Recommended environment variables:

```text
$OBSIDIAN_VAULT_PATH       # root of the durable-note vault
$OBSIDIAN_AGENT_FOLDER     # optional configured folder for agent operational notes
```

Use durable notes for:

- Strategic decisions and rationale.
- Architecture summaries.
- Dream-cycle syntheses.
- Project reference notes.
- Lessons learned.
- Memory candidates requiring human review.
- Public-safe reusable guides.

Do not use durable notes for:

- Every task progress update.
- Raw transcript copies.
- Secrets, credentials, or unnecessary PII.
- Unreviewed always-loaded memory bloat.

Privacy rule:

> Keep secrets, credentials, and unnecessary PII out of always-loaded memory and public/reusable notes. Private durable notes may contain sensitive context only when intentionally stored, access-controlled, and appropriate for the active model/provider.

### Path Verification Before Writing

Before writing any dream-cycle or durable-note file, verify the target root exists and is the intended vault/folder. This is not optional. Do **not** silently create a sibling folder if the configured path is wrong, misspelled, normalized differently, or missing punctuation/symbols.

For Obsidian, verify that the vault root contains `.obsidian` before writing. If an agent-specific folder is configured, verify it exists before writing into it; create only known child folders such as `Dream Cycles/` after the parent has been verified.

Python verification pattern:

```python
from pathlib import Path
import os

vault = Path(os.environ["OBSIDIAN_VAULT_PATH"]).expanduser()
assert (vault / ".obsidian").exists(), f"Not an Obsidian vault: {vault}"

agent = Path(os.environ["OBSIDIAN_AGENT_FOLDER"]).expanduser()
assert agent.exists(), f"Agent folder missing: {agent}"

target = agent / "Dream Cycles"
target.mkdir(parents=False, exist_ok=True)
```

If `$OBSIDIAN_AGENT_FOLDER` is unset, choose an explicit existing folder under `$OBSIDIAN_VAULT_PATH`, verify it, then document the choice before writing.

### 3. Hermes Built-In Memory

**Purpose:** Compact facts that should be injected into future sessions.

Good memory entries:

- Stable user preferences.
- Stable project conventions.
- Durable environment facts.
- Recurring tool quirks.
- Short facts that prevent repeated user correction.

Bad memory entries:

- PR numbers, issue numbers, commit SHAs.
- Task progress or session logs.
- Temporary bugs or transient errors.
- Large architecture notes.
- Raw plans, transcripts, or research dumps.
- Secrets or credentials.

Important behavior:

- Built-in memory may be snapshotted into the active prompt at session start.
- A memory write may persist on disk but not affect the current session's reasoning until a fresh session/reset.
- For urgent current-turn context, keep it in the conversation or read the relevant note directly.

### 4. Optional External / Deep Memory Providers

Hermes can support optional memory providers or plugins depending on configuration.

Examples include:

- Honcho
- Mem0
- Supermemory
- Hindsight
- Holographic or structured memory systems

Operational rule:

> Do not add external memory complexity until native session recall, durable notes, and built-in memory hygiene are healthy.

External memory should complement the core layers, not replace them.

### Structured / Deep Memory Provider Audit

If structured or deep memory tools are available, audit them separately from built-in memory. These providers often store facts, preferences, embeddings, or confidence scores that are not visible in the basic memory file.

Audit workflow:

1. List stored facts or memories.
2. Search for duplicates by topic, tool, project, and preference.
3. Search for raw transcript fragments or system/user-message fragments accidentally saved as facts.
4. Look for stale, contradictory, or over-specific facts.
5. Perform manual review even if automated contradiction checks pass. Contradiction tools can miss duplicates, polluted raw fragments, and stale-but-not-technically-contradictory facts.
6. Prefer lowering trust, removing polluted entries, or merging duplicates over adding more memory.
7. Promote only compact stable facts that should influence future sessions.
8. Record cleanup decisions in a durable note when the provider has no clear audit trail.

Generic checks:

```text
- duplicate facts
- contradictory facts
- stale facts
- raw transcript fragments
- task-progress facts
- facts containing secrets, credentials, or unnecessary PII
- multiple versions of the same preference
```

Provider-specific commands vary. If a profile exposes tools such as `fact_store list`, `fact_store search`, `fact_store contradict`, `fact_feedback`, `fact_store remove`, or `fact_store update`, use them as provider-specific examples, not universal assumptions.

### 5. Dream Cycles

A dream cycle is a scheduled synthesis pass that:

1. Searches a bounded set of recent or relevant sessions.
2. Identifies durable decisions, patterns, risks, and open loops.
3. Writes a dated note to the durable knowledge base.
4. Proposes memory candidates for human or operator review.
5. Does **not** directly mutate Hermes memory.
6. Does **not** recursively create more cron jobs.

Dream cycles are for synthesis, not raw transcript dumping.

Recommended note path pattern:

```text
$OBSIDIAN_AGENT_FOLDER/Dream Cycles/YYYY-MM-DD Dream Cycle.md
```

If `$OBSIDIAN_AGENT_FOLDER` is not configured, choose an explicit durable folder under `$OBSIDIAN_VAULT_PATH` and document it.

## Audit Workflow

Run audit mode before upgrade mode. Inspect first, report findings, then apply only safe changes.

### Step 1 — Identify the Active Hermes Home

Do not assume `~/.hermes` in reusable instructions. Resolve the active home/profile.

```bash
printf 'HERMES_HOME=%s\n' "${HERMES_HOME:-$HOME/.hermes}"
hermes config path
hermes config env-path
hermes profile list 2>/dev/null || true
```

For scripts, use a resolved variable:

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
printf 'Using HERMES_HOME=%s\n' "$HERMES_HOME"
```

### Step 2 — Check Native Memory Status

```bash
hermes memory status
```

Look for:

- Built-in memory enabled/available.
- External providers deliberately configured, not accidentally half-configured.
- No obvious provider errors.
- No expectation that external memory replaces session recall.

### Step 2b — Check Model / Config Persistence

Model and provider configuration are not memory layers, but they affect summarisation, compression, dream-cycle quality, tool behaviour, and scheduled-job behaviour. Check that the live model/provider and persisted profile config are consistent where it matters.

```bash
hermes config
```

If you need a concise CLI slice and the config renderer supports stable headings, inspect the model section. Otherwise, use `hermes config path` and read the active profile config directly.

Look for:

- Live handoff/session model differs from persisted profile default.
- Scheduled jobs pin an older provider/model unexpectedly.
- Auxiliary compression/search/summarisation models are unset or routed to an unintended provider.
- Local/chat-only profiles accidentally have tool-capable settings, or tool-capable profiles accidentally use chat-only settings.

Do not change model/provider settings as part of memory cleanup unless the user explicitly asked for config repair. Report mismatches as related audit findings.

Model persistence deserves its own explicit result in the audit report. Record both:

- **Live/session model:** what the current session or handoff reports.
- **Persisted profile config:** what future sessions and scheduled jobs are likely to use.

If they diverge, explain the likely impact before changing anything. A live model mismatch can make an agent appear to "revert" after restart even when memory itself is healthy.

### Step 3 — Check Session DB Integrity

Use SQLite if available:

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
sqlite3 "$HERMES_HOME/state.db" "PRAGMA quick_check;"
```

Portable Python fallback:

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
python3 - <<'PY'
import os, sqlite3, pathlib
home = pathlib.Path(os.environ.get('HERMES_HOME', pathlib.Path.home() / '.hermes')).expanduser()
db = home / 'state.db'
print('db:', db)
if not db.exists():
    raise SystemExit('state.db not found')
con = sqlite3.connect(db)
print('quick_check:', con.execute('PRAGMA quick_check').fetchone()[0])
print('tables:')
for (name,) in con.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
    print('-', name)
con.close()
PY
```

### Step 4 — Count Sessions, Messages, and FTS Rows

Inspect schema first because table names can change across Hermes versions.

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
python3 - <<'PY'
import os, sqlite3, pathlib
home = pathlib.Path(os.environ.get('HERMES_HOME', pathlib.Path.home() / '.hermes')).expanduser()
con = sqlite3.connect(home / 'state.db')
tables = {row[0] for row in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
for table in ['sessions', 'messages', 'messages_fts']:
    if table in tables:
        print(f'{table}:', con.execute(f'SELECT count(*) FROM {table}').fetchone()[0])
    else:
        print(f'{table}: not present')
con.close()
PY
```

Healthy signs:

- `PRAGMA quick_check` returns `ok`.
- Session/message counts are plausible for the profile.
- FTS count is present and roughly aligned with messages when the schema uses FTS.
- Recent sessions are represented.

### Step 4b — Check Session DB Completeness

Database health and recall completeness are different.

- **Health** means SQLite is valid and queryable.
- **Completeness** means expected session transcripts are indexed and searchable.

Compare transcript files with indexed sessions:

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
python3 - <<'PY'
import os, sqlite3, pathlib
home = pathlib.Path(os.environ.get('HERMES_HOME', pathlib.Path.home() / '.hermes')).expanduser()
sessions_dir = home / 'sessions'
files = []
if sessions_dir.exists():
    files = [p for p in sessions_dir.iterdir() if p.suffix in {'.json', '.jsonl'}]
print('session transcript files:', len(files))
try:
    con = sqlite3.connect(home / 'state.db')
    tables = {row[0] for row in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    if 'sessions' in tables:
        print('sessions table:', con.execute('SELECT count(*) FROM sessions').fetchone()[0])
    else:
        print('sessions table: not present')
    con.close()
except Exception as exc:
    print('db count failed:', repr(exc))
PY
```

The counts do not need to match exactly. Profiles may keep exported, archived, compressed, or non-indexed session files. However, a large unexpected mismatch should trigger investigation before assuming recall is complete.

Failure signs:

- `database disk image is malformed`.
- `file is not a database`.
- Empty counts despite known prior sessions.
- FTS tables missing or obviously stale when the schema expects them.

### Step 5 — Test `session_search`

Use the actual tool when available. Search for known recent topics and older known topics.

Checks:

- Recent sessions return.
- Exact phrases from known sessions return.
- Results include enough context to reconstruct what happened.
- Empty results are plausible rather than obviously wrong.

If `session_search` fails, do not immediately rewrite memory. Diagnose the database and session files first.

### Step 6 — Check Durable Note Paths

```bash
printf 'OBSIDIAN_VAULT_PATH=%s\n' "${OBSIDIAN_VAULT_PATH:-unset}"
printf 'OBSIDIAN_AGENT_FOLDER=%s\n' "${OBSIDIAN_AGENT_FOLDER:-unset}"
```

Verify:

- The configured vault/folder exists.
- Dream-cycle notes have a consistent location.
- Public/reusable notes are separate from private profile-specific notes.
- Notes are searchable and not just write-only archives.

### Step 7 — Check Cron / Dream-Cycle Jobs

Use Hermes cron tooling or the cron tool if available.

```bash
hermes cron list
```

Then inspect the specific job details/prompt using the current Hermes cron UI/CLI or `cronjob` tool. The exact command may vary by Hermes version, but the audit must verify the stored prompt text, schedule, delivery, enabled toolsets, model override, and last-run status.

Look for:

- A bounded schedule such as nightly or weekly.
- A self-contained stored prompt.
- Appropriate toolsets only.
- No recursive scheduling instructions.
- Recent successful run, if already configured.
- Deliveries/errors that make failures visible.

Do not rely on status alone. A job can be "healthy" while its stored prompt still contains brittle paths, missing path verification, stale model assumptions, or unsafe memory-mutation instructions. Inspect the stored prompt with the available cron tooling before declaring a dream-cycle job production-ready.

### Step 8 — Audit Built-In Memory Hygiene

Review memory content using available Hermes memory tools/status.

Look for pollution:

- Large paragraphs that belong in notes.
- Stale task progress.
- Duplicates.
- Implementation logs.
- Credentials or private tokens.
- Old facts that conflict with current behavior.

Do not delete or overwrite memory blindly. Propose changes first unless the user explicitly authorizes safe cleanup.

## Upgrade Workflow

Apply upgrades in this order.

### Step 1 — Report Findings

Before changing anything, summarize:

- Active `$HERMES_HOME` / profile.
- Session DB status.
- `session_search` status.
- Durable note path status.
- Cron/dream-cycle status.
- Memory hygiene issues.
- Recommended safe actions.
- Actions requiring approval.

### Step 2 — Apply Safe Non-Destructive Improvements

Safe actions usually include:

- Creating missing durable-note folders.
- Creating a README that explains dream-cycle note format and guardrails.
- Writing proposed memory cleanup candidates to a review note.
- Updating reusable documentation to use profile-aware paths.
- Adding verification checklists.

Example durable folder setup:

```bash
: "${OBSIDIAN_AGENT_FOLDER:?Set OBSIDIAN_AGENT_FOLDER or choose an explicit durable folder first}"
mkdir -p "$OBSIDIAN_AGENT_FOLDER/Dream Cycles"
```

Example README content requirements:

```markdown
# Dream Cycles

Scheduled synthesis notes for this Hermes profile.

## Purpose
- Review bounded recent/relevant sessions using session recall.
- Preserve durable decisions and lessons in human-readable notes.
- Propose memory candidates for review.
- Avoid raw transcript dumping.

## Guardrails
- Do not directly mutate Hermes memory from scheduled runs.
- Do not recursively create cron jobs.
- Keep secrets and unnecessary PII out of notes.
- Label uncertainty and failures.
```

### Step 3 — Move Large Knowledge Out of Always-Loaded Memory

For each bloated memory item:

1. Copy the durable content into an appropriate note.
2. Replace the memory item with a compact pointer or summary only if needed.
3. Remove duplicates only after verifying the durable note exists.
4. Avoid storing sensitive content in public/reusable notes.

Good replacement pattern:

```text
Project X architecture details are documented in the durable project notes; built-in memory only stores the stable convention needed every turn.
```

Bad replacement pattern:

```text
[Several thousand words of architecture, logs, PR history, and temporary decisions]
```

### Step 4 — Configure Dream Cycles

Only configure a scheduled dream cycle after:

- `session_search` works.
- Durable note path exists.
- The prompt is bounded.
- The run cannot recursively schedule jobs.
- The run does not directly mutate memory.

Use the Dream-Cycle Setup section below.

### Step 5 — Defer Destructive Repairs

These require explicit approval or a clear operator decision:

- Moving/replacing `$HERMES_HOME/state.db`.
- Deleting memory entries.
- Removing old session files.
- Changing profile-level memory providers.
- Disabling existing scheduled jobs.

## Dream-Cycle Setup

### Recommended Schedule

Nightly is reasonable for active agents:

```text
0 2 * * *
```

Weekly may be better for low-volume agents:

```text
0 3 * * 0
```

### Recommended Toolsets

Use the minimum required toolsets:

```text
session_search, file, skills
```

Add `terminal` only if the prompt must inspect local paths or run validation commands. Add web/browser tools only if the dream cycle explicitly needs external research, which is uncommon.

### Profile-Sensitive Search Limits

Dream-cycle search depth should match the profile's latency and reliability.

Default bounded approach:

```text
Use at most one recent-session browse plus up to five targeted searches.
```

For latency-sensitive profiles, mobile/gateway sessions, or cron jobs that have previously timed out, prefer a lighter nightly pattern:

```text
Use exactly one no-query recent-session scan. Do not run targeted searches in the nightly job. Reserve deeper targeted searches for a separate weekly or manual consolidation job.
```

This keeps nightly synthesis reliable while still allowing deeper memory consolidation when timeouts are less risky.

### Safe Cron Prompt Template

```text
You are running a bounded Hermes memory dream cycle for this profile.

Goal:
Create one dated durable-note synthesis of recent important sessions. Do not directly write Hermes memory.

Rules:
- Do not create, update, or remove cron jobs.
- Do not call the memory tool.
- Use session_search first.
- Use profile-sensitive search limits: normally at most one recent-session browse plus up to five targeted searches; for latency-sensitive cron jobs, use exactly one no-query recent-session scan.
- Prefer synthesis over transcript dumping.
- Capture only durable decisions, recurring preferences, reusable lessons, risks, and open loops.
- Keep secrets, credentials, and unnecessary PII out of the note.
- Label uncertainty and failures explicitly.
- If recall fails, write a short failure note rather than pretending success.

Output note:
Write a markdown note to:
$OBSIDIAN_AGENT_FOLDER/Dream Cycles/YYYY-MM-DD Dream Cycle.md

Required sections:
1. Run timestamp
2. Evidence base: searches performed and limits
3. Recent activity summary
4. Durable decisions / learnings
5. Reusable workflow lessons
6. Proposed memory candidates — NOT yet saved
7. Risks / privacy observations
8. Failures / limitations
9. Suggested follow-up

Final response:
Report the note path, whether it was created, and any failures/limitations.
```

If environment variables are unavailable to cron runs, replace them with an explicit profile-appropriate path when creating the job.

### Cron Creation Pattern

From an interactive Hermes session, use the `cronjob` tool when available. From CLI, use `hermes cron create` and paste the self-contained prompt.

Verification after creation:

```bash
hermes cron list
```

Then run once manually through Hermes cron tooling and verify the note.

### Dream-Cycle Note Requirements

Each note should include:

- Timestamp and profile/context.
- Evidence base: what searches were performed.
- Summary of durable findings.
- Memory candidates clearly marked as proposed only.
- Failures/limitations.
- No raw transcript dumps.
- No direct claim that built-in memory was changed.

## Session Recall Diagnostics and Escalation

Run basic recall checks during every memory-architecture audit. Do **not** assume the session database needs repair just because this section exists.

The purpose of this section is to help an agent distinguish:

- **Healthy recall** — record status and move on.
- **Stale or incomplete recall** — investigate profile, indexing, or session-file coverage.
- **Corrupted recall storage** — escalate carefully to backup and repair.
- **Confirmed unrecoverable index problem** — rebuild only as a last resort.

### Level 1 — Normal Recall Health Checks

Run these during ordinary audits:

1. Resolve the active `$HERMES_HOME` and profile.
2. Run `hermes memory status`.
3. Run SQLite `PRAGMA quick_check` on `$HERMES_HOME/state.db`.
4. Count sessions, messages, and FTS rows if the schema exposes them.
5. Compare transcript-file count with indexed session count.
6. Test `session_search` with known recent and older topics.
7. Check dream-cycle cron status if scheduled synthesis is used.

If all checks pass, record recall as healthy and skip repair/rebuild steps.

### Level 2 — Symptoms That Justify Troubleshooting

Escalate beyond normal audit only when there are symptoms such as:

- `session_search` fails for known recent sessions.
- Known exact phrases cannot be found.
- SQLite `PRAGMA quick_check` is not `ok`.
- SQLite reports errors such as malformed database or invalid database file.
- DB counts are implausibly low for the profile.
- Transcript-file count is much higher than indexed-session count without a known reason.
- Recent sessions are missing from search results.
- Gateway or session logs show SQLite/session-store errors.
- Dream cycles repeatedly report recall failures or produce empty evidence bases.

A count mismatch alone is not proof of corruption. Profiles may contain exported, archived, or non-indexed session files. Treat mismatches as investigation triggers, not automatic rebuild triggers.

### Level 3 — Non-Destructive Investigation

Before any repair:

- Confirm the active profile and `$HERMES_HOME` are the intended ones.
- Inspect the live SQLite schema; do not assume table names across versions.
- Check whether session files exist under `$HERMES_HOME/sessions/`.
- Run known `session_search` probes.
- Check whether a gateway or long-lived process may be holding a stale database handle.
- Treat gateway staleness as adjacent operational state, not automatically as memory corruption. A stale gateway/session can make config, model, cron, or database changes appear not to apply until restart.
- Check model/config persistence if scheduled jobs or compression may be using an unexpected profile/model.
- Back up before any command that could alter storage.

Schema and health check:

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
python3 - <<'PY'
import os, sqlite3, pathlib
home = pathlib.Path(os.environ.get('HERMES_HOME', pathlib.Path.home() / '.hermes')).expanduser()
db = home / 'state.db'
print('checking:', db)
try:
    con = sqlite3.connect(db)
    print('quick_check:', con.execute('PRAGMA quick_check').fetchone()[0])
    print('tables:')
    for (name,) in con.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
        print('-', name)
    con.close()
except Exception as exc:
    print('sqlite_error:', repr(exc))
    raise
PY
```

Session-file coverage check:

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
python3 - <<'PY'
import os, sqlite3, pathlib
home = pathlib.Path(os.environ.get('HERMES_HOME', pathlib.Path.home() / '.hermes')).expanduser()
sessions_dir = home / 'sessions'
files = [p for p in sessions_dir.glob('*.json')] + [p for p in sessions_dir.glob('*.jsonl')] if sessions_dir.exists() else []
print('session transcript files:', len(files))
try:
    con = sqlite3.connect(home / 'state.db')
    tables = {row[0] for row in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    if 'sessions' in tables:
        print('indexed sessions:', con.execute('SELECT count(*) FROM sessions').fetchone()[0])
    if 'messages' in tables:
        print('indexed messages:', con.execute('SELECT count(*) FROM messages').fetchone()[0])
    con.close()
except Exception as exc:
    print('db count failed:', repr(exc))
PY
```

### Level 4 — Backup Before Any Repair

If troubleshooting indicates a real storage/index problem, back up the live database and sidecars before changing anything.

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
timestamp=$(date '+%Y%m%d_%H%M%S')
mkdir -p "$HERMES_HOME/backups"
for f in "$HERMES_HOME/state.db" "$HERMES_HOME/state.db-wal" "$HERMES_HOME/state.db-shm" "$HERMES_HOME/state.db-journal"; do
  [ -e "$f" ] && cp -p "$f" "$HERMES_HOME/backups/$(basename "$f").backup-$timestamp"
done
```

This backup step is safe and reversible. It does not imply that a rebuild is required.

### Level 5 — Rebuild Only as a Last Resort

Rebuild only when audit evidence indicates the live session index is corrupted or materially incomplete and safer fixes have failed.

Last-resort rules:

- Prefer rebuilding into a temporary database before touching the live DB.
- Use the current Hermes code/API where possible rather than hand-creating tables.
- Inspect the live Hermes schema; do not assume table names across versions.
- Verify the rebuilt DB before replacing anything.
- Preserve or account for SQLite sidecar files such as `-wal`, `-shm`, and journals.
- Replace the live DB only after explicit approval when working for a user.
- Restart gateway or start a fresh session after DB replacement because live processes may hold stale SQLite handles.

Generic temporary rebuild approach:

1. Create a temporary `$HERMES_HOME/state.rebuild-TIMESTAMP.db`.
2. Initialize it using Hermes' current session database class or migration path.
3. Import sessions/messages from `$HERMES_HOME/sessions/` if available.
4. Recreate or refresh FTS rows using Hermes' current APIs.
5. Verify counts and `PRAGMA quick_check`.
6. Test known search hits against the rebuilt DB if a safe test harness exists.
7. Only then consider replacing the live DB.

Do not proceed with a rebuild if there are no session files or other source of truth to import.

Replacement pattern, after approval and verification:

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
timestamp=$(date '+%Y%m%d_%H%M%S')
mv "$HERMES_HOME/state.db" "$HERMES_HOME/state.db.pre-replacement-$timestamp"
cp -p "$HERMES_HOME/state.rebuild-$timestamp.db" "$HERMES_HOME/state.db"
```

Adjust the temporary filename to match the actual rebuild artifact.

### Level 6 — Verify After Any Recall Repair

After repair or replacement:

- Restart Hermes gateway if running.
- Start a fresh Hermes session.
- Re-run SQLite quick check.
- Re-run session/message/FTS counts.
- Re-run `session_search` for known recent and historical topics.
- Confirm dream-cycle jobs can produce a non-empty evidence base.
- Record what changed in a durable note if the repair was significant.

## Memory Hygiene Rules

### Save to Built-In Memory Only When

- The fact is stable and likely useful across many future sessions.
- The fact prevents repeated user correction or setup discovery.
- The fact is compact: usually one sentence.
- The fact is safe to inject into every prompt for that profile.

### Prefer Durable Notes When

- The content is long.
- The content requires human review.
- The content is strategic, architectural, or explanatory.
- The content may change over time.
- The content is useful but not needed in every prompt.

### Prefer Session Search When

- The user asks what happened previously.
- You need evidence from past conversations.
- The content is historical rather than a durable preference.
- You need to reconstruct a decision trail.

### Never Store in Built-In Memory

- API keys, tokens, passwords, auth cookies, private keys.
- Raw financial documents, private business material, or unnecessary PII.
- Long plans or architecture documents.
- One-off task status.
- Completed work logs.
- Temporary bugs.
- PR numbers, issue numbers, commit SHAs.

### Memory Candidate Review Pattern

Dream cycles and audits should write proposed memory entries like this:

```markdown
## Proposed Memory Candidates — NOT YET SAVED

- Candidate: User prefers concise implementation plans before code.
  - Reason: Repeated preference across recent sessions.
  - Scope: User profile.
  - Risk: Low.
  - Suggested action: Save after user approval.
```

Only promote candidates into built-in memory after review or clear authorization.

## Common Pitfalls

1. **Turning memory into a giant file**
   - Fix: Move detail to session recall and durable notes. Keep built-in memory compact.

2. **Hardcoding one machine or profile path in reusable instructions**
   - Fix: Use `$HERMES_HOME`, `$OBSIDIAN_VAULT_PATH`, and optional `$OBSIDIAN_AGENT_FOLDER`. Put real paths only in examples or migration notes.

3. **Assuming SQLite schema is stable forever**
   - Fix: Inspect `sqlite_master` and use current Hermes APIs for rebuilds.

4. **Running dream cycles as transcript dumpers**
   - Fix: Bound searches and require synthesis, memory candidates, and limitations sections.

5. **Letting cron directly mutate memory**
   - Fix: Cron writes proposed memory candidates to notes only. A human/operator promotes them later.

6. **Adding external memory before core recall works**
   - Fix: Stabilize native session recall and durable notes first; repair only when diagnostics show a real issue.

7. **Deleting or rewriting memory during an audit**
   - Fix: Propose cleanup first. Apply only authorized, safe changes.

8. **Expecting memory edits to affect the current prompt immediately**
   - Fix: Start a fresh session/reset when you need updated always-loaded memory in context.

9. **Mixing public reusable guides with private operational logs**
   - Fix: Keep generic instructions in the reusable core. Put profile-specific details in clearly labelled examples or private notes.

10. **Overstating what a dream cycle learned**
    - Fix: Include evidence base and failures/limitations in every note.

## Verification Checklist

Before declaring memory architecture healthy, verify:

- [ ] Active `$HERMES_HOME` / profile is known.
- [ ] `hermes memory status` is sane.
- [ ] SQLite `PRAGMA quick_check` returns `ok`.
- [ ] Session/message counts look plausible.
- [ ] Session transcript file count has been compared with indexed session count for completeness.
- [ ] FTS rows exist and are plausible if the current schema uses FTS.
- [ ] `session_search` returns expected recent sessions.
- [ ] `session_search` returns at least one known older hit.
- [ ] Recall troubleshooting was skipped if health/completeness checks were normal.
- [ ] Durable-note path exists, is documented, and has been verified before writing, including `.obsidian` for Obsidian vaults.
- [ ] Dream-cycle folder exists if dream cycles are used.
- [ ] Cron dream-cycle job exists if expected.
- [ ] Stored cron prompt has been inspected, not just cron status.
- [ ] Last dream-cycle run succeeded or failures are visible.
- [ ] Dream-cycle note contains evidence base and limitations.
- [ ] Dream-cycle note proposes memory candidates but does not claim to save them.
- [ ] Built-in memory remains compact.
- [ ] Structured/deep memory provider facts have been manually reviewed if such a provider is enabled.
- [ ] Live/session model and persisted profile model/provider have both been checked.
- [ ] Model/provider config mismatches have been reported as related findings.
- [ ] Duplicated, stale, or bloated memory entries are identified for review.
- [ ] No secrets or credentials are present in reusable/public notes.
- [ ] No profile-specific paths remain in the reusable core.
- [ ] Installed-skill copy/symlink has been verified in a fresh session if this note is being used as a real Hermes skill.
- [ ] Any machine/persona-specific details are isolated in Examples / Migration Notes.

## Installing as a Real Hermes Skill

If this document is maintained as an Obsidian note first, it can also be installed as a real Hermes skill.

Recommended local install path:

```text
$HERMES_HOME/skills/devops/hermes-memory-architecture/SKILL.md
```

Alternative categories are acceptable if they better match the local skill taxonomy, but keep the skill name stable:

```text
hermes-memory-architecture
```

Copy pattern:

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
mkdir -p "$HERMES_HOME/skills/devops/hermes-memory-architecture"
cp /path/to/Hermes\ Memory\ Architecture.md "$HERMES_HOME/skills/devops/hermes-memory-architecture/SKILL.md"
```

Symlink pattern, useful when Obsidian is the source of truth:

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
mkdir -p "$HERMES_HOME/skills/devops/hermes-memory-architecture"
ln -sf /path/to/Hermes\ Memory\ Architecture.md "$HERMES_HOME/skills/devops/hermes-memory-architecture/SKILL.md"
```

Verification:

1. Start a fresh Hermes session so the skill loader rescans skills.
2. Run `hermes skills list` or use the in-session skill tools.
3. Load `hermes-memory-architecture`.
4. Confirm the frontmatter parses and the skill body appears.
5. Run a small audit against the active profile before using it for troubleshooting or repair work.

For public distribution, remove private examples and keep profile-specific paths in a separate private migration note.

## Optional Examples / Migration Notes

This section may contain real-world examples, but keep them clearly separate from the reusable core.

### Example Path Mapping

Generic reusable paths:

```text
$HERMES_HOME/state.db
$HERMES_HOME/sessions/
$HERMES_HOME/memories/
$OBSIDIAN_VAULT_PATH
$OBSIDIAN_AGENT_FOLDER/Dream Cycles/
```

Example default local profile paths may look like:

```text
~/.hermes/state.db
~/.hermes/sessions/
~/Documents/Obsidian/<Vault>/<Agent Folder>/Dream Cycles/
```

Do not publish private user names, phone numbers, credentials, proprietary client details, or machine-specific paths in a public version.

### Example Dream-Cycle Note Name

```text
Dream Cycles/2026-05-21 Dream Cycle.md
```

### Example Audit Summary Format

```markdown
## Memory Architecture Audit

- Profile/home: `$HERMES_HOME` resolved to `<path>`
- Built-in memory: healthy / needs review
- Session DB: quick_check ok / failed
- Session recall: recent search ok / stale / failed
- Durable notes: configured / missing
- Dream cycle: scheduled / missing / failing
- Risks: ...
- Safe changes applied: ...
- Changes requiring approval: ...
```

### Public Skill Publishing Notes

Before publishing a memory-architecture skill externally:

- Remove private paths from the core workflow.
- Replace local usernames with generic examples.
- Remove implementation logs that will age quickly.
- Keep exact commands, but make paths profile-aware.
- Keep safety rules explicit around DB repair and memory mutation.
- Have another agent or reviewer test whether the instructions are actionable.
