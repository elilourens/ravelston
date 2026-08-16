# Kinematics Pipeline

What has to happen between a BLE packet and a feature vector, before any
classifier or form metric is worth trusting.

Research wave 7, 2026-08-16. Companion to [[FINDINGS]] §13 (lift recognition)
and [[MOUNTING]]. Nothing here has met real hardware.

---

## 0. The one-paragraph version

Displacement cannot be integrated from acceleration. Orientation error leaks
gravity into the horizontal channels, and the best 6-axis filter in the
literature (2.11° inclination RMSE) puts you 1.6 m off after a 3 s rep. Every
position number has to come from a **boundary-value fit over a rep that starts
and ends at rest**, not from an initial-value integration. Everything else in
this pipeline exists to make those boundaries findable and trustworthy.

The highest-severity risk in the whole system is **clock skew between the two
sensors**, because it corrupts exactly the measurement the product is built on
and produces no visible symptom.

---

## 1. Clock sync is load-bearing

The two sensors are independent BLE peripherals with independent crystals.
Measured drift between wearable devices is 39–67 ppm, with one published pair
at 267 ms after an hour.

| Interval | Skew at 50 ppm | Samples at 100 Hz |
|---|---|---|
| 3 s rep | 0.15 ms | 0.015 |
| 60 s set | 3 ms | 0.3 |
| 10 min | 30 ms | 3 |
| 60 min session | 180 ms (267 observed) | 18–27 |

So skew is negligible **within** a set and fatal **across** a session. Estimate
the offset per set; fit a session-level drift rate across sets as a cross-check.

### Why it matters more here than in most systems

A time offset `δt` injects a fake differential acceleration of `|ȧ|·δt`, which
becomes fake angular acceleration `|ȧ|·δt / |d|` with `|d|` = bar separation.
For a moderately explosive rep (jerk ~100 m/s³) against a true α of ~8 rad/s²:

| δt | Spurious α | As % of true |
|---|---|---|
| 1 ms | 0.077 rad/s² | 0.9% |
| 5 ms (½ sample) | 0.38 rad/s² | 4.6% |
| 10 ms (1 sample) | 0.77 rad/s² | 9.3% |
| 100 ms | 7.7 rad/s² | 93% — destroyed |

**The modal case is worse, and it is the one that matters.** The whole
discriminative content of a two-ended modal estimate is the *relative phase*
between the ends. Phase error is `2πf·δt`:

| δt | Phase error at 5 Hz |
|---|---|
| 1 ms | 1.8° |
| 10 ms | 18° |
| 50 ms | 90° — symmetric and antisymmetric modes swap |

One sample of misalignment at 100 Hz already costs 18° of modal phase. Five
samples — entirely plausible if host arrival timestamps are used — makes the
matrix-pencil estimator return a **confident, completely wrong** mode shape.
Amplitude looks fine throughout. There is no symptom.

### The fix

Twist-n-Sync (Faizullin et al., *Sensors* 21(1):68, 2021) is an almost exact
fit: it synchronises devices by cross-correlating gyroscope signals, and it
*requires* the devices to be rigidly connected and rotating together — which
two sensors bolted to a barbell permanently are.

1. Cross-correlate `|ω₁|` against `|ω₂|` over ≥5 s → integer-sample delay
2. Least-squares relative gyro calibration (no external reference needed)
3. Re-correlate on the calibrated signals
4. **Cubic-spline the correlation function**, solve `dρ/dτ = 0` for the
   sub-sample peak

They report 11.5 µs at 1 kHz. At 100 Hz, budget **0.5–1 ms**; at 200 Hz,
0.25–0.5 ms. Reject the set if the correlation peak is not sharp and unimodal.

> Splines are correct *here* — you are interpolating a smooth correlation
> function. Do not spline the raw signal; see §5.

---

## 2. Orientation: VQF, 6-axis, bias estimation on

With no magnetometer, roll and pitch are observable (gravity is the reference);
**yaw is a pure integrator of gyro bias and is not observable at all.** This is
structural, not a filter deficiency.

VQF (Laidig & Seel, *Information Fusion* 91, 2023) is the only large fixed-
parametrisation benchmark across six datasets:

