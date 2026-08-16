# Competitive Landscape

Who ships what, what actually validates, what killed the ones that died, and
the one patent that matters.

Research wave 7, 2026-08-16. Not legal advice — §4 flags what an attorney
should search, it is not an opinion of non-infringement.

---

## 1. The headline

**Nobody has shipped credible automatic exercise recognition from an
equipment-mounted sensor.**

- **GymAware FLEX** is the only equipment-mounted device that even *claims* it
  ("automatic exercise detection, 200+ exercises"). But FLEX is a **laser
  rangefinder** ranging to a reflective floor mat — it recovers horizontal *and*
  vertical bar position, a far richer signal than 6-axis inertial. It publishes
  **zero accuracy data** for the claim.
- **Output Sports is not an auto-recognition player**, contrary to widespread
  assumption. Its own workflow is *Choose Athlete → Select Exercise → Analyze*.
- Enode, Vitruve, RepOne, GymAware RS and Tendo **all require manual lift
  selection**.
- Buyer's guides that tick "auto exercise recognition: yes" are conflating
  **rep/set detection** with **lift classification**.

Credible auto-recognition ships only on **wrists** (Garmin, Amazfit) and in
**cameras** (Perch, Metric). In both cases honest performance is far below the
marketing, and the camera cohort is a graveyard.

---

## 2. The field

### Equipment-mounted / VBT

| Device | What it is | Price | Auto **exercise ID** | Form feedback |
|---|---|---|---|---|
| GymAware RS | Optical rotary encoder + tether, magnetic clip. Angle sensor for x-axis correction — unique | $1,995 + $325–1,095/yr | **No** — 270+ *library*, user-selected | Bar path + video |
| GymAware FLEX | Laser array, magnetic on sleeve, ranges to a mat | $495, no sub | **Claims yes**, no data | Bar path + video |
| Vitruve | Cable LPT, no angle correction | $447; teams $620–1,251 **per encoder** | No | None |
| RepOne Tether | LPT, magnetic base | $449 | Rep/set only | None |
| Tendo (since 1993) | LPT + wired readout | $1,196–1,499 | **No exercise library at all** | No |
| **Enode Pro** (= Vmaxpro rebranded) | Barbell IMU, magnetic/strap. Eleiko kit puts **dual sensors inside the bar sleeves** | €329; Eleiko kit €829 | **No claim** | "Technique consistency" via bar path |
| Output Sports V2 | Single IMU, multiple straps | ~$500 + Hub sub | **No** — 200+ *tests*, user-selected | Mobility screens |
| Perch → Catapult | **3D depth camera**, rack-mounted | HaaS, ~$3,000/yr | **Yes** | Yes — per-rep bar path, LED cueing |
| Metric | **Phone camera**, patented CV | Free / **$65 yr** | Claims auto tracking, 60+ lifts | Bar path trace |
| PUSH Band 2.0 | IMU armband/bar | **Dead** | — | — |
| Beast Sensor | Magnetic IMU | **Dead** | — | — |
| Bar Sensei | IMU on bar | **Discontinued** | No | No |

> Note the Eleiko/Enode kit: **dual sensors inside the sleeves already exists as
> a product.** They use the second sensor for redundancy and bar path — *not*
> for asymmetry. The geometry is not novel; the use of the differential is.

### Consumer wearables

| Product | Auto exercise ID | Notes |
|---|---|---|
| **Garmin** | **Yes, since ~2017** — the longest-running attempt | See §3 |
| **Amazfit / Zepp** | **Yes — 25 exercises** | Independent testing: "hit-or-miss". Amazfit shipped **voice input** as a manual fallback |
| **WHOOP Strength Trainer** | **No** — user picks from ~500 movements | IMU only refines Muscular Load once the lift is named |
| **Apple Watch** | **No.** watchOS 26 "Workout Buddy" is spoken motivation on pace/HR | Fitness+ has zero strength sensing |
| **Tonal** | Machine knows the movement | **Only credible shipped form feedback in the category — because it owns the load path.** Trained on ~1B reps |
| FORM Smart Swim 2 *(analogue)* | **Yes, and it works** — ~1 mislabelled length/session | 4 classes, in water, constrained cyclic high-amplitude motion. The contrast case |

---

## 3. Validation — marketing vs measured

