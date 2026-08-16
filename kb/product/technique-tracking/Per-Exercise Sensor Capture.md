# Per-Exercise Sensor Capture

For each lift: what the two bar-end sensors can actually measure, and what they
can't.

Condensed from [[Form Analysis]] and [[FINDINGS]]. Nothing here has met real
hardware — every figure is from published literature or simulation.

Key: **✓** trustworthy · **~** usable with a caveat · **✗** not available

---

## 1. The master matrix

| Lift | Reps | ROM | Mean velocity | Tempo | Bar tilt | Load from whip | Sticking point |
|---|---|---|---|---|---|---|---|
| Back squat | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Front squat | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bench press | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Overhead press | ✓ | ~ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Conventional deadlift | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ |
| Sumo deadlift | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ |
| Barbell row | ✓ | ~ | ✓ | ✓ | ✓ | ✗ | ✗ |
| RDL | ✓ | ~ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Hip thrust | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ~ |
| Snatch | ✓ | ✓ | ~ | ✓ | ~ | ✗ | n/a |
| Clean & jerk | ✓ | ✓ | ~ | ✓ | ~ | ✗ | n/a |

**Why ROM is mostly `~`:** vertical bar travel is measurable to roughly 2–5 cm
per rep, so *consistency* across a set is solid. But it is not the same as
anatomical depth — bar travel depends on limb length, grip width and where the
bar sits. Deadlift and hip thrust get a full ✓ because the floor gives a hard
zero every rep.

**Why load is only on rack lifts:** the whip signal is a *support-constrained*
mode. It needs the bar held at fixed points — J-hooks. Off the floor or purely
in the hands is a different and harder problem. This is the §5 scope limit from
[[FINDINGS]] and it has not changed.

---

## 2. What every lift gives you, free

These need no integration or only one, so they're the most reliable things the
product has.

| Measurement | Notes |
|---|---|
| Rep count and set boundaries | Should beat every published number — the bar is a rigid body with one dominant oscillation and no arm/leg ambiguity |
| Eccentric duration | Pure timing, no drift |
| Concentric duration | Pure timing |
| Pause / dwell at the turnaround | Pure timing |
| Time under tension | Pure timing |
| Rest between sets | Pure timing |
| Mean concentric velocity | Validated on commercial bar IMUs at ICC 0.91–0.96, ~0.02–0.05 m/s bias |
| Velocity loss across the set | Correlates **r = 0.92–0.97** with lactate and jump-height loss. The best-validated thing we measure |
| Bar tilt, left vs right | Two sensors make this native. Almost nothing else on the market measures it |
| Time-to-peak-velocity as a fraction of the concentric | Independent fatigue signal — under fatigue, peak velocity arrives much earlier |

**Peak velocity is the exception — treat it as unreliable.** Every device in
every study is 2–5× worse on peak than on mean, and it degrades exactly where
it matters: validity drops to r = 0.78 above 60% 1RM. Report it with a range or
not at all.

---

## 3. Per lift

### Back squat

**Signature:** unrack transient → 2–4 walkout steps (visible as anti-phase
sideways acceleration across the two sensors) → eccentric first → ~1.25 m travel.

| Extra available | |
|---|---|
| Sticking point | vmax at **12% of the ascent**, vmin at **~40%**. Only appears above ~85–90% 1RM, so its presence alone flags a near-maximal rep |
| Load from whip | ✓ in the rack |
| Depth consistency | ✓ relative to that user |
| Forward bar drift | ~ — real signal, but a maximal squat *normally* drifts forward in the sticking region, and no normative cm figure exists anywhere |

**Not available:** butt wink, knee valgus, heel rise, absolute competition
depth, stance width, bracing. Front vs back squat is indistinguishable (see
[[Auto-Categorised Exercises]]).

### Front squat

Everything as back squat. The only bar-side difference from a back squat is
~5–10 cm of start height, which is inside the variation between people.

### Bench press

**Signature:** no walkout, straight from the J-hooks to the first rep.

| Extra available | |
|---|---|
| **Bounce off the chest** | ✓ Clean — turnaround duration and the contact transient. And there's a principled scale to score it: the stretch-reflex benefit has a **~0.85 s half-life**, so 0.35 s of pause keeps ~75% of it and 1.5 s keeps ~30% |
| Pause length | ✓ For competition-style legality |
| Sticking point | ~23–38 cm above the chest |
| Load from whip | ✓ in the rack |
| Uneven lockout (one arm leading) | ✓ Differential tilt — and near-invisible from a normal camera angle |
| J-curve bar path | ~ 5–15 cm of horizontal travel. Right shape, but inside our error budget. Ship as consistency, never as centimetres |

**Not available:** elbow flare, grip width, back arch, leg drive, scapular
position, whether the bar actually touched the chest.

> Elbow flare is worth understanding because it *looks* detectable. Grip width
> generates 22–30% of vertical force sideways on the bar — but equal and
> opposite from the two hands, so it cancels completely in the rigid-body
> balance. Only a strain-gauged bar could see it.

### Overhead press

| Extra available | |
|---|---|
| **Dip count** | ✓ This is the whole discriminator for the family: strict = no dip, push press = one, jerk = dip + re-dip |
| Sticking point | ~47–56 cm above start — much higher in the ROM than bench, because the moment arm is 10 cm vs bench's 25 cm |
| Load from whip | ✓ in the rack |

**Not available:** layback, elbow position, whether the bar cleared the head
cleanly.

### Conventional deadlift

