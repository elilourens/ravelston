# PHONE-PROTOCOL.md — Stage 0 dry run with a Pixel 9

Interim protocol for gym testing **before** the WT9011 units arrive, using a
Pixel 9 + Sensor Logger as a single-node stand-in.

Derived from [FINDINGS.md](FINDINGS.md) §10 (decisive bench test) and §11
(open risks). Mounting guidance from [MOUNTING.md](MOUNTING.md) — Stage 0
track (tape on the shaft inside the collars), not the finalist mounts.

## Why this is worth doing without the real sensors

Two of the three risks that could kill the vibration route (§11 risks #1 and
#2) are measurable with one phone:

- **Risk #1 — no Hz-vs-load curve has ever been published.** This needs one
  IMU on a bar and a load ladder. A phone IMU samples *faster* than the
  WT9011's 100 Hz, and the signal of interest is 2–12 Hz. Test B below.
- **Risk #2 — plate-to-sleeve contact stiffness.** §10 step 6: ten minutes,
  phone mic only, no mounting at all. Test A below.

What a single phone **cannot** do — all of it needs two synchronised nodes,
so don't try:

- Dual-end peak-velocity cancellation (Padgaonkar, §6)
- SUM vs DIFF channel separation (mode 1 vs mode 2, needed for the two-mode
  inversion in §4/§7)
- The sleeve-spin test (§11 risk #3, MOUNTING bench test 3)
- Cross-sensor sync drift characterisation

## What PureGym actually has

Researched 2026-08-14. Well-sourced unless flagged; per-branch details vary,
so the site survey below is not optional polish.

**Plates are Jordan Fitness, and they are neither of the two types §10
assumes.** PureGym's house plate is the **Classic Urethane Olympic Disc** —
a *solid steel core in a urethane encasement*, with three tri-grip handle
cutouts. That's a third category: steel-like mass distribution, polymer
contact surface at the sleeve and between plates. For open risk #2
(plate-to-sleeve contact stiffness) it's an intermediate case and arguably a
*more* interesting data point than the iron/bumper contrast, since it's what
a real user's bar will actually be wearing. Denominations run 1.25–25 kg.

**A second type is likely present.** The Jordan contract dates to 2018 and
the estate now includes acquired sites, so expect legacy **rubber tri-grip**
(cast iron core, rubber coating) alongside the urethane, plus **calibrated
colour competition bumpers** if your branch has a lifting platform. That
gives Test C's second-plate-type trial something real to compare against.
It also means *don't assume the plates already on a bar match each other* —
check every plate you load.

**The rack bar is probably a Jordan Ultimate Bar**: 20 kg, 2.2 m, hard
chrome, and **8 needle-bearing sleeves — not bushings**. Worth noticing,
because §10 step 3 specifies a bushing bar and lists the needle-bearing bar
as a *variant* in the step-5 confound sweep. You'll be running the whole
ladder on the variant. That's fine, but it's also the harder case for open
risk #3 (transmission of shaft bending through the sleeve interface), so
record it and don't compare these numbers to bushing-bar data later without
flagging it. Some racks in older branches carry generic bars instead —
check for the Jordan logo and spin a sleeve to feel bearing vs bushing.

**Collars are Jordan plastic quick-lock clamps, and branches run short of
them** (directly evidenced in reviews). Reinforces bringing your own. One
refinement: plastic collars are ~100–200 g against ~500 g+ for steel
lock-jaw, so your own clamps add roughly 1 kg of end mass across the bar.
That's a constant offset that cancels in the empty/loaded ratio, and it's
worth far less error than collar slack — but **weigh them and write it
down.**

**Plate quantity is the one thing nobody publishes**, and it's the biggest
practical risk. Reviews consistently complain of plate shortages and
peak-time hoarding. 140 kg on one bar is normally achievable off-peak in a
mid-size branch; 180 kg will visibly strip the 20s and 25s and is unrealistic
at peak. Count the 20s and 10s on arrival before committing to a ladder.

**Timing: go weekday mid-morning, 10:00–12:00.** Busiest is Mon–Fri
17:00–20:00, Monday evening worst. Check live occupancy in the PureGym app
or Google Maps popular times. You need a rack for ~40 minutes, so this
matters more than the music does.

**Music: no dB figure exists and there are no quiet hours.** PureGym runs a
PA across the free-weight floor with no music-off policy, and reports of
volume vary wildly by branch. Measure the ambient floor yourself when you
arrive — see Test A, where the noise-floor recording does double duty.

### Site survey — 30 minutes, do it before you start recording

1. Count the 20 kg and 10 kg plates available; fix your ladder to what's
   actually there
2. Note whether they're urethane or rubber, and whether a second type exists
3. Caliper (or tape) plate thickness and outer diameter per denomination —
   the published table is a proxy, your branch's plates are the truth
4. Check the rack bar for a Jordan logo; measure shaft diameter and
   collar-to-collar span; spin a sleeve for bearing vs bushing
5. Weigh a collar if you can, or note the type
6. Record 30 s of ambient on the phone at the rack, at your session time

## Gym noise: which tests actually care

**Music threatens exactly one test.** Tests B, C and D are measured on the
IMU, and a PA cannot put meaningful energy into a 20 kg steel bar at 2–12 Hz
— gym music rolls off around 40–50 Hz at the bottom, well above our band.
The realistic IMU contaminant is *floor-borne*: dropped weights and footfall
on a shared platform, which is broadband and impulsive. Band-passing handles
the steady part, and a ring-down is a decaying sinusoid rather than
stationary noise, so it survives a noisy floor better than it looks.

**Test A is acoustic and does care**, because it lives at 288–347 Hz, right
in the middle of where music has energy. Six mitigations, in order of how
much they buy:

1. **Get the mic close.** 5–10 cm from the bar end, not 30 cm. Inverse-square
   alone is worth 10–15 dB, and it is free.
2. **Use a hard, light striker** — a coin, an allen key, the rim of a
   1.25 kg plate. Contact time sets the excited bandwidth: a soft rubber
   mallet has a ~2–5 ms contact and dumps its energy below a few hundred Hz,
   which is exactly wrong for mode 5. A hard tap rings the bar audibly.
3. **Take 15–20 strikes, not 5.** Music is uncorrelated with your strike
   onsets, so strike-synchronous spectral averaging suppresses it as √N —
   16 strikes is about 12 dB. Strikes are cheap; take more than you think.
4. **Record 5 s of music-only** before each series with no strike. That's a
   noise-floor estimate for spectral subtraction, and it costs nothing.
5. **Put your body between the phone and the nearest speaker**, and pick the
   corner furthest from the PA.
6. **Go off-peak.** You need to hold a rack for ~40 minutes, which is the
   real constraint anyway.

The strongest discriminator is algorithmic, and it's worth stating because
it shapes the processing: we are not looking for energy at 300 Hz, we are
looking for a **narrow peak that rings down with a consistent decay
constant, synchronised to a strike onset**. Music at 300 Hz does not decay
on your schedule. Fitting the decay envelope rejects steady programme
material almost completely, so a noisy room degrades this test far less than
raw SNR suggests.

**Two strikers, two tests.** Hard and light for Test A (acoustic, ~300 Hz);
heavy and soft for Test B (bending, 2–12 Hz), where momentum transfer
matters more than contact hardness. The drop-rack is a better low-frequency
exciter than any hand strike, and it is completely immune to music.

## Tap slates — labelling the recording without talking

The phone is taped to the bar for most of the session, so reaching over to
stop/start or type a label is friction that will erode the protocol by the
third load. Instead, **run one continuous recording per test and segment it
with knuckle taps on the shaft.**

### The vocabulary — three signals, all light taps

| Signal | Pattern | Meaning |
|---|---|---|
| **Advance** | 3 fast taps (~4/sec) | Next trial starts now |
| **Checkpoint** | 5 fast taps, ~2 s gap, then *N* taps | Absolute position: *N* = rung index |
| **Void** | 8+ taps, continuous rattle | Discard everything since the last Advance |

**Checkpoint indices.** Test B: 1 … *N* up the load ladder, in the order you
wrote down. Test C: 1 = loose collars, 2 = second plate type, 3 = outboard,
4 = end-strike. (Test A needs no slates — see below.) The two tests never
interleave and are separated by minutes of handling noise, so the same
opener is unambiguous in both.

### Why this is machine-separable from the data

Slate taps and measurement strikes differ on **two independent axes**, so
the decoder never has to make a close call:

- **Spacing** — slate taps are ~0.25 s apart; measurement strikes are ~3 s
  apart with a full ring-down between them.
- **Amplitude** — slate taps are light knuckle taps; measurement strikes are
  mallet hits, roughly an order of magnitude hotter.

Use a knuckle or fingertip for slates and the mallet for strikes, and never
the reverse. That single habit is what makes the whole scheme parse.

### Why it's robust to miscounting

Advance markers carry no payload, so there is nothing to get wrong — they
just cut the file into ordered segments, and the running order you wrote
down beforehand supplies the labels. Checkpoints then re-anchor that index
at every plate change, so a skipped or repeated trial can shift the count by
at most one rung before it self-corrects. Void handles the rest.

### Bonus: free cross-stream sync

Every tap appears in the audio and the IMU at the same physical instant.
Sensor Logger timestamps those streams from different clocks, so each slate
burst is a hard alignment pulse between them — worth having regardless of
the labelling, and a rehearsal of the sync problem the real sensor pair will
have between nodes.

### Decoder rule (for the processing script)

1. Onset-detect on the audio energy envelope and on gyro jerk independently.
2. Cluster onsets with inter-onset interval < 0.5 s → one burst.
3. A burst of ≥3 onsets whose median amplitude is well below the session's
   strike median → slate, not data.
4. Bursts separated by 1–3 s belong to the same slate group; >4 s of quiet
   closes the group.
5. Measurement strike = isolated onset, ≥2.5 s of quiet either side, high
   amplitude.

## Before you leave

**App setup (Sensor Logger):** enable accelerometer, gyroscope, and
microphone; disable location, barometer, and anything else — fewer streams
means fewer dropped samples. Set the sampling rate as high as it offers; the
Pixel 9 should give 400 Hz+, and anything ≥200 Hz is ample for a 2–12 Hz
signal. Do one 30-second test recording at home and confirm the export
actually contains audio — if the mic channel doesn't capture raw audio, use
the stock Recorder app for Test A and Sensor Logger for Tests B–D.

**Rehearse the slates at home** in that same test recording: tap an Advance,
a Checkpoint-3, and a Void, then a hard strike. Confirm on the export that
the two amplitude classes are obviously separable on your bar and your
phone. Five minutes here saves an unparseable session.

**Kit:** athletic tape (or a Voile strap), a phone case, a tape measure,
**a pair of lock-jaw clamp collars** (see below — buy these), and
**both strikers**: something heavy and soft for Test B (a rubber mallet is
ideal; the heel of your hand works) and something hard and small for Test A
(a coin, an allen key). Consistency of strike matters more than force. **Pen and paper** —
once the phone is taped to the bar you cannot take notes on it, and the
written running order is what the Advance markers index into.

## Test A — mic only, ~10 minutes, do this first

Settles §11 risk #2. No mounting, no rack time, and it is a measurement
nobody has published.

**No slates needed here.** The phone is still loose and in your hand, so
just stop/start and name a file per condition — the tap vocabulary exists
because the phone is taped to a loaded bar in Tests B–D. Onset-detecting
slates against music would be the one place the scheme is weak, and this is
the one place you don't need it.

Phone 5–10 cm from the bar end, mic pointed at the bar, quietest corner you
can find, your body between it and the nearest speaker. Per condition:
**5 s of silence first** (noise-floor reference), then **15–20 hard light
taps**, ~3 s apart:

1. Bare bar
2. 60 kg
3. 140 kg
4. A second plate type at 60 kg, if the gym has one

**What we're looking for:** mode 5 near **347 Hz** means the plates are
acoustically decoupled from the sleeve; near **288 Hz** means coupled. The
two computable bounds are ~20% apart, so this is an easy call to make.

## Test B — the decisive one: Hz vs load

This is §10 steps 2–4, and it validates or kills the weight-estimation
premise.

**Mount:** phone flat against the shaft **just inside the collar**, screen
facing outward, 3–4 tight wraps of athletic tape. Not on the sleeve or end
cap — it rotates and it takes impacts. Once it's on, **leave it on for the
whole session**; re-taping between loads introduces a variable you can't
back out later.

**Measure and write down first:** collar-to-collar span (this is the L³
term and most manufacturers don't publish it), shaft diameter, bar
make/model, plate type, collar type.

### Collars — buy your own before you go

§10 calls for **clamped** collars. Commercial gyms supply spring collars or
plastic snap-locks, both of which leave the plate stack able to shift and
rattle on the sleeve. That matters more than it sounds: collar slack is one
of the "where is the mass sitting" confounds in §4, and it is worth **+14 to
+60 kg** of apparent-load error — the same order as the thing you're trying
to measure.

Left uncontrolled it doesn't just add noise, it becomes a *varying* part of
your baseline, because you re-clamp between every rung. A pair of lock-jaw
style clamp collars is about £15–25 and removes the single largest
uncontrolled variable in the session. Buy them.

If you end up on gym collars anyway: use the *same pair* for every trial,
push the stack tight against the sleeve shoulder before clamping, and note
which type they were. Then treat the whole ladder as one plate/collar
configuration rather than a clean measurement.

### Choosing the rungs

§10 specifies bare/60/100/140/180 on iron with clamped collars. In a
commercial gym you will not get all of that, and **you don't need to** —
what the ladder has to deliver is a monotonic curve over enough distinct
masses to fit, not a specific top end.

Two substitutions are safe, and two things are not:

- **Plate type: any type is fine, as long as it's the same type
  throughout.** Risk #1 asks whether frequency falls with load at all, and
  that question is answered by any consistent plate. Type changes the
  calibration constants, not the existence of the curve. Record exactly
  what you used.
- **Top end: trade it for resolution.** Since `f ∝ 1/√m` in the loaded
  limit, sensitivity `df/dm` goes as `m^-3/2` — the curve is steepest, and
  therefore most informative per kilo, at *low* load. Seven rungs reaching
  140 kg beat five reaching 180.
- **Mixing plate types within one rung is not safe.** Don't make 60 kg from
  a 20 and a 10 of different types on the same sleeve. That's the confound
  you're trying to isolate, smeared into your baseline.
- **Nor is improvising the plate composition** — see below. This is the one
  that will silently ruin the ladder.

### Plate composition: the trap in this protocol

Jordan's published tri-grip geometry shows thickness is **not** proportional
to mass:

| Plate | Thickness | kg per mm of sleeve |
|---|---|---|
| 25 kg | 45 mm | 0.56 |
| 20 kg | 41 mm | 0.49 |
| 15 kg | 37 mm | 0.41 |
| 10 kg | 33 mm | 0.30 |
| 5 kg | 29 mm | 0.17 |
| 2.5 kg | 26 mm | 0.10 |

A 5 kg plate eats nearly three times the sleeve length per kilo that a 25
does. So **40 kg a side built as 2×20 occupies 82 mm; built as 8×5 it
occupies 232 mm** — the same mass with its centroid in a completely
different place. §4 names plate thickness as one of the "where is the mass
sitting" confounds worth +14 to +60 kg, and this is precisely that
mechanism, sitting inside what looks like a clean load ladder.

**The rule: build every rung from the shoulder outward, heaviest
denomination first, and write down the exact composition per rung — not
just the total.** With the composition recorded you can compute the stack
centroid from the table above, which is exactly the geometric input the
two-mode inversion in §7 wants. Without it, the ladder has an uncontrolled
second variable moving with the first.

### The ladder, made concrete

Assuming a 20 kg bar and Jordan plates, this reaches 140 kg in seven rungs
off **3×20 and 1×10 per side** — a realistic ask off-peak:

| Total | Per side | Stack, shoulder → out |
|---|---|---|
| bare | — | — |
| 40 kg | 10 | 10 |
| 60 kg | 20 | 20 |
| 80 kg | 30 | 20, 10 |
| 100 kg | 40 | 20, 20 |
| 120 kg | 50 | 20, 20, 10 |
| 140 kg | 60 | 20, 20, 20 |

The 10 always goes outboard of the 20s, every time. Bare is the ratio-trick
anchor and a free known 20 kg calibration point; 60 kg doubles as the
tare-mass shape-ratio reference; 100 kg is the load you hold for all of
Test C.

**Load ladder** — one continuous recording for the whole ladder. At each
load:

1. **Checkpoint-*N*** for the rung (1 = bare … 5 = 180 kg)
2. Strike the shaft mid-span, let it ring out fully (~3 s), ×5
3. **Advance** → drop-rack: lift the bar 3–5 cm off the J-hooks and
   release, ×3
4. **Advance** → one rep (squat or bench) ending in a controlled re-rack

The bare-bar pass is the ratio-trick anchor and a free known 20 kg
calibration point, so don't skip it. The 60 kg pass doubles as the
tare-mass shape-ratio reference.

**Expect:** one clean spectral line marching from roughly **9 Hz** bare down
toward **4 Hz** at 180 kg. If that line is there and repeatable, the product
is real.

## Test C — confounds, one variable at a time

Hold the load at 100 kg and change exactly one thing per trial, opening each
with its **Checkpoint**:

1. **Loose/unclamped collars** — swap your clamps for the gym's spring
   collars at the same load. This is the §4 collar-slack confound measured
   directly, and it's the one you're most likely to hit in the wild.
2. **A second plate type at the same mass** — the biggest confound in the
   project. §10 frames this as iron-vs-bumper and predicts ~14% lower
   frequency at identical mass. At PureGym that means urethane vs legacy
   rubber tri-grip, or vs colour competition bumpers if there's a platform.
   Whatever the second type is, the test is the same and the prediction is
   directional. Note both types precisely, and match the *composition*
   (same denominations, same order) so plate type is the only thing that
   changed.
3. **Plates slid outboard** toward the end of the sleeve
4. **Strike the bar end** rather than mid-span — excites mode 2

**Plate handling, all trials.** Rubber-coated plates with handle cutouts are
not axisymmetric and can rattle and rotate on the sleeve. Rotate every plate
so the handles align the same way each time, push the stack tight, and note
if you hear rattle during a ring-down — plate-rattle nonlinearity is already
open risk #6 and this is your chance to see it.

## Test D — free, while you train

Leave it recording through a few normal working sets. Costs nothing and
yields real re-rack ring-downs, rep cadence, rest intervals, and ROM — the
inputs for the §6 velocity pipeline and for rep/set detection. No slates
needed; this segment is whatever runs after the last Test C checkpoint.

## Caveats to record alongside the data

- **Phone mass (~200 g) on the shaft shifts the frequencies.** It's roughly
  1% of a bare bar's mass, so order 0.5% in frequency, and it's constant
  across trials so it largely cancels in the empty/loaded ratio. Note it,
  and when the real sensors arrive, re-measure the bare bar with a node in
  the *same* position to cross-calibrate the two datasets.
- **Don't drop-rack hard at 180 kg with a phone taped on.** A 3–5 cm
  lift-and-release excites the mode perfectly well.
- Phone IMUs sometimes apply an internal low-pass; check the raw spectra for
  an unexpected rolloff before trusting the tail of a ring-down.
- Gym floors and adjacent racks put energy in the same band. Note anything
  loud happening nearby.

## Processing

Same chain as §10 step 4: gap-aware resample → band-pass 2–12 Hz → tracked
interpolated FFT, gyro preferred over accelerometer for bending. Run the
slate decoder above first to cut the continuous recording into labelled
trials, and use the slate bursts to align the audio and IMU clocks before
anything else.

With one node there is no DIFF channel, so modes 1 and 2 arrive mixed —
that's fine for establishing the curve, and mode separation waits for the
second sensor.