The decisive source: a **2025 PLOS One systematic review** of 40 devices, 66
validity and 56 reliability studies. **Only 5 of 66 validity studies passed all
criteria.** Survivors: **GymAware, Perch, FLEX, Vmaxpro/Enode.**

| Study | Device | Criterion | Result |
|---|---|---|---|
| Thompson 2020, *Sports* 8(7):94 | 5 devices | **12-cam mocap, 250 Hz** | GymAware CV 2.2–22%, R² 0.95–0.99. **Bar Sensei CV 8.8–60.5%. Beast CV 5.1–75.8%**, TE to 0.48 m/s |
| Pérez-Castilla 2019 | 7 devices, bench | OptiTrack | All r 0.947–0.995 **except Beast r = 0.765**. Reliability CV: Speed4Lift 2.6%, **PUSH 9.3%, Beast 35.0%** |
| Beckham 2019 | Bar Sensei | GymAware | ICC 0.3–0.59 — "**neither valid nor reliable**" |
| **Behrmann 2025**, *Sensors* 25(2):549 | **EnodePro** | Draw-wire, n=53 | Bench ICC 0.995. **Squat Vmean ICC 0.772, MAPE 23.5%.** Recommends "**prohibit the use of these devices**"; 1RM overestimation "can endanger an athlete's health" |
| Ruiz-Alias 2024, PLOS One | **Vitruve** | GymAware | **Mean velocity failed at every load** (r<0.70, CV>10%); peak power bias +96 to +556 W |
| Weakley 2023 | **Perch** | 3D mocap | Explains 86–96% of variance but runs **~0.25 m/s slower than criterion** |

**Auto-recognition, actual numbers:** Apple Watch + StrengthControl (*Sports*
2021): **88.4% across only three exercises** — bench 96.5%, deadlift 92.2%,
**back squat 76.5%**. 1RM prediction succeeded **8.9% of the time**.

### The Beast contradiction — a lesson about single studies

Same device, three papers: Balsalobre-Fernández 2017 (LPT criterion) found
r = 0.97–0.98, ICC 0.922–0.990. Pérez-Castilla 2019 (OptiTrack) found CV 35%,
r 0.765. Thompson 2020 (12-camera mocap) found R² 0.12–0.71, CV to 119.9%.

**The two using true 3D mocap both condemned it.** Treat any single-study IMU
validation — including a favourable one — as weak evidence.

### Garmin's own support page is the frankest document in the category

It lists what it *cannot* track: "Stationary wrist exercises: dips, pullups,
pushups, planks. Leg isolated exercises… Complex/hybrid motions: box jumps,
'CrossFit' type exercises, burpees. Short-range exercises: shoulder shrugs."

And: "your device will display '—' until the device recognizes between 3-5
reps." It further demands 8–10 rep minimum sets, a metronomic pace, and that you
not look at the watch mid-set.

Against a ~1,524-exercise library, the auto-detectable subset is *arm-driven
isolation lifts performed metronomically*. **Garmin has never published the
recognized-exercise count; the exclusion list is the disclosure.**

User reports: shoulder presses logged as **pull-ups**, shrugs as **squats**, lat
pulldowns detected as **zero reps**, and auto-detection **silently overwriting
manually entered weights**.

TechRadar: the mode "consistently fail[s] to record the right number of reps,"
and once noticed, the user's "eye was consistently drawn to it throughout their
set, to ensure it was recording correctly."

> **That is the killer failure mode: a feature meant to remove cognitive load
> adds it.** Auto-labelling has to be near-perfect or trivially correctable, or
> it is worse than a dropdown. **Design the correction UX before the
> classifier.**

---

## 4. Patents

### The one live threat

**US9171201B2 — Atlas Wearables → PELOTON INTERACTIVE.** Priority 2013-05-30,
granted, live to ~2034.

Claim 1 covers a device with **accelerometer, gyroscope and display**; a
**learning mode** that records reps of a defined exercise to build a statistical
model; and a normal mode applying **probabilistic analysis to identify an
exercise event, classify it against a recorded model, and simultaneously
identify repetitions** — plus a module to **score the user's exercise form**.

That is a near-verbatim description of the goal. **Claim 1 is not limited to
wrist or body mounting** — wrist appears only in dependent claim 3. Peloton
bought Atlas explicitly for the patents and has a litigation record (Echelon,
iFIT, Lululemon).

