# Slower, warmer German instruction voices

Research recorded October 18, 2026. User likes the human vowel/word recordings;
only the nine synthetic full-sentence instruction clips need comparison. The
current generator uses Piper de_DE-thorsten-medium with length_scale=1.05. That is
only a slight slowdown from its normal duration, and does not change the voice's
underlying quality. Existing model/source pins remain in docs/AUDIO.md.

## Realistic options

| Option | What we can control | Practical requirement / limit |
| --- | --- | --- |
| Existing Piper, slower | Try length_scale 1.3–1.45, shorter sentences and clearer pauses | Free, installed locally, CPU generation; retains Thorsten's current timbre/quality ceiling |
| OpenAI gpt-4o-mini-tts | German text and instructions for a warm, patient adult voice, slow delivery and natural pauses | API access/billing; built-in voices are optimized for English, so German needs listening comparison |
| ElevenLabs | Audition a native German voice, select a suitable current multilingual model and tune pacing using the chosen model's controls | Account/API and plan/output-publication terms; quality varies by voice/model, requires audition |
| Azure Speech neural German | KatjaNeural or ConradNeural, SSML prosody rate and explicit breaks | Azure Speech resource/key/billing; precise timing controls, perceived warmth still needs listening review |

Official documentation inspected:
- OpenAI models, supported languages and instruction control:
  https://developers.openai.com/api/docs/guides/text-to-speech
- ElevenLabs current model selection (do not assume every model has identical controls):
  https://elevenlabs.io/docs/overview/models
- Azure SSML rate/pauses:
  https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice
- Azure German voice availability:
  https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts

These are documented capabilities, not a ranking from generated samples. No new
samples were synthesized, listened to or approved in this investigation. Provider
credentials, access, current prices and distribution/attribution terms have not
been tested; verify them before using a paid service or assigning asset licenses.
Never assume a subscription includes API credits or puts provider output under the
project license. Existing rights and source attribution remain intact.

## Recommended comparison before replacement

Use two representative prompts, one short and one containing Laut/Silbe/Bausteine.
Compare baseline Thorsten, a slower Piper version and two warmer candidate voices
from one selected provider. Try roughly 20–30% slower delivery with natural pauses,
not stretched phoneme sounds. Keep adult-friendly warmth rather than exaggerated
child voices. Present samples in the existing sound-review page for phone listening.

Choose by German pronunciation, naturalness, pace and intelligibility on a small
speaker. Then regenerate only the nine instructions, update provenance/hashes and
run the audit/browser checks. Do not replace liked human targets with synthetic
phonemes. Rewording long prompts may help more than merely stretching playback.

Generate MP3s once during development and serve them with the static website.
No runtime API, child-data transmission, account or paid service is needed for
learners. There are only nine short prompts, so initial generation volume is small;
account/plan minimums may matter more than per-character generation pricing.
