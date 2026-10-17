#!/usr/bin/env python3
"""Generate reviewable German prototype WAVs with a pinned offline Piper voice.

Run using the dedicated environment described in german/AUDIO.md. The manifest is
{version: 1, clips: [{id, text, kind, phonemes?}]}; phonemes is an explicit IPA-like
sequence understood by Piper, never a spelling interpreted as a letter name.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import urllib.request
import wave

PIPER_VERSION = "1.4.2"
VOICE = "de_DE-thorsten-medium"
REVISION = "c10ece1aade47bb51c153c893d14e5bf8e5b7117"
MODEL_SHA256 = "7e64762d8e5118bb578f2eea6207e1a35a8e0c30595010b666f983fc87bb7819"
CONFIG_SHA256 = "974adee790533adb273a1ac88f49027d2a1b8f0f2cf4905954a4791e79264e85"
BASE_URL = f"https://huggingface.co/rhasspy/piper-voices/resolve/{REVISION}/de/de_DE/thorsten/medium"
RECIPE_VERSION = 1


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ensure_asset(path: Path, checksum: str) -> None:
    if path.exists():
        if digest(path) != checksum:
            raise ValueError(f"Checksum mismatch for {path}; remove it and retry")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as temp:
        temporary = Path(temp.name)
        try:
            # Uses the standard verified HTTPS context and inherited proxy.
            with urllib.request.urlopen(f"{BASE_URL}/{path.name}", timeout=120) as response:
                shutil.copyfileobj(response, temp)
            temp.flush()
            if digest(temporary) != checksum:
                raise ValueError(f"Downloaded asset checksum mismatch: {path.name}")
            temporary.replace(path)
        finally:
            temporary.unlink(missing_ok=True)


def read_manifest(path: Path) -> list[dict]:
    manifest = json.loads(path.read_text(encoding="utf-8"))
    if manifest.get("version") != 1 or not isinstance(manifest.get("clips"), list):
        raise ValueError("Expected manifest version 1 and clips array")
    clips = manifest["clips"]
    seen = set()
    for clip in clips:
        clip_id = clip.get("id", "")
        if not re.fullmatch(r"[a-z0-9_]+", clip_id) or clip_id in seen:
            raise ValueError(f"Unsafe/duplicate clip ID: {clip_id!r}")
        seen.add(clip_id)
        if not isinstance(clip.get("text"), str) or not clip["text"].strip():
            raise ValueError(f"Missing text label for {clip_id}")
        if not isinstance(clip.get("kind"), str):
            raise ValueError(f"Missing kind for {clip_id}")
        if clip["kind"] in {"phoneme", "grapheme", "gp"} and not clip.get("phonemes"):
            raise ValueError(f"Isolated phoneme {clip_id} requires explicit phonemes")
        if "phonemes" in clip and (not isinstance(clip["phonemes"], str) or not clip["phonemes"]):
            raise ValueError(f"Invalid phonemes for {clip_id}")
    return clips


def validate_wav(path: Path) -> dict:
    import numpy as np

    raw = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "stream=codec_name,sample_rate,channels",
         "-show_entries", "format=duration", "-of", "json", str(path)],
        check=True, capture_output=True, text=True,
    )
    probe = json.loads(raw.stdout)
    stream = probe["streams"][0]
    if stream != {"codec_name": "pcm_s16le", "sample_rate": "22050", "channels": 1}:
        raise ValueError(f"Unexpected WAV format for {path}: {stream}")
    with wave.open(str(path), "rb") as wav:
        samples = np.frombuffer(wav.readframes(wav.getnframes()), dtype="<i2").astype(np.float32) / 32768
    duration = float(probe["format"]["duration"])
    peak = float(np.max(np.abs(samples))) if samples.size else 0
    rms = float(np.sqrt(np.mean(samples * samples))) if samples.size else 0
    if not 0.12 <= duration <= 60 or rms < 0.002 or peak > 0.75:
        raise ValueError(f"Invalid/silent/clipped WAV {path}: duration={duration}, peak={peak}, rms={rms}")
    return {"duration_seconds": round(duration, 6), "sample_rate": 22050, "channels": 1,
            "peak_dbfs": round(20 * math.log10(peak), 3), "rms_dbfs": round(20 * math.log10(rms), 3),
            "sha256": digest(path)}


def synthesize(voice, clip: dict, path: Path) -> list[str]:
    import numpy as np
    from piper import SynthesisConfig

    direct = clip.get("phonemes")
    sequences = [list(direct)] if direct else voice.phonemize(clip["text"])
    if not sequences:
        raise ValueError(f"No phonemes for {clip['id']}")
    for sequence in sequences:
        unknown = set(sequence) - set(voice.config.phoneme_id_map)
        if unknown:
            raise ValueError(f"Unsupported phonemes for {clip['id']}: {sorted(unknown)}")
    isolated = clip["kind"] in {"phoneme", "grapheme", "gp"}
    # Zero model noise produces deterministic synthesis; a hash cache preserves
    # reviewed results. Isolated sounds are slower, not spoken letter names.
    # The model's isolated /uː/ and /iː/ can be shorter than its short vowels
    # at equal rate. Deliberately sustain long-vowel targets; words keep their
    # contextual duration. This is an explicit synthesis adjustment for review.
    length_scale = 3.6 if isolated and direct and "ː" in direct else (1.8 if isolated else 1.15)
    config = SynthesisConfig(length_scale=length_scale,
                             noise_scale=0.0, noise_w_scale=0.0, normalize_audio=False)
    chunks = []
    for sequence in sequences:
        ids = voice.phonemes_to_ids(sequence)
        chunk = voice.phoneme_ids_to_audio(ids, config)
        if not np.isfinite(chunk).all():
            raise ValueError(f"Non-finite speech output for {clip['id']}")
        chunks.extend([chunk, np.zeros(round(0.12 * voice.config.sample_rate), dtype=np.float32)])
    samples = np.concatenate(chunks)
    peak = np.max(np.abs(samples))
    if peak < 1e-7:
        raise ValueError(f"Silent synthesis for {clip['id']}")
    # Trim model pauses, retain 80 ms of space either side, normalize peaks to
    # -3 dBFS. Peak normalization does not certify perceived loudness/phonetics.
    active = np.flatnonzero(np.abs(samples) > peak * 0.0063)
    padding = round(0.08 * voice.config.sample_rate)
    samples = samples[max(0, active[0] - padding):min(len(samples), active[-1] + padding + 1)]
    samples = samples * (10 ** (-3 / 20) / peak)
    pcm = np.round(samples * 32767).astype("<i2")
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(voice.config.sample_rate)
        wav.writeframes(pcm.tobytes())
    return ["".join(sequence) for sequence in sequences]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, default=Path("german/audio"))
    parser.add_argument("--cache-dir", type=Path, default=Path("/workspace/kalulu-tools/tts-models"))
    parser.add_argument("--validate-only", action="store_true", help="Validate clips and metadata without Piper/model/download")
    parser.add_argument("--force", action="store_true", help="Regenerate clips instead of reusing verified hash cache")
    args = parser.parse_args()
    clips = read_manifest(args.manifest)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    metadata_path = args.output_dir / "metadata.json"
    old = json.loads(metadata_path.read_text()) if metadata_path.exists() else {}
    previous = {c["id"]: c for c in old.get("clips", [])}
    script_hash = digest(Path(__file__))
    voice = None
    if not args.validate_only:
        if importlib.metadata.version("piper-tts") != PIPER_VERSION:
            raise ValueError(f"Install piper-tts=={PIPER_VERSION}; see german/AUDIO.md")
        from piper import PiperVoice
        model = args.cache_dir / f"{VOICE}.onnx"
        ensure_asset(model, MODEL_SHA256)
        ensure_asset(Path(str(model) + ".json"), CONFIG_SHA256)
        voice = PiperVoice.load(model)
        voice.session.disable_fallback()
    output = []
    reused = generated = 0
    for clip in clips:
        path = args.output_dir / f"{clip['id']}.wav"
        key = hashlib.sha256(json.dumps({"clip": clip, "voice": VOICE, "model": MODEL_SHA256,
                                        "config": CONFIG_SHA256, "recipe": RECIPE_VERSION,
                                        "script_sha256": script_hash, "piper": PIPER_VERSION},
                                       ensure_ascii=False, sort_keys=True).encode()).hexdigest()
        prior = previous.get(clip["id"], {})
        cache_ok = (path.exists() and prior.get("cache_key") == key
                    and prior.get("sha256") == digest(path))
        if args.validate_only:
            if not cache_ok:
                raise ValueError(f"Missing/stale/modified audio for {clip['id']}; regenerate")
        if cache_ok and not args.force:
            phonemes = prior["synthesized_phonemes"]
            reused += 1
        else:
            if voice is None:
                raise ValueError("Cannot regenerate in validation-only mode")
            phonemes = synthesize(voice, clip, path)
            generated += 1
        metrics = validate_wav(path)
        output.append({**clip, "file": path.name, "cache_key": key, "synthesized_phonemes": phonemes,
                       "listening_review": "pending_native_speaker", **metrics})
    metadata = {"schema_version": 1, "voice": VOICE, "model_revision": REVISION,
                "model_sha256": MODEL_SHA256, "config_sha256": CONFIG_SHA256,
                "engine": f"piper-tts=={PIPER_VERSION}", "recipe_version": RECIPE_VERSION,
                "script_sha256": script_hash, "synthetic": True,
                "phonetic_correctness_verified": False, "clips": output}
    if not args.validate_only:
        metadata_path.write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"validated": len(output), "generated": generated, "reused": reused,
                      "total_seconds": round(sum(c["duration_seconds"] for c in output), 3),
                      "listening_review": "pending_native_speaker"}, indent=2))


if __name__ == "__main__":
    main()
