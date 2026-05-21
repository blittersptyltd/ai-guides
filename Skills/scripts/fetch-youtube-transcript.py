#!/usr/bin/env python3
"""
Fetch a YouTube video transcript and output it as structured JSON or plain text.

Usage:
    python fetch-youtube-transcript.py <url_or_video_id> [--language en,tr] [--timestamps]

Output (JSON):
    {
        "video_id": "...",
        "segment_count": 123,
        "duration": "12:34",
        "full_text": "complete transcript as plain text",
        "timestamped_text": "00:00 first line\n00:05 second line\n..."
    }

Install dependency:
    pip install youtube-transcript-api
"""

import argparse
import json
import re
import sys


def extract_video_id(url_or_id: str) -> str:
    """Extract the 11-character video ID from common YouTube URL formats."""
    value = url_or_id.strip()
    patterns = [
        r'(?:v=|youtu\.be/|shorts/|embed/|live/)([a-zA-Z0-9_-]{11})',
        r'^([a-zA-Z0-9_-]{11})$',
    ]
    for pattern in patterns:
        match = re.search(pattern, value)
        if match:
            return match.group(1)
    return value


def format_timestamp(seconds: float) -> str:
    """Convert seconds to HH:MM:SS or MM:SS format."""
    total = int(seconds)
    h, remainder = divmod(total, 3600)
    m, s = divmod(remainder, 60)
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def fetch_transcript(video_id: str, languages: list[str] | None = None) -> list[dict]:
    """Fetch transcript segments from YouTube and normalize them to dictionaries."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError:
        print(
            "Error: youtube-transcript-api not installed. Run: pip install youtube-transcript-api",
            file=sys.stderr,
        )
        sys.exit(1)

    api = YouTubeTranscriptApi()
    if languages:
        result = api.fetch(video_id, languages=languages)
    else:
        result = api.fetch(video_id)

    # youtube-transcript-api v1.x returns FetchedTranscriptSnippet objects.
    return [
        {"text": seg.text, "start": seg.start, "duration": seg.duration}
        for seg in result
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch a YouTube transcript as JSON or text")
    parser.add_argument("url", help="YouTube URL or 11-character video ID")
    parser.add_argument(
        "--language",
        "-l",
        default=None,
        help="Comma-separated language codes in priority order, e.g. en,en-US,tr",
    )
    parser.add_argument(
        "--timestamps",
        "-t",
        action="store_true",
        help="Include timestamped text in output",
    )
    parser.add_argument(
        "--text-only",
        action="store_true",
        help="Output plain text instead of JSON",
    )
    args = parser.parse_args()

    video_id = extract_video_id(args.url)
    languages = [lang.strip() for lang in args.language.split(",")] if args.language else None

    try:
        segments = fetch_transcript(video_id, languages)
    except Exception as exc:  # noqa: BLE001 - surface API-specific failures as JSON
        error_msg = str(exc)
        lower = error_msg.lower()
        if "disabled" in lower:
            print(json.dumps({"error": "Transcripts are disabled for this video."}))
        elif "no transcript" in lower:
            print(json.dumps({"error": "No transcript found. Try specifying a language with --language."}))
        else:
            print(json.dumps({"error": error_msg}))
        sys.exit(1)

    full_text = " ".join(seg["text"] for seg in segments)
    timestamped = "\n".join(
        f"{format_timestamp(seg['start'])} {seg['text']}" for seg in segments
    )

    if args.text_only:
        print(timestamped if args.timestamps else full_text)
        return

    result = {
        "video_id": video_id,
        "segment_count": len(segments),
        "duration": format_timestamp(segments[-1]["start"] + segments[-1]["duration"]) if segments else "0:00",
        "full_text": full_text,
    }
    if args.timestamps:
        result["timestamped_text"] = timestamped

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
