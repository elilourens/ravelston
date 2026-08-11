# Ravelston — Findings

Can two bar-end IMUs (WitMotion WT9011DCL-BT50) measure how much weight is
loaded on a barbell — and what else does the dual-sensor geometry buy?

Sources: five waves of literature/market/patent/hardware research, plus
eight simulation experiments in this repo (`run_all`, `run_dual`,
`run_combo`, `run_mitigation`, `run_barlib`, `run_velocity`, `run_plates`,
`run_family`; raw numbers in the matching `results_*.md`).

Research brief with citations (rounds 1–2 only; this file supersedes it):
https://claude.ai/code/artifact/cfe73a9e-6312-4f67-b8ee-b6d1dcb7bfd6

Status: research phase complete, hardware pending. Last updated after the
bar-geometry census and the self-calibration result.

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
