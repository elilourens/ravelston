# Session handoff — 2026-08-16

Where things stand, so the next session (probably on the MacBook) can pick up
cold. Delete this once it's been read and acted on.

---

## The one thing to do next

**Record 30 seconds on a desk with the phone app, both sensors, and keep the
`.txt`.** Everything downstream is blocked on it — there is no loader for the
phone app's export format yet, so recordings can't be analysed.

---

## What happened this session

### 1. Research wave 7 (eight parallel sweeps, ~180 sources)

Five new notes, all in the vault:

| Note | Covers |
|---|---|
| `kb/rnd/Exercise Recognition.md` | What the bar can classify, and with what model |
| `kb/rnd/Form Analysis.md` | What technique feedback is honestly available |
| `kb/rnd/Kinematics Pipeline.md` | Signal processing that must work before any of it |
| `kb/rnd/Data Plan.md` | Zero to a shippable model, costed |
| `kb/gtm/Competitive Landscape.md` | Products, validation, patents |

`FINDINGS.md` gained **§14**, which records what changed. Summary page:
https://claude.ai/code/artifact/9d35546d-2e30-4bf7-800d-06700184783c

**The headline correction:** §13 said recognition was "far more tractable"
than load estimation. That was too optimistic. Accuracy tracks how tightly the
sensor couples to the body part that *distinguishes* the exercises, and the bar
is coupled only to the hands. Revised expectation is **88–94% on five lifts**,
not 96%+.

**Strategic revision:** load stays the wedge, recognition is a supporting
feature. Every competitor makes the user type in the weight; nobody has
patented reading it off the bar; no camera can do it.

### 2. Two technique-tracking notes

`kb/product/technique-tracking/` — condensed, practical reference:
- `Auto-Categorised Exercises.md` — what can be told apart, what can't
- `Per-Exercise Sensor Capture.md` — per lift, what the sensors can measure

The governing rule: **if two lifts move the bar differently we can tell them
apart; if they differ in where the body is, we cannot.**

### 3. Hardware setup — got most of the way, then hit a wall

**Done:**
- Windows Python 3.12.8 confirmed, `bleak` 3.0.2 + numpy installed
- **Fixed `daq.ps1`** — it had the repo path hardcoded as `ravelston\sensors\daq`,
  stale since the landscaping moved it to `rnd\sensors\daq`. Now derives its own
  location from `$PSScriptRoot`
- Fixed two stale paths in `setup/requirements-{analysis,dev}.txt`
- Sensors configured via the phone app: 6-axis, 188 Hz bandwidth, 100 Hz return rate

**Blocked:** the desktop has **no Bluetooth adapter at all** — absent, not
disabled. So `daq.ps1` can't record on that machine. Plan is to move to the
MacBook.

---

## Picking up on the MacBook

```bash
git clone https://github.com/elilourens/ravelston.git
cd ravelston
pip3 install -r setup/requirements-daq.txt
pip3 install -r setup/requirements-analysis.txt

python3 rnd/sensors/daq/logger.py scan
python3 rnd/sensors/daq/logger.py record --out desk_test
python3 rnd/sensors/daq/benchcheck.py <session_dir>
```

`daq.ps1` is Windows-only; call `logger.py` directly on macOS. (A `daq.sh`
wrapper was offered but not written — say the word.)

### Three macOS gotchas

1. **Terminal needs Bluetooth permission** — System Settings → Privacy &
   Security → Bluetooth. Without it, scanning returns zero devices with **no
   error message**. Miserable to debug if you don't know.
2. **macOS reports CoreBluetooth UUIDs, not MAC addresses.** `sensors.txt` is
   not portable between machines.
3. Only one thing can hold a sensor at a time — close the phone app first.

---

## Sensor config, for reference

Set per sensor, in the app: device entry → **gear next to it** (not the app's
own settings gear, which only has Baudrate / Language / Storage path).

| Menu | Value |
|---|---|
| Algorithm | **6-axis** |
| Range → Bandwidth | **188 Hz** |
| Communication → Return rate | **100 Hz** |

Plus: **Displacement demo mode OFF** — it lives on the Displacement *data*
screen, not in settings. With it on, the sensor stops outputting acceleration
and angular velocity entirely.

⚠ The module **silently drops the rate** if it can't keep up. Setting 100 Hz
does not guarantee 100 Hz — always measure the delivered rate from the data.

Recordings land in `/Download/WitRecord` on Android. The `.txt` is the useful
one; `.wplay` is hex.

---

## Mounting — where it landed

Magnets and epoxy have arrived. Decision was to **epoxy a magnet to one sensor**
and keep the other clean for comparison.

The constraint that governs everything: **the mount must be stiff.** Anything
soft between sensor and bar becomes a spring, and you measure the mount instead
of the bar. That's what killed session 1 — duct-taped phone rang at 22 Hz with
ζ ≈ 0.09, and frequency went *up* with load, which is impossible for a bar.

- Ruled out: VHB/foam tape, Blu-tack (literally sold as a damping compound),
  cling film, hot glue, silicone, velcro
- Good: jubilee clip, steel banding, spare barbell collar, heat-shrink,
  epoxy/superglue with a **thin** glue line
- Research says mount on the **shaft** inboard of the collars, not the rotating
  sleeve — see `Kinematics Pipeline.md` §7. This contradicts
  `Hardware Roadmap.md` Stage 1, which is still unresolved

**Free experiment worth doing:** record the same load with two different mounts.
Same frequency both ways → measuring the bar. Different → measuring the mount.

---

## Open items

1. **Phone `.txt` loader does not exist.** Blocks all analysis of phone
   recordings. Needs one sample file.
2. **No Bluetooth on the desktop** — Mac, or a ~£10 USB BLE dongle.
3. **`Hardware Roadmap.md` Stage 1 still describes the superseded mount**
   (shaft saddle inside the collars) and contradicts `MOUNTING.md`.
4. **Get Sato & Heise 2012** (JSCR 26(2):342–349) in full text — the only study
   that ever measured barbell tilt, and the only estimate of our primary
   signal's dynamic range. Every open route to it is dead.
5. **FTO opinion on US9171201B2** (Peloton, live to ~2034) before the classifier
   architecture is fixed — it covers accel+gyro exercise classification and is
   *not* limited to body-worn devices.
6. `spectra.py` and `explore.py` read `sys.argv[1]` at module level with no
   `__main__` guard, so they can't be imported. Pre-existing.
7. 9.9 MB of datasheet PDFs are in permanent git history.

---

## Still true

**Nothing has met real hardware.** Every number in the vault is from published
literature or simulation. The desk test and the mount check are the gate.
