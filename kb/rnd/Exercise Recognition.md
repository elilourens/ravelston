# Exercise Recognition from Bar-End IMUs

Can two sensors on a barbell tell which lift is being performed, and what does
it take to build that?

Research wave 7, 2026-08-16. **Revises [[FINDINGS]] §13 downward** — see §1.
Companion to [[Kinematics Pipeline]], which has to work first.

---

## 1. Where this disagrees with FINDINGS §13

§13 concluded recognition was "solved-in-the-lab at the class counts we need"
and "far more tractable than the weight-estimation problem." Wave 7 says that
was too optimistic in one specific, important way.

**§13 reasoned from body-worn results and assumed the bar could only do
better.** The controlled evidence says the opposite: accuracy tracks how
tightly the sensor is coupled to the segment that distinguishes the exercises,
and a barbell is coupled to the hands only.

Every controlled placement ablation, same data, same model:

| Study | Placement comparison | Cost |
|---|---|---|
| Bian 2025 (12 classes, LOSO) | wrist 93.6% → calf 88.9% → pocket 79.8% | −14 pts |
| MM-Fit (10 classes, unseen subjects) | watch 94% → phone 85% → earbud 82% | −12 pts |
| kBox thesis (5 barbell lifts, grouped by subject) | wrist 87.4% → thigh 64.4% | −23 pts |
| "Seven Things" (37 classes, LOSO) | pelvis 89% → wrist 75% (clusters) | −14 pts |

And the closest published analogue to our hardware is not encouraging. The kBox
flywheel machine's **own integrated angular-velocity sensor**, CNN, 10 subjects,
5 exercises:

| Exercise | Accuracy |
|---|---|
| Squat | 95% |
| Bent-over row | 72% |
| Deadlift | 72.2% |
| Calf raise | 70.6% |
| Biceps curl | 67% |

The *same* five exercises reach 87.4% from a single wrist IMU and 98.1% from
three body IMUs on the follow-on study. The thesis author attributes the gap
directly to wearables capturing the participant's movement more closely than
the equipment sensor does.

**There is still no peer-reviewed multi-class exercise classification from a
bar-mounted IMU.** §13 said this and it remains true — it is unclaimed
territory. But unclaimed is not the same as easy.

### The structural loss §13 missed

MiLift's 15-class wrist classifier is built **entirely from the gravity
vector** — it works because the wrist adopts a distinctive static orientation
per exercise.

**A barbell is horizontal in essentially every barbell exercise.** Gravity in
the bar frame is degenerate: it gives the roll angle about the long axis, which
is set by how the pod was clamped, and near-zero pitch. The entire
posture-orientation feature family that carries most of the discriminative load
in wrist systems is **unavailable to us**.

### What survives from §13

The compensating advantages §13 identified are real and unmeasured anywhere in
the literature:

1. **Tiny, pre-filtered class space.** If the bar is moving, someone is
   lifting. ~8–15 movements, not 42.
2. **Load as a prior.** Intra-session load ordering (deadlift > squat > row ≈
   bench > OHP > curl) is strongly informative and subject-normalisable.
   Nothing body-worn has an equivalent. This is the genuine edge.
3. **Start condition and floor contact.** Deadlift's impact transient, static
   zero-velocity period and concentric-first structure vs everything racked.
4. **Differential channels.** Tilt, twist, bend, bar yaw from the difference
   between the ends. No published system has an analogue.

### Revised expectation

Subject-independent (LOSO), per-set classification after voting across a whole
set:

| Vocabulary | Realistic LOSO |
|---|---|
| 4–5 distinct lifts (squat/bench/deadlift/OHP/row) + load prior | **88–94%** |
| 8–10 barbell movements | **78–88%** |
| 15+ including variants | 65–78%, marginal classes near-useless |
| Variant-level within a movement pattern | don't ship it |

Deduct 5–10 points for first field deployment. RecoFit's segmentation fell from
near-perfect lab cross-validation to **~50% precision in a real gym** — their
diagnosis was that lab participants behaved "robotically."

---

## 2. What is impossible, and what to do about it

### Impossible in principle — the bar trajectory is identical

- **Back squat vs front squat.** Same load, path, tempo, ROM. The difference is
  torso angle and bar position on the body.
- **Bench vs close-grip vs wide-grip.** Grip width is unobservable; ROM differs
  by centimetres, well inside inter-subject variance.
- **Pronated vs supinated grip** (row vs underhand row, curl vs reverse curl).
- **High-bar vs low-bar squat.**
- Anything defined by *which muscle works* rather than *how the bar moves* —
  which covers most of what a lifting app wants to log.