| Method | Orientation RMSE |
|---|---|
| **VQF** | **2.9°** (inclination 2.11°) |
| Madgwick, Mahony, Seel, MKF, RIANN et al. | 5.3–16.7° |

OfflineVQF (forward–backward, non-causal) gains a further ~20% — worth using on
the post-set path, since nothing here needs to be real-time.

**Yaw budget.** Ground-truth gyro bias in the consumer IMUs benchmarked was
0.33–0.86 °/s, i.e. **20–51 °/min uncorrected**. With rest-phase bias updates,
expect 1–3 °/min between updates and 0.1–0.3° over a single rep.

**Rule: absolute yaw never enters the feature tensor.** Yaw *rate* and
within-rep yaw *increment* are fine.

### Rest detection (VQF's, worth copying verbatim)

Filter gyro and accel per-axis with a 2nd-order Butterworth, τ = 0.5 s, in the
sensor frame. Declare rest if for the last **1.5 s** the gyro deviation stayed
< **2 °/s** and the accel deviation < **0.5 m/s²**. No magnetometer needed;
reported as very reliable.

This one detector feeds three things: gyro bias updates (ZARU), velocity resets
(ZUPT), and gravity reference epochs.

---

## 3. Displacement: fit, don't integrate

A tilt error θ leaks `g·sin θ` into horizontal acceleration, which
double-integrates to `½gθt²`:

