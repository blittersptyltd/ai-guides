---
name: hermes-memory-architecture
description: Audit and improve Hermes memory across session recall, compact memory, structured facts, durable notes, and dream-cycle cron.
version: 1.1.0
author: Brad Down | Hermes | Steve | GPT 5.5
license: MIT
metadata:
  hermes:
    tags:
      - hermes
      - memory
      - session-search
      - obsidian
      - cron
      - dream-cycle
      - sqlite
      - profile-aware
    related_skills:
      - hermes-agent
      - obsidian
---

# Hermes Memory Architecture

## Purpose

Use this skill to audit, repair, and improve a Hermes agent's memory system without turning memory into a single giant prompt file.

A healthy Hermes memory architecture is layered:

1. **Session recall** — detailed historical recall through `session_search`, backed by Hermes' session store and SQLite/FTS indexing where available.
2. **Compact built-in memory** — short always-loaded facts about stable preferences, environment conventions, and recurring tool quirks.
3. **Structured/deep memory** — optional fact/entity stores such as holographic memory, Honcho, Mem0, Hindsight, Supermemory, or similar providers.
4. **Durable notes** — human-readable synthesis in Obsidian or another filesystem knowledge base.
5. **Dream-cycle cron** — bounded scheduled synthesis that writes reviewable notes and proposes memory candidates, but does not directly mutate always-loaded memory.

Core rule:

> Session history belongs in session recall. Durable synthesis belongs in notes. Only compact stable facts belong in always-loaded memory.

## When to Use

Use this skill when:

- setting up or reviewing memory for a Hermes profile;
- diagnosing weak or stale recall;
- auditing `state.db`, session transcripts, or `session_search`;
- cleaning built-in or structured memory;
- creating, reviewing, or hardening a dream-cycle cron job;
- migrating large memory content into durable notes;
- preparing a reusable memory architecture guide or skill.

Do **not** use this skill for:

- saving a single obvious memory fact;
- dumping transcripts into notes;
- storing secrets, tokens, private keys, auth cookies, or credentials;
- rebuilding databases as routine maintenance;
- deleting memory or replacing databases without explicit operator approval.

## Target Architecture

### 1. Session Recall

Session recall is for detailed history: what happened, what was decided, and where prior work stopped.

Primary interface:

```text
session_search
```

Typical storage:

```text
$HERMES_HOME/state.db
$HERMES_HOME/sessions/
```

Operational rules:

- Search sessions before asking the user to repeat known context.
- Prefer targeted queries over raw transcript dumps.
- Treat SQLite schema details as implementation-specific; inspect the live database before writing repair code.
- Do not declare recall healthy from SQLite integrity alone. Also test actual searches.

### 2. Compact Built-In Memory

Built-in memory is always-loaded context. It should stay small.

Good entries:

- stable user preferences;
- durable environment facts;
- recurring project/tool conventions;
- one-sentence facts that prevent repeated correction.

Bad entries:

- task progress;
- PR numbers, issue IDs, commit SHAs;
- temporary bugs;
- raw plans or transcripts;
- long architecture notes;
- secrets or credentials.