### Possible but unreliable — don't expose to users

- **Deadlift vs bent-over row** — the most reproducible confusion in the
  literature. kBox wrist data: **33% of deadlifts called rows, 21% of rows
  called deadlifts.** The authors' fix requires hip and knee angles we cannot
  see. Our escape is floor contact — but it degrades for touch-and-go deadlifts
  and for rows tapped off the floor. Expect this to stay the dominant error.
- **Conventional vs sumo deadlift** — ~5–8 cm ROM difference, smaller than
  between-subject height variance. ~65–75% at best.
- **Barbell curl vs upright row.**

### Genuinely easy

- **OHP vs push press vs jerk** — leg drive gives a distinct dip and much
  higher peak concentric acceleration. 85%+.
- **Set vs rest segmentation** — should beat RecoFit's 99.1/98.3%. A bar that
  only moves when lifted is a cleaner signal than a wrist that moves all day.
- **Rep counting** — should beat every published number. Rigid body, one
  dominant near-vertical oscillation, no limb articulation, no alternating-arm
  ambiguity. Target within-1 ≥97%.
- **Bar tilt and left/right asymmetry** — no body-worn system in the review can
  do this at all.

### The product answer

Classify **movement patterns**, not exercise names: vertical press, horizontal
press, hip hinge from floor, squat pattern, horizontal pull, elbow flexion.
Let the user disambiguate the variant once, then make it sticky for the session.

The evidence for this is direct: "Seven Things" got **81% on 37 individual
exercises and 96% on the same data clustered into 10 groups**, LOSO. Clustering
turns the impossible distinctions above from a modelling failure into a UI
question. They also extrapolate that hitting 95% on individual exercises would
need **2,322 subjects** — scaling data does not rescue this.

---

## 3. Which model — the answer is not a neural network

Three independent, methodologically careful studies say ROCKET-family methods
beat deep learning at the data scale we will occupy for at least a year.

| Study | Setup | Result |
|---|---|---|
| Bake-off redux (Middlehurst 2024) | 112 UCR datasets | MultiRocket+Hydra and HIVE-COTE2 win; **InceptionTime is the best deep model and ranks below both** |
| Singh/Ifrim 2023 | 54 participants, exercise **form** classification, 5 IMUs | ROCKET **0.91** vs FCN 0.86, ResNet 0.87; and **+10 pts over hand-crafted features** |
| Dissanayake 2024 | 27 h, 30 subjects, strict subject-wise split, 12 models | MiniRocket macro-F1 **0.67**, beating all 11 deep models (ConvTran 0.51, InceptionTime 0.65) |

The crossover is measured, not guessed: **~100 labelled windows per class**
before a conv-transformer starts winning, and ~10k total windows before it beats
ROCKET on speed *and* accuracy (Foumani 2024, sorting 32 benchmarks by training
samples per class).

**MiniRocket fits the future sensor puck, never mind the phone.** Giordano et
al. ported it to an nRF52810 (Cortex-M4, 64 MHz, no FPU):

| | |
|---|---|
| Flash / RAM | **7 kB / 3 kB** |
| Latency | **8.6 ms** |
| Energy per inference | **72 µJ** |
| int32 vs float32 | **<1% difference** |
| F1 | 0.969 across 16 device models, **trained on one brand tested on the others** |

They used **84 features**, not ROCKET's 9,996. Don't ship 10k kernels.

### If and when to go deeper

- Target **TinierHAR / TinyHAR scale (30k–150k params)**, never DeepConvLSTM
  scale (3.97M). TinierHAR matches TinyHAR across 14 datasets at 43× fewer
  params than DeepConvLSTM.
- **Use dilated causal convs, not LSTM.** TinierHAR's ablation: removing the
  LSTM from DeepConvLSTM caused minimal loss *or improvement* on 5 of 14
  datasets; removing the CNN block cost 9–55%. Convolution does the work.
  LSTM is also the one op class that breaks int8 quantisation and GPU
  delegation across every mobile runtime.
- **Skip self-attention.** Removing it from TinyHAR *improved* F1 on **10 of
  14** datasets.
- Budget ≤1 pp for int8 post-training quantisation (measured: −0.21 pp mean
  across five benchmarks).

### Pretrained encoders: mostly unusable

| Model | Blocker |
|---|---|
| UK-Biobank ResNet (harnet) | **Academic licence only** — not commercial |
| IMU2CLIP | **CC-BY-NC** — not commercial |
| RelCon (Apple), LSM-2 (Google) | Weights never released |
| MOMENT / Chronos | Channel-independent — destroys accel/gyro cross-axis coupling |
| UniMTS | Only real candidate: 6-axis, rotation-invariant, 4.9M params. **Repo licence unstated — confirm in writing** |
| LIMU-BERT | MIT ✅, but use it as a *method* not a checkpoint — 62K params, cheap to re-pretrain at our rate |

