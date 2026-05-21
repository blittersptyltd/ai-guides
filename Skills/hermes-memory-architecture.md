# Hermes Memory Architecture Skill

**Type:** AI Skill / Hermes operating pattern  
**Status:** Public reference implementation  
**Audience:** Hermes Agent users, AI-agent builders, and teams designing durable agent memory  

## Purpose

Set up and maintain a scalable Hermes memory system using the right storage layer for each kind of knowledge:

1. **Session recall** via `session_search` / SQLite FTS5
2. **Obsidian or another knowledge base** for durable strategic synthesis
3. **Hermes built-in memory** only for compact, always-needed facts
4. **Scheduled dream cycles** to synthesize recent work without polluting prompt memory

This avoids the common failure mode where agents keep stuffing project history, task progress, and procedures into a small prompt-injected memory file until it becomes unmaintainable.

## When to Use

Use this skill when:

- Setting up a Hermes Agent instance with long-term memory discipline
- Fixing broken or corrupted `session_search`
- Rebuilding `state.db` from transcript files
- Creating an Obsidian-backed or markdown-backed nightly dream-cycle workflow
- Migrating knowledge out of oversized memory files
- Designing memory for long-running autonomous AI workflows

Do **not** use this for:

- One-off memory additions — use the `memory` tool directly
- One-off prior-session lookups — use `session_search` directly
- Raw transcript archival — keep detailed conversational history in session recall
- Task management — use Linear, GitHub Issues, Jira, or another work tracker

## Core Architecture

### 1. Session Recall

**Tool:** `session_search`  
**Storage:** `$HERMES_HOME/state.db`  
**Index:** SQLite FTS5  

Use for questions like:

- “What did we decide about X?”
- “Where did we leave Y?”
- “Find the session where we discussed Z.”

Session recall is the scalable contextual layer. It keeps detailed conversational history searchable without injecting all of it into every prompt.

### 2. Durable Knowledge Base

**Recommended tool:** Obsidian, markdown notes, or another searchable knowledge base.

Use it for:

- Strategic decisions and rationale
- Architecture summaries
- Dream-cycle syntheses
- Project reference notes
- Lessons learned
- Memory candidates requiring human review

Example folder structure:

```text
Knowledge Base/
└── Agent Name/
    ├── Dream Cycles/
    │   ├── README.md
    │   └── YYYY-MM-DD Dream Cycle.md
    ├── Architecture Decisions/
    └── Operating Notes/
```

### 3. Hermes Built-In Memory

Hermes built-in memory is prompt-injected and intentionally bounded. Use it only for compact durable facts that must be available every session.

Good memory examples:

- Stable user preferences
- Stable project conventions
- Durable environment facts
- Recurring tool quirks

Bad memory examples:

- PR numbers
- Commit SHAs
- Task progress
- Session logs
- Temporary errors
- Long procedures
- Detailed architecture notes that belong in a knowledge base

### 4. Dream Cycles

A dream cycle is a scheduled consolidation pass that:

1. Searches recent sessions using `session_search`
2. Identifies durable decisions, patterns, and follow-ups
3. Writes a dated note to the knowledge base
4. Proposes memory candidates for review
5. Does **not** directly mutate Hermes memory

Recommended output path:

```text
Knowledge Base/Agent Name/Dream Cycles/YYYY-MM-DD Dream Cycle.md
```

Recommended note sections:

1. Run timestamp and evidence base
2. Recent activity summary
3. Durable learnings / preferences discovered
4. Project updates
5. Follow-up tasks / open loops
6. Proposed memory candidates — not yet saved
7. Risks / privacy observations
8. Files written

## Setup Workflow

### Step 1 — Check Native Memory Status

Before changing architecture, inspect the current setup.

```bash
hermes memory status
```

Best-practice interpretation:

- Built-in memory is always active.
- External providers such as Honcho, Mem0, Supermemory, Hindsight, etc. are optional plugins.
- Do not add an external memory layer until native session recall and durable synthesis are healthy.

### Step 2 — Check Session Recall Health

Use SQLite checks before assuming recall is healthy.

```bash
# If sqlite3 CLI is installed:
sqlite3 "$HERMES_HOME/state.db" "PRAGMA quick_check;"
sqlite3 "$HERMES_HOME/state.db" "SELECT count(*) FROM sessions; SELECT count(*) FROM messages;"
```

Portable Python fallback:

```bash
python3 - <<'PY'
import os
import pathlib
import sqlite3

home = pathlib.Path(os.environ.get('HERMES_HOME', pathlib.Path.home() / '.hermes'))
db = home / 'state.db'
con = sqlite3.connect(db)
print('database:', db)
print('quick_check:', con.execute('PRAGMA quick_check').fetchone()[0])
for table in ['sessions', 'messages', 'messages_fts']:
    try:
        print(table + ':', con.execute(f'SELECT count(*) FROM {table}').fetchone()[0])
    except Exception as e:
        print(table + ':', e)
con.close()
PY
```

Then test through Hermes:

```text
Use session_search to find recent discussions about memory architecture.
```

Healthy signs:

- `PRAGMA quick_check` returns `ok`
- `session_search` returns prior sessions
- Recent topics are searchable

Failure signs:

- `database disk image is malformed`
- Empty results for known recent topics
- Gateway logs show SQLite errors

### Step 3 — Rebuild Corrupted Session DB Safely

If `session_search` reports SQLite corruption, do not overwrite the live DB immediately.

Safe repair pattern:

1. Check disk space and obvious I/O errors first.
2. Build a fresh database at a temporary path using the current Hermes schema.
3. Import transcript files from `$HERMES_HOME/sessions/`.
4. Verify `PRAGMA quick_check`, table counts, and known search hits.
5. Move the corrupted live DB to a timestamped backup.
6. Preserve WAL/SHM/JOURNAL sidecars if present.
7. Install the rebuilt DB as `$HERMES_HOME/state.db`.
8. Restart the gateway or start a fresh session if a live process has a stale SQLite handle.