| Tilt error | Error at 1 s | at 3 s | at 5 s |
|---|---|---|---|
| 0.1° | 0.9 cm | 7.7 cm | 21 cm |
| 0.5° | 4.3 cm | 39 cm | 1.07 m |
| **2.11°** (VQF's actual RMSE) | **18 cm** | **1.6 m** | **4.5 m** |

Getting 1 cm over a 3 s rep open-loop needs 0.013° of inclination accuracy.
Nothing published is within two orders of magnitude. **Open-loop integration is
not an option and never will be.**

### What to do instead

Fourier integration over the rep (Sabatini, Ligorio & Mannini, *BioMedical
Engineering OnLine* 14:106, 2015): decompose one cycle's acceleration into
~20 harmonics, force the DC term to zero (a cyclic motion has zero-mean linear
acceleration), then integrate **analytically** — coefficients divide by k and
k², so there is no numerical drift by construction.

Validated against optical mocap on gait: **±4 mm vertical, ±9 mm horizontal**,
~70% better than numerical integration horizontally. A barbell rep is far more
nearly cyclic than gait, so this transfers well.

Constraints to enforce per rep: `v(0) = v(T) = 0`, and `p(T) = p(0)` for reps
that return to the start.

### Honest accuracy expectation

| Quantity | Realistic | Commercial reality |
|---|---|---|
| Vertical displacement | 2–5 cm RMSE | 8–12 cm LoA (Held 2021) |
| Mean velocity | 0.02–0.05 m/s bias | LoA ~0.10 m/s |

**Prefer mean/integrated features over peak features.** Concentric *peak*
velocity validity collapses to r = 0.78 above 60% 1RM (Thompson 2020) — it
fails precisely in the heavy range where load estimation matters.

Also from Thompson 2020: one participant excluded entirely, and **13% of
remaining attempts flagged as internal sensor error**. That is the base rate
for a validated commercial device. Design to say "couldn't measure that rep"
rather than to guess.

---

## 4. What the second sensor actually buys

For two sensors on one rigid body with lever arm **d**:

- `a₁ − a₂ = α × d + ω × (ω × d)`
- `ω₁ = R₁₂ ω₂` — angular velocity is a property of the body, identical everywhere

**Gravity and common-mode translation cancel exactly in the difference.** What
survives is purely rotational, free of the orientation errors that dominate §3.
This is the cleanest possible input to the modal estimator.

### The instability trap

Padgaonkar's classic result (ASME JAM 1975) uses **nine** accelerometers, and
Liu's 1976 discussion showed the six-accelerometer formulation is
**mathematically unstable by Routh–Hurwitz**. Two triads = six accelerometers.

So: **never recover ω from the accelerometers.** Take ω from the gyros, and
solve `Δa − ω×(ω×d) = α × d` for α as a linear least-squares — well-posed. The
component of α along **d** is unobservable that way; get it by differentiating
the axial gyro instead.

### Self-calibration, from your own data

| Quantity | Method | Published accuracy |
|---|---|---|
| Relative rotation R₁₂ | `argmin ‖ω₁ − R ω₂‖`, Wahba/nonlinear LS | 0.01–1.15° from 2 s |
| Lever arm **d** | nonlinear LS on the Δa identity | 0.12–1.33 mm from 2 s |

(Zhang et al., arXiv:2409.16228, 2024.)

### The caveat that matters most

The same paper: with extrinsic errors of σ = 0.01 rad / 1 mm, fusing two, four
or **nine** IMUs was **worse than a single IMU** with exact extrinsics.

**Multi-IMU fusion amplifies extrinsic error.** A hand-placed magnetic mount
will not repeat to 0.01 rad. Re-estimate R₁₂ and **d** every session, and
monitor `|d|` continuously — a shift of more than ~2 mm mid-session means a
mount has moved.

Noise averaging is *not* the benefit: √N with N = 2 is only 1.41×. Don't build
the value proposition on it.

---

## 5. Gaps and packet loss

Measured BLE wearable streaming: loss is proportional to packet rate and
payload size. Bundling several samples per notification at a low packet rate
drove loss below 1%; 200 packets/s lost badly.

**Design consequence:** bundle ~10 samples per notification (~120 B, 10
notifications/s per sensor). Every sample carries a **device-side monotonic
sample index**. Never use host arrival time as a timestamp — that is transport
jitter, not a clock.

### How much loss hurts

| Missing rate | HAR accuracy |
|---|---|
| 0% | ~95% |
| 2% | ~80% |
| 5% | 65–84% |
| 10% | <50% |

5% random loss can cost 10–30 accuracy points. Two cheap mitigations: train
with simulated packet loss resampled every epoch, and **give the model the
mask** (GRU-D style — a validity channel plus time-since-last-observation).

### Interpolation

**Linear, not spline.** Splines overshoot on impulsive events — rack impacts,
plate rattle — and a modal estimator will happily fit the phantom
high-frequency content as a structural mode.

### Gap policy

| Gap | Action |
|---|---|
| ≤2 samples | Interpolate, mask = 0 |
| 3–5 samples | Interpolate, mask = 0, flag window degraded |
| >5 samples in the concentric | Reject rep for kinematics |
| >10% of a window | Reject the window — past the accuracy cliff |
| Straddling a rep boundary | Reject the rep — boundaries are what §3 rests on |

---

## 6. Rep segmentation

### The published bar

| System | Result |
|---|---|
| RecoFit (CHI 2014, 114 participants) | Segmentation 98.8% P/R at 5 s tolerance, **85.6% at 2 s**; counting within ±1 rep 93% |
| LiftRight (4,000 reps, 8 users) | Rep detection 96–98%, set detection 100%, phase-duration error **79–94 ms** (vs PUSH's 165 ms) |
| ExerSense | F1 95.9% from **one** template per exercise |

Note RecoFit's collapse from the 5 s to the 2 s tolerance: **boundary precision
is ~2 s, not ~200 ms.** That is nowhere near good enough to anchor a ZUPT, so a
finer second stage is mandatory.

### Which family to use — the controlled comparison

Haji Ghassemi et al. (*Sensors* 18(1):145, 2018), on heterogeneous data with
turns and transitions:

| Method | Precision | Recall | F |
|---|---|---|---|
| hierarchical HMM | **98.5%** | 93.5% | **95.9%** |
| subsequence DTW | 94.0% | 93.5% | 93.8% |
| Peak detection | 87.4% | **95.9%** | 91.5% |

On homogeneous data all four hit ~100% — the differences only appear when the
motion varies. **hHMM buys precision, peak detection buys recall.** Cascade
them rather than choosing.

Subsequence DTW gains up to 15 percentage points over peak detection when tempo
varies (Barth et al., *Sensors* 2015), because it warps the template to fit.

### Build the template locally

RecoFit's insight: rely on **short-term** self-similarity only. "If the 10th
repetition is different than the first, segmentation will not suffer, as long
as it's somewhat similar to the 9th." Build the DTW template from the first 2–3
reps of the *current set*, so fatigue-driven form drift doesn't break it.

### Tag reps, don't delete them

RecoFit's counting stage rejects peaks below half the 40th-percentile amplitude
— which silently **deletes partial reps**. For a coaching product, partials are
signal, not noise. Emit a taxonomy instead: `{complete, partial, paused,
failed, ambiguous}`. A failed rep violates `p(T) = p(0)` and must be excluded
from §3, not fed through it.

---

## 7. Sleeve spin — mount on the shaft

A barbell's sleeves spin on bearings independently of the shaft. Eleiko's
figures: weightlifting delivers ~180° of rotation, powerlifting under 45°.

For a sensor at radius 25 mm during a clean (180° in ~0.3 s):

- ω_spin ≈ 10.5 rad/s
- centripetal `ω²r` = **2.75 m/s²** — 28% of g, injected straight into the accelerometer
- 180° of unmodelled sensor-frame rotation, which rotates **the measured bending
  direction** — the basis of the whip load estimate

Worse: the two sleeves are on *independent* bearings and can slip by different
amounts, which **violates the rigid-body constraint that all of §4 depends on**.

### Detection is free

For a rigid bar the axial spin rate is common to the whole body, so with **û**
the bar's long axis in each sensor frame:

```
s(t) = ω₁·û₁ − ω₂·û₂
```

Any persistent non-zero `s(t)` *is* differential sleeve slip, by definition.

| `∫s dt` over a rep | Action |
|---|---|
| > 5° | Suppress whip/modal features |
| > 45° | Reject the rep for kinematics |
| sustained during rest | Mount-loose alarm |

### But prefer to avoid it

Mount on the **shaft**, inboard of the inner collars:

1. The shaft doesn't rotate relative to the bar — the whole failure class disappears.
2. **The whip lives in the shaft.** Plates load the sleeves; the shaft between
   the collars is where the bending happens. Sleeve sensors sit outboard of the
   flexing region and see it only through the sleeve–shaft joint, which has
   compliance and backlash.
3. Off-centre placement costs little: measured bar-end vs midpoint velocity
   SEE is 0.06 m/s mean / 0.05 m/s peak (Weakley 2021) — "negligible in
   training settings".

This contradicts [[Hardware Roadmap]] Stage 1 in the other direction from
[[MOUNTING]] — resolve before ordering anything.

Residual risk: the shaft is inside the hand path for wide-grip bench and
snatch. Form factor becomes the constraint, not signal processing.

---

## 8. Proposed order of operations

```
BLE packets (2 peripherals, device-side sample index on every sample)
  ↓
 1. Per-stream ingest — reconstruct device timebase, diff index → exact gaps
 2. Per-stream calibration — factory bias/scale + boot-time still-period null
 3. Set-level change-point detection → activity blocks
 4. CLOCK ALIGNMENT per set — Twist-n-Sync, target ≤1 ms   ← highest severity
 5. Gap-aware resample to common grid — LINEAR, carry validity mask
 6. Extrinsic self-calibration — R₁₂ and d from 2–5 s of motion
 7. Sleeve-slip gate — s(t) axial disagreement
 8. Rest detection — VQF's thresholds → ZUPT/ZARU/gravity epochs
 9. Orientation — VQF 6D per sensor, OfflineVQF post-set, fuse through R₁₂
10. Rigid-body decomposition — ω from gyros, α from Δa (never ω from accels)
11. Rep segmentation — cascade: autocorrelation → DTW → hHMM boundaries
12. Per-rep boundary-constrained displacement — Fourier integration
13. Feature tensor — + validity masks + per-rep quality scalars
```

Every rep carries its own quality scalars: sync residual, slip integral, gap
fraction, `|d|` deviation, DTW distance, boundary-constraint residual. These
are what let the product decline to answer instead of guessing.

---

## 9. Things most likely to break silently

Ordered by how invisible the failure is.

1. **Clock skew destroying modal phase.** 50 ms = 90° at 5 Hz; symmetric and
   antisymmetric modes become indistinguishable and the estimator returns a
   confident wrong answer. Nothing in the amplitude domain looks wrong.
   *Guard:* log correlation peak sharpness and `ω₁ − R₁₂ω₂` residual per set.
2. **Session-scale drift between syncs.** Sync once at session start and by set
   15 you are 20+ samples out. *Guard:* re-sync every set, cross-check against
   the fitted drift rate.
3. **Extrinsic miscalibration making two sensors worse than one.** *Guard:*
   re-estimate per session, alarm on `|d|` moving >2 mm.
4. **Gravity leakage that looks like a real bar path.** 1° of tilt error is
   77 cm over 3 s, and it renders as a perfectly plausible smooth trajectory.
   *Guard:* every displacement carries its boundary-constraint residual.
5. **A failed rep accidentally satisfying `p(T) = p(0)`** because the bar was
   dumped and landed near start height. *Guard:* cross-check against the
   velocity-trace shape and the phase HMM, not just endpoints.
6. **Sleeve slip rotating the whip direction.** Undetectable from whip
   magnitude. *Guard:* `s(t)`, which costs nothing.
7. **Sub-visibility BLE loss.** 5% costs 10–30 accuracy points and the stream
   still "appears smooth". *Guard:* device-side sample index; alarm above 2%
   per set.
8. **Spline overshoot at rack impacts** fitting as a structural mode.
   *Guard:* linear interpolation for signals.
9. **A segmenter tuned on cooperative data.** RecoFit went from near-perfect
   lab cross-validation to **~50% precision/recall in a real gym** — their
   diagnosis was that lab subjects behaved "robotically". *Guard:* record
   strangers, in a real gym, with walking and chalking and phone-checking in
   the data, before believing any segmentation number.
10. **Walking is extremely periodic** and RecoFit calls it almost impossible to
    separate from exercise on periodicity alone. *Guard:* set-level
    change-point detection and rest detection, not periodicity.
11. **Rest detection never firing** on supersets or a bar held at lockout —
    then bias correction degrades and yaw drift returns to tens of °/min.
    *Guard:* track time-since-last-rest and flag heading-dependent features
    after ~60 s.
12. **A bandpass tuned for one exercise killing another.** RecoFit's counting
    band is 0.15–11 Hz; a 6 s tempo squat sits at 0.17 Hz, right at the edge.
    *Guard:* derive the band from the measured local period, not a constant.

---

## Key sources

- Laidig & Seel, *VQF*, Information Fusion 91:187–204, 2023 — https://arxiv.org/abs/2203.17024
- Faizullin et al., *Twist-n-Sync*, Sensors 21(1):68, 2021 — https://pmc.ncbi.nlm.nih.gov/articles/PMC7795013/
- Sabatini, Ligorio & Mannini, BioMedical Engineering OnLine 14:106, 2015 — https://doi.org/10.1186/s12938-015-0103-8
- Padgaonkar, Krieger & King, ASME J. Appl. Mech. 42(3), 1975; Liu, *Discussion*, 43(2):377, 1976
- Zhang et al., *Fast extrinsic calibration for multiple IMUs*, arXiv:2409.16228, 2024
- Morris, Saponas, Guillory & Kelner, *RecoFit*, CHI 2014 — https://dl.acm.org/doi/10.1145/2556288.2557116
- Haji Ghassemi et al., Sensors 18(1):145, 2018 — https://pmc.ncbi.nlm.nih.gov/articles/PMC5796275/
- Barth et al., Sensors 15(3):6419, 2015 — https://pmc.ncbi.nlm.nih.gov/articles/PMC4435165/
- Milanko & Jain, *LiftRight*, Smart Health 16:100115, 2020
- Held et al., IJERPH 18(17):9170, 2021 — https://pmc.ncbi.nlm.nih.gov/articles/PMC8431394/
- Thompson et al., Sports 8(7):93, 2020 — https://pmc.ncbi.nlm.nih.gov/articles/PMC7404789/
- Weakley et al., Sports 9(9):123, 2021 — https://pmc.ncbi.nlm.nih.gov/articles/PMC8472848/
- Woodman, *An Introduction to Inertial Navigation*, Cambridge TR-696, 2007