Useful sanity check:

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
wc -c "$HERMES_HOME"/memories/*.md 2>/dev/null || true
```

Large always-loaded files are not automatically wrong, but growth is a smell. Move detail into notes and keep memory compact.

### 3. Structured / Deep Memory

Hermes may use a structured provider such as holographic memory, Honcho, Mem0, Hindsight, Supermemory, or another plugin.

Check status:

```bash
hermes memory status
```

When `fact_store` tools are available, audit with concrete probes:

```text
fact_store list
fact_store search <topic>
fact_store probe <entity>
fact_store related <entity>
fact_store reason <entity A>, <entity B>
fact_store contradict
```

Rules:

- Use structured memory to complement session recall, not replace it.
- Manually review duplicates, raw transcript fragments, stale facts, and profile contamination.
- Contradiction tools can miss duplicate-ish or polluted facts.
- Use `fact_feedback` after relying on a fact when that tool is available.
- Do not delete or rewrite structured memory blindly; propose cleanup first unless explicitly authorised.

### 4. Durable Notes

Durable notes hold reviewed synthesis, architecture notes, lessons learned, project context, and memory candidates.

Recommended variables:

```text
$OBSIDIAN_VAULT_PATH
$OBSIDIAN_AGENT_FOLDER
```

For Obsidian, always verify the root before writing:

```bash
: "${OBSIDIAN_VAULT_PATH:?Set OBSIDIAN_VAULT_PATH first}"
test -d "$OBSIDIAN_VAULT_PATH/.obsidian"
```

Do not silently create sibling folders when paths contain spaces, commas, ampersands, Unicode, or punctuation. If a vault path is mistyped, stop and report the failure.

### 5. Dream-Cycle Cron

A dream cycle is a scheduled synthesis run. It should:

1. use bounded session recall;
2. identify durable decisions, lessons, risks, and open loops;
3. write one dated note to the durable note system;
4. propose memory candidates for review;
5. avoid direct memory mutation;
6. avoid recursive cron creation;
7. report failures and limitations.

Recommended note path:

```text
$OBSIDIAN_AGENT_FOLDER/Dream Cycles/YYYY-MM-DD Dream Cycle.md
```

Recommended cadence:

```text
0 2 * * *      # nightly for active profiles
0 3 * * 0      # weekly for lower-volume profiles
```

Recommended tool scope:

```text
session_search, file
```

Add `terminal` only when the job must validate paths or inspect local files. Avoid web/browser tools unless the dream cycle explicitly requires external research.

## Audit Workflow

Run this workflow before making changes.

### 1. Identify Active Profile and Hermes Home

```bash
printf 'HERMES_HOME=%s\n' "${HERMES_HOME:-$HOME/.hermes}"
hermes config path
hermes config env-path
hermes profile list 2>/dev/null || true
```

Do not assume the default profile or `~/.hermes` in reusable instructions.

### 2. Check Persisted Model and Runtime Drift

Model drift affects summaries, compression, cron jobs, and gateway behaviour.

```bash
hermes config | sed -n '/◆ Model/,/◆ Display/p; /◆ Context Compression/,/◆ Auxiliary/p'
hermes gateway status 2>/dev/null || true
```

Record:

- persisted provider/model;
- live/session model if known;
- whether the gateway needs restart before config changes apply.

Do not trust prior assistant self-identification after a model switch. Verify the current runtime/config.

### 3. Check Memory Provider Status

```bash
hermes memory status
```

Look for:

- built-in memory availability;
- active provider, if any;
- plugin errors;
- accidental half-configured external providers.

### 4. Check Session Database Integrity and Counts

```bash
export HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
python3 - <<'PY'
import os, sqlite3, pathlib
home = pathlib.Path(os.environ.get('HERMES_HOME', pathlib.Path.home() / '.hermes')).expanduser()
db = home / 'state.db'
print('db:', db, 'exists:', db.exists())
if not db.exists():
    raise SystemExit('state.db not found')
con = sqlite3.connect(db)
print('quick_check:', con.execute('PRAGMA quick_check').fetchone()[0])
tables = {r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
for table in ['sessions', 'messages', 'messages_fts']:
    if table in tables:
        print(f'{table}:', con.execute(f'SELECT count(*) FROM {table}').fetchone()[0])
    else:
        print(f'{table}: not present')
con.close()
files = list((home / 'sessions').glob('*.json')) + list((home / 'sessions').glob('*.jsonl'))
print('session transcript files:', len(files))
PY
```

Interpretation:

- `quick_check: ok` means SQLite is structurally healthy.
- It does **not** prove recall completeness.
- A large mismatch between transcript files and DB sessions is an investigation trigger, not proof of corruption.
- Continue by testing `session_search` with known topics.

### 5. Test Session Search

Use actual `session_search` when available.

Test:

- one recent topic;
- one older known topic;
- one exact phrase if available.

Healthy recall returns plausible sessions with enough context to reconstruct what happened. Empty results are acceptable only when they are plausible.

### 6. Verify Durable Note Paths

```bash
printf 'OBSIDIAN_VAULT_PATH=%s\n' "${OBSIDIAN_VAULT_PATH:-unset}"
printf 'OBSIDIAN_AGENT_FOLDER=%s\n' "${OBSIDIAN_AGENT_FOLDER:-unset}"
```

If Obsidian is used:

```bash
python3 - <<'PY'
import os
from pathlib import Path
vault = Path(os.environ['OBSIDIAN_VAULT_PATH']).expanduser()
assert (vault / '.obsidian').exists(), f'Not an Obsidian vault: {vault}'
agent = Path(os.environ.get('OBSIDIAN_AGENT_FOLDER', vault)).expanduser()
assert agent.exists(), f'Agent folder missing: {agent}'
print('vault:', vault)
print('agent:', agent)
PY
```

Watch for path normalisation bugs: symbols such as `&` must not be silently changed into words such as `and`.

### 7. Audit Cron / Dream-Cycle Jobs

```bash
hermes cron list
```

Then inspect the stored prompt/content, not just status.

Check whether the prompt:

- is self-contained;
- has bounded search limits;
- verifies durable-note paths before writing;
- avoids direct memory mutation;
- avoids recursive scheduling;
- names where failure notes should be written;
- relies on environment variables that cron may not have;
- uses only necessary toolsets;
- has recent visible output or failure reporting.

### 8. Audit Gateway Lifecycle When Relevant

For Telegram, Discord, Slack, or other gateway platforms, memory/config behaviour is affected by gateway lifecycle.

Check:

```bash
hermes gateway status 2>/dev/null || true
```

Distinguish:

- **fresh session / `/reset`** — reloads conversation context, skills, and always-loaded memory snapshot;
- **gateway restart / `/restart`** — reloads config, environment, code, and platform process;
- **cron run** — tests scheduled behaviour separately.

Gateway staleness is not memory corruption, but it can explain why model/config/skill changes do not appear to take effect.

### 9. Review Memory Hygiene

For built-in memory:

- check file sizes;
- read the current entries if appropriate;
- identify duplicates, task progress, stale facts, raw fragments, or secrets.

For structured memory:

- list/probe facts;
- search by common entities/projects;
- run contradiction checks;
- manually identify duplicates and pollution.

Report proposed cleanup rather than deleting immediately.

## Upgrade Workflow

### 1. Report Findings First

Before making changes, summarise:

- active Hermes home/profile;
- persisted model/provider and runtime drift;
- memory provider status;
- session DB health and counts;
- `session_search` test result;
- durable-note path status;
- cron/dream-cycle status;
- gateway lifecycle issues;
- built-in and structured memory hygiene issues;
- safe changes recommended;
- changes requiring approval.

### 2. Safe Non-Destructive Improvements

Usually safe with operator intent:

- create a verified durable-note subfolder;
- write an audit note;
- write proposed memory cleanup candidates;
- improve documentation/checklists;
- add README files explaining dream-cycle notes and guardrails.

Still verify roots before writing.

### 3. Changes Requiring Explicit Approval

Do not perform these automatically:

- changing default model/provider;
- restarting gateway in a production/user-facing setup;
- editing cron jobs;
- deleting or merging memory facts;
- moving/deleting note folders;
- rebuilding or replacing `state.db`;
- removing session files;
- changing memory providers.

### 4. Database Repair Only When Proven Necessary

Do **not** rebuild `state.db` as routine maintenance.

Consider repair only when:

- `PRAGMA quick_check` fails;
- `session_search` is demonstrably broken;
- indexed recall is clearly incomplete after investigation;
- the operator approves a repair plan.

Safety steps:

1. back up `state.db` and sidecars (`-wal`, `-shm`, journals);
2. inspect the live schema;
3. rebuild to a temporary DB using current Hermes APIs where possible;
4. verify counts and known search hits;
5. replace live DB only after approval;
6. restart gateway or start a fresh session after replacement.

## Dream-Cycle Prompt Template

Use this as a starting point and adapt paths/profile details explicitly.

```text
You are running a bounded Hermes memory dream cycle for this profile.

Goal:
Create one dated durable-note synthesis of recent important sessions. Do not directly write Hermes memory.

Rules:
- Do not create, update, or remove cron jobs.
- Do not call memory mutation tools.
- Use session_search first.
- Use at most one recent-session browse plus up to five targeted searches.
- Prefer synthesis over transcript dumping.
- Capture durable decisions, recurring preferences, reusable lessons, risks, and open loops.
- Keep secrets, credentials, and unnecessary PII out of the note.
- Verify the durable-note root exists before writing. For Obsidian, confirm `.obsidian` exists under the vault root.
- Do not silently create sibling vault folders.
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
6. Proposed memory candidates — not yet saved
7. Risks / privacy observations
8. Failures / limitations
9. Suggested follow-up

Final response:
Report the note path, whether it was created, and any failures/limitations.
```

## Verification Checklist

Before declaring memory architecture healthy, verify:

- [ ] Active `$HERMES_HOME` and profile are known.
- [ ] Config and env paths are known.
- [ ] Persisted provider/model are known.
- [ ] Runtime/model drift is documented if present.
- [ ] Gateway lifecycle requirements are understood if using a messaging platform.
- [ ] `hermes memory status` is sane.
- [ ] Built-in memory files are compact enough for always-loaded context.
- [ ] Structured memory provider is intentionally configured or intentionally absent.
- [ ] Structured memory has been checked for duplicates/pollution when available.
- [ ] `state.db` exists and `PRAGMA quick_check` returns `ok`.
- [ ] Session/message/FTS counts are plausible for the current schema.
- [ ] Transcript-file count has been compared with DB session count.
- [ ] `session_search` returns expected recent and older hits.
- [ ] Durable-note root exists.
- [ ] Obsidian vault root contains `.obsidian` before writing.
- [ ] Dream-cycle folder exists if dream cycles are used.
- [ ] Dream-cycle cron exists if expected.
- [ ] Stored cron prompt has been inspected, not just cron status.
- [ ] Dream-cycle prompt has bounded searches and no direct memory mutation.
- [ ] Dream-cycle output contains evidence base, limitations, and proposed memory candidates.
- [ ] No secrets or credentials are stored in public/reusable notes.
- [ ] Private profile-specific paths are not present in the reusable skill core.

## Common Pitfalls

1. **Using memory as a giant text file**
   - Move detail into session recall and durable notes. Keep built-in memory compact.

2. **Trusting SQLite health as recall health**
   - `quick_check: ok` is necessary but not sufficient. Test `session_search`.

3. **Ignoring transcript/DB mismatch**
   - A mismatch is not proof of corruption, but it is worth investigating.

4. **Blindly rebuilding `state.db`**
   - Rebuild only when evidence shows corruption or broken recall.

5. **Letting cron mutate memory directly**
   - Cron should propose memory candidates, not save them.

6. **Checking cron status but not cron prompt**
   - A job can be green while its prompt is stale or unsafe.

7. **Silently creating wrong note paths**
   - Verify Obsidian `.obsidian`; watch for spaces, punctuation, and symbol normalisation.

8. **Confusing reset with restart**
   - `/reset` refreshes session context. Gateway restart refreshes process config/env/code.

9. **Trusting stale assistant self-identification after model switching**
   - Verify live/persisted model separately.

10. **Relying only on contradiction detection for memory hygiene**
    - Manual duplicate and pollution review is still required.

11. **Publishing private operational details**
    - Keep reusable skills profile-neutral; put real paths and user specifics in private audit notes.

## Public Publishing Notes

Before publishing this as a real Hermes skill:

- keep frontmatter valid and description concise;
- keep commands profile-aware using `$HERMES_HOME`, `$OBSIDIAN_VAULT_PATH`, and `$OBSIDIAN_AGENT_FOLDER`;
- remove private names, client details, phone numbers, credentials, and local-only paths;
- keep profile-specific examples in a clearly marked optional section or external private note;
- test the workflow on at least one real Hermes instance;
- verify the skill loads with `hermes skills list` or equivalent skill tooling.