Two possible design-arounds an attorney should assess:

1. Claim 1 requires a **"learning mode"** in which the user records their own
   reps to generate the model. A **factory-pretrained, subject-independent
   classifier with no enrollment step** arguably falls outside. **This is
   probably the most consequential architectural decision in the project** — and
   it cuts directly against the §1 finding in [[Form Analysis]] that
   personalisation is what makes form assessment work at all. Recognition can be
   factory-trained; form templates are per-user. Keep them architecturally
   separate and document why.
2. Claim 1 requires **"a display"** on the device. Two screenless pucks
   streaming to a phone may not read on it — but a court could construe the
   phone as part of the claimed device. Do not rely on this alone.

### Prior art that clears space

| Patent | Status | Why it helps |
|---|---|---|
| **US8749380B2** (Apple, priority **2005**) | **Expired / end of term** | The broadest barbell rep-counting claim ever granted — "a **body bar sensing system**… housing… attached to the body bar… determine repetitions… display." Housing may double as a **weight-retention collar**. Now **prior art rather than a barrier**, and it likely invalidates anyone else's generic barbell rep-counting claim |
| **EP3057505B1** (Beast) | **EP only; US and WO not active** | Company defunct, US route abandoned |
| **WO2015048884A1** (PUSH) | **Lapsed** | US free-weight IMU space uncovered by both obvious incumbents |
| **US20170128765A1** "Smart Barbell" | **Abandoned** | Discloses barbell + IMU + strain gauges, explicitly notes the accelerometer "measures vibration" |
| **US7455621B1** | **Expired** | Rack-mounted optical beam array |

### Genuinely unclaimed

Repeated searches across Google Patents, Espacenet-facing sources, USPTO and FPO
found **no patent claiming estimation of barbell load from bar whip, flex,
resonant frequency or oscillation**, and **no patent on two IMUs at opposite
ends of a bar for bilateral asymmetry**.

Adjacent art is strain-gauge (abandoned), RFID plate tagging (US9468793B2), or
industrial weighing vibration-compensation (US9417118B2) — a different problem.

**Both look filable.** But read the absence carefully: it may mean nobody
thought of it, or it may mean people tried, found it didn't work, and never
filed.

> ⚠ **US20170128765A1 will be cited against our own filings** — as published
> abandoned art it already discloses a barbell IMU that "measures vibration"
> alongside strain-gauge load determination. **File early, claim narrowly around
> the specific dynamics.**

### What an attorney should search

1. The full Atlas/Peloton family, including continuations and CN/EP/JP members
2. Peloton filings post-2020 citing US9171201
3. Tonal's rep-extraction and form-feedback families (US12576308B2,
   US20220176184A1, US12564763B2) for claims not limited to cable machines
4. Garmin, Fitbit/Google, Samsung and Apple filings on strength-exercise
   classification, 2018–present
5. Exact term-and-fee status of Apple US8749380 to confirm expiry
6. Novelty search on load-from-bar-dynamics **before** we file

---

## 5. The graveyard

| Company | Fate | Cause |
|---|---|---|
| **PUSH** | Acquired by WHOOP Sept 2021, **product killed** | Acqui-hire |
| **Beast Technologies** | Deadpooled ~2019–21 | **Failed validation** (CV to 75.8%) |
| **Atlas Wearables** | Out of money; **bought by Peloton primarily for patents** | Auto rep counting never worked well enough |
| **Assess2Perform (Bar Sensei)** | Discontinued ~2022 | "Neither valid nor reliable" |
| **Vay** | Bought by Nautilus → JRNY engine → **sold in bankruptcy** | — |
| **Nautilus/BowFlex** | **Chapter 11, Mar 2024**; all assets to Johnson Health for **$37.5M** | Bowflex + Schwinn + JRNY together fetched barely more than Nautilus paid for Vay alone |
| **Onyx** | Acquired by Cure.fit, **brand discontinued FY24** | — |
| **Vi / LifeBEAM** | **App shut June 2022**, bricking shipped hardware | — |
| **Peloton Guide** | **Sales ended July 2025** | "Never quite found its groove" |
| **Asensei** | Alive, retreated to **rowing stroke only**, ~16 staff | General strength coaching never shipped |
| **Sportsbox AI** | Survives by abandoning fitness for **golf only** | — |
| **Tonal** | Alive. **$1.6B → ~$600M (−64%)**, 35% layoffs | Raised $615M, worth less than it raised |