All of them run at **20–30 Hz**, which throws away the whip band. That alone
disqualifies them for the load path.

**Do not z-score-normalise per window.** LIMU-BERT reports mean-variance
normalisation destroys performance; their magnitude-preserving scheme beat raw
input by 5.78%. For load estimation, absolute magnitude *is* the label.

---

## 4. Features that repeatedly work

Convergent across RecoFit, MM-Fit, MiLift, ExerSense:

**Autocorrelation — the most valuable family.** RecoFit's core: 5 s windows,
lags ≥0.5 s, normalised to 1 at zero lag. Number of peaks (explicitly
*non-monotonic* with repetitiveness), prominent peaks, **weak peaks** (more in
non-exercise), max autocorrelation value, height of the first peak after a zero
crossing. For recognition rather than segmentation, 5 evenly-spaced summed bins
of the autocorrelation — the *shape*, not just the peakiness.

**Spectral.** Power in 10 bands linearly spaced 0.1–25 Hz.

**Simple statistics**, including kurtosis and IQR, plus RMS/mean/SD computed
**separately on the first and second half of each window** — a cheap trick that
sharpens segmentation boundaries.

**Orientation invariance via PCA.** RecoFit trusts only the along-arm axis and
projects the other two onto their first principal component. This maps exactly
onto a bar sensor whose roll is arbitrary. See §5.

**Accelerometer beats gyroscope for recognition** (MM-Fit; "Seven Things" found
accel-only matched accel+gyro at 6× lower energy). **Gyroscope beats
accelerometer for rep counting** (MM-Fit MAE 0.34 vs 0.41).

**100 Hz is plenty for classification.** Downsampling 100 → 20 Hz cost <3%
("Seven Things"). Our rate is sized for the whip band; recognition rides along
free.

---

## 5. Roll invariance is mandatory, not optional

Sensor rotation costs up to **30 points** unmitigated (Yurtman & Barshan). The
controlled comparison of mitigations, five datasets, four classifiers:

| Approach | Accuracy lost under random rotation |
|---|---|
| Nothing | **−21.2%** |
| Heuristic invariant transform | −15.5% |
| Magnitude-only channels | −13.5% |
| **SVD reframing into principal-component axes** | **−7.6%** |

Rotation augmentation helps on top (+5.08 pp alone, the single most effective
IMU augmentation in Um et al. 2017) but only gives *approximate* invariance.

### The barbell-specific recipe

Gravity direction is **meaningful** for us — bar path is vertical-dominant.
Unlike a wrist sensor, we do not want full SO(3) invariance.

- Canonicalise **roll about the bar's long axis only**; keep pitch, yaw-rate
  and gravity.
- Augment with a **shared** rotation across both sensors (= the bar gripped at
  a different roll angle), plus a small ±10–15° independent perturbation per
  sensor for clamp misalignment. **Never full independent SO(3)** — that
  destroys the inter-sensor phase relationship that *is* the whip signal.
- Don't use naive Gaussian jitter (neutral-to-harmful) or cropping (harmful).

> Iwana & Uchida (2021) report rotation augmentation *degrades* accuracy — that
> is a univariate-UCR artefact where "rotation" degenerates to a sign flip and
> genuinely changes the class. It does not apply to true 3-axis IMU rotation.

---

## 6. Segmentation and rep counting

| System | Result |
|---|---|
| RecoFit | Segmentation LOSO 99.1/98.3% traditional, 86.8/86.9% at 2 s tolerance; counting within-1 **97%** with true boundaries, **93%** end-to-end |
| LiftRight | 100% set detection, 96–98% rep detection, <1% FP over 4,000 reps, **training-free** (DTW) |
| MM-Fit | Rep MAE 0.34 (gyro, best modality) |
| MiLift | 1.12 reps mean error out of 9.65 — noticeably worse |
| ExerSense | F1 95.9% from **one template per exercise** |

Two things worth stealing:

**RecoFit's counting pipeline** — bandpass 0.15–11 Hz, subtract mean, PCA,
project onto PC1, find peaks, then use *windowed autocorrelation around each
candidate* to estimate the local period P and reject peaks closer than 0.75·P.
This handles the double-peak-per-rep problem and preparatory movements. Because
P is re-estimated per peak, it is tempo-robust.

**ExerSense's one-template requirement** is a plausible v0 that ships before any
corpus exists.

Recognition is robust to modest segmentation error — RecoFit's recognition
accuracy was *identical* using ground-truth or automatic boundaries.

