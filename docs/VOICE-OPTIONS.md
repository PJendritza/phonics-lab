# Free German instruction voice options

Assessed October 18, 2026 against official project/model documentation. User permits
free/local options only; ChatGPT Plus and a Google subscription must not be treated
as external API or GPU credits. Earlier paid-provider suggestions are superseded.

## Approved next-release setting

Regular Piper Thorsten High, length_scale=1.5, with 0.3 seconds added between
sentences. The user liked the 1.35/0.2-second-pause sample (3.866 seconds), then the 1.45/0.3-second-pause sample (4.232 seconds), and selected 1.5/0.3 seconds for implementation. Comparison sentence: “Hör auf den ersten Laut im Wort. Tippe auf
den passenden Laut.”  High model SHA256:
9df1c43c61149ef9b39e618e2b861fbe41e1fcea9390b2dac62e8761573ea4f1.
The 1.8 sample with 0.4-second pause was too slow. A 1.25 sample without additional
pause lasted 3.448 seconds. length_scale is a duration setting, not a playback-speed
multiplier; a larger value means slower. Pauses here are inserted PCM silence.

Model and samples are external under /workspace/kalulu-tools/tts-models and
/workspace/kalulu-browser-build/audio-samples. All nine instructions have now been regenerated for v5; exact publication status is in PROGRESS.md. Human target
vowels/words remain unchanged.

The user auditioned Qwen online and did not like it. Keep the approved Piper voice; no further model experiments are part of this update.

## Assessment of the user's model list

| Model | Verified German/license facts | Practical assessment |
| --- | --- | --- |
| Qwen3-TTS 1.7B | German among ten documented languages; Apache 2.0. Base supports cloning; CustomVoice and VoiceDesign are distinct variants | Strong candidate to audition; larger runtime/dependencies than Piper. Official examples use GPU, bfloat16 and optional FlashAttention; current CPU speed untested |
| Qwen3-TTS 0.6B | German and Apache 2.0; Base cloning and CustomVoice variants | Smaller first CPU experiment; not proof of natural German quality, and 0.6B lacks the 1.7B instruction-control feature in the official variant table |
| Chatterbox Multilingual V3 | Officially released, 0.5B, German among 23 languages; official model card MIT. Select t3_model="v3" explicitly; default can select V2 | Credible alternative. Official code documents cpu/mps/cuda; actual CPU speed and voice quality here untested. English-focused variants must not be confused with Multilingual |
| XTTS-v2 | German supported; Coqui Public Model License, non-commercial conditions | Established candidate, but less straightforward rights for a generally reusable project than Apache/MIT; not unrestricted open-source weights |
| OpenAudio S1-mini | Old URL resolves to fishaudio/s1-mini; German listed; model metadata CC BY-NC-SA 4.0 and access gate | Not anonymously downloadable here: model-card request returned HTTP 401. Metadata gate requires accepting non-commercial terms and additional fields; no gate bypass attempted |
| Piper German | Thorsten High is already installed, verified and used to generate the approved sample | Immediate no-paid-API option, fast CPU generation; no claim it matches the larger models' quality |

Qwen supports cloning in Base variants, not as an interchangeable feature of every
model bearing the family name. We can start with preset/voice-design capabilities
without a reference recording. Chatterbox includes automatic audio watermarking.
Do not confuse open weights with unrestricted licenses, or expected quality labels
with a measured ranking. No German listening benchmark of the new candidates has
been performed. A suitable permitted reference recording is an additional input
when choosing a cloning workflow; it is not required for every candidate/workflow.

## Current environment and sensible next trial

Observed: five reported CPUs, about 33 GiB RAM, no nvidia-smi executable or NVIDIA
device files. No usable GPU is established. These models are free to download under
their terms, but running them needs compute. Do not promise a free hosted GPU, infer
hardware availability from subscriptions, or call CPU performance verified before
executing it. Do not interpret Qwen's 96 GB FlashAttention build-job note as a model
inference RAM requirement.

Recommended future experiment: a bounded isolated CPU trial of Qwen3-TTS 0.6B
CustomVoice or Chatterbox Multilingual V3 with one identical short German prompt.
Use CPU-compatible attention/dtypes and external caches; stop if performance or
compatibility is impractical and report the evidence. If viable, compare a 1.7B
variant and the approved Piper sample by listening. No install or inference of
these candidates was performed during this assessment.

The original “excellent” / “top recommendation” ordering is not independently
established. Native listening for clarity, accent, phoneme accuracy, pacing and
small-speaker intelligibility should decide. Use richer synthesis only for whole
instructions, preserving the human target recordings already liked by the user.
Generate MP3s once and publish static files; no model runs on a learner's phone.

## Official sources and demos

- Qwen project/variant capabilities: https://github.com/QwenLM/Qwen3-TTS
- Qwen 1.7B Base model/license: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Qwen 0.6B model/license: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Qwen official demo: https://huggingface.co/spaces/Qwen/Qwen3-TTS
- Chatterbox release, device options and MIT code: https://github.com/resemble-ai/chatterbox
- Chatterbox model/license: https://huggingface.co/ResembleAI/chatterbox
- Chatterbox multilingual demo: https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS
- XTTS-v2 model/CPML reference: https://huggingface.co/coqui/XTTS-v2
- S1-mini model/license/gate: https://huggingface.co/fishaudio/s1-mini

Demo links are provided by official projects; anonymous usage, current uptime,
queues, quotas and automated access were not tested. An online demo is not a promise
of unlimited free programmatic generation. Preserve per-model terms, references
and provenance when adding any generated asset.