**The pattern is unambiguous: every company that tried to automatically
recognise general human exercise from a sensor is dead, acquired-then-killed, or
has retreated to a single constrained movement** (Asensei→rowing,
Sportsbox→golf, FORM→swimming).

### The living, and what they're worth

- **Output Sports**: €4.6M pre-A, Jan 2025. 800+ organisations, half the Premier
  League. Purely B2B elite. **Does not claim auto-recognition.**
- **Perch**: raised **$6M total**, **acquired by Catapult June 2025 for ~$18M**.
  A validated, NFL/NBA-deployed product exited for less than most would assume.
- **Enode**: tiny German company, no disclosed funding, ships the one surviving
  barbell IMU of scale.

**VBT is overwhelmingly B2B** — all 32 NFL teams, 30+ NBA teams. The historic
barrier to consumer adoption was price; the *current* barrier is that **Metric
does validated velocity from a phone camera for $65/yr**. There is no evidence
of a large B2C VBT market.

---

## 6. Where the gap is

**Genuinely unserved:**

1. **Load estimation without user input.** *Every* device in the market makes
   the user type in the weight — GymAware, Enode, Vitruve, Perch, WHOOP, Garmin,
   all of them. The only automated alternatives ever built are strain gauges
   (abandoned patent) and RFID plate tags (requires instrumenting every plate).
   **No patent appears to claim inferring load from bar dynamics.**
2. **Left–right asymmetry from dual end-of-bar sensors.** No product claims it.
   Only Strive (EMG apparel) claims symmetry at all, and from muscle activation
   rather than bar mechanics. Unpatented, unbuilt, **architecturally native to a
   two-puck design**.
3. **Published sensor specifications.** RepOne, Tendo, Bar Sensei and FLEX
   publish no sampling rate at all. Honest specs plus a third-party validation
   study is itself a wedge, given four leading devices have been told in print
   not to be used.

**Tried and failed — do not build:**

- Wrist-based auto exercise recognition (Garmin's eight years; Atlas died trying)
- Camera-based form feedback for general strength (Onyx, Vay, Peloton Guide,
  Asensei, Sportsbox — only Tonal works, and only because it owns the load path)
- **Form/technique feedback from a bar-mounted sensor** — see [[Form Analysis]].
  Marketing this would be the same overclaim that killed Beast and Bar Sensei.
- Selling VBT metrics to consumers — Metric does it for $65/yr with no hardware

---

## 7. Risks

**Patent.** US9171201B2 needs a real FTO opinion *before* engineering commits to
an architecture — specifically before deciding whether the classifier is
user-enrolled (inside the claim) or factory-pretrained (arguably outside).

**Commercial, and this is the larger one:**

1. **The graveyard is not a coincidence.** Two of the deaths (Beast, Bar Sensei)
   were caused *specifically* by IMU accuracy failing independent testing.
2. **The validation literature will come for us.** Weakley, Thompson, Behrmann,
   Pérez-Castilla and Ruiz-Alias have publicly told practitioners not to use
   Beast, Bar Sensei, PUSH, Vitruve and — as of 2025 — EnodePro. **Budget for a
   criterion-validity study against GymAware or mocap before launch**, because
   someone will run one whether we do or not.
3. **The buyer is a strength coach, not a lifter.** Slow, relationship-driven,
   RFP-shaped selling against GymAware's 30-year incumbency and Catapult's
   distribution behind Perch.
4. **Exits are small.** Perch: ~$18M on $6M raised. This is a good small
   business, not a venture outcome — unless load estimation opens a consumer
   market VBT never reached.
5. **Software is undercutting hardware.** Whatever we sell has to be something a
   camera fundamentally cannot do.

---

## 8. The strategic read

Rep counting and velocity are solved, commoditised, and being eaten by phone
apps. Exercise recognition is a graveyard. Form feedback from a bar is
physically not available (see [[Form Analysis]]).

**The one thing nobody has done, nobody has patented, and no camera can do is
read the load off the bar itself.** That should be the product, with recognition
as a supporting feature — not the reverse.

Asymmetry is the second unclaimed thing, and it is the only other measurement
that is native to two sensors rather than one.

This is a meaningful revision of emphasis: [[Exercise Recognition]] is a
*feature*, not the wedge.
