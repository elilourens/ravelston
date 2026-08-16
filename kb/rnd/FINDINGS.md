# Ravelston — Findings

Can two bar-end IMUs (WitMotion WT9011DCL-BT50) measure how much weight is
loaded on a barbell — and what else does the dual-sensor geometry buy?

Sources: six waves of literature/market/patent/hardware research, plus
eight simulation experiments in this repo (`run_all`, `run_dual`,
`run_combo`, `run_mitigation`, `run_barlib`, `run_velocity`, `run_plates`,
`run_family`; raw numbers in the matching `results_*.md`).

Research brief with citations (rounds 1–2 only; this file supersedes it):
https://claude.ai/code/artifact/cfe73a9e-6312-4f67-b8ee-b6d1dcb7bfd6

Status: research phase complete, hardware pending. Last updated 2026-08-11
after the lift-recognition research wave (§13, Appendix B).

---

## 0. Executive summary

1. **Load from bar motion alone: impossible.** Two unknowns (force, mass),
   one equation. No paper, no product, no consumer wearable does it.
2. **Load from bar whip frequency: viable in the rack, and unclaimed.**
   Frequency falls with load; simulation says ±0.2 kg after calibration.
   Nobody has ever published a Hz-vs-load curve for a barbell.
3. **Scope is narrower than first thought.** The whip signal is a
   *support-constrained* mode. It works when the bar is supported at
   fixed points (rack J-hooks). Deadlifts from the floor are effectively
   out. In-hands is a different, harder estimation problem.
4. **Confounds are all "where is the mass sitting" problems** — collar
   slack, plate thickness (bumper vs iron), grip width. All are large
   (+14 to +60 kg) and all yield to the same two-mode joint inversion,
   which the dual sensors make measurable.
5. **The unknown-bar problem solves itself.** The loaded/empty frequency
   ratio cancels bar stiffness *exactly*; a light-load shape ratio
   identifies tare mass (15/20/25 kg separate cleanly, four different
   20 kg bars agree to 0.001). Together they self-calibrate an unseen bar
   with **zero user input**. A phone-mic "tap to register your bar" trick
   — backed by an ASTM-standardised industry — gives a redundant check.
6. **The surprise: the boring features are the weakest in the market.**
   Peak velocity, rep detection at high load, and bar path are all
   demonstrably broken in shipping products, and the dual-sensor geometry
   fixes the first one with 50-year-old mechanics nobody has applied here.

---

## 1. Why kinematics alone cannot work

`m·a = F_lifter − m·g` — force and mass both unknown, force under
voluntary control. A 60 kg and a 180 kg bar can trace identical paths.

Every real attempt adds a force path or instruments the load: strain
gauges (US20170128765A1, abandoned), RFID-tagged plates (US20170266490A1,
abandoned), magnetometer on a weight stack (W8-Scope, 97.5%), vision
(Tempo, proprietary plates), or machine-set resistance (Tonal, EGYM).
Best kinematics-only precedent: Pernek 2015, ~6% *relative* intensity on
dumbbells, per-user trained. MyoBuddy (EMG) classified curl weight into
10 lb bins at 77%. That is the whole prior art.

**Market check (2026): no consumer wearable auto-detects load.** WHOOP
Strength Trainer, Apple Watch, Garmin, Samsung, GymAware, Enode, Vitruve,
Flex, RepOne, Output, Perch — all manual entry.

## 2. The physics, and where it does and doesn't hold

Two independently built Euler-Bernoulli FE models (this repo's, and one
from the literature research) agree within ~10%:

| Config | Behaviour |
|---|---|
| **Rack (J-hooks support, plates are the moving mass)** | Strongly load-dependent — **this is the signal** |
| **Free-free / in flight** | Plates become an *inertial ground*; shaft rings between them at ~12–16 Hz, nearly load-INdependent |
| **On the floor (deadlift)** | Plates grounded; bare shaft pinned near plate contact, ~26–34 Hz, load-independent |
| **In the hands** | Same topology as rack but hands are compliant supports — see §5 |

