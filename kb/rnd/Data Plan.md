# Data Plan

How to get from zero proprietary data to a shippable exercise-ID model, for one
engineer.

Research wave 7, 2026-08-16. Depends on [[Exercise Recognition]] for what to
build and [[Kinematics Pipeline]] for what has to work first.

---

## 1. The five findings that set the shape

1. **Subjects dominate reps.** Downstream performance rises ~linearly in
   **log(number of subjects)**; cutting per-subject data 4× at fixed subject
   count barely degraded results. **20 lifters × 20 reps beats 2 lifters × 200
   reps, decisively.** Every incentive pushes the wrong way here — more reps
   from a willing subject is free, another subject is £35 and a morning.
2. **Universal exercise ID works; universal form classifiers don't.** RecoFit
   hit 96–99% with no user-specific training. O'Reilly's 80-participant deadlift
   study found personalised classifiers worked from a single IMU while universal
   ones "may not be appropriate… due to poor accuracy achieved." **Ship ID as
   universal, form as personalised or not at all.**
3. **Labelling cost is 1.2–20× realtime, and the spread is an *interface*
   effect.** Opportunity took 14–20 h of annotation per hour of footage;
   timestamp-only supervision cuts it **6×**. **Pre-segment with signal
   processing, have humans only correct.**
4. **The "user labels for you" bootstrap has documented precedents** — and they
   all work by **correcting a prediction**, never by asking from a blank slate.
5. **The synthetic-data opportunity is rigid-body physics, not video.** Every
   published failure of virtual-IMU work traces to placement, orientation or
   pose uncertainty. **We have none of those** — the mount fixes sensor pose to
   millimetres.

---

## 2. Decisions that precede any collection

| Decision | Answer | Why |
|---|---|---|
| **v1 catalogue** | **8 classes**: back squat, front squat, conventional DL, sumo DL, bench, OHP, row, hip thrust. Plus **4 non-exercise**: rest, unrack/rerack, plate loading, walking-with-bar. Everything else → **unknown** | RecoFit: 99% at 4 classes → 96% at 13. Fitbod's real catalogue is **505 exercises** — unlearnable at any data volume. Explicit non-exercise classes beat one NULL bucket |
| **Hierarchy** | L1 = movement pattern, L2 = variation. **Score separately** | The bar may genuinely not see front vs back squat. Don't promise what physics forbids |
| **Form in v1** | **Intra-user deviation only** | See [[Form Analysis]] §1 |
| **Evaluation** | LOSO always, report mean **and worst subject**. Leave-one-session-out as a second axis. Event-level fragment/merge/insert/delete alongside frame F1 | Random k-fold inflates ~10%, ~16% with overlapping windows |
| **Rate** | ≥200 Hz, both IMUs, logged clock skew | Impact transients reach 50–100 Hz. See [[Kinematics Pipeline]] §1 |

### Two evaluation traps

**Never split within a session.** Overlapping sliding windows share samples, so
a random split puts near-duplicates in train and test. And run
leave-one-*session*-out as well as leave-one-subject-out: if LOSO looks fine and
LOSessionO collapses, **you learned the mount**, not the exercise.

**Frame F1 will actively misrank your models.** For a rep counter,
*fragmentation* (one rep → two) is catastrophic and nearly invisible in frame
F1, while *boundary jitter* costs frame F1 and is harmless. A model with 3%
overfill and no fragmentation beats one with 1% overfill and 5% fragmentation;
frame F1 says the opposite. Report event-level metrics from day one.

---

## 3. Expected learning curve

No barbell-IMU learning curve exists in the literature. Extrapolated from
adjacent domains, for a closed 8–15 class catalogue:

| Subjects (LOSO) | Expected top-1 | Note |
|---|---|---|
| 1–3 | 60–75% | Fitting individuals, not the movement |
| **5** | 80–88% | First point where LOSO numbers mean anything |
| **10** | **90–94%** | **The MVP gate.** Diminishing returns begin |
| **20** | 93–96% | Marginal subject ≈ +0.2–0.4 pp |
| 50–100 | 95–98% | Only via the in-app flywheel; value is *tail coverage*, not headline accuracy |

