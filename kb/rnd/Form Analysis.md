# Form Analysis from Bar-End IMUs

What can two sensors on a barbell actually say about technique — and what
should never be claimed.

Research wave 7, 2026-08-16. Companion to [[Exercise Recognition]] and
[[Kinematics Pipeline]]. Nothing here has met real hardware.

---

## 1. The number that should govern the whole feature

Same research group, same exercise, same physio-assigned labels, barbell back
squat, 55 participants:

| Model | Sensors | Accuracy | Sensitivity | **Specificity** |
|---|---|---|---|---|
| **Global** (subject-independent) | **5 body IMUs** — lumbar, both thighs, both shanks | 64% | 70% | **28%** |
| **Personalised** (N=1) | **1 IMU**, left thigh | 81% | 81% | **84%** |

28% specificity means a global model calling "bad rep" is wrong roughly three
times in four when the rep was fine. That is a product-destroying false-positive
rate — produced by **five sensors on the body**, in a lab, with expert labels.

Ravelston has two sensors, neither on the body.

Two things follow, and they govern everything below:

1. **Personalisation is not a nice-to-have.** It is the difference between a
   usable and an unusable system. The same pattern repeats across the whole
   O'Reilly/UCD body of work on deadlifts and squats.
2. **Silence is the default output.** See §5 for the arithmetic.

---

## 2. The observability table

The organising principle: **the bar is a rigid body coupled to the hands (or
shoulders).** A fault is observable only if it displaces, tilts, or re-times the
bar. Faults internal to the lifter's kinematic chain are not attenuated — they
are *absent*.

**A** = measurable with defensible accuracy · **B** = inferable with caveats ·
**C** = not observable without body sensors or a camera

### Squat pattern

| Fault | Bar signature | |
|---|---|---|
| Knee valgus | **None.** Can be bilateral, symmetric and severe with a perfectly level, perfectly vertical bar | **C** |
| Butt wink / lumbar flexion | **None.** A 10–20° posterior pelvic tilt moves the bar millimetres and is confounded with normal trunk pitch | **C** |
| Heel rise / weight onto toes | **None** — indistinguishable from normal forward lean | **C** |
| Stance width, foot turnout | **None** (and Escamilla 2001 found foot angle changes nothing measurable anyway) | **C** |
| Bar drifting forward | Horizontal displacement — but forward lean in the sticking region is **normal** in a maximal squat, and no normative cm value exists | **B** |
| Insufficient depth | Vertical excursion. **Consistency** is honest; absolute depth is not — bar travel depends on limb proportions and bar position | **B** |
| Lateral hip shift | Bar translates mediolaterally — but no published ML bar displacement value exists for the squat | **B** |
| Uncontrolled eccentric | Eccentric duration and peak eccentric velocity. Eccentric variables are the **best-measured** on IMUs (r = 0.92–0.95) | **A** |
| **Uneven bar / bar tilt** | **The flagship measurement** — see §3 | **A** |

### Deadlift pattern

| Fault | Bar signature | |
|---|---|---|
| Lumbar flexion / rounding | **None.** Two lifters with identical bar trajectories can have 0° and 30° of lumbar flexion. **The most-claimed and least-supportable feature in the category** | **C** |
| Hips shoot up first | The bar does not encode hip height. Early-phase velocity is a weak proxy fully confounded with load. **Don't claim it** | **C** |
| Bar drifting from the shins | Horizontal displacement. A 5 cm anterior drift ≈ **+16.7% lumbar extensor torque at 100 kg** (modelled). But no normative bar-to-midfoot distance exists for any deadlift style | **B** |
| Soft lockout | Vertical displacement consistency only — a short-torso lifter and a lifter cutting lockout produce identical bar heights | **B** |
| Rep-to-rep start drift | **Yes.** Floor contact gives a clean per-rep integration reset | **A** |
| Hitching | **Yes.** Multiple velocity minima with re-acceleration in the upper third — distinctive and robust | **A** |
| Uneven pull off the floor | **Yes**, and essentially unmeasurable any other way — a side-view camera cannot see it and nobody films from the front | **A** |

### Bench and overhead press