But note: **boundary precision is ~2 s, not ~200 ms** (RecoFit's collapse from
the 5 s to the 2 s tolerance). That is not good enough to anchor a ZUPT, so
[[Kinematics Pipeline]] §6 adds a finer stage.

---

## 7. Data: essentially nothing transfers

### There is no public barbell-mounted IMU data. Anywhere.

Swept UCI, PhysioNet, Zenodo, figshare, Kaggle, HuggingFace, IEEE DataPort,
Mendeley, Dryad, OpenNeuro, GitHub, paper appendices. The only *equipment*-
mounted inertial data that exists publicly is one sensor on a **1.25 kg
dumbbell** (Velloso 2013), one on a **table-tennis racket**, and gym-machine
beacons whose data was never released.

Several groups built barbell-collar IMU prototypes (a 104 Hz Michigan thesis, a
2025 Springer chapter, every VBT vendor) and **none released data**.

### How much transfers from body-worn? Very little, and it's measured

| Finding | Cost |
|---|---|
| Sensor displacement *on the same limb* (REALDISP) | 90% → ~50% (10 classes); 80% → ~35% (33 classes) |
| Cross-position transfer within a dataset | −15 pts; across datasets −24 pts |
| Limb → torso specifically | DSADS torso 87.6% → **35.0%** |
| Left wrist → right wrist (a *mirror pair*, best case) | mean F1 −0.12 to −0.45 |
| Generic HAR pretraining → MyoGym's 31 gym exercises | **~2%** improvement. Two points. |

That last row is the one that matters: pre-training on generic body-worn HAR
buys ~2% on a fine-grained gym target that is *wrist*-mounted, i.e. an easier
target than ours.

### Video → synthetic IMU: good for classification, useless for load

The gym precedent is real and encouraging for recognition: **41 h of virtual
IMU harvested from YouTube + 36 min of real calibration data → 80.2% F1 on 13
dumbbell exercises**; free-weight macro-F1 went 44% → 64%.

But three hard blockers for the load path:
1. IMUTube rigidly attaches its virtual sensor to a **body joint frame** from
   SMPL forward kinematics. The barbell is not in the kinematic tree.
2. Classic IMUTube emits **accelerometer only** — no gyro.
3. **Bar whip is millimetre-scale elastic deflection**, orders of magnitude
   below the noise floor of any monocular 3D-pose pipeline.

And there is a measured hard limit: above a "Motion Subtlety Index" of 0.9,
virtual IMU data **cannot improve performance at all**, and on a 17-class
subtle-motion task it made things *worse* (0.4769 → 0.4621).

**Synthetic-from-video can never teach a model to read load.** Real plates on a
real bar is the only path.

### The five datasets actually worth the time

1. **RecoFit** — https://github.com/microsoft/Exercise-Recognition-from-Wearable-Sensors
   200+ subjects, 50 Hz raw accel+gyro, ~30 exercises, session traces with
   start/stop times *and* rep counts, plus a null class. **CDLA-Permissive-2.0
   with an explicit "no restrictions on Results" clause** — the only large gym
   IMU corpus buildable into a product without a lawyer. Use it to build and
   stress-test segmentation, rest detection and rep counting before hardware.
   *Repo archived read-only June 2026 — clone it now, with Git LFS, 2.5 GB.*
2. **REALDISP** — https://archive.ics.uci.edu/dataset/305/ CC BY 4.0, 33
   exercises, 9 synchronised IMUs, and uniquely **ideal / self-placement /
   induced-displacement conditions in the same dataset**. This is the test
   bench for mounting robustness. Baños derived decision-level fusion on it
   that cuts the displacement penalty from 40–45 pts to **0–3 pts** — with two
   sensors, fuse at the decision level, not by concatenating features.
3. **Velloso WLE** — the only public IMU data with a sensor on a free weight
   *and* per-rep form labels (A correct, B–E four named errors). Host is dead;
   pull raw 45 Hz from the Wayback snapshot while it exists. Value is the label
   schema, not the volume. CC BY-SA share-alike — check whether that reaches
   model weights.