**Signature:** the easiest lift to identify. Dead stop at floor height, quiet
gravity-only window, concentric first, floor impact between reps.

| Extra available | |
|---|---|
| ROM | ✓ Full marks — the floor gives a hard zero-velocity reset every rep, which also bounds integration drift |
| **Hitching** | ✓ Multiple velocity minima with re-acceleration in the upper third. Distinctive and robust |
| Uneven pull off the floor | ✓ One of the few things nothing else measures — a side-view camera can't see it and nobody films from the front |
| Start-position drift across reps | ✓ Clean, because of the floor reset |
| Sticking point | ~ Occurs at the floor or near knee height, *not* at a fixed fraction of ROM like squat and bench. No published figure exists |

**Not available — and this is the important one:** **lumbar flexion / rounded
back.** The bar is in your hands, mechanically disconnected from your spine. Two
lifters with identical bar paths can have 0° and 30° of lumbar flexion.

Also not available: hips shooting up first. The bar doesn't encode hip height,
and early-phase velocity as a proxy is confounded with simply being heavy.

**Load from whip: ✗.** Off the floor the bar isn't supported at fixed points.

### Sumo deadlift

As conventional. ~10% less vertical travel and a slower start off the floor —
enough to separate at group level, not reliably per rep.

### Barbell row

**Signature:** hinged, bar suspended, no floor impact.

Everything in §2 applies. Nothing exercise-specific beyond that — and note this
is the lift most often confused with the deadlift.

**Not available:** torso angle, grip, elbow path, whether the bar reached the
torso.

### RDL

Eccentric first from standing, no floor impacts. Bar travel down to about
mid-shin.

**No published bar-path data exists for the RDL at all** — no loop width, no
horizontal drift figures. We'd be measuring against nothing. Consistency only.

### Hip thrust

| | |
|---|---|
| ROM | ✓ Published vertical bar travel **0.361 ± 0.042 m** over 0.828 ± 0.148 s |
| Velocity at 1RM | 0.25 ± 0.03 m/s, with a strong load–velocity fit (R² 0.94) |
| Peak effort timing | ~ Peak hip extensor moment lands at **14% of lift time**, then falls by two-thirds by lockout — so "constant tension throughout" is a myth we could actually disprove |

### Snatch, clean & jerk

| Extra available | |
|---|---|
| **Jerk dip depth and velocity** | ✓ Bounded excursion with a clean zero-velocity anchor at the top. 10–20 cm typical |
| Bar crash at the catch | ✓ Sharp deceleration transient |
| Turnover duration | ✓ Timing |
| Bar height and drop into the catch | ~ Elite figures: peak 0.89–1.17 m, drop 0.13–0.17 m |
| Loop width | ~ 8–15 cm total — and elite rep-to-rep noise is already ~6 cm, so this discriminates at group level, not per rep |

**Two warnings specific to the Olympic lifts:**

1. **Sleeve spin.** These lifts deliver ~180° of sleeve rotation, versus under
   45° in powerlifting. If sensors sit on the sleeves that injects ~2.75 m/s² of
   centripetal acceleration and rotates the measured bending direction
   arbitrarily. Mount on the shaft. See [[Kinematics Pipeline]] §7.
2. **Make vs miss.** Peak velocity and bar height do **not** separate a
   successful lift from a failed one. Horizontal displacement into the catch and
   drop distance do — but by ~1 cm against ±5 cm spreads. Don't build a
   make/miss predictor.

---

## 4. Never claim these, on any lift

Not "hard" — **absent**. The sensor is not attached to the lifter.

| Claim | Why it's impossible |
|---|---|
| Rounded back / lumbar flexion / butt wink | Bar is decoupled from the spine |
| Knee valgus | Can be severe, bilateral and symmetric with a perfectly level bar |
| Elbow flare | Lateral forces cancel between the two hands |
| Hips shooting up first | Bar doesn't encode hip height |
| Heel rise, stance, foot turnout | Needs force plates |
| Bracing, breathing, gaze, neck position | Nothing reaches the bar |
| Grip width or grip type | Invisible |
| Absolute competition depth | Human referees can't do this reliably either |
| Any injury-risk score | Two systematic reviews find inconsistent evidence; the standard 10% asymmetry threshold has **AUROC 0.50–0.59** — chance level |

For calibration on how hard these are: state-of-the-art **computer vision**,
with a full view of the body, expert labels and thousands of gym videos,
detects knee valgus at **F1 0.53** and lumbar error at 0.63. That's the ceiling
with a camera. From the bar it isn't a measurement problem, it's an
observability problem.

---

## 5. Two traps in the numbers above

**Bar tilt is real but must be sold carefully.** Only one study has ever
measured barbell tilt during a lift, and its magnitudes are paywalled — get the
full text before setting any threshold. Two further constraints:

- The bar sees the *most attenuated* version of an asymmetry. Six months after
  ACL reconstruction, force-plate asymmetry is only ~7–10% while knee moment
  asymmetry is ~30–36%.
- **Asymmetry falls with fatigue, not rises.** Two independent studies confirm
  this. Do not build a "fatigue detected via rising asymmetry" feature — the
  evidence predicts the opposite sign.

**Bar path renders convincingly and is mostly noise.** Displacement error is
~10 cm even on a 1000 Hz commercial device, while the entire snatch loop is
8–15 cm and elite rep-to-rep variation is already ~6 cm. Show it as a
within-session shape comparison. Never quote centimetres.