Reps per subject saturate far earlier — **10–20 per exercise per subject** is
enough; under 100 s per class gives the sharp gain and 10 min/class is within 6%
of asymptote.

> These bands are extrapolation, not measurement. **The first thing this plan
> should produce is our own curve** — retrain at n = 2, 4, 6, 8, 10 and plot it.
> One afternoon, and it replaces the whole table above.

---

## 4. Label sources, ranked by cost

| Method | £ per hour of labelled data | Quality | Scales? |
|---|---|---|---|
| You label video-synced IMU in ELAN | £25–75 | Highest | No — caps at ~5 h/week |
| Freelance annotator + your spot-check | £20–90 | Good with a revision pass | Moderate |
| **Pre-segmenter + human correction only** | **£8–35** | Good | Moderate–good — **the 5–6× lever** |
| Voice annotation while lifting | £5–15 | Set-level, ±1 s | Poor, but great solo |
| Participant self-label in-app | incentive only | Set-level | Good |
| **Shipped-app flywheel** | **≈£0 marginal** | Noisy, biased | **Unbounded** |
| **Weak supervision (physics rules)** | **£0** after ~2 days | Moderate | Unbounded |
| **Self-supervised pretraining** | **£0** | n/a | Unbounded — cuts labelled need ~10× |
| Physics simulation | £0 after 1–3 weeks | Exact for kinematics, wrong for form | Unbounded |
| Commercial annotation service | £30–600 | Variable, no domain knowledge | Uneconomic at our scale |

### Tooling

**ELAN** (free, GPL) for our own labelling — its Timeseries Viewer takes linked
CSV alongside video with unlimited hierarchical tiers, and the keyboard workflow
is the fastest available. **Label Studio** (Apache-2.0) when handing work to a
freelancer — it gained native video+timeseries sync in 1.20.0 (July 2025). Set
`frameRate` explicitly or sync drifts.

**ANVIL is licence-disqualified** (research/education only). CVAT has no numeric
timeseries lane.

### Clock drift will bite

Free-running RTCs on separate devices drift ~2 ms/min — **~1.2 s over a
10-minute block**. Put a sync impulse at the start *and* end of every recording
and least-squares the drift between them. For barbell work the natural impulse
is **dropping the bar onto the rack pins once** — an unmistakable simultaneous
spike in accel, gyro and audio.

### Weak supervision is unusually strong here

Physics gives high-precision labelling functions for free:

- Vertical displacement > 40 cm AND bar starts at floor ⇒ deadlift family
- Bar starts at shoulder height AND net displacement ≈ 0 AND concentric-first ⇒ squat family
- Bar path predominantly horizontal ⇒ press family
- Peak accel > 5 g with no matching concentric ⇒ **dropped bar** (hand rule, never a learned class)
- Rep count from zero-velocity crossings ≠ logged rep count ⇒ **label suspect**

Each is individually wrong sometimes; a Snorkel-style label model resolves the
disagreements. **~2 days, works on day one with zero data.**

---

## 5. The flywheel, and the four ways it poisons itself

Documented precedents: **Oura** shipped a weak model, let users *correct* the
prediction, retrained on corrections → **89% across 40+ activity types, up to
+50% on niche classes**. **Strava**: "thanks to our community, who has been
manually flagging activities for years, we have a large labeled dataset."
**WHOOP** contrasted logged workouts against *unlogged* activity as negatives.

Note also: **asking the user to pick the exercise is already the category
norm** — every VBT device does it. Auto-ID is a friction *reduction* we can
market, not friction we're adding.

### The four failure modes, each with a cheap fix

