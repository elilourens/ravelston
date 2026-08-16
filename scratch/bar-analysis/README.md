# bar-analysis

Processing for Sensor Logger exports from the phone-on-bar sessions
(see [PHONE-PROTOCOL.md](../../research/PHONE-PROTOCOL.md)).

## Run

```bash
# unzip the Sensor Logger exports so each recording is its own directory
for f in *.zip; do unzip -q "$f" -d "${f%.zip}"; done

python3 explore.py  <datadir>   # per-session diagnostics: did detection find the hits?
python3 spectra.py  <datadir>   # averaged ring-down spectrum per load, overlaid
python3 estimate.py <datadir>   # per-strike modal fit, frequency vs load
python3 report.py   <datadir>   # verdict figure + summary table
```

## Files

| File | Purpose |
|---|---|
| `barlib.py` | loading, gap-aware resampling, bending-channel projection, event detection |
| `explore.py` | diagnostic plots per session |
| `spectra.py` | load-overlaid average spectra — shows which peaks move with load |
| `estimate.py` | matrix-pencil modal estimation, frequency-vs-load scatter |
| `report.py` | the two-panel verdict figure |

## Notes on the data

Sensor Logger on a Pixel 9 delivers **gyroscope at ~100.8 Hz** and
**accelerometer at ~50.4 Hz**. Gyro is the primary whip channel per FINDINGS §9.
`Microphone.csv` is only a dBFS envelope at ~17 Hz. The real audio is in
`Microphone.mp4` — **16 kHz mono HE-AAC at 32 kb/s**. Decode it first:

```bash
for d in */; do ffmpeg -i "$d/Microphone.mp4" -ac 1 -ar 16000 -c:a pcm_s16le "$d/audio.wav"; done
python3 acoustic.py <datadir>
```

**Session 1 acoustic result: inconclusive.** Gym PA music sits directly across
250–350 Hz (clearly visible as steady horizontal bands in the spectrogram),
which is exactly where the 288 Hz-coupled / 347 Hz-decoupled answer lives.
Decay-gating the modal search — keeping only modes that ring down after a tap,
which steady music cannot fake — still returns scattered frequencies with no
consistency across loads. To settle this the acoustic test needs a quiet room
and, ideally, an app that writes uncompressed PCM rather than a 32 kb/s
perceptual codec.

## Method notes

**Bending channel.** Rather than assume which phone axis is bar-transverse, the
gyro is band-passed and projected onto the principal axis of the filtered
motion. In session 1 this came out as almost pure phone-Y, carrying ~10× the
energy of the other two axes.

**Why matrix pencil rather than FFT.** These ring-downs die in ~0.2–0.3 s. An
FFT over that window has ~3 Hz of resolution, which cannot separate a 4 Hz mode
from a 7 Hz one. Matrix pencil fits damped sinusoids directly and recovers both
frequency and damping from short records.

**Damping is the diagnostic that matters.** Frequency alone cannot tell you
whether you measured the bar or the thing you strapped to it. A steel bar
bending mode has ζ ≈ 0.001–0.005; a taped or rubber mount is ζ ≈ 0.05–0.2.
Always report ζ alongside f.