Rack-supported frequencies (this repo's FEM, 1.0 m J-hook span):

| Total load | f1 | f2 |
|---|---|---|
| 60 kg | 11.1 Hz | 16.4 Hz |
| 100 kg | 8.7 | 13.1 |
| 140 kg | 6.9 | 10.5 |
| 180 kg | 5.7 | 8.5 |
| 220 kg | 4.7 | 7.1 |

- Sensitivity ≈ 53 mHz/kg near 100 kg → **0.05 Hz ≈ 0.9 kg**.
- Golf shaft fitters resolve the same band (3.3–5 Hz) to ±0.017 Hz daily.
- Steel damping is negligible — Chiu 2010 measured **zero hysteresis** in
  4-point bending to 220 kg, so all ring-down loss is at the boundaries.
- **Support span dominates**: at 70 kg/side, half-span 0.25 m → 4.5 Hz,
  0.55 m → 6.6 Hz, 0.80 m → 12.7 Hz. Fixed J-hooks are knowable; hands
  are not.

### External evidence
- **Langlois & Russell (Penn State), ASA 190th meeting, May 2026** —
  first experimental modal analysis of Olympic bars under load. Four
  20 kg bars, 50 kg/end, free-free suspension, impact hammer. Findings
  released are qualitative: **sleeve geometry matters more than steel
  alloy or coating**, and higher modes *rose* with load (consistent with
  the inertial-ground mechanism). **No Hz published — email
  jgl5306@psu.edu / dar119@psu.edu; they likely hold the exact dataset.**
- **Mamiy & Polyakov 2014** (free full text, CyberLeninka): barbell
  k ≈ 43,000 N/m (range 15,000–63,750), Q ≈ 45–65. Implies ~4.7 Hz at
  50 kg to ~2.3 Hz at 200 kg for the lifter-coupled case.
- **Vassiouk et al. 2018** — closest product prior art found: a 120 g
  wireless **strain-gauge** sensor clamped to one bar end, Bluetooth,
  real-time biofeedback so lifters time the jerk to peak bar bend. Elite
  lifter, 4×170 kg. Amplitudes reported in uncalibrated units only.
- **Russian jerk-force modelling**: bar-end deflection reaches **10 cm**
  during a 241 kg jerk; ignoring bar elasticity overestimates applied
  force by ≥25%.
- **Appleby 2020**: bar ends travel 30–44 mm (6–8.5%) further than C7 in
  heavy squats — whip amplitude captured as a measurement artifact,
  never analysed.
- **Chiu 2008**: peak bar speed 5–30% lower at centre than ends in clean
  pulls — bending is a large fraction of what a bar-end sensor sees.
- **Industry blind spot**: VBT devices sample ~100 Hz and low-pass at
  10–15 Hz. **The whip signal is present in commercial data and
  deliberately filtered out.**

## 3. Simulation results (full sensor-corruption chain)

Sensor model: ODR clock error, 20 Hz factory LPF vs 188 Hz, noise
density, 16-bit quantisation, ±16 g clipping, gyro dead-band, bursty
counterless BLE packet loss.

- Frequency estimation (gyro, fundamental-tracked interpolated FFT):
  **13–26 mHz RMS** per 3 s ring-down.
- Mass inversion after 5-point calibration: **±0.2 kg, 60–220 kg**.
- Full pipeline with plate-grid snap: **100% exact-load, 0% wrong
  auto-logs** on the calibrated bar.

### Engineering traps found before spending money
1. **Packet drops + naive timestamps** bias frequency +4% (≈ −8% mass) at
   5% loss. The WT9011 stream has **no sample counters**, so gap-aware
   resampling from arrival timestamps is mandatory (+280 → +3 mHz bias).
2. **ODR clock error**: 0.5% clock error = 1% mass error. Calibrate each
   unit's true rate against the phone clock once.
3. Factory **20 Hz LPF** barely affects the whip band but must be set to
   188 Hz (`FF AA 1F 01 00`, save) for velocity/impact work.

### What the second sensor buys (`run_dual.py`, `run_velocity.py`)
- **Mode separation via channel algebra** — on GYRO channels the whip
  mode's end slopes are anti-symmetric, so **DIFF (L−R) isolates the
  fundamental, SUM isolates mode 2** (reverse of accelerometer channels).
  Under end-strikes: diff channel found the fundamental 100% of trials,
  sum locked onto mode 2 100% of trials. This is what makes the two-mode
  inversion of §4 possible at all.
- **Mass precision**: 1.2–1.5× tighter.
- **Mis-load detection**: gyro diff/sum RMS ratio drops monotonically
  (15.3 symmetric → 12.4 at +2.5 kg/side → 5.8 at a full plate). Note
  left/right *frequencies* are identical under mis-load — asymmetry lives
  in mode shape (amplitude), not frequency.
- **Peak velocity halved** — see §6.
- Racking impact hits both sleeves at once → free inter-unit time sync.

## 4. The confounds — all the same problem, one fix

Every large error source is "the mass is sitting somewhere other than
where I calibrated". Single-mode inversion cannot separate *more mass*
from *mass further out*.

| Confound | Single-mode error | Two-mode error |
|---|---|---|
| Collar slack, plates 3 cm out | **+14.4 kg** @140 | **+0.1 kg** |
| Bumpers when calibrated on iron @200 kg | **+59.9 kg** | **+3.8 kg** |
| Bumpers @160 kg | +41.0 kg | −4.9 kg |

Plate geometry is the biggest single confound found in this whole
project: iron 20 kg ≈ 32 mm thick, bumpers ≈ 55 mm, so a bumper stack's
CG sits ~43 mm further outboard. **Iron rings 13.6% higher than bumpers
at identical mass.** Rubber damping is a red herring — the rubber body
tracks the hub quasi-rigidly below ~45 Hz; it is pure geometry.

**The fix (tested, `run_mitigation.py` + `run_plates.py`)**: calibrate the
(f1, f2) surface over (mass, effective CG offset) and solve both jointly.
Prior art: Dohn et al. 2007/2010 (cantilever mass sensing — *ratios* of
frequency shifts between modes depend only on position, mass cancels; two
modes is the minimum for two unknowns); Cawley & Adams 1979 (same maths
for damage localisation).

Residual two-mode error is ±4–8 kg on unseen configurations — good enough
to snap correctly on 10–20 kg grids, marginal at 2.5 kg. Tightening this
is the main algorithmic work item.

## 5. Scope: which lifts are actually covered

| Lift | Verdict |
|---|---|
| **Squat, bench, overhead press, rows racked** | **Covered.** Rack ring-down at unrack and re-rack, hands off, fixed J-hook span. 2+ free measurements per set. |
| **Deadlift from floor** | **Not covered by ring-down.** Plates rest on the ground, mass is grounded out, frequency goes load-independent at ~26–34 Hz. Needs a different observable (drop free-flight) or velocity-only. |
| **Cleans, snatches, anything caught** | Hard. Free-flight phases are load-independent; catches are impulsive. |
| **In-hands mid-rep** | **Different estimation problem, not a degraded one.** |

### Why in-hands is hard (quantified)
The reassuring bat literature ("hands damp but don't shift frequency")
does **not** transfer — bat modes are 90–230 Hz, far above hand-arm
resonance. The one study in *our* band (Chiementin 2019, golf club):

| Mode | Free-free | Strong grip | Weak grip |
|---|---|---|---|
| 1 | 45.3 Hz, ζ=1.0% | **2.03 Hz, ζ=24.2%** | 2.06 Hz, ζ=10.5% |

Gripped modes are *new hand-created boundary modes*, with damping 10–30×
free-free. Consequences: ring-down lasts under 0.5 s at firm grip;
half-power bandwidth ±0.6 Hz at 5 Hz; grip width alone swings frequency
4.5→12.7 Hz; and physiological tremor at 4–12 Hz continuously re-excites
the band. ISO 10068 hand-arm impedance is only defined **10–500 Hz** —
our whole band is below every standardised model.

**Design consequence: rack ring-downs are the measurement, full stop.**
Bench press is the easy case (rack available). Deadlift needs velocity.

## 6. The unexpected opportunity: the "boring" features are broken

Literature review of the VBT pipeline found the incumbents are weak
exactly where the dual-sensor geometry is strong.

| Device | Mean velocity SEE | Peak velocity SEE |
|---|---|---|
| GymAware (linear transducer, class leader) | 0.06 | 0.08 |
| Vmaxpro (bar IMU) | 0.08 | 0.11 |
| PUSH 2.0 | 0.12 | 0.15 |
| **Enode Pro** | 0.059 | **0.188** |
| bar-END vs midpoint placement penalty alone | 0.06 | 0.05 |

- **Peak velocity is universally poor and degrades with load** — backwards
  from what coaches need.
- **Rep detection fails where it matters**: Vmaxpro missed **14.1% of
  bench reps during 1RM testing**; Bar Sensei errored on 13% of attempts.
- **Bar path from IMU alone is unsolved**: the one honest attempt
  (MEMEA 2019) got ±30 cm on bench and could not recover squat/deadlift
  displacement at all. Even camera-vs-transducer ROM agreement is poor
  (ICC 0.236).
- A 2025 systematic review certified **only Vmaxpro, only back squat,
  only 75–95% 1RM**, and rated all 49 classification models high risk of
  bias.
- **An Apple Watch strapped to a barbell beat the purpose-built Enode Pro
  on every metric.** The algorithms are the bottleneck, not the hardware.
- **No open-source bar-IMU velocity pipeline exists.** The OSS landscape
  is all computer vision. Nothing to fork, nothing to compete with.

### The dual-IMU fix, tested (`run_velocity.py`)
Rigid-body mechanics: `a_end = a_mid + α×r + ω×(ω×r)`, and
`r_left = −r_right`, so averaging the two ends cancels both cross terms
geometrically rather than statistically. Canonical reference: **Padgaonkar
1975** (standard in crash-test instrumentation for 50 years).
**No prior art on barbells.**

| Metric | Single-end | Dual-end | Improvement |
|---|---|---|---|
| Mean velocity | 0.053 m/s | 0.056 m/s | none |
| **Peak velocity** | **0.122 m/s** | **0.065 m/s** | **1.9×** |

Mean velocity doesn't improve (tilt averages out over a full rep); peak
velocity does, because it samples the single instant where α×r bites
hardest. **0.065 m/s puts peak velocity at linear-transducer quality.**

Other open problems worth owning: set/rest detection (named as a gap by
the 2025 review), IMU+phone-camera fusion for bar path (camera gives
absolute scale from known plate diameter, IMU gives 100 Hz dynamics —
completely unclaimed), and rep detection at near-failure grinders.

## 7. Solving the "unknown bar" problem

Layered, and cheaper than expected.

**(a) The ratio trick — tested, `run_barlib.py` + `run_family.py`.**
Stiffness scales all modes equally, so it **cancels exactly** in the
loaded/empty frequency ratio (measured spread across bars: **0.0%**).
Tested against real census geometry: **97–100% exact-load identification
with zero user confirmations** for every bar sharing the reference tare
mass — a 28 mm Rogue Ohio, a 28.5 mm Texas, a 29 mm power bar and a
27 mm deadlift bar all invert correctly off one universal curve.
**It fails only on a different TARE MASS**: a 25 kg squat bar reads
−15 kg, a 15 kg women's bar +21 kg. Stiffness cancels; tare does not.

**(b) The tare mass is itself measurable — the pair closes.** The shape
feature `f(60 kg)/f(empty)` tracks tare mass almost perfectly and is
nearly blind to stiffness:

| Bar tare | Shape ratio | Spread |
|---|---|---|
| 15 kg | 0.6959 | — |
| **20 kg (four different bars)** | 0.7640–0.7652 | **0.0012** |
| 25 kg | 0.8155 | — |

Four bars of different diameters and spans agree to 0.001, while the
15/20/25 kg classes separate by ~0.05. Note this does *not* separate the
census's stiffness families (a 27 mm deadlift bar and a 29 mm power bar
share a tare mass, hence a shape ratio) — but tare mass is exactly the
parameter (a) is missing. **Empty ring-down cancels stiffness; light-load
shape ratio identifies tare; nothing is entered by the user.**

