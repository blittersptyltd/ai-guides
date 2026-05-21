# YouTube Transcript Extraction Skill

**Type:** AI Skill / content extraction workflow  
**Status:** Public reference implementation  
**Audience:** AI agents, researchers, content teams, and developers extracting structured knowledge from YouTube videos  

## Purpose

Extract transcripts from YouTube videos and transform them into useful formats such as summaries, timestamped chapters, quotes, article drafts, and social posts.

This skill is designed for AI agents that need a reliable, repeatable workflow for turning YouTube video links into structured text without manually browsing the video page.

## When to Use

Use this skill when a user:

- Shares a YouTube URL and asks for a summary
- Requests the transcript of a YouTube video
- Wants timestamped notes or chapters from a video
- Wants a blog post, thread, newsletter, or briefing based on a video
- Needs quotes or key takeaways with timestamps
- Wants to compare multiple YouTube videos by transcript content

Do **not** use this skill when:

- The task requires visual analysis of the actual video frames
- The transcript is disabled or unavailable and the user needs exact wording
- The video is private, region-blocked, or unavailable to the runtime
- The user needs copyrighted content reproduced beyond reasonable summary/quotation

## Setup

Install the transcript dependency:

```bash
pip install youtube-transcript-api
```

Optional but recommended: keep a reusable helper script in the repo or agent skill folder.

Reference script path in this repository:

```text
Skills/scripts/fetch-youtube-transcript.py
```

## Helper Script Usage

The helper accepts:

- Standard YouTube URLs
- `youtu.be` short links
- Shorts URLs
- Embed URLs
- Live URLs
- Raw 11-character video IDs

### JSON output

```bash
python3 Skills/scripts/fetch-youtube-transcript.py "https://www.youtube.com/watch?v=VIDEO_ID"
```

### Plain text

```bash
python3 Skills/scripts/fetch-youtube-transcript.py "URL" --text-only
```

### Timestamped transcript

```bash
python3 Skills/scripts/fetch-youtube-transcript.py "URL" --text-only --timestamps
```

### Language fallback chain

```bash
python3 Skills/scripts/fetch-youtube-transcript.py "URL" --language en,en-US,en-GB
```

For multilingual videos, pass a comma-separated list in priority order:

```bash
python3 Skills/scripts/fetch-youtube-transcript.py "URL" --language tr,en
```

## Workflow

### Step 1 — Fetch the Transcript

Start with timestamped plain text because it is easiest for downstream summarization.

```bash
python3 Skills/scripts/fetch-youtube-transcript.py "URL" --text-only --timestamps > /tmp/youtube-transcript.txt
```

### Step 2 — Validate Output

Check that the output is non-empty and in the expected language.

```bash
python3 - <<'PY'
from pathlib import Path
p = Path('/tmp/youtube-transcript.txt')
text = p.read_text(errors='ignore') if p.exists() else ''
print('chars:', len(text))
print(text[:1000])
PY
```

If empty or wrong language:

1. Retry with `--language` using likely language codes.
2. Retry without `--language` to let the API choose any available transcript.
3. If still empty, report that transcripts are probably disabled or unavailable.

### Step 3 — Chunk Long Transcripts

If the transcript exceeds roughly 50,000 characters, chunk it before summarizing.

Suggested pattern:

- Chunk size: ~40,000 characters
- Overlap: ~2,000 characters
- Summarize each chunk
- Merge chunk summaries into the final output

### Step 4 — Transform into Requested Format

Common output formats:

- **Summary** — concise 5–10 sentence overview
- **Detailed notes** — structured bullet notes by topic
- **Chapters** — timestamped chapter list
- **Chapter summaries** — timestamped chapters with short summaries
- **Quotes** — notable quotes with timestamps
- **Thread** — numbered social posts, each under platform limits
- **Blog post** — full article with headings and takeaways
- **Briefing** — executive summary, implications, risks, next actions

If the user does not specify a format, default to a concise summary plus key takeaways.

### Step 5 — Verify the Final Output

Before presenting:

- Confirm timestamps are plausible and in ascending order.
- Check that the final answer reflects the whole transcript, not only the first section.
- Label uncertainty if transcript quality is poor or auto-generated.
- Do not invent claims that are not supported by the transcript.

## Output Format Templates

### Concise Summary

```markdown
## Summary

[5–10 sentence overview]

## Key Takeaways

- ...
- ...
- ...

## Notable Timestamps

- 00:00 — ...
- 03:45 — ...
- 12:20 — ...
```

### Timestamped Chapters

```markdown
## Chapters

- 00:00 — Introduction: host opens with the problem statement
- 03:45 — Background: context and why existing solutions fall short
- 12:20 — Core method: walkthrough of the proposed approach
- 24:10 — Results: benchmark comparisons and takeaways
- 31:55 — Q&A: scalability and next steps
```

### Quote Extraction

```markdown
## Notable Quotes

- 04:12 — “...”
- 18:27 — “...”
- 39:04 — “...”

## Context

Briefly explain why each quote matters.
```

### Blog Post

```markdown
# [Article Title]

## Introduction

## Main Idea 1

## Main Idea 2

## Main Idea 3

## Practical Takeaways

## Conclusion
```

## Error Handling

### Transcript disabled

Tell the user:

> I could not extract a transcript because transcripts appear to be disabled for this video. If captions are visible on YouTube, you may need to provide the transcript manually or try another source.

### Private or unavailable video

Tell the user the video is private, deleted, age-restricted, region-blocked, or otherwise unavailable to the transcript API. Ask them to verify the URL or provide another link.

### No matching language

Retry without a language constraint. If a transcript is found in another language, tell the user which language appears to be available and ask whether they want a summary or translation.

### Dependency missing

Install and retry:

```bash
pip install youtube-transcript-api
```

### API or format changes

If `youtube-transcript-api` changes its return format, normalize results into dictionaries with:

```python
{"text": text, "start": start_seconds, "duration": duration_seconds}
```

## Privacy and Copyright Notes

- Prefer summaries, notes, and short quotes over reproducing entire copyrighted transcripts to the user.
- If storing transcripts, avoid saving private or sensitive video content unless explicitly approved.
- For public knowledge-base use, store derived summaries and references rather than full transcript dumps.

## Verification Checklist

- [ ] Dependency installed or available in runtime
- [ ] Video ID extracted correctly
- [ ] Transcript fetched successfully
- [ ] Language is acceptable or language limitations are disclosed
- [ ] Long transcript chunked before summarization
- [ ] Final output matches requested format
- [ ] Timestamps are plausible
- [ ] No unsupported claims added

## Key Principle

Treat YouTube transcripts as source material, not final content. Extract, validate, transform, and verify before presenting the result.