Example backup command:

```bash
timestamp=$(date '+%Y%m%d_%H%M%S')
cp "$HERMES_HOME/state.db" "$HERMES_HOME/state.db.corrupted-$timestamp.db"
```

Transcript sources:

```text
$HERMES_HOME/sessions/*.json
$HERMES_HOME/sessions/*.jsonl
```

### Step 4 — Create Dream-Cycle Folder

Create a durable folder for dream-cycle outputs.

Example:

```text
Knowledge Base/Agent Name/Dream Cycles/
```

Create a `README.md` defining purpose, note format, guardrails, privacy rules, and the memory-candidate workflow.

Minimum README:

```markdown
# Agent Dream Cycles

Scheduled nightly dream-cycle summaries.

## Purpose
- Review recent sessions using `session_search`
- Consolidate decisions, patterns, and learnings
- Preserve operational knowledge in searchable notes
- Propose memory candidates for review, not auto-save

## Note Format
Each run creates: `YYYY-MM-DD Dream Cycle.md`

Sections:
1. Run timestamp and evidence base
2. Recent activity summary
3. Durable learnings/preferences
4. Project updates
5. Follow-up tasks
6. Proposed memory candidates — NOT yet saved
7. Privacy/risk observations
8. Files written

## Guardrails
- Concise synthesis, not transcript dumps
- Label uncertainty explicitly
- No PII/secrets in memory without approval
- Cron does not directly write Hermes memory
```

### Step 5 — Schedule Nightly Dream Cycle

Use Hermes cron with a self-contained prompt.

Recommended schedule:

```text
0 2 * * *
```

Recommended enabled toolsets:

```text
session_search, file, terminal, skills
```

Prompt principles:

- Use `session_search` first.
- Fall back to local session files only if recall fails.
- Write concise synthesis to the durable knowledge base.
- Do not create recursive cron jobs.
- Do not directly write Hermes memory.
- Propose memory candidates for review.
- Avoid secrets, PII, financial/tax/company-structure details, and proprietary content.

### Step 6 — Smoke Test

Manually run the cron once.

Verify:

- Cron status is `ok`
- Delivery error is empty / `null`
- Dated note exists
- Note includes evidence basis and memory candidates
- Hermes memory was not directly modified

## Operating Pattern

During normal sessions:

1. Use `session_search` when the user references prior work.
2. Save strategic synthesis to the durable knowledge base.
3. Save only compact durable facts to Hermes memory.
4. Let dream cycles summarize recent activity.
5. Review memory candidates manually before promoting them into prompt-injected memory.

## Best-Practice Refinements

### Use `$HERMES_HOME` for Reusable Instructions

For reusable guides, avoid hardcoding `~/.hermes`. Hermes profiles can have isolated config, sessions, skills, and memory.

Use:

```text
$HERMES_HOME/state.db
$HERMES_HOME/sessions/
$HERMES_HOME/memories/
```

### Remember the Frozen Snapshot Pattern

Hermes memory is loaded into the system prompt at session start. If the `memory` tool adds, replaces, or removes entries mid-session, changes persist on disk but usually do **not** appear in the active prompt until a fresh session or reset.

Implications:

- Do not expect a memory write to immediately alter current reasoning context.
- For urgent current-turn context, keep it in the live conversation or write/read a note directly.

### Avoid Task Diary Creep

Dream-cycle notes should not become daily task logs. Preserve:

- Durable decisions
- Memory candidates
- Cross-session project context
- Risks / privacy observations
- Follow-up questions or open loops

Task progress belongs in a work tracker, git commits, or project docs.

## Troubleshooting

### `session_search` says database image is malformed

Likely SQLite corruption in `$HERMES_HOME/state.db`.

Actions:

1. Back up the corrupted DB.
2. Rebuild from `$HERMES_HOME/sessions/` transcripts.
3. Verify SQLite integrity.
4. Restart gateway or begin a fresh session if a live process holds a stale DB handle.

### Dream cycle writes too much detail

Tighten the cron prompt:

- “Concise synthesis, not transcript dump.”
- “Only durable decisions, patterns, and follow-ups.”
- “Max one screen per section unless evidence requires more.”

### Memory starts growing too large

Move strategic or historical detail to your durable knowledge base and keep Hermes memory to compact declarations.

### Search recall feels stale

Check:

```bash
python3 - <<'PY'
import os
import pathlib
import sqlite3

home = pathlib.Path(os.environ.get('HERMES_HOME', pathlib.Path.home() / '.hermes'))
db = home / 'state.db'
con = sqlite3.connect(db)
print('quick_check:', con.execute('PRAGMA quick_check').fetchone()[0])
try:
    print('max message created_at:', con.execute('SELECT max(created_at) FROM messages').fetchone()[0])
except Exception as e:
    print('messages timestamp check failed:', e)
con.close()
PY
```

If the database is healthy but live search is stale, restart the gateway or start a fresh session.

## Verification Checklist

- [ ] `session_search` returns relevant prior sessions
- [ ] SQLite `PRAGMA quick_check` returns `ok`
- [ ] Session/message counts look plausible
- [ ] Dream-cycle folder exists in the knowledge base
- [ ] Cron job is scheduled
- [ ] Manual cron run creates a dated note
- [ ] Dream-cycle note proposes memory candidates but does not write memory
- [ ] Hermes memory stays compact

## Key Principle

Do not make memory a giant file. Use the right layer:

- **Session recall** for detailed conversational history
- **Durable knowledge base** for synthesis and reviewable knowledge
- **Hermes memory** for compact facts that must always be present