**(c) Bar geometry census — a small, discrete space.** Young's modulus is
~200 GPa for every barbell steel, so differences are pure geometry:
`EI ∝ d⁴`, compliance `∝ L³/EI`. Tensile-rating marketing (190k vs 205k
psi) is **irrelevant to stiffness** — it sets yield, not bend.

| Bar | d (mm) | Collar span | k rel | f rel |
|---|---|---|---|---|
| Women's 25 mm | 25.0 | 1309 | 0.555 | 0.745 |
| Rogue Ohio DL | 27.0 | 1422 | 0.589 | 0.767 |
| Texas DL | 27.0 | 1435 | 0.573 | 0.757 |
| Men's Olympic | 28.0 | 1309 | 0.873 | 0.934 |
| Texas PB Original | 28.5 | 1321 | 0.912 | 0.955 |
| **Power bar (baseline)** | 29.0 | 1311 | 1.000 | 1.000 |
| Texas Squat | 31.75 | 1460 | 1.040 | 1.020 |
| Rogue 32 squat | 32.0 | 1422 | 1.162 | 1.078 |
| EZ curl bars | 28.5–30 | ~800–850 | ~4.2 | **~2.0** |

Structural findings that matter for the library:
- **The span axis is nearly degenerate.** Almost everything sits at
  ~1308–1311 mm collar-to-collar; only deadlift and squat bars leave it
  (1422–1460 mm). A women's 2010 mm bar and a men's 2200 mm bar differ
  mainly in *sleeve* length (317 vs 415 mm), not grip span. So for most
  bars, f-vs-mass is a pure function of d⁴.
- **Four frequency families**: A "standard" (0.93–1.08, all 28/28.5/29 mm
  plus squat bars), B "whippy" (0.75–0.77, 25 mm women's *and* 27 mm
  deadlift), C EZ/short (~2.0, trivially separable), D **aluminium
  technique bars** (E ≈ 69 GPa → ~0.6× steel; the one case where
  "material doesn't matter" fails).
- **"IPF power bar" is not one calibration target.** The IPF rulebook
  specifies shaft 28–29 mm and span 1310–1320 mm as *ranges*, so two
  legal bars can differ **17.7% in tip stiffness**. Family A is 15% wide
  by nameplate alone, plus ~6% unit-to-unit variation (Chiu).
- **The IWF publishes no geometry at all** — only weights. Public specs
  come from licensed makers (Eleiko, ZKC, Rogue), which agree.
- **Collar-to-collar span is the least-published dimension** (it is the
  L³ term). Texas publishes it everywhere; Rogue on some SKUs; **Eleiko
  and Kabuki on nothing**, and Rogue omits it on the Ohio Bar and Bella
  2.0 — two of the most common bars in existence. Expect to measure it
  yourself for the library.
- Consequence: a nameplate-only library delivers only ~±10% mass
  accuracy. **One scalar per bar must be fitted** — which is exactly what
  (a) and (b) supply for free.

**(c) Acoustic bar fingerprinting — repositioned from load to identity.**
Audible modes (mode 5 ≈ 287 Hz) shift only **0.21%** across 60→100 kg but
**9.4%** for a 50 mm CG shift — useless for mass, ideal as a fingerprint.
Bar types separate cleanly at mode 5: 25 mm women's 256 Hz, 28 mm 287,
29 mm 297, 32 mm 328. This is a **standardised industrial method**
(NDT-RAM, ASTM E2001 / E3397-23, ASTM E1876 impulse excitation, ~1%
accuracy, 1–3 s per part). Product framing: **"tap your bar once to
register it"** — zero extra hardware, yields tare mass and stiffness
prior. Phone-mic caveats: mics high-pass at 50–100 Hz (killing modes
1–3), and voice-processing pipelines mangle transients — request
unprocessed capture.

**(d) Detect mismatch rather than average it away.** Fusion does **not**
rescue systematic bias (`run_combo.py`: on an unknown bar, fused accuracy
~4%, 80% of auto-logs wrong) because a confidently-wrong ±2 kg whip
estimate outvotes a ±17 kg velocity estimate. Standard fixes:
- **Novelty detection** on the modal signature (Farrar & Worden):
  Mahalanobis distance on {f1, f2, f2/f1, damping, end-amplitude ratio}
  vs the calibrated baseline. **f2/f1 is stiffness-invariant**, so it
  separates "new bar" from "plates moved".
- **NIS / χ² innovation gating** (Bar-Shalom): when whip and velocity
  disagree beyond their combined covariance, inflate the whip covariance
  or fall back to velocity-only — don't average.
- **Slope-and-bias correction** (chemometrics calibration transfer):
  1 confirmed point fixes scale, 2 fix scale+offset. Matches simulation:
  5 confirmed sets → 99% (`run_combo.py`).
- **Hierarchical Bayes over a bar fleet**: new bars start at the
  population mean with *wide honest uncertainty* — converting
  "confidently wrong" into "unsure, ask the user".

**Industrial proof this whole stack works**: Coriolis vibrating-tube
density meters (resonant frequency → fluid density) handle the same
mounting sensitivity with balanced twin tubes, temperature compensation,
and second-mode diagnostics — "Smart Meter Verification" literally
detects "this isn't the tube I calibrated". QCM-D does the same with
harmonic ratios plus dissipation.

## 8. Product architecture that falls out

- **States**: KNOWN BAR (silent auto-log) / SUSPECT (novelty test fired →
  one-tap confirm) / NEW BAR (velocity-only + wide bounds, recalibrate
  over ~5 confirmed sets, then promote).
- **The NEW BAR state should usually be skipped entirely.** If the app
  catches an empty-bar ring-down (§7a) plus one light set (§7b), the bar
  self-calibrates with no confirmations at all. Fall back to confirmed
  sets only when the bar is never seen empty — e.g. it was already loaded
  when tracking started.
- **Detect the loading sequence.** Warm-ups ascend, so early sets give the
  light-load points both calibrations want. Prompting "rack the empty bar
  for a second" during onboarding costs the user nothing and buys the
  entire calibration.
- Every confirmation calibrates *both* the bar curve and the user's
  velocity profile. Confirmations decay to zero at a home gym.
- Onboarding: "tap your empty bar to register it" (acoustic fingerprint +
  empty ring-down reference — solves bar ID and the ratio anchor at once).
- Free bonus features: mis-load alarm, always-current 1RM estimate,
  stick-point detection (published algorithm: Rum 2022 — Vmin between two
  velocity peaks), eccentric tempo (validates *better* than concentric on
  IMUs: Bar Sensei EPV r=0.95 vs CPV r=0.78).