4. **IMHD² (I'M HOI, CVPR 2024)** — the only dataset pairing **6DoF object pose
   with a real IMU physically mounted on that object**. This is how you
   *validate a simulator* before trusting anything it generates.
5. **Fitness-AQA** — non-commercial and video-only, so untrainable, but the
   largest expert-annotated error dataset for **BackSquat, BarbellRow,
   OverheadPress**. Request access and mine the **error taxonomy**. Getting the
   label ontology right before collecting 100 hours is worth more than any
   borrowed signal. Pair with **UI-PRMD** (ODC-PDDL, public domain,
   correct/incorrect per rep) as the licence-clean structural template.

### Licence traps

| Dataset | Status |
|---|---|
| WEAR | CC BY-NC-SA — **not commercial** |
| MyoGym | Host 404, no mirror — effectively unobtainable |
| AMASS | Explicitly forbids training algorithms for commercial use |
| SHL, DIP-IMU, BEHAVE, HuMMan, FLEX | Research-only |
| USC-HAD, Skoda, HuGaDB, ExtraSensory, RealWorld | No licence = all rights reserved by default |
| Kaggle "Gym Workout IMU" | Unverified provenance, possibly a re-upload — don't rely on it |

---

## 8. Evaluation discipline

**Report leave-one-subject-out or nothing.** The gap is not small:

| Dataset | k-fold | LOSO |
|---|---|---|
| Nurse Care Challenge (same 6 classes, same 8 subjects) | 87% | **66%** |
| MM-Fit | 99.6% seen-subject | 96.4% unseen |
| ISS squat technique | 98.29% | 89.03% real-time |

A published number above ~95% for more than ~10 free-weight classes is almost
always (a) not subject-independent, (b) using multiple body-worn sensors, or
(c) using a modality we don't have (EMG, video, machine identity).

Group by **subject and session**. RecoFit's lab-to-gym collapse shows even
subject-held-out *lab* data overestimates field performance.

**Prioritise subjects over sessions.** The scaling-laws work found the
power-law exponent for adding *users* is ~3× steeper than for adding data per
user. 100 sessions from 100 lifters decisively beats 100 sessions from 10.

---

## 9. Recommended build order

**Stage 0 — zero data.** Physics-informed channels (gravity-aligned,
roll-canonicalised, magnitudes, and the **differential** channels between the
two ends) → MiniRocket + ridge for classification, 84 features not 9,996 →
RecoFit's autocorrelation bank for segmentation and counting → hand-crafted
whip features + gradient boosting for load. No neural networks. Bootstrap
classification labels from video via IMUTube/COMODO.

**Stage 1 — ~100 sessions.** Keep MiniRocket as the production model *and* as
the permanent baseline every future architecture must beat on a subject-wise
split. Add a small CNN/TCN at TinierHAR scale and compare honestly. Start
SelfHAR-style self-training on unlabelled data (+12% F1 at identical inference
cost, or equivalent performance with 10× less labelled data).

**Stage 2 — ~10,000 sessions.** Re-pretrain LIMU-BERT's architecture at our own
sample rate on our own unlabelled corpus, keeping both sensors' channels and
magnitude-preserving normalisation. Consider a physics simulator — we have to
model an **Euler–Bernoulli beam with tip masses**, not a human body, which is
far more tractable and directly generates the load↔whip relationship video
cannot.

Open question §13.7(2) remains open: **how much does the dual-end differential
actually add over one sensor for classification?** No literature exists. It is
answerable in one afternoon once hardware works, by ablating one sensor.

---

## Key sources

- Morris, Saponas, Guillory & Kelner, *RecoFit*, CHI 2014
- Bian et al., arXiv:2503.06311 (2025) — the three-placement LOSO ablation
- kBox flywheel thesis, KTH 2024 — https://www.diva-portal.org/smash/get/diva2:1913749/FULLTEXT01.pdf
- "Seven Things to Know about Exercise Classification", 2024 — https://pmc.ncbi.nlm.nih.gov/articles/PMC11284806/
- Strömbäck et al., *MM-Fit*, IMWUT 4(4), 2020
- Shen, Ho & Srivastava, *MiLift*, IEEE TMC 2018
- Middlehurst, Schäfer & Bagnall, *Bake off redux*, DMKD 38, 2024 — https://arxiv.org/abs/2304.13029
- Dempster, Schmidt & Webb, *MiniRocket*, KDD 2021 — https://arxiv.org/abs/2012.08791
- Dissanayake et al., calf behaviour comparison, 2024 — https://arxiv.org/abs/2408.13041
- Singh et al., wearables vs video for exercise classification, ECML 2023 — https://arxiv.org/abs/2307.04516
- Giordano et al., MiniRocket on Cortex-M4, IEEE WF-IoT 2023
- Yurtman & Barshan, Sensors 17(8):1838, 2017
- Um et al., data augmentation for wearables, ICMI 2017 — https://arxiv.org/abs/1706.00527
- Baños et al., REALDISP sensor displacement, Sensors 14(6), 2014
- Kwon et al., virtual IMU for free weights, IMWUT 5(3) 2021 & Sensors 21(24):8337