| Fault | Bar signature | |
|---|---|---|
| **Elbow flare** | **None — and this one is subtle enough to be worth spelling out.** Grip width generates large lateral bar forces (22–30% of vertical; ~30% outward at an 81 cm grip vs ~10% inward at 40 cm). But those forces are **equal and opposite from the two hands**. They cancel in the rigid-body force balance: zero net lateral acceleration, no distinguishable bending. **Only a strain-gauged bar can see this.** Do not let that literature be repackaged as a bar-IMU capability | **C** |
| Excessive arch | Reduced ROM, confounded with arm length, grip width, chest depth | **C** |
| Scapular retraction, leg drive, wrist position | **None** | **C** |
| J-curve / bar drifting to the feet | 5–15 cm sagittal displacement — the right shape, but inside the error budget and with no normative cm-level curve to score against | **B** |
| Partial ROM / not touching chest | Within-athlete consistency yes; "touched vs stopped 2 cm short" no | **B** |
| **Bouncing off the chest** | **Yes, clearly.** And the SSC potentiation half-life is **~0.85 s** (75% of the augmentation remains after a 0.35 s pause, ~30% after 1.5 s), which gives a *principled scale* for scoring a pause rather than an arbitrary threshold | **A** |
| Pause length / competition legality | **Yes** — zero-velocity dwell time | **A** |
| Uneven press, one side leading | **Yes** — differential roll | **A** |

### Olympic lifts

| Fault | Bar signature | |
|---|---|---|
| Early arm bend | **None** — internal to the lifter–bar system | **C** |
| Bar contact at the hip | **None** directly | **C** |
| Loop too far forward | **Best-supported bar-path fault in the literature** — but the make/miss difference is ~1 cm against ±5 cm SDs. Group-level valid, rep-level marginal | **B** |
| Bar drop into the catch | Successful 0.17 ± 0.04 m vs unsuccessful 0.18 ± 0.04 m (p < 0.001). Same effect-size problem | **B** |
| **Uneven pull / bar tilt in the snatch** | Coaching literature calls this "difficult to notice looking at the lifter from the side… often committed without knowledge by the coach or the athlete." **No peer-reviewed study has ever measured it** | **A** |
| Jerk dip depth and velocity | **Yes.** Bounded excursion with a clean zero-velocity anchor at the top, so drift is contained | **A** |
| Bar crashing in the clean | **Yes** — deceleration transient at the catch | **A** |

---

## 3. Bar tilt — the one genuinely unclaimed measurement

**Exactly one peer-reviewed study has ever measured barbell tilt during a lift.**

Sato & Heise 2012, *JSCR* 26(2):342–349. 28 trained subjects split by a
dual-scale standing test into equal/unequal weight distribution, back squats at
60% and 75% 1RM. They measured GRF symmetry index **plus tilting and rotational
angular bar displacement** — precisely the two DOF a dual-end IMU pair resolves.
The unequal group showed significantly greater tilt *and* rotation.

Their recommendation reads like our marketing copy: coaches should watch for
"minimal bar displacements in tilting and rotational manner."

> ⚠ **The magnitudes are paywalled and every open mirror is dead.** This is the
> only existing estimate of our primary signal's dynamic range. **Get the full
> text before setting any product threshold.**

One finding from the abstract that matters: **60% → 75% 1RM did not change tilt
magnitude.** Tilt is not simply a heaviness signal.

### There is nothing else

No peer-reviewed value for bar tilt in degrees in any other lift. No
mediolateral bar displacement in cm for the snatch, squat or bench. No
biomechanics of bar roll about the long axis. No study of asymmetric grip width.

**An empty quadrant is a moat and a liability at once** — nothing to calibrate
against, and no outcome validation.

### Three findings that constrain how tilt can be sold

**(a) The bar sees the most attenuated version of the asymmetry.** Six months
after ACL reconstruction — an unambiguous clinical asymmetry — **vertical GRF
asymmetry is only ~7–10%, barely outside healthy noise, while knee flexion
moment asymmetry is ~30–36%.** Bar-level measures see the small number.

Healthy background asymmetry for reference: hip moment SI 8.70 ± 3.98% in
trained lifters; bodyweight squat peak vGRF ~6%.

**(b) Asymmetry *falls* under fatigue — the opposite of the obvious feature.**
Hodges 2011 (17 lifters, 5×8 at 90% 8RM, bilateral force plates): mean absolute
vGRF asymmetry **4.3 ± 2.5% at reps 1–2 → 3.6 ± 2.3% at reps 7–8**, no
whole-group fatigue effect. Whittal 2020 independently found deadlift asymmetry
*improved* as reps progressed.