- Evidence-backed coaching metric to lead with: **velocity loss %** — the
  only one with RCT backing (Pareja-Blanco et al. and successors).
  Caveat: attentional cueing changes the VL number, so the app's own
  feedback perturbs the metric.

## 9. Hardware plan

**Prototype (sensors on order)**: WT9011DCL-BT50 × 2 at **100 Hz/unit**
(2×200 Hz BLE is fragile on iOS; 100 Hz is 10× Nyquist for the whip band
and sufficient per the literature for MCV/ROM/tempo), bandwidth register
188 Hz + save + verify persistence, **ignore magnetometer/yaw entirely**
(steel bar), host timestamps + gap-aware resampling + per-unit clock
calibration, rack-impact cross-correlation for inter-unit sync. Gyro
transverse magnitude √(ωx²+ωy²) as the primary whip channel.

**Mount to the shaft/collar, not the rotating sleeve** where possible —
the sleeve rotates on bearings and the gyro will read plate spin. (But
note Eleiko's Sensor Barbell puts an Enode IMU *inside each sleeve*
behind the end cap — placement precedent exists.)

**Production path if validated**: 2× XIAO nRF52840 Sense (~$17/node),
LSM6DS3 at 400+ Hz internally to onboard flash, Nordic sub-µs radio
time-sync, multi-sample packets **with counters**, decimate and stream
100 Hz. Sub-millisecond inter-unit sync is a hard requirement — the
lever-arm solution differences two acceleration vectors, so sync jitter
maps straight into the differenced signal. No COTS unit under $600 gives
counter-stamped dual 200 Hz streams (Movella DOT has gold-standard sync
but caps at 60–120 Hz).

## 10. The decisive bench test (one afternoon)

**Before you go**: measure and write down the bar's **collar-to-collar
span** and shaft diameter with calipers. It is the L³ term, and most
manufacturers (Eleiko, Kabuki, and Rogue on its most popular SKUs) do not
publish it.

1. Configure both units (100 Hz, 188 Hz BW register saved, verified after
   a power cycle); measure the *actually delivered* rate with both
   streaming simultaneously to the phone.
2. **Empty-bar reference first** — strike and drop-rack the bare bar ×5.
   This is the ratio-trick anchor and the acoustic fingerprint, and it is
   a known 20 kg calibration point for free.
3. Bushing bar, clamped collars, **iron plates**. Load 60/100/140/180 kg.
   At each: strike in rack, drop-rack ×3, one rep ending in a re-rack.
   The 60 kg point doubles as the tare-mass shape-ratio reference.
4. Process: gap-aware resample → gyro DIFF channel → band-pass 2–12 Hz →
   tracked interpolated FFT. Expect one clean line marching ~9 → ~4 Hz.
   **This step alone validates or kills the product.**
5. Then the confound sweep, one variable at a time: loose collars,
   **bumper plates** (the biggest confound — expect ~14% lower frequency
   at identical mass), needle-bearing bar, plates slid outboard, and an
   **end-strike** (excites mode 2 on the SUM channel, which the two-mode
   inversion needs).
6. Free extra experiment, 10 minutes, phone only: **strike a bare bar and
   a loaded bar, record with the phone mic, FFT.** Mode 5 at ~347 Hz means
   plates are acoustically decoupled; ~288 Hz means coupled. Nobody has
   ever measured this, and it settles risk #2 below.
7. Fit m(f1, f2), compare residuals to this simulation's error budget,
   and check the empty/loaded ratio against the universal curve.

## 11. Open risks and unknowns

Ordered by risk to the product. Items 1–3 are the ones that could still
kill the vibration route.

1. **No Hz-vs-load curve for a loaded barbell has ever been published,
   for any lift.** The entire premise rests on a curve nobody has
   measured. Langlois & Russell have it and haven't released numbers —
   **emailing them is the highest-value action available.**
2. **Plate-to-sleeve contact stiffness / decoupling frequency.** Two
   computable bounds ~20% apart; settled in ten minutes with a phone mic
   (step 6 above).
3. **Sleeve bearing/bushing transmission** of shaft bending to a
   sleeve-mounted sensor. Langlois's headline finding — sleeve coupling
   dominates bar-to-bar modal behaviour — cuts both ways here.
4. Residual two-mode inversion error (±4–8 kg on unseen plate/collar
   configurations) — fine for 10–20 kg grids, marginal at 2.5 kg. Main
   algorithmic work item.
5. Grip-width and grip-force dependence of whip — blocks in-hands work,
   and hand-arm impedance below 8 Hz is a genuine standards gap.
6. Plate rattle nonlinearity; collar-torque effects; bumper vs iron
   damping — all unmeasured, all directly measurable with this rig.
7. WT9011 delivering 2×100 Hz reliably; gyro dead-band clamping small
   ring-down tails.
8. Whether the deadlift drop free-flight window carries any usable
   signal (the only remaining path to floor-lift coverage).

**Retired risks** (previously listed, now addressed): the unknown-bar
problem (§7a/b self-calibration, tested); bar-to-bar stiffness spread
(cancels in the empty/loaded ratio); plate-type confound (two-mode
inversion, tested); BLE packet loss corrupting frequency (gap-aware
resampling, tested).

## 12. Key citations

**Physics/modal**: Langlois & Russell, ASA 190 paper 3aNS8 (2026);
Chiu 2010 JSCR 24(9):2390 (static bending, no hysteresis); Chiu 2008
(end-vs-centre speed); Dohn et al., Rev. Sci. Instrum. 78:103303 (2007)
and Appl. Phys. Lett. 97:044103 (2010) (multimode mass+position); Cawley
& Adams, J. Strain Analysis 14(2) (1979); Chiementin et al., Appl. Sci.
9:2050 (2019) (gripped club modes); Cross, Sports Eng. 4:1 (2001) (added
mass on rackets); Mamiy & Polyakov (2014) (barbell k, Q).

**Estimation**: Farrar & Worden, *SHM: A ML Perspective* (Wiley 2013);
Bar-Shalom, Li & Kirubarajan (Wiley 2001) (NIS gating, IMM); Workman,
Appl. Spectrosc. (2018) (calibration transfer); Gelman & Hill (2007)
(hierarchical partial pooling); Padgaonkar, Krieger & King, J. Appl.
Mech. (1975) (angular acceleration from linear accelerometers).

**VBT**: Rum et al., Sensors 22:9904 (2022) (the one disclosed method
paper); Fritschi, Seiler & Gross, IJERPH (2021) (placement effects);
PLOS ONE 2025 systematic review; Sports Medicine 2025 classification
review; Abbott 2020 (Bar Sensei); Achermann 2023 (Apple Watch vs Enode);
Thompson 2023 (LVP meta-analysis, SEE 9.8 %1RM); Banyard 2017;
Sánchez-Medina & González-Badillo 2011 (velocity loss).

**Standards/industry**: ASTM E2001, E3397-23 (resonant acoustic
inspection), E1876 (impulse excitation); ISO 10068 (hand-arm impedance,
10–500 Hz); US10132674 (cargo mass from vibration frequency);
US20170128765A1, US20170266490A1 (both abandoned).

**Bar geometry**: IPF 2026 Technical Rulebook (publishes shaft 28–29 mm,
collar span 1310–1320 mm **as ranges**); IWF TCRR 2025 (weights only — no
geometry published anywhere); manufacturer spec pages (Rogue, Texas
Power Bars, Eleiko, REP, Titan, York). Note Kabuki's site is offline
(Wayback only) and Crain's Okie DL specs are third-party only.

