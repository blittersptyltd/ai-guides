# Hermes + xAI Grok OAuth Tools

Set up Hermes Agent to use a SuperGrok / X subscription for Grok chat, real-time X search, xAI text-to-speech, Grok Imagine image generation, and native video generation.

This guide is based on:

- Alex Finn's Hermes update walkthrough: `Hermes just got 10x better...` — https://www.youtube.com/watch?v=8iZUyE7SlXo
- Official Hermes xAI OAuth docs — https://hermes-agent.nousresearch.com/docs/guides/xai-grok-oauth
- Official Hermes X Search docs — https://hermes-agent.nousresearch.com/docs/user-guide/features/x-search

## What Changed

The relevant Hermes update added a practical xAI/Grok path:

1. **xAI Grok OAuth provider** — browser login through `accounts.x.ai`; no separate `XAI_API_KEY` needed if you have the required SuperGrok/X subscription.
2. **Real-time X Search** — `x_search` lets Hermes search X posts, profiles, and threads using Grok server-side search with citations.
3. **Direct-to-xAI media tools** — the same OAuth login can power xAI TTS, Grok Imagine images, and Grok Imagine videos.
4. **Video generation toolset** — Hermes can generate text-to-video and image-to-video outputs directly from chat, including Telegram delivery when the gateway supports media attachments.

Alex Finn's practical framing: even if Claude, GPT, or another model remains the main orchestrator, Grok can be added as a specialist "muscle" for X-native research and media generation.

## When To Use This

Use xAI/Grok tools when the task needs:

- current X/Twitter reactions, posts, accounts, or threads;
- content trend discovery from X;
- citations back to X posts;
- native Grok Imagine image/video generation;
- xAI TTS voices;
- a SuperGrok subscription path instead of a separate xAI API key.

Do **not** use X Search as a general web search replacement. For normal webpages, use Hermes `web_search` / `web_extract`.

## Prerequisites

- Hermes updated to a version that includes `xai-oauth`, `x_search`, and `video_gen`.
- Active SuperGrok / eligible X subscription **or** a paid xAI API key.
- Browser access for OAuth, or the no-browser flow for remote machines.
- Fresh Hermes session after enabling new tools.
- Gateway restart if using Telegram/Discord/etc and config/env/tool availability changed.

## Setup

### 1. Update Hermes

```bash
hermes update
hermes --version
```

If running through a gateway, restart after update:

```bash
hermes gateway restart
```

or from the gateway chat:

```text
/restart
```

### 2. Login With xAI Grok OAuth

Interactive picker:

```bash
hermes model
# Select: xAI Grok OAuth (SuperGrok Subscription)
# Complete browser login at accounts.x.ai
# Pick grok-4.3 or the current recommended Grok model
```

Manual OAuth login:

```bash
hermes auth add xai-oauth
```

Remote/headless login:

```bash
hermes auth add xai-oauth --no-browser
```

Direct model config, if you want Grok as the primary model:

```bash
hermes config set model.provider xai-oauth
hermes config set model.default grok-4.3
```

You do **not** need to make Grok the main orchestrator just to use X Search or media tools. Claude/GPT can remain the main model while Grok tools are enabled as specialist tools.

### 3. Enable Tools

Run:

```bash
hermes tools
```

Enable the relevant toolsets/providers:

- `X (Twitter) Search`
- `Video Generation`
- `Image Generation` → `xAI Grok Imagine`, if desired
- `Text-to-Speech` → `xAI TTS`, if desired

Important: `video_gen` is disabled by default. The agent cannot call `video_generate` until the video toolset is enabled and a fresh session is started.

### 4. Optional X Search Config

```yaml
# ~/.hermes/config.yaml
x_search:
  model: grok-4.20-reasoning
  timeout_seconds: 180
  retries: 2
```

Use a generous timeout. Complex X searches can take 60–120 seconds.

## Verification

### Check Auth

```bash
hermes doctor
```

Look for `xai-oauth` under auth providers.

### Check Tool Visibility

```bash
hermes tools list | grep -Ei 'x search|twitter|video|image|tts|xai|grok'
```

Then start a fresh session:

```bash
hermes
```

or in a gateway chat:

```text
/reset
```

### Test X Search

Ask Hermes:

```text
Search X for recent posts about Hermes Agent xAI OAuth. Summarise the main claims and include citations.
```

Expected behaviour:

- Hermes uses `x_search`, not generic `web_search`.
- Output includes cited X/Twitter sources.

### Test Video Generation

Ask Hermes:

```text
Generate a short video of a red dragon flying over Sydney Harbour at sunrise.
```

Expected behaviour:

- Hermes uses `video_generate`.
- Output is delivered as a video file/path or native media attachment where supported.

## Operational Patterns

### X Research Muscle

Use this when the orchestrator is Claude/GPT but you want Grok's X-native search:

```text
Use X Search to find what builders are saying about <topic> this week. Focus on high-signal posts and cite sources.
```

### Trend Briefing

```text
Search X for the last 48 hours of discussion around <market/product/person>. Group results by theme, list notable accounts, cite posts, and flag uncertainty.
```

### Content Ideation

```text
Use X Search to identify 10 angles people are reacting to around <topic>. Turn the findings into hooks for posts, newsletter sections, or video ideas.
```

### Media Production

```text
Create a short video prompt for <campaign>, then generate the video using Grok Imagine. Keep it under 10 seconds and suitable for social preview use.
```

## Security and Privacy Notes

- OAuth credentials are stored in Hermes auth storage, typically under `~/.hermes/auth.json`; do not paste tokens into chat or notes.
- Prefer `xai-oauth` over `XAI_API_KEY` when using subscription quota intentionally.
- If both OAuth and API key are configured, Hermes documentation says OAuth wins for X Search.
- Treat X Search results as social evidence, not verified truth. Cite posts and label uncertainty.
- Be careful when asking the agent to search or summarise private accounts, DMs, or sensitive topics.

## Troubleshooting

### X Search Tool Does Not Appear

Likely causes:

- `X (Twitter) Search` toolset not enabled.
- No valid `xai-oauth` credentials or `XAI_API_KEY`.
- Token refresh failed.
- Session was not reset after enabling tools.

Fix:

```bash
hermes auth add xai-oauth
hermes tools
# enable X Search
```

Then start a fresh session or use `/reset` in the gateway.

### Video Generation Does Not Work

Likely causes:

- `video_gen` disabled.
- xAI OAuth not configured.
- Gateway session has not restarted/reset.
- Current Hermes version predates the video toolset.

Fix:

```bash
hermes update
hermes auth add xai-oauth
hermes tools
# enable Video Generation
```

Then restart gateway if using Telegram:

```bash
hermes gateway restart
```

### OAuth Fails on a Remote Machine

Use no-browser mode:

```bash
hermes auth add xai-oauth --no-browser
```

Open the printed URL on a device with a browser and complete the flow.

### Searches Take Too Long

- Use narrower queries.
- Restrict handles when possible.
- Increase `x_search.timeout_seconds` if needed.
- Avoid running broad X Search inside latency-sensitive cron jobs.

## What Not To Add To Memory

Do not save raw X search results, trend lists, generated media prompts, or temporary campaign outputs into always-loaded Hermes memory. Put durable learnings in project notes, and save only stable preferences or reusable workflow conventions to memory.

## Related Guides

- [Hermes Memory Architecture](../Skills/hermes-memory-architecture.md)
- [Hermes + Codex Native Integration](./codex-integration.md)
- [Hermes Agent Setup & Configuration](./setup.md)