> **Do not ship "fatigue detection via rising asymmetry." The published evidence
> predicts the opposite sign.**

**(c) Asymmetry metrics are far less reliable than the performance metrics they
derive from.** Pérez-Castilla 2021, two sessions a week apart: performance
variables were reliable (CV 4–10%, ICC 0.82–0.97), but unilateral CMJ asymmetry
had **ICC 0.15–0.64 and Kappa −0.10 to 0.15 for agreement on the *direction* of
asymmetry** — which limb comes out on top is near-random week to week.

**The bright spot: bilateral tasks were substantially better — Kappa 0.65–0.74.
A barbell lift is a bilateral task.** That is a real reason to expect our
measurement to behave better than the unilateral-testing literature suggests.

Tempo confound: a metronome **halved squat asymmetry and reversed its
direction**. Any asymmetry metric must be tempo-normalised or it tracks cadence.

### Injury claims are not available

| Evidence | Result |
|---|---|
| Helme 2021, 31 papers, 6,228 participants | 8 studies no association, 10 partial, 10 significant — "moderate to lower quality evidence" |
| Guan 2022, 28 prospective cohorts | 10 of 15 dynamic balance and 6 of 14 strength studies found nothing — "highly inconsistent" |
| Simonsson 2024, 233 athletes, 37 second ACL injuries | The ≥90% LSI threshold was **never validated**; best cut-offs gave **AUC 0.50–0.59** — chance level |
| Bishop 2021 | Within the *same* isometric squat trials, peak-force asymmetry 8.4–9.0% vs impulse asymmetry 9.6–15.5% — one test, two metrics, straddling the magic 10% line |

**Not one study in either systematic review measured asymmetry during a barbell
lift.** There is no route from a bar-tilt number to an injury probability that
survives scrutiny.

---

## 4. What is well-validated: fatigue

This is the strongest part of the evidence base and it maps directly onto our
hardware.

**Velocity loss vs independent fatigue markers** (Sánchez-Medina &
González-Badillo 2011, 18 trained males, 21 sessions):

| Against | r |
|---|---|
| Blood lactate | **0.93–0.97** |
| Countermovement jump height loss | 0.92 |
| Decline in V₁-load performance | 0.91 |
| Ammonia | R² 0.85 |

These are extraordinary correlations for exercise physiology. Velocity loss is
about as well-validated as any non-invasive fatigue proxy in strength science.

**The dose mapping** (Jukic 2023 meta-analysis): **20% velocity loss in the
squat ≈ 50% of the maximum possible reps; 40–50% ≈ at or near failure.** At
heavier loads allow less VL for the same proximity to failure (~2.5/5/10
percentage points less at 75/80/85% 1RM). MPV of the last rep of a set to
failure is **0.12–0.14 m/s regardless of load** across 50–85% 1RM.

### The honest caveat

The R² ≈ 0.96 VL equations come from **Smith-machine, paused-rep,
tightly-load-controlled** protocols. Free-weight barbell is the hard case — and
that is our entire market.

Jukic 2023 (*Eur J Appl Physiol*), 46 trained participants, **free-weight** back
squat: general models R² **0.67–0.80** (vs ≥0.93 on Smith machines), and **mean
absolute prediction error in a subsequent session exceeded 10% at every load,
for both general and individual models.** Their conclusion: VL "does not seem to
provide any additional benefits compared to more traditional methods."

### The best argument for shipping it anyway

Dello Iacono 2025: 20 resistance-training coaches watched video of bench and
squat at 45/65/85% 1RM and indicated when 20% and 40% velocity loss occurred.
**Average absolute error: 2.6 repetitions.**

The value proposition is not that velocity loss is precise. It is that the
alternative — a coach's eye — is worse.

### Other fatigue signals available from the bar

- **Time-to-peak-velocity as a fraction of concentric duration.** Duffey &
  Challis 2007: under fatigue, peak upward velocity occurs **much earlier** in
  the lift, and time to lift the bar **more than doubled** from first to last
  rep at 75% 1RM. This is independent of velocity magnitude and almost nobody
  ships it.
- **Sticking-region duration increases** across a set (η² = 0.33–0.54).
- **Rep-to-rep variability rises with intensity** (ηp² = 0.28–0.39;
  IMU-derived DFA/SampEn/FuzzyEn increase significantly). Caveat: trained
  lifters maintain *more* consistent technique under load, so rising variability
  is not universally bad — baseline per user, per exercise, per load band.