**Papers worth buying/pulling**: Zhang et al. 2024, DOI
10.1007/s11036-024-02293-0 (only direct barbell IMU velocity/displacement
method paper, paywalled); Jon & Rim 2025, DOI 10.1002/eng2.13042 (bar k
and c from shoulder oscillation — free in a browser, bot-walled to
scrapers); Chiu 2010 Table 4 (per-bar stiffness, paywalled).

---

## 13. Lift recognition: auto-detecting which exercise is being performed

*(Added 2026-08-11, sixth research wave: seven parallel literature/market/
patent sweeps, 127 unique source documents (~115 distinct works); full
source list in Appendix B.)*

Question: can the two bar-end IMUs tell **which lift** is being performed
(squat vs bench vs deadlift vs press vs row vs Olympic lifts), so the app
can auto-log without the user selecting an exercise?

**Answer: yes, and it is far more tractable than the weight-estimation
problem.** Exercise-type recognition from a single 6-axis IMU is
solved-in-the-lab at the class counts we need; nobody has shipped it from
a bar-mounted sensor; and the bar's own physics hands us most of the
classifier for free. The catch is the same one the whole HAR literature
trips over: the hard part in the wild is not telling squat from bench, it
is telling *exercise* from *everything else* (re-racking, plate loading,
walking the bar out).

### 13.1 Competitive state: the feature does not exist on the bar

- **No bar-mounted product does cold-start exercise classification.** The
  closest is GymAware FLEX's "Exercise Assist," which *learns each
  athlete's* pattern per exercise and then flags mismatches — a per-user
  warning system, not recognition. Enode/Vmaxpro, PUSH, Beast, RepOne,
  Vitruve, Bar Sensei, Output: all require manual exercise selection; the
  2026 VBT buyers' guides barely mention auto-detection.
