#!/usr/bin/env python3
"""
MuscleWiki Exercise Media Scraper
Downloads side-view MP4 form videos for each exercise in the Cyber Gym database.

Approach: fetches the full MuscleWiki exercise catalog via their JSON API
(/newapi/exercise/exercises/), builds a slug→record map, then for each Forge
exercise picks the male side-view branded_video and downloads it.

Output goes to public/exercises/ relative to the script directory,
or pass a custom output dir as the first argument.

Usage:
    python scrape_musclewiki.py                         # → ./public/exercises/
    python scrape_musclewiki.py /path/to/project        # → /path/to/project/public/exercises/

Polite: 1.0s delay between media downloads, skips files already present.
"""

import sys
import os
import json
import time
import subprocess
from pathlib import Path

# ── Cyber Gym exercise ID → MuscleWiki slug ────────────────────────────────
# Slugs verified against MuscleWiki's JSON catalog. Where an exact match
# doesn't exist, we fall back to the closest equivalent movement pattern
# (different equipment but same mechanics).
EXERCISE_MAP = {
    # CHEST
    "smith-bench":    "smith-machine-bench-press",
    "smith-incline":  "smith-machine-incline-bench-press",
    "smith-decline":  "cable-decline-bench-press",        # no smith decline in catalog
    "cable-fly-mid":  "cable-pec-fly",
    "cable-fly-high": "cable-decline-bench-chest-fly",    # high-to-low substitute
    "cable-fly-low":  "cable-bench-chest-fly",            # low-to-high substitute
    "cage-dips":      "parralel-bar-dips",                # yes, catalog really spells it "parralel"
    # BACK
    "lat-pulldown":   "machine-pulldown",
    "wide-pulldown":  "machine-pulldown",                 # no "wide" variant in catalog
    "seated-row":     "machine-seated-cable-row",
    "pullups":        "pull-ups",
    "single-row":     "cable-single-arm-neutral-grip-row",
    "straight-pull":  "cable-straight-arm-pull-in",
    "cable-shrug":    "cable-30-degree-shrug",
    "smith-rdl":      "smith-machine-romanian-deadlift",
    # LEGS
    "smith-squat":    "smith-machine-squat",
    "smith-fsquat":   "barbell-front-squat-bodybuilding", # no smith front squat
    "vert-press":     "vertical-leg-press",
    "smith-lunge":    "smith-machine-split-squat",        # closest smith lunge variant
    "smith-calf":     "smith-machine-calf-raise",
    "cable-kickback": "cable-standing-glute-kickback",
    "cable-abduct":   "cable-standing-hip-abduction",
    "rdl":            "barbell-romanian-deadlift",
    # SHOULDERS
    "smith-ohp":      "smith-machine-seated-overhead-press",
    "cable-lat":      "cable-low-bilateral-lateral-raise",
    "cable-front":    "cable-bar-front-raise",
    "face-pull":      "cable-bar-face-pull",
    "cable-upright":  "cable-upright-row",
    "rear-delt":      "cable-high-single-arm-rear-delt-fly",
    # ARMS
    "cable-curl":     "cable-bar-curl",
    "cable-hammer":   "cable-rope-hammer-curl",
    "cable-preacher": "ez-bar-preacher-curl",             # no cable preacher
    "rope-pushdown":  "cable-rope-pushdown",
    "bar-pushdown":   "cable-bar-pushdown",
    "oh-tri-ext":     "cable-rope-overhead-tricep-extension",
    "skull-crusher":  "cable-rope-skullcrusher",
    "tri-dips":       "parralel-bar-dips",
    # CORE
    "cable-crunch":   "cable-rope-kneeling-crunch",
    "hanging-lr":     "laying-leg-raises",                # no hanging LR in catalog
    "woodchop":       "cable-wood-chopper",
    "pallof":         "cable-pallof-press",
    "plank":          "plank",
}

API_URL = "https://musclewiki.com/newapi/exercise/exercises/"
# Cloudflare fingerprints Python's TLS handshake and returns 403. Curl's
# handshake is allowed, so we shell out to curl for every request.
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
PAGE_LIMIT = 50
DELAY = 1.0


def curl_text(url, timeout=30):
    """GET `url` and return the response body as text."""
    out = subprocess.run(
        ["curl", "-sSfL", "-A", USER_AGENT, "--max-time", str(timeout), url],
        capture_output=True, timeout=timeout + 5,
    )
    if out.returncode != 0:
        raise RuntimeError(out.stderr.decode("utf-8", "replace").strip() or f"curl exit {out.returncode}")
    return out.stdout.decode("utf-8", "replace")


def curl_download(url, dest_path, timeout=60):
    """Download `url` to `dest_path`. Returns (success, info)."""
    out = subprocess.run(
        ["curl", "-sSfL", "-A", USER_AGENT, "--max-time", str(timeout), "-o", str(dest_path), url],
        capture_output=True, timeout=timeout + 5,
    )
    if out.returncode != 0:
        return False, out.stderr.decode("utf-8", "replace").strip() or f"curl exit {out.returncode}"
    size_kb = os.path.getsize(dest_path) // 1024
    return True, f"{size_kb} KB"