- **ROM does *not* collapse under fatigue** (ηp² ≤ 0.15 squat; no bench
  displacement change 1RM→10RM). Don't build a fatigue feature on ROM.

### Sticking-region locations, for feature engineering

| Lift | Location |
|---|---|
| Back squat | vmax1 at **12.2 ± 3.7%** of upward displacement, vmin at **39.7 ± 9.7%** |
| Bench press | ~23–38 cm above chest |
| Overhead press | ~47–56 cm above start (shorter moment arm, 10 cm vs bench's 25 cm) |
| Deadlift | At/near the floor and knee — **not** at ~15% of the concentric. No published fraction-of-ROM figure exists. Gap. |

A sticking region appears **only above ~85–90% 1RM** in single lifts, so its
presence is itself a binary near-maximal indicator.

---

## 5. The false-positive arithmetic

Parasuraman & Riley's *disuse* mechanism: automation gets abandoned because of
"alarms that activate falsely, often because the **base rate** of the condition
to be detected is not considered."

Bad reps are the minority class. At a 10% base rate:

| Sensitivity | Specificity | Per 100 reps | **Precision** |
|---|---|---|---|
| 80% | 85% | 8 true alerts, 13.5 false | **37%** |

The device becomes the thing that cries wolf, and the user is *correct* to
distrust it. False alarms are more damaging than misses because they are more
cognitively salient.

Two confirmations from the field:
- Perceived inaccuracy is a primary wearable-abandonment driver, and the
  frustration is **strongest among athletes and advanced exercisers** — exactly
  our market.
- TechRadar on Garmin's auto-detection: users' eyes were "consistently drawn to
  it throughout their set, to ensure it was recording correctly." **A feature
  meant to remove cognitive load added it.**

> **Design rule: set the operating point by precision, not accuracy.** Pick the
> threshold where precision ≥ 0.9 on held-out *subjects*, accept whatever
> sensitivity that leaves — it may be 0.2 — and say nothing the rest of the
> time. Silence is free.

Tempo, the one shipped product with a published design rationale, states its
cues are "not designed to appear 100% of the time, as this can be demoralizing."
Sparse is both the evidence-backed answer and the industry-converged one.

---

## 6. Feedback design

Three findings that point in different directions and have to be reconciled.

**(a) Feedback works, acutely, and per-rep visual is best.** Weakley 2023
meta-analysis, 20 studies: acute velocity improvement **g = 0.63 (≈8.4%)**;
**visual g = 1.11 vs verbal g = 0.47** (p = 0.027); most effective **when
provided after each repetition**.

**(b) But frequent feedback degrades *learning*.** The guidance hypothesis
(Salmoni, Schmidt & Walter 1984; Winstein & Schmidt 1990): high-frequency
knowledge of results improves immediate performance but impairs retention,
because learners stop developing intrinsic error detection. Reduced and faded
schedules produce **equal or superior retention at delayed test**. Concurrent
feedback gives the smallest practice error and the **largest retention error**.

> Caveat: this literature is overwhelmingly simple lab tasks with young adults.
> Extrapolating to barbell technique is an inference, not a finding.

**(c) External focus of attention beats internal — and this is free for us.**
Chua et al. 2021, *Psychological Bulletin*: performance g = 0.264 (73 studies);
**retention g = 0.583; transfer g = 0.584** (40 studies). Neither age, health
status, skill level, nor their interactions moderated the effect.

External focus means attending to the *movement effect* — the bar — rather than
body parts. **A device whose entire vocabulary is about the bar is by
construction an external-focus coaching device.** "Drive the bar up in a
straight line" is external; "engage your glutes" is internal. This is a real,
meta-analytically supported advantage of bar-based over body-based feedback, and
it comes free with the sensor placement.

> Scepticism: the meta-analysis is by the hypothesis's originators and excludes
> grey literature — the standard recipe for inflated pooled effects. The
> *direction* is well-supported; don't treat g = 0.58 as load-bearing.

### The reconciliation

**Every-rep feedback for the performance variable (velocity). Faded,
exception-only feedback for the technique variable.**

| Variable | Timing |
|---|---|
| Velocity, rep count, load | Real-time, every rep, **visual** |
| Set-level fatigue / "stop here" | Real-time — it must be actionable before the next rep |
| Technique deviation | **Post-set, faded, exception-only** |
| Trends, PRs, template drift | Post-session |

Formulift — the one deployed system with published user data (SUS 79.2) — does
exactly this split: real-time vibration and rep count, post-set RAG-coded
technique rating.

On cue count: no rigorous experiment fixes how many simultaneous technique cues
a lifter can act on. **Treat "one cue per set, at most" as a well-motivated
heuristic, not an evidenced parameter.**

Self-controlled feedback (user chooses when to receive it) matches or beats
imposed schedules for retention — so making it opt-in is both better for
learning and safer for trust.

---

## 7. Regulatory framing

Not legal advice. The point is that **the copy is the regulatory artefact** —
intended use is established by marketing, app strings and support articles.

**UK / MHRA** is the most permissive and unusually explicit:

> "The monitoring of general fitness, general health and general wellbeing is
> not usually considered to be a medical purpose."

> "Prevention of disease… **does not include products that claim to prevent
> injury or handicap**."

But MHRA publishes an **indicative trigger-word list** — "Protects against…",
"Prevents…", "Corrects", "Alarms", "Reduce pain" — each qualified by needing "a
link to a specific disease, injury or handicap." So phrasing still matters:
"protects against back injury" pairs a trigger verb with a named injury.

**EU / MDR** is narrower but structurally similar: the *disease* limb covers
prevention; the **injury limb does not** (only "diagnosis, monitoring,
treatment, alleviation of, or compensation for"). Rule 11's effect is that *any*
qualifying medical device software providing information for decisions is at
minimum Class IIa — which is why staying out of qualification entirely is the
only sensible strategy.

**US / FDA General Wellness** explicitly names as covered: claims to "improve
physical fitness, develop or improve endurance, **strength** or coordination."
That is squarely our claim space.

### Wording

| Say | Not | Why |
|---|---|---|
| "Your bar tilted 4° left on reps 6–8" | "You have a left-side weakness" | Measurement vs diagnosis |
| "Bar path drifted forward more than usual" | "You're rounding your back" | We measured the bar, not the spine — and §2 says we *cannot* measure the spine |
| "Bar speed dropped 32% across this set" | "You're overtrained" | Descriptive vs clinical state |
| "Consider stopping the set here" | "Stop — this rep is dangerous" | Suggestion vs urgent-safety claim |
| "Helps you train with more consistent technique" | "Protects against back injury" | Trigger verb + named injury |

Keep a **claims register**: every user-facing string asserting something about
the body gets checked against the MHRA trigger list and the FDA Category-1 list
before shipping.

### How the incumbents word it

Tempo: "Leaning backward" → "adjust your form to prevent unnecessary **strain**
on your spine"; ships a **"barbell asymmetry"** cue already. Tonal: senses
"pace, range of motion, positioning, balance, symmetry, and smoothness" —
entirely measurable kinematic dimensions, no anatomical diagnoses. Output
Sports: publishes validity figures (single-leg squat 92% accuracy, **78%
sensitivity, 97% specificity**) and lets the numbers carry the claim.

That last shape — high specificity, mediocre sensitivity — is the correct trade
for trust, and publishing it is the model to emulate.

---

## 8. What to ship first

**A fatigue and consistency instrument, not a form judge.**

v1 says exactly three things:

1. **Per-rep velocity, live, large, visual.** The one intervention with a
   meta-analytic effect size in resistance training specifically (g = 0.63), and
   the one measurement our hardware is validated to make (ICC 0.91–0.96). Pure
   knowledge-of-results, so there is **no false-positive class** — the number is
   either right or the device is broken, and users can sanity-check it
   themselves.
2. **Velocity loss across the set**, with a user-set stop threshold. Backed by
   r = 0.92–0.97 against independent fatigue markers. Opt-in and user-chosen,
   which is also better for retention.
3. **Post-set only: one consistency observation, and only above a precision
   bar.** Compare this set to the user's own baseline for that exercise and load
   band, built from their own fresh reps by soft-DBA. *"Bar tilt averaged 4°
   left across this set (your usual: 1°)."* Threshold so measured precision on
   held-out subjects is ≥ 0.9. If that means it fires on 5% of sets, fire on 5%.

**And the fourth rule, which is really the product decision: default to
silence.**

### What v1 must not do

- **No overall "form score."** No ground truth exists to validate it against.
- **No named anatomical errors.** Not "rounded back," not "knee valgus," not
  "butt wink." State-of-the-art computer vision, with full-body visibility,
  expert labels and thousands of samples, detects knee valgus at **F1 0.53** and
  lumbar error at **F1 0.63**. That is the ceiling, and from the bar it is not a
  measurement problem but an **observability** problem.
- **No injury language.** Not "dangerous," not "injury risk," not "protects
  against."
- **No global model deciding whether a rep is good.** 64% accuracy, 28%
  specificity, five body sensors.

### Earning the right to say more

Everything in the **B** tier becomes shippable once there are (a) enough per-user
reps for a stable personalised template, and (b) a synchronised phone-video
validation set, physio-labelled, evaluated **subject-wise**. That last
discipline is the one the rehab benchmark literature has only just discovered it
was missing — two 2025–26 re-analyses found subject leakage inflating every
published number, and that under proper subject-disjoint splits, **detecting the
incorrect class is much harder than headline accuracy suggests** (best
incorrect-class recall 0.629).

Publish sensitivity and specificity the way Output Sports does. In a category
where nearly every claim is unvalidated, a published, honest, deliberately
narrow number is a durable differentiator — and the cheapest liability insurance
available.

---

## 9. Two concrete actions

1. **Get Sato & Heise 2012 (*JSCR* 26(2):342–349) in full text.** It is the only
   document that tells us the expected dynamic range of our primary signal, and
   every open route to it is dead. Institutional access or an author email.
2. **Run the Liu et al. 2025 protocol with bar tilt instrumented.** They
   deliberately offset-loaded a barbell by 5.65 and 10.32 kg on 20 trained
   lifters, measured joint moments and EMG, and **did not measure bar tilt**.
   That is our validation study, already designed and already run, missing
   exactly one instrument. It would give the tilt-vs-offset-load transfer
   function and a defensible calibration.

A third, cheaper and more strategic: **publish the numbers the field is
missing** — absolute anterior-posterior bar displacement in the back squat,
bar-to-midfoot distance in the deadlift, loop width in the RDL and row, and
mediolateral bar displacement in anything. Every one is an acknowledged gap.
Owning them is worth more than any inference about knees or spines.

---

## Key sources

- Whelan, O'Reilly, Ward, Delahunt & Caulfield — personalised vs global squat classification, UCD Insight
- O'Reilly et al., *Classification of deadlift biomechanics with wearable IMUs*, J Biomech 58:155–164, 2017
- O'Reilly et al., *Formulift*, JMIR mHealth uHealth 6(1):e33, 2018
- Parmar, Gharat & Rhodin, *Fitness-AQA*, ECCV 2022 — https://arxiv.org/abs/2202.14019
- Sato K & Heise GD, *JSCR* 26(2):342–349, 2012 — **the only bar-tilt study**
- Hodges, Patrick & Reiser, *JSCR* 25(11):3107–3117, 2011 — asymmetry falls with fatigue
- Pérez-Castilla et al., *PLoS ONE* 16(7):e0255458, 2021 — asymmetry reliability
- Simonsson et al., *BJSM* 59(6), 2024 — the ≥90% LSI threshold is unvalidated
- Helme et al., *Phys Ther Sport* 49:204–213, 2021; Guan et al., *J Clin Med* 11(2):360, 2022
- Sánchez-Medina & González-Badillo, *MSSE* 43(9):1725–1734, 2011 — velocity loss validation
- Jukic et al., *Sports Medicine* 53:177–214, 2023 (meta) and *Eur J Appl Physiol* 123(6), 2023 (the free-weight caveat)
- Dello Iacono et al., *Sports Med Open*, 2025 — coaches err by 2.6 reps
- Duffey & Challis, *JSCR* 21(2):556–560, 2007 — fatigue effects on bar kinematics
- van den Tillaar, Knutli & Larsen, *Front Sports Act Living* 2:604177, 2020 — squat sticking region
- Weakley et al., *Sports Medicine* 53(9):1789–1803, 2023 — feedback meta-analysis
- Chua, Jiménez-Díaz, Lewthwaite, Kim & Wulf, *Psychological Bulletin* 147(6):618–645, 2021 — external focus
- Salmoni, Schmidt & Walter, *Psych Bulletin* 95:355–386, 1984; Winstein & Schmidt, *JEP:LMC* 16(4), 1990
- Parasuraman & Riley, *Human Factors* 39(2):230–253, 1997
- MHRA, *Medical device stand-alone software including apps*, v1.10f
- MDCG 2019-11; FDA *General Wellness: Policy for Low Risk Devices* (rev. 2026)