- **Wrist wearables do it and users hate the results.** Garmin's native
  exercise guessing is the most-complained-about feature in its strength
  mode (shoulder press logged as pull-ups; TechRadar: "improve or scrap
  it"). Apple Watch still has no native rep/exercise detection in 2026 —
  third-party apps score ~3/5, "not reliable enough to replace intentional
  logging." Whoop only detects that "weightlifting happened." Atlas
  Wearables built a 70-exercise wrist classifier a decade ago — reviews
  said "sometimes magic," misidentified freestyle work, and the company
  folded.
- The one peer-reviewed wrist system on the big three (StrengthControl,
  Apple Watch): 88.4% overall, but squat only 76.5% — at the wrist, a
  squat is easily confused with other hip hinges. **The bar sees exactly
  what the wrist cannot**: the implement's own path, which is the thing
  that differs between lifts.
- Platform APIs won't commoditise this soon: neither Apple's nor Google's
  health SDKs expose barbell exercise classification or rep primitives.

### 13.2 What the literature establishes (body-worn, transfers with caveats)

- **Accuracy at our class counts is high.** RecoFit (CHI 2014, 114–200
  users, arm-worn): 99/98/96% on 4/7/13 exercise classes, user-independent.
  O'Reilly (82 subjects): 98% on 5 barbell/lower-limb exercises from ONE
  shank IMU. A 2025 study classified exactly our five target lifts
  (squat/bench/deadlift/OHP/row) from a single 6-axis sensor at >90%.
  Fifty-class problems drop to ~92% (CNN); beyond ~30 fine-grained classes
  a lone IMU saturates.
- **The canonical architecture is three stages**: (1) segment exercise vs
  non-exercise (periodicity/autocorrelation is the strongest cue),
  (2) classify the segmented set, (3) count reps. Segment-then-classify
  beats sliding-window classification on continuous gym sessions.
- **The null class is the real problem.** In-the-wild, ~95% of samples are
  non-exercise; naive models collapse (F1 ≈ 0.5). MyoGym is 77% NULL.
  Published accuracies mostly assume manual segmentation — treat every
  reported number as an upper bound. What works: an explicitly *trained*
  null class (plate loading, re-racking, walking), temporal smoothing as
  postprocessing, and confidence thresholding / open-set rejection.
  A bar sensor shrinks this problem structurally: **bar not moving = null**
  covers most of a gym session, and nobody curls the bar rack.
- **Expect a 5–15 pp drop from subject-dependent to subject-independent**
  (e.g. 98.3% → 89.0% real-time on new users). Evaluate leave-one-subject-
  out from day one. Exercise-*type* recognition is fairly user-independent
  (inter-exercise variance > inter-subject variance); technique/form
  scoring is strongly user-dependent and needs personalisation — keep the
  two problems separate.
- **Sensor rate/axes are a non-issue**: reviews find accelerometer-only at
  20 Hz suffices for classification. Our 2×100 Hz is sized for the whip
  band, and recognition rides along free.
- **No academic precedent for dual bar-end recognition.** The nearest
  published analogs are a dumbbell-mounted IMU in a fusion study (86–91%)
  and ERICA (SenSys 2020, IMU on the dumbbell). The differential signal
  (end-to-end tilt, anti-phase transverse motion) is unexplored for
  classification — same unclaimed-territory pattern as the whip result.

### 13.3 The bar's physics does most of the classifying

From the bar-path/VBT biomechanics literature, the discriminative structure
available at the bar, roughly in order of power:

1. **Start condition.** Conventional deadlift is the only major lift that
   begins from a true dead stop at floor height: quiet gravity-only
   window → concentric-first rep → floor-impact spike between reps.
   Everything racked (squat/bench/press) begins with an unrack transient,
   a settle, and an eccentric-first rep. RDL: eccentric-first from
   standing, *no* floor impacts. This single feature family nearly
   partitions the catalogue.
2. **Walkout signature.** Squats add 2–4 steps of low-amplitude horizontal
   jitter and bar yaw between unrack and first rep; bench has none
   (J-hooks to first rep directly). The two bar-end sensors see walkout
   yaw as **anti-phase transverse acceleration** — a dual-IMU-exclusive
   feature.
3. **Vertical ROM and absolute bar height.** Squat descent path ≈ 1.25 m;
   deadlift floor-to-lockout only; OHP goes *above* standing shoulder
   height; sumo pulls 20–40% shorter than conventional; snatch peak height
   0.89–1.17 m plus a 0.13–0.17 m catch drop.
4. **Path shape.** Bench has a sustained toward-the-head horizontal
   acceleration component (the J-curve) absent in squat/deadlift;
   Olympic lifts trace a multi-inflection horizontal S-loop plus catch
   drop that is unmistakable at 100 Hz.
5. **Velocity envelope + tempo.** Deadlift is the slowest of the big
   three at limit loads (MPV ~0.15 m/s at 1RM vs squat ~0.25); Olympic
   lifts are categorically faster (snatch peak 1.65–2.28 m/s). Caveat:
   squat and bench MPV at matched %1RM nearly overlap — velocity alone
   cannot separate them; it needs features 1–4.
6. **Dip counting for the overhead family.** Strict press: no dip; push
   press: one pre-drive dip; push jerk: dip + re-dip. Their kinetics are
   otherwise identical — the dip count *is* the discriminator.
7. **Roll and tilt.** End-to-end vertical-velocity difference measures
   lateral bar tilt (bench shows more independent-hand tilt than
   back-coupled squat). Caveat from the sleeve-coupling finding in §2:
   sensors on the sleeves see bearing spin — roll-axis gyro is partly
   decoupled from lift mechanics and spikes at snatch/clean turnover.
   Treat roll as an event detector, not a continuous feature.

**Hard pairs** (bar motion alone genuinely underdetermines): front vs back
squat (~5–10 cm start-height difference is the main lever), flat vs
incline bench (MPV differs by 0.02–0.05 m/s — near-indistinguishable),
high- vs low-bar squat, RDL vs stiff-leg vs good morning. Product answer:
classify to the group, let the user disambiguate once, remember their
default (which is also exactly GymAware's per-user trick, applied only
where physics runs out).

### 13.4 Recommended recognition architecture

1. **Stage 0 — activity gating**: bar stationary (rack/floor) = null.
   Free, robust, bar-exclusive.
2. **Stage 1 — set segmentation**: autocorrelation-based periodicity
   detection, exercise-period precision/recall >95% is the published bar.
3. **Stage 2 — classification**: start with windowed statistical +
   frequency features (means, RMS, energy, dominant frequency, axis
   correlations, autocorrelation period) + event features from §13.3
   (start condition, floor impacts, dip count, ROM, walkout) into a
   random forest / gradient boosting. This class of pipeline is what hit
   96–99% in RecoFit and >90% on our exact five lifts. Add MiniRocket as
   the second iteration — near-SOTA on small data, and it has been run on
   a Cortex-M in 7 kB flash / 3 kB RAM at <15 µW, i.e. it fits the
   Stage-1-hardware nRF52840 with room to spare. Deep models (1D-CNN,
   InceptionTime) only after thousands of labelled sets; on 20-subject
   LOSO benchmarks classical features matched CNNs anyway.
4. **Stage 3 — rep counting**: autocorrelation period + peak detection
   with period-based rejection (±1 rep in 93% of sets, RecoFit), plus
   zero-velocity updates between reps — the bar is stationary at lockout/
   floor, a drift reset body-worn sensors don't get.
5. **Orientation robustness**: mount rotation is arbitrary → use
   magnitudes, the gravity-aligned vertical axis, and differential-
   quaternion features (random orientation costs ~32 pp raw; Earth-frame
   features recover to within ~5 pp).
6. **Confidence honesty**: classify to group when the posterior is flat
   (front/back squat), ask once, personalise thereafter.

### 13.5 Data situation and plan

- **No public bar-mounted dataset exists.** Every public corpus is
  body-worn. This is a moat *and* a cost: we must collect our own, but so
  must anyone else, and we'll have the only labelled bar-end corpus.
- Pretraining/prototyping corpora (wrong placement, right dynamics):
  RecoFit (200+ participants, forearm — repo archived June 2026,
  **download it now**), MyoGym (30 exercises + NULL, via Oulu authors),
  MM-Fit (multimodal, Zenodo), RecGym (50 h in-gym incl. NULL,
  CC-BY-4.0 — commercial-friendly), Ebbelaar's tracking-barbell-exercises
  (exactly our five lifts at the wrist; best label match; code + data
  open). **Licence watch**: WEAR is CC BY-NC-SA — not usable commercially;
  IEEE DataPort items are often paywalled.
- Label-cheap routes when we do collect: template/DTW methods reach 95%
  with ONE recorded example per exercise (ExerSense) — a plausible v0
  that ships before any big corpus exists; self-supervised pretraining on
  our own unlabelled gym recordings (LIMU-BERT-style), or fine-tuning the
  open-weights UK-Biobank accelerometer ResNet (+24 pp median F1 on small
  datasets).
- Rough scale expectations from the literature: 10–20 subjects × a few
  sets per lift ≈ 90%+ LOSO on 5–15 classes; ~100–200 people is what
  pushed RecoFit to 96–99%.
- **Every Stage-0 whip session doubles as a recognition session**: the
  §10 bench-test protocol already has us logging squats/bench/deadlifts
  at varying loads — label them and the classifier corpus starts free.

### 13.6 Patent landscape (rough non-lawyer read)

- **Wrist/body-worn classification is crowded; bar-mounted is not.** Every
  bar-mounted-sensor filing found is abandoned (Smart Barbell
  US20170128765A1; iLift smart collar US20170266490A1), expired (rack
  free-weight monitor US7455621B1), or ceased (Peloton WO2024064703A1,
  camera-based anyway).
- **The one real FTO watch item: Microsoft US9174084B2** (the RecoFit
  patent, active to ~2033): a *wearable* apparatus that auto-segments and
  classifies exercise from accelerometer + ML. A bar-mounted sensor is
  arguably not "wearable" — plausible design-around, but this deserves a
  proper claim-construction read (plus its EP family) before launch.
  Secondary: Bosch US8500604B2, US11794074B2, GestureLogic US10575760B2 —
  all explicitly body-worn.
- **VBT incumbents hold no relevant IP found** (GymAware, Beast, Vmaxpro,
  PUSH/WHOOP — WHOOP's filings are physiological, Atlas's are design-only).
- **Cuts both ways**: abundant 2014–2025 prior art (RecoFit paper+dataset,
  >90% barbell-classification papers) means broad claims on "classify lift
  from bar IMU" are probably ungettable for anyone — good FTO, weak
  offensive IP. The patentable angle remains the **dual-IMU whip/
  deflection methods** (§2–§7), where nothing was found.
- Caveats: Google Patents front pages only; no claim charts; applications
  <18 months old are invisible; non-US not systematically checked.

### 13.7 Open questions specific to us

1. Does sleeve bearing spin corrupt more than the roll axis in practice
   (it rides on the same mount as the whip measurement)?
2. How much does the dual-end differential signal actually add over one
   sensor for classification (unexplored in any literature)?
3. Dumbbell mode: everything above is barbell-path reasoning; dumbbell
   exercises reintroduce the wrist-like ambiguity problem.
4. Warm-up vs working set boundaries (the top real-world complaint about
   every shipping auto-logger) — velocity + load context may make this
   tractable for us where it isn't at the wrist.

---

## Appendix: next actions

1. **Email jgl5306@psu.edu and dar119@psu.edu** for the ASA-190
   frequency-vs-load dataset. Highest value per minute of any action here.
2. Download Jon & Rim 2025 (free in a browser) for measured bar spring
   and damping constants.
3. Order/borrow **both iron and bumper plates** plus clamped collars for
   the bench test — plate type is the largest confound in the project.
4. Run the §10 protocol. Steps 1–4 decide the product; step 6 costs ten
   minutes and settles a question nobody has ever answered.
5. Scope the MVP to **rack lifts** (squat, bench, press). Deadlift needs
   the velocity route; in-hands mid-rep is out of scope for v1.
6. Build the velocity pipeline in parallel regardless — §6 shows it is a
   defensible product on its own, and it is the fallback load estimator.

---

## Appendix B: lift-recognition sources (research wave 6)

127 unique source documents consulted across the seven sweeps of research
wave 6 (a handful are the same work at a second host or the code/data
companion of a paper; ~115 distinct works). Grouped by theme.

### Exercise recognition — core academic (25)

1. RecoFit: find, recognize, count repetitive exercises (CHI 2014) — https://www.microsoft.com/en-us/research/publication/recofit-using-wearable-sensor-find-recognize-count-repetitive-exercises/
2. RecoFit paper, ACM DL version consulted separately — https://dl.acm.org/doi/10.1145/2556288.2557116
3. MyoGym open gym dataset (ISWC 2017) — https://dl.acm.org/doi/10.1145/3123024.3124400
4. Tracking Free-Weight Exercises (UbiComp 2007) — https://link.springer.com/chapter/10.1007/978-3-540-74853-3_2
5. Um et al., CNN on 50 gym exercises (arXiv 1610.07031) — https://arxiv.org/abs/1610.07031
6. Seven Things to Know about Exercise Classification (IEEE JBHI 2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11284806/
7. Sensor-Based Gym Exercise Recognition, 42 classes chest accel (Sensors 2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9002367/ (MDPI: https://www.mdpi.com/1424-8220/22/7/2489)
8. Gym recognition with data fusion incl. dumbbell IMU (ICBBS 2021) — https://dl.acm.org/doi/fullHtml/10.1145/3469678.3469705
9. Soro et al., CrossFit recognition + rep counting CNN (Sensors 2019) — https://www.mdpi.com/1424-8220/19/3/714 (PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC6387025/)
10. MiLift smartwatch workout tracking (IEEE TMC 2017) — https://ieeexplore.ieee.org/document/8118128/
11. O'Reilly et al., lower-limb exercise detection, one shank IMU (JSCR 2017) — https://www.ovid.com/jnls/nsca-jscr/pdf/10.1519/jsc.0000000000001852~technology-in-strength-and-conditioning-tracking-lower-limb
12. Wearable inertial systems for lower-limb exercise: systematic review (Sports Med 2018) — https://link.springer.com/article/10.1007/s40279-018-0878-4
13. IMU classification of resistive exercise on the ISS (PLoS ONE 2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10414632/
14. Automatic squat-posture classification (Sensors 2020) — https://pubmed.ncbi.nlm.nih.gov/31936407/
15. Subject-independent deadlift technique errors (Smart Health 2026) — https://www.sciencedirect.com/science/article/abs/pii/S2352648326000243
16. Formulift thigh-IMU biofeedback evaluation (JMIR mHealth 2018) — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5812980/
17. NULL-class impact on in-the-wild HAR (Sensors 2024) — https://www.mdpi.com/1424-8220/24/12/3898 (PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC11207638/)
18. ExerSense placement-robust recognition (Sensors 2021) — https://www.mdpi.com/1424-8220/21/1/91 (arXiv: https://arxiv.org/abs/2004.10026)
19. Complete gym-exercise detection with smartphone sensors (2020) — https://onlinelibrary.wiley.com/doi/10.1155/2020/6471438
20. Free-weight recognition via DTW (2013) — https://link.springer.com/chapter/10.1007/978-3-642-37105-9_20
21. CNN-ResBiGRU on MyoGym, EMG+IMU (MDPI ASI 2024) — https://www.mdpi.com/2571-5577/7/4/59
22. Deep CNN-LSTM with self-attention for HAR (IEEE JTEHM 2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9252338/
23. Workout recognition + rep counting, chest CNN (IWANN 2019) — https://link.springer.com/chapter/10.1007/978-3-030-20521-8_29
24. StrengthControl smartwatch validation, big three at the wrist (2021) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8471343/
25. Wearables vs video for exercise classification (arXiv 2307.04516) — https://arxiv.org/abs/2307.04516

### Datasets (18)

26. MM-Fit dataset site — https://mmfit.github.io/
27. MM-Fit IMWUT paper — https://dl.acm.org/doi/10.1145/3432701
28. MM-Fit starter repo — https://github.com/KDMStromback/mm-fit
29. Microsoft RecoFit dataset repo — https://github.com/microsoft/Exercise-Recognition-from-Wearable-Sensors
30. MyoGym via ResearchGate (access route) — https://www.researchgate.net/publication/319603676_MyoGym_introducing_an_open_gym_data_set_for_activity_recognition_collected_using_myo_armband
31. MyoGym via Semantic Scholar (access route) — https://www.semanticscholar.org/paper/MyoGym:-introducing-an-open-gym-data-set-for-using-Koskim%C3%A4ki-Siirtola/ad12b1caf7125f4dad1035f7b412f776dfb7447f
32. WEAR dataset site — https://mariusbock.github.io/wear/
33. WEAR paper (arXiv) — https://arxiv.org/abs/2304.05088
34. Velloso et al., Weight Lifting Exercises dataset paper (AH'13) — https://www.collaborative-ai.org/publications/velloso13_ah.pdf
35. ERICA dumbbell+earable dataset (SMU) — https://researchdata.smu.edu.sg/articles/dataset/Earable_IoT_Dataset_from_ERICA_-_Enabling_real-time_mistake_detection_corrective_feedback_for_free-weights_exercises/13114661
36. ERICA dataset repo — https://github.com/ericasensys/erica-dataset
37. RecGym dataset site — https://zhaxidele.github.io/RecGym/
38. RecGym on Kaggle — https://www.kaggle.com/datasets/zhaxidelebsz/10-gym-exercises-with-615-abstracted-features
39. Gym Gesture Classification IMU dataset (IEEE DataPort) — https://ieee-dataport.org/documents/gym-gesture-classification-using-imu-sensor-dataset
40. MEx multimodal exercise dataset (IEEE DataPort) — https://ieee-dataport.org/open-access/mex-multi-modal-exercise-dataset
41. StrengthSense dataset (arXiv 2511.02027) — https://arxiv.org/abs/2511.02027
42. Gym Workout IMU Dataset (Kaggle, Apple Watch SE) — https://www.kaggle.com/datasets/shakthisairam123/gym-workout-imu-dataset
43. Awesome-IMU-Sensing curated list — https://github.com/rh20624/Awesome-IMU-Sensing
44. Fitness Tracker accel+gyro data (Kaggle mirror) — https://www.kaggle.com/datasets/krishujeniya/fitness-tracker-accelerometer-and-gyroscope-data

### Commercial products & validations (21)

45. GymAware FLEX product page — https://gymaware.com/product/flex-barbell-tracker/
46. GymAware FLEX Exercise Assist doc — https://gymaware.zendesk.com/hc/en-us/articles/6947870249743-FLEX-Exercise-Assist
47. Enode.ai — https://enode.ai/
48. Enode/Vmaxpro review (Sprinting Workouts) — https://sprintingworkouts.com/blogs/training-equipment/enode-vmaxpro-review
49. Enode/Vmaxpro reliability & sensitivity study — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11676481/
50. Vmaxpro accuracy evaluation (PubMed 38188099) — https://pubmed.ncbi.nlm.nih.gov/38188099/
51. PUSH Band 2.0 rep-counting validation (JMPB) — https://journals.humankinetics.com/view/journals/jmpb/6/4/article-p289.xml
52. PUSH Band 2.0 squat validity (SAGE) — https://journals.sagepub.com/doi/10.1177/17543371211024018
53. Bar Sensei reliability/validity (MDPI Sports) — https://www.mdpi.com/2075-4663/7/11/230
54. VBT device placement/validity comparison (Sports 2021) — https://doi.org/10.3390/sports9090123
55. Metric VBT app validation (PeerJ) — https://peerj.com/articles/17789/
56. VBT devices buyers guide 2026 (VBTcoach) — https://vbtcoach.com/blog/velocity-based-training-devices-buyers-guide/
57. Beast Sensor review (Garage Gym Reviews) — https://www.garagegymreviews.com/beast-sensor-review
58. Output Sports drop-jump validity — https://pmc.ncbi.nlm.nih.gov/articles/PMC9620392/
59. Apple Watch rep-counter app roundup (Riven) — https://riven.fit/blog/best-automatic-rep-counter-apps-apple-watch
60. Whoop workout detection doc — https://www.whoop.com/us/en/thelocker/how-whoop-detects-and-labels-your-workouts-activities/
61. Garmin forums: wrong exercise detected — https://forums.garmin.com/sports-fitness/running-multisport/f/forerunner-965/353939/strength-activity-profile-detects-the-wrong-exercise
62. TechRadar: Garmin strength mode critique — https://www.techradar.com/features/why-garmins-strength-training-mode-needs-to-be-improved-or-scrapped
63. AppleInsider: Atlas Wristband 2 review — https://appleinsider.com/articles/16/07/17/review-atlas-wristband-2-makes-some-improvements-but-not-enough
64. Samsung Galaxy Watch weightlifting guide (MyHealthyApple) — https://www.myhealthyapple.com/a-complete-guide-to-weightlifting-and-strength-training-using-the-samsung-galaxy-watch/
65. New Atlas: Moov Now review — https://newatlas.com/moov-now-sports-coach-review/41114/

### ML methods (17)

66. ROCKET (arXiv 1910.13051) — https://arxiv.org/abs/1910.13051
67. MiniRocket (2021) — https://www.researchgate.net/publication/353908279_MiniRocket_A_Very_Fast_Almost_Deterministic_Transform_for_Time_Series_Classification
68. MiniRocket on ultra-low-power MCU (ETH 2023) — https://www.research-collection.ethz.ch/server/api/core/bitstreams/b5bd8918-f595-4997-b36d-20649b13816f/content
69. InceptionTime (arXiv 1909.04939) — https://arxiv.org/abs/1909.04939
70. Scaling-FCN IMU fitness CNN vs classical, LOSO (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10857166/
71. DTW template recognition of locomotion (2021) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8067979/
72. Few-shot rep counting for unseen exercises (arXiv 2410.00407) — https://arxiv.org/abs/2410.00407
73. Hi-OSCAR open-set HAR (arXiv 2510.08635) — https://arxiv.org/abs/2510.08635
74. Orientation-invariant HAR via differential quaternions (2018) — https://pmc.ncbi.nlm.nih.gov/articles/PMC6111613/
75. Yuan et al., SSL on 700k person-days (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11015005/
76. OxWearables ssl-wearables code — https://oxwearables.github.io/ssl-wearables/
77. LIMU-BERT (SenSys 2021) — https://tanrui.github.io/pub/LIMU_BERT.pdf
78. IMU2CLIP (arXiv 2210.14395) — https://arxiv.org/abs/2210.14395
79. Virtual IMU data from videos for HAR (2021) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8707382/
80. On-device few-shot HAR personalization (arXiv 2508.15413) — https://arxiv.org/abs/2508.15413
81. Cross-domain few-shot HAR (arXiv 2310.14390) — https://arxiv.org/pdf/2310.14390
82. SSL for accelerometer HAR: survey (ACM 2024) — https://dl.acm.org/doi/10.1145/3699767

### Bar kinematics & biomechanics (18)

83. Snatch bar trajectory survey, Worlds/Pan-Am (2020) — https://pmc.ncbi.nlm.nih.gov/articles/PMC7552656/
84. Back squat kinematics across loads (Frontiers 2024) — https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1454309/full
85. Intensity/fatigue effects on SBD: systematic review (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12521083/
86. Load-velocity of full squat and bench (2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9180020/
87. Deadlift minimal velocity thresholds (2017) — https://pmc.ncbi.nlm.nih.gov/articles/PMC5968962/
88. Flat vs incline bench load-velocity (2025) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12274453/
89. Snatch vs clean, wearable IMUs (PAAH 2024) — https://paahjournal.com/articles/10.5334/paah.306
90. Snatch vs clean in elite lifters (J Biomech 2025) — https://www.sciencedirect.com/science/article/abs/pii/S0021929025006189
91. Sumo vs conventional deadlift 3D analysis (2000) — https://pubmed.ncbi.nlm.nih.gov/10912892/
92. Conventional vs Romanian deadlift (2019) — https://pubmed.ncbi.nlm.nih.gov/30662500/
93. Front vs back squat biomechanics (2012) — https://www.researchgate.net/publication/258363730_A_biomechanical_Analysis_of_front_and_back_squat_injury_implications
94. Overhead press variants kinetics (Sports Biomech 2021) — https://www.tandfonline.com/doi/abs/10.1080/14763141.2021.1993983
95. Eccentric-phase duration effects (2019) — https://pubmed.ncbi.nlm.nih.gov/31418323/
96. GymAware velocity zones — https://gymaware.com/velocity_zones/
97. Barbell exercise classification + rep counting (Springer LNCS 2025) — https://link.springer.com/chapter/10.1007/978-981-96-7742-9_17
98. IMU fitness recognition CNN at 100 Hz (Sensors 2024) — https://www.mdpi.com/1424-8220/24/3/742
99. EnodePro validity, bench + squat (2025) — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11769546/
100. Asymmetric-load barbell squats (2024) — https://pmc.ncbi.nlm.nih.gov/articles/PMC12946874/
101. Barbell velocity IMU systematic review (Sensors 2021) — https://pmc.ncbi.nlm.nih.gov/articles/PMC8038306/
102. Apple Watch barbell velocity validity (2023) — https://pmc.ncbi.nlm.nih.gov/articles/PMC10383699/
103. Paralympic bench press bar-IMU velocity validation (Sensors 2022) — https://doi.org/10.3390/s22249904

### Practitioner / open source (11)

104. daveebbelaar/tracking-barbell-exercises — https://github.com/daveebbelaar/tracking-barbell-exercises
105. Veto2922 reimplementation — https://github.com/Veto2922/Fitness-tracker-based-on-ML-2
106. OpenBarbell V3 — https://github.com/squatsandsciencelabs/OpenBarbell-V3
107. OpenBarbell build log (Hackaday.io) — https://hackaday.io/project/3706-openbarbell
108. Wojtek120 IMU bar velocity — https://github.com/Wojtek120/IMU-velocity-and-displacement-measurements
109. KevinAiken/Smart-Bar — https://github.com/KevinAiken/Smart-Bar
110. kostecky/VBT-Barbell-Tracker — https://github.com/kostecky/VBT-Barbell-Tracker
111. bartkowiaktomasz BiLSTM fitness classification — https://github.com/bartkowiaktomasz/fitness-activity-classification-with-lstms
112. namanarora42/DeepFit — https://github.com/namanarora42/DeepFit
113. Android Health Services ExerciseClient docs — https://developer.android.com/health-and-fitness/health-services/active-data

### Patents & IP landscape (14)

114. US9174084B2, Automatic exercise segmentation and recognition (Microsoft, 2015) — https://patents.google.com/patent/US9174084B2/en
115. US7455621B1, Free-weight exercise monitoring (expired 2025) — https://patents.google.com/patent/US7455621
116. US20110092337A1 / US8500604B2, Bosch wearable strength-training monitor — https://patents.google.com/patent/US20110092337A1/en
117. US20170128765A1, Smart Barbell (abandoned) — https://patents.google.com/patent/US20170128765A1/en
118. US20170266490A1, iLift smart collar (abandoned) — https://patents.google.com/patent/US20170266490A1/en
119. US11794074B2, Exercise type recognition, body-worn (2023) — https://patents.google.com/patent/US11794074B2/en
120. WO2024064703A1, Peloton rep counting via video (ceased) — https://patents.google.com/patent/WO2024064703A1/en
121. US10575760B2, GestureLogic activity recognition — https://patents.google.com/patent/US10575760B2/en
122. US20170266494A1 / US10653918B2, Nike mobile fitness monitoring — https://patents.google.com/patent/US20170266494A1/en
123. US20160354014A1 / US10881327B2, 3M accelerometer activity classification (expired) — https://patents.google.com/patent/US20160354014A1/en
124. US20180021616A1 / US10661112B2, Tonal digital strength training — https://patents.google.com/patent/US20180021616A1/en
125. US11051720B2, Apple constrained-arm fitness tracking — https://patents.google.com/patent/US11051720B2/en
126. USD725512S1, Atlas Wearables design patent — https://patents.google.com/patent/USD725512S1/en
127. SimpliFaster VBT buyer's guide (patent-landscape context) — https://simplifaster.com/articles/buyers-guide-velocity-based-training-systems/