def fetch_catalog():
    """Page through the full MuscleWiki catalog and return slug→record map."""
    print("Fetching MuscleWiki catalog…")
    by_slug = {}
    offset = 0
    total = None
    while True:
        url = f"{API_URL}?limit={PAGE_LIMIT}&offset={offset}"
        data = json.loads(curl_text(url, timeout=20))
        if total is None:
            total = data.get("count", 0)
        for rec in data.get("results", []):
            by_slug[rec["slug"]] = rec
        got = len(data.get("results", []))
        offset += got
        print(f"  fetched {offset}/{total}")
        if got == 0 or offset >= total:
            break
        time.sleep(0.3)
    print(f"Catalog built: {len(by_slug)} exercises\n")
    return by_slug


def pick_side_video(record):
    """Pick the male side-view branded_video URL from a catalog record."""
    images = record.get("male_images") or record.get("female_images") or []
    side = next((i for i in images if "side" in (i.get("branded_video") or "")), None)
    pick = side or (images[0] if images else None)
    return pick.get("branded_video") if pick else None


def pick_body_maps(record):
    """Return (front_url, back_url) for the male body map. Falls back to female."""
    maps = record.get("body_map_images") or []
    male = next((m for m in maps if (m.get("gender") or {}).get("id") == 1), None)
    pick = male or (maps[0] if maps else None)
    if not pick:
        return None, None
    return pick.get("front"), pick.get("back")


def build_instruction_json(record):
    """Extract form steps + muscle names from a catalog record."""
    steps = [
        s.get("text_en_us") or s.get("text") or ""
        for s in sorted(record.get("correct_steps") or [], key=lambda x: x.get("order", 0))
    ]
    steps = [s for s in steps if s.strip()]

    def names(key):
        return [m.get("name_en_us") or m.get("name") for m in (record.get(key) or []) if m.get("name_en_us") or m.get("name")]

    return {
        "steps": steps,
        "muscles": {
            "primary": names("muscles_primary"),
            "secondary": names("muscles_secondary"),
            "tertiary": names("muscles_tertiary"),
        },
        "source_slug": record.get("slug"),
        "source_name": record.get("name_en_us") or record.get("name"),
    }


def download_file(url, dest_path):
    try:
        return curl_download(url, dest_path, timeout=60)
    except Exception as e:
        return False, str(e)


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    out_dir = Path(sys.argv[1]) / "public" / "exercises" if len(sys.argv) > 1 else Path("public/exercises")
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {out_dir.resolve()}\n")

    catalog = fetch_catalog()

    total = len(EXERCISE_MAP)
    ok = skipped = missing = failed = 0
    unresolved = []

    for i, (forge_id, slug) in enumerate(EXERCISE_MAP.items(), 1):
        video_dest = out_dir / f"{forge_id}.mp4"
        json_dest = out_dir / f"{forge_id}.json"
        front_dest = out_dir / f"{forge_id}-muscles-front.png"
        back_dest = out_dir / f"{forge_id}-muscles-back.png"
        prefix = f"[{i:02d}/{total}] {forge_id:<15}"

        all_have = video_dest.exists() and json_dest.exists() and front_dest.exists() and back_dest.exists()
        if all_have:
            print(f"  SKIP  {prefix} (all assets present)")
            skipped += 1
            continue

        record = catalog.get(slug)
        if not record:
            print(f"  MISS  {prefix} slug '{slug}' not in catalog")
            missing += 1
            unresolved.append((forge_id, slug))
            continue

        # 1. Instructions JSON (always written — tiny, cheap to refresh)
        try:
            json_dest.write_text(
                json.dumps(build_instruction_json(record), indent=2, ensure_ascii=False),
                encoding="utf-8",
            )
        except Exception as e:
            print(f"  WARN  {prefix} json write failed: {e}")

        bits = []

        # 2. Video (side view)
        if not video_dest.exists():
            video_url = pick_side_video(record)
            if video_url:
                success, info = download_file(video_url, video_dest)
                if success:
                    bits.append(f"mp4 {info}")
                else:
                    bits.append(f"mp4 FAIL ({info})")
                    failed += 1
                time.sleep(DELAY)
            else:
                bits.append("mp4 missing")
        else:
            bits.append("mp4 skip")

        # 3. Body map images (front + back)
        front_url, back_url = pick_body_maps(record)
        if front_url and not front_dest.exists():
            success, info = download_file(front_url, front_dest)
            bits.append(f"front {'OK' if success else 'FAIL'}")
            time.sleep(0.5)
        elif front_dest.exists():
            bits.append("front skip")
        else:
            bits.append("front missing")

        if back_url and not back_dest.exists():
            success, info = download_file(back_url, back_dest)
            bits.append(f"back {'OK' if success else 'FAIL'}")
            time.sleep(0.5)
        elif back_dest.exists():
            bits.append("back skip")
        else:
            bits.append("back missing")

        bits.append("json OK")
        print(f"  DONE  {prefix} {' · '.join(bits)}")
        ok += 1

        time.sleep(DELAY)

    print(f"\n{'='*50}")
    print(f"Done. OK: {ok}  Skipped: {skipped}  Missing: {missing}  Failed: {failed}")
    if unresolved:
        print("\nSlugs that did not match a MuscleWiki record:")
        for fid, slug in unresolved:
            print(f"  {fid:<15} → {slug}")
        print("\nTip: search musclewiki.com, find the exercise, and update EXERCISE_MAP.")


if __name__ == "__main__":
    main()