**(a) Runaway feedback loop.** Ensign et al. (2018) prove the loop diverges when
model output determines what data gets observed. The moment we auto-suggest and
the user taps "yes", the label distribution is *the model's prior, not the
world's*.
→ **Log whether each label was typed from scratch vs accepted from a
suggestion.** Train on freely-chosen labels or inverse-propensity-weight the
accepted ones.

**(b) Position bias.** An exercise picker sorted by frequency **is a ranker**.
"Back Squat" at position 1 gets selected over "Front Squat" at position 9 on
some front-squat sets.
→ **Log the rendered ordering and chosen rank.** Unrecoverable retroactively.

**(c) Survivorship bias.** Fitbod, 389,481 users: 52-week adherence is
**beginners 10.1%, intermediate 18.3%, advanced 25.8%**; beginner median dropout
19 weeks. Our corpus will describe **advanced, adherent lifters**, while
beginners — whose form varies most and who are the largest market — churn out of
exactly the region where the classifier is weakest.
→ **Log user tenure; over-weight early-tenure sessions; stratify eval by
tenure.**

**(d) Logged-as-planned, not as-performed.** Planned-vs-performed adherence
ranges **1.2% to 166.7%**. Trackers cause this by prefilling last session's
weights and reps, so an accepted default *is* the plan masquerading as the
performance.
→ **The IMU is the referee.** Any set where logged rep count ≠ detected rep
count is a candidate label error. That disagreement is a free trigger.

Also: **warm-up sets are unlabelled by convention** — coaching guidance says
they shouldn't be tracked. So each session has a prefix of lighter, faster reps
of the same movement. Propagating the session label naively **poisons the load
estimator**, which is the core thesis.

### Label noise tolerance

Deep nets tolerate massive *uniform* noise. Ours is **systematic,
class-conditional and asymmetric** (front-squat-as-back-squat), which shifts the
decision boundary rather than blurring it. Two cheap defences:

- **Co-teaching** — two networks exchange small-loss samples, ~30 lines on a
  normal training loop. Use the stochastic variant so you don't need to know the
  noise rate (you won't).
- **cleanlab / confident learning** — `find_label_issues` on out-of-fold
  probabilities. Benchmark audits confirmed **51% of flagged candidates were
  genuinely erroneous**. At 50% flag precision a few hundred reviews buys a
  materially cleaner core — and **we can replay the IMU trace and adjudicate in
  seconds**, which almost no other domain can.

### Session labels → rep boundaries, for free

A session label is a **bag label** and the windows inside are instances — this
is multiple-instance learning. Attention-MIL pooling predicts the session *and*
localises the sets, so retrospectively-logged data still yields boundaries.

**Low-attention instances = warm-up / failed rep / drop candidates ⇒ quarantine,
don't discard.** That queue is both the review pile and the hard-negative mine.

---

## 6. Synthetic data: physics yes, video no

### Why video-to-IMU doesn't apply

IMUTube's own numbers: on PAMAP2 11-class, **every addition of virtual data
hurt** (0.7225 real-only → 0.7111 mixed). Without distribution mapping virtual
data is worthless (0.29 vs 0.83 F1). The 2020 system produced **accelerometry
only, no gyroscope**. Compute is **~30× slower than realtime** — 41 h of data is
~1,200 GPU-hours.

The decisive finding is the **Motion Subtlety Index**, with an empirical cut-off
at **≈0.9**: above it, virtual IMU "no longer improves classification
performance and can actually degrade" it, per-class **−7.5 to +2.5 pp**.
Bench vs overhead press is coarse — favourable. Bar drift, asymmetric tilt,
depth cut short are subtle — the wrong side of the line.

And on the two gym-adjacent datasets IMUGPT tested, synthetic data was
**neutral-to-harmful in 5 of 6 configurations**, worst for the deepest models.

> Also note **US 12,236,616** is granted and maps 1:1 to the IMUTube method.
> Clear it before building on that approach.

### Why physics simulation does apply

| Nuisance | Body-worn | Bar-mounted |
|---|---|---|
| Sensor placement | Unknown, drifts | **Fixed by the mount, known to mm** |
| Orientation | Arbitrary | **Fixed; only roll about the bar axis is free** |
| Underlying body | Deformable, soft-tissue artefact | **Near-rigid steel beam** |
| Forward model | Needs full-body pose estimation — *the* error source | **Closed-form rigid-body kinematics** |
| Ground truth | Needs a mocap lab | **A parameterised bar path *is* the ground truth** |

**Every published failure mode of virtual IMU traces to placement, orientation
or pose uncertainty. None apply.**

The forward model is textbook strapdown INS:

```
a_sensor = R(q)ᵀ(a₀ − g) + ω̇ × r + ω × (ω × r)
```

The multi-IMU version — several rigidly-coupled IMUs from one B-spline
trajectory under rigid-body constraints — is **already derived and
open-sourced** (Huai & Huang, arXiv:2308.05303). That is our dual-IMU simulator,
off the shelf.

Use `gnss-ins-sim` for the error model (far more mature than IMUSim, which is
GPL-3.0 and Python-2-era) and `imu_utils` to fit it to **our own** static
recordings rather than the datasheet.

**SNR is not the problem.** For a modern part (ICM-42688-P, 70 µg/√Hz), accel
noise ≈ 1 mg RMS against barbell accelerations of 0.5–2 g. **The sim-to-real gap
is dominated by whether the trajectory model is right, not by noise.**

**But measure the whip, don't simulate it blind.** Chiu (2010) measured 8 bars:
**no hysteresis under cyclic loading** (so linear Euler–Bernoulli is defensible)
and 4–5 cm deflection at max load. Langlois (ASA 2026) reports modal behaviour
depends mostly on **sleeve geometry**, so whip varies by brand. **No published
natural frequency or damping ratio exists for a loaded Olympic bar.** Twenty
minutes with our own IMU beats the literature — and that gap is itself the
finding.

### The near-term win: physically-plausible augmentation

Perturb movement amplitude, speed, sensor placement and hardware noise/bias
**in simulation** rather than perturbing raw signals. Published: **+3.7 pp
macro-F1 average (max +13), and 40–80% fewer training subjects for equal
performance.** Its stated limitation — needs paired IMU + mocap to identify
parameters — is precisely the limitation we don't have.

**Best payoff-per-hour in this entire plan.**

### Where synthetic will actively hurt

- **Form feedback.** Synthetic bad-form data encodes *our assumptions* about bad
  form, and the classifier learns the assumptions rather than reality.
- **Ratios above ~1:1–1:5** — monotonic degradation past that.
- **Deep models on mostly-synthetic data** — losses were worst for the deepest
  models. Random forest on ECDF features was the most synthetic-robust backend
  across three separate papers.
- **Classes that differ in the human, not the bar.** A bar simulator cannot
  distinguish front from back squat. It will confidently generate
  indistinguishable examples for distinct labels and bake in an unfixable
  confusion.

---

## 7. Personalisation and open-set

**Personalisation gains are the largest numbers in the whole research wave.**

| Evidence | Result |
|---|---|
| Weiss & Lockhart 2012 (WISDM) | Impersonal ~71%, **personal ~97%** |
| Uncertainty-aware few-shot adaptation, 2026 | **3 s of calibration per class**: +2.76 to **+33.44 pp** macro-F1 supervised; **+0.56 to +32.13 pp unsupervised** |
| Few-shot transfer, 2024 | 3-way 5-shot: 79.2% for known activities from a **new** user |

Three implications:

1. **Build personalisation into v1.** A 60-second onboarding — "three reps of
   each of your main lifts" — buys +3 to +33 pp. It is also a natural moment to
   confirm bar weight, mount orientation and the user's exercise set.
2. **Nearest-neighbour-on-embedding, not fine-tuning.** Prototypical networks
   are gradient-free, run on-device, add no training infrastructure and cannot
   catastrophically forget. For one engineer this is correct; MAML is not.
3. **Unsupervised adaptation gives most of it** — up to +32 pp with *no* labels,
   so we can adapt silently for users who skip onboarding.

> ⚠ **This interacts with the patent position.** [[Competitive Landscape]] §4
> notes that US9171201B2's claim 1 requires a *learning mode* where the user
> records reps to build the model. Keep the **universal recognition classifier
> factory-pretrained** and the **per-user form template** architecturally
> separate, and document why.

### Open set

**"Unknown exercise" is a legitimate and often correct output**, and far cheaper
than being confidently wrong.

Best current evidence: **KDE or GMM over class-conditional logits, AUROC
≈ 0.90–0.91**, applied **post hoc with zero closed-set accuracy cost**.
Confidence-threshold methods were less stable.

The failure mode: when the unknown resembles a known class, *all* methods
collapse to AUROC 0.55–0.72. Mitigation from the paper — **include at least one
baseline/low-motion class in training**, which is why §2's catalogue has four
explicit non-exercise classes.

| Confidence state | Behaviour |
|---|---|
| High, single class | Log silently |
| Ambiguous between 2–3 | Top choice + one-tap alternative. **This is the active-learning query** |
| Below open-set threshold | "Unknown exercise — tap to name it." Still log velocity, reps and load; those are exercise-agnostic |
| Physics rule fired (drop, no concentric) | Handle explicitly, never let it reach the classifier |

**Set the threshold from business asymmetry, not AUROC.** Strava tuned
deliberately for low false positives. Mislabelling a set is more annoying than
admitting ignorance — and a confidently-wrong label the user accepts *poisons
the training set*, whereas an "unknown" prompt harvests a clean one.

---

## 8. Legal (UK)

> Not legal advice. Enough to design the study correctly; get an hour with a
> solicitor before public collection.

- **Register with the ICO — £52/yr Tier 1.** R&D filming is not exempt.
- **Lawful basis: consent**, with **separate tick-boxes** for recording,
  retaining video, training use, and any external use. One combined box is
  invalid.
- **The trap:** ICO is explicit that if you rely on consent you **cannot later
  switch to another basis**. Keep per-participant data separable and deletable,
  derive features early, delete raw video on a short clock.
- **Bystanders: the household exemption does not apply at all.** Best mitigation
  is structural — **hire a private space with exclusive use**. Then frame tight
  on bar and torso with a wall behind (which is also better training data), and
  **blur at ingest, not at export**.
- **Biometrics — a two-stage test.** ICO lists gait among behavioural
  biometrics, but Article 9 bites only when processing is *for the purpose of
  uniquely identifying a person*. Bar kinematics for exercise ID is **not**
  special category data. Three bright lines that would flip it:
  **don't build user identification** ("recognise which household member is
  lifting" — tempting for a shared-home product), **don't infer health**, and
  **don't assume anonymity** — bar-path signatures are plausibly distinctive.
- **The video is a bigger exposure than the IMU.** Collect video only in the
  controlled study phase; **ship IMU-only**.
- **DPIA: treat as mandatory** — the project stacks multiple ICO triggers.
- **Gym permission.** Chains tightened filming rules through 2024. The practical
  route is hiring an independent powerlifting gym off-peak: **£100–200 flat for
  a private morning**, and many owners will help recruit — their members are our
  users.
- **If the shipped app trains on user data: opt-in only, default off, not in the
  T&Cs.** LinkedIn attempted opt-out AI training in Sept 2024 and **the ICO made
  them suspend it**; Meta paused the same. If Meta and LinkedIn got stopped, we
  will be.

---

## 9. The programme

### Week 1 — zero cost, no participants

1. Register with the ICO (£52); write the DPIA, participant information sheet
   and consent form.
2. **Clone RecoFit now** — repo archived read-only June 2026. Wrong sensor
   location so not for training, but it lets us build and validate the
   segmentation and rep-counting pipeline **before a single unit ships**.
3. **Build the physics simulator** — parameterised bar path → rigid-body
   kinematics at two known lever arms → error model. **Simulate the inter-IMU
   clock skew**; [[Kinematics Pipeline]] §1 says it is the highest-severity
   failure.
4. **Write the unsupervised rep segmenter** (zero-velocity crossings +
   autocorrelation + energy). Validate on RecoFit. **This is the 5–6× labelling
   lever — build it before budgeting a single annotation hour.**
5. Write the physics labelling functions and wire up a label model.
6. Install ELAN, link an MP4 to an IMU CSV, confirm the format works.

**Gate:** does the simulator produce a plausible squat trace, and does the
segmenter hit >90% rep recall on RecoFit?

### Weeks 2–4 — n=1, you

1. 6–10 sessions across all 8 classes, 3 bar models, 40% to near-limit, **mount
   rotation randomised each session**. Bar-drop sync impulse at start *and* end.
2. **Label all of it yourself in ELAN.** 10–15 h of recording. This is not for
   the model — it is to discover what a rep boundary means for a hitched
   deadlift, and to write the annotation spec. **You cannot write a spec you
   haven't executed.**
3. **Measure your own φ** (annotation hours per recording hour). This sets every
   downstream budget.
4. **Measure the whip** on 3 bars at 3 loads. Fit EI and first-mode frequency.
   The literature does not have these numbers.
5. Calibrate the simulator against this data.

**Gate:** does an 8-class model trained on you alone, tested on a **held-out
session**, exceed 90%? If it fails leave-one-session-out on a *single* subject,
the sensor or the features are wrong and no number of subjects will fix it.

### Month 2 — n=10, the scripted core

1. Book an independent powerlifting gym, off-peak, **exclusive use**. 3 mornings
   × 4 h.
2. Recruit 10 lifters, stratified: ≥4 female, height 1.55–1.95 m spread, ≥3
   novices, ≥3 advanced. **Over-recruit beginners** — hardest case, fastest
   churn.
3. ~75 min each: consent → mount + sync → 8 classes × 3 sets × 5–8 reps at 3
   loads → **deliberately induced edge cases** (failed rep, dropped bar, hitched
   deadlift, bailed squat) → sync.
4. Participant announces the exercise verbally *and* taps a button; the
   segmenter pre-labels; **you only correct boundaries**.
5. One fixed camera, tight on bar + torso, wall behind, blur at ingest.

| Item | Cost |
|---|---|
| Gym hire, 3 mornings | £300–600 |
| 10 participants × £35 | £350 |
| Contingency | £200 |
| **Cash total** | **£850–1,150** |

**Gate:** LOSO ≥90% top-1, worst subject ≥80%, event-level fragmentation <3%.
**And plot the subject learning curve at n = 2, 4, 6, 8, 10** — that replaces
§3's extrapolation with our own number and decides whether month 3 is worth it.

### Month 3 — n=20 only if the curve says so

**If still climbing steeply at n=10:** second collection to n=20, different gym,
different bar brands, deliberately outside the first sample's demographic
(£850–1,150 again).

**If flattened:** skip it and spend the time on physically-plausible
augmentation (+3.7 to +13 pp, days of work, zero cash), self-supervised
pretraining on unlabelled streams (~10× less labelled data needed), the open-set
head (AUROC ~0.90, post hoc, zero closed-set cost), and few-shot
personalisation.

**Ship gate:** LOSO ≥93% on 8 classes, worst subject ≥85%, open-set AUROC ≥0.85,
rep count within ±1 on ≥95% of sets, whole stack running on-phone in real time.

### Months 4–6 — the flywheel

**Instrument the app from day one.** None of this can be backfilled:

| Log | Why |
|---|---|
| **Label provenance** — typed / picked-from-top-3 / accepted-suggestion / edited-later | Without it the feedback loop is unrecoverable |
| **Rendered rank** of the chosen exercise | The picker is a ranker |
| **Model prediction + confidence** alongside the user's label | Every disagreement is worth 100× an agreement |
| **User tenure** | The corpus will skew advanced otherwise |
| **Detected vs logged rep count** | Free label-error detector |
| **Raw unlabelled stream** (opt-in) | Feeds SSL regardless of whether anyone labels |

**UX: copy Oura, not WHOOP.** One-tap correction of a prediction, never a blank
picker. Ask at most once per session; stop asking once per-user confidence is
calibrated.

**Month 6 audit:** review 10 sessions per class yourself and publish a per-class
label-reliability score. Any class below ~0.8 needs a scripted top-up, not more
flywheel data. Then retrain and re-run LOSO on a **cohort of users who joined
after the model froze** — that confirms the flywheel is adding accuracy rather
than amplifying its own priors.

### Total

| Phase | Cash | Time |
|---|---|---|
| Week 1 | £52 | 40 h |
| Weeks 2–4 (n=1) | ~£0 | 50 h |
| Month 2 (n=10) | £850–1,150 | 60 h |
| Month 3 | £0–1,150 | 80 h |
| Months 4–6 | £0 | 60 h |
| **Total** | **£900–2,350** | **~290 h** |

**Less than two months of a contractor, and dominated by participant incentives
and gym hire rather than labelling.** That is only true because of two
decisions: **build the pre-segmenter before budgeting annotation**, and **stop
scripted collection when our own learning curve flattens** rather than at a
number read in a paper — including this one.

---

## 10. The three things most likely to go wrong

1. **Over-collecting reps and under-collecting people.** Every incentive pushes
   the wrong way, and the literature is unambiguous that it's backwards.
2. **Shipping universal form feedback.** The 80-subject negative result is the
   clearest finding in the whole wave, and it is the feature most likely to be
   demanded.
3. **Letting the model's suggestions become the labels.** It will look like the
   flywheel is working right up until the class distribution *is* the model's
   prior. The fix is two extra logged fields — free today, impossible tomorrow.

---

## Key sources

- Yuan, Chan, Creagh et al., *npj Digital Medicine* 7:91, 2024 — https://www.nature.com/articles/s41746-024-01062-3
- O'Reilly et al., *J Biomechanics* 58:155–164, 2017 — https://pubmed.ncbi.nlm.nih.gov/28545824/
- Morris, Saponas, Guillory & Kelner, *RecoFit*, CHI 2014
- Dehghani, Glatard & Shihab, *Subject cross validation in HAR*, arXiv:1904.02666
- Ward, Lukowicz & Gellersen, *Performance metrics for activity recognition*, ACM TIST 2(1):6, 2011
- Li et al., *Temporal action segmentation from timestamp supervision*, CVPR 2021
- Ensign, Friedler, Neville, Scheidegger & Venkatasubramanian, *Runaway feedback loops*, PMLR 81, 2018
- Joachims, Swaminathan & Schnabel, *Unbiased learning-to-rank with biased feedback*, WSDM 2017
- Conti, Marzagão, Galpin & Schoenfeld, *Front Sports Act Living*, 2026 (389,481 Fitbod users)
- Kwon et al., *IMUTube*, IMWUT 4(3):87, 2020; Leng, Jain, Kwon & Plötz, ISWC 2023 (Motion Subtlety Index) — https://arxiv.org/pdf/2211.01342
- Oishi, Birch, Roggen & Lago, *PPDA*, 2025 — https://arxiv.org/html/2508.13284v1
- Huai & Huang, *Multi-visual-inertial system*, arXiv:2308.05303
- Chiu, *Mechanical properties of weightlifting bars*, JSCR 24(9):2390–2399, 2010
- Tang, Perez-Pozuelo, Spathis, Brage, Wareham & Mascolo, *SelfHAR*, IMWUT 5(1):36, 2021
- Xu, Zhou, Tan, Li & Shen, *LIMU-BERT*, SenSys 2021
- Cortese et al., *Open-set recognition of human activities*, Sensors, 2026
- Northcutt, Jiang & Chuang, *Confident learning*, JAIR 70, 2021
- ICO guidance on consent, video surveillance, biometric data and DPIAs
