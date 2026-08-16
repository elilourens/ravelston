# MOUNTING.md — Detachable mounting for Ravelston nodes

Research synthesis, 2026-08-12. Three research waves, 13 parallel sweeps,
**~256 sources** (compact lists at the end). Companion visual pages:
`scratch/mount-concept.html` and `scratch/mount-options.html`.

## Requirements (final, Eli 2026-08-12)

1. Works on **plastic AND metal** equipment
2. **Instant** attach/detach (seconds, tool-free, no per-equipment prep in
   commercial gyms)
3. **Small and simple** — no big levers, buckles, or ratchet hardware
4. Works on **barbells AND dumbbells** (one mechanism, or one node with two
   trivial carriers)
5. Bar-end mounting is acceptable **even though the sleeve rotates**
   (spin-tolerant sensing assumed — must pass the sleeve-spin bench test)

How we got here (context for why older candidates were retired): started
with magnet-on-end-face → research killed it (end caps rotate, magnet-only
sheds under vibration) → shaft saddle clamp → rejected (doesn't fit
dumbbells) → cam-lever band → rejected (too big/fussy) → stretch loop →
superseded by requirements 4–5 and the round-2/3 candidates below.

## Current recommendation

**Prototype three finalists and let the bench decide:**

1. **Spring claw with interleaving rubber teeth** (round-3 N1: hair claw
   clip × trigger capo). One-hand squeeze, <1 s, and one SKU spans the Ø50
   sleeve and 60–180 mm dumbbell heads of any material. The strongest
   single-mechanism answer found in any round.
2. **Quick-Fist-style one-piece rubber C-clamp** (round-2 #2). Snap-over +
   tab-on-knob, 1–2 s, Ø25–57 mm, proven in off-road vibration duty; the
   node's housing *is* the clamp.
3. **Split system** (round-2 #5): quarter-turn puck node + snap cap on the
   sleeve end + C-clamp carrier for dumbbells — best per-session gesture
   (~1 s) at the cost of two carrier parts.

Premium/roadmap track: **dock/bolt occupation** (round-3 N4+N5, the
Sony-tennis/Garmin-golf pattern) — install a cheap dock once per equipment
(sleeve end plug, dumbbell head-bolt recess), sensor hops between docks.
Zero per-session friction; needs an Eleiko claim check for the sleeve-plug
variant.

**Stage 0/1 validation (unchanged)**: magnets + athletic tape on the shaft
inside the collars for bench work; Voile-strap leash as drop insurance;
tap-test any mount (resonance ≥200 Hz) before trusting whip data.

**Bench tests** (Stage 1 plan):
1. Tap test each candidate → mounted resonance (phone mic + FFT ok).
2. Whip spectrum per mount vs zip-tie baseline — does mount choice shift
   f1/f2 or Q?
3. **Sleeve-spin test (gates all end-mounting)**: node on rotating sleeve
   end during plate spin — gyro contamination + whip fidelity through the
   bushing/bearing (FINDINGS open question #3).
4. Drop test: bar drop from rack height ×10 — retention + post-drop
   calibration shift.
5. Claw prototype vs Quick Fist vs snap cap head-to-head (order from
   cross-round synthesis).

## The "just stick it on" staircase

Eli's preferred UX is slap-on adhesion. Physics taxes it (see Findings:
chalk/texture/peel) but doesn't forbid it — three options, in ascending
ambition:

**Option 1 — Magnet-primary v1 (shippable now).** A strong rubber-booted
pot magnet IS the stick-everything experience on the ~90% of commercial-gym
equipment that is steel; Beast Sensor shipped exactly this and users loved
the magnet. Ship with a strap/band fallback in the box for plastic
adjustables (a home-gym category), and a leash rule for overhead drops.
Every VBT product on the market made a version of this compromise.

**Option 2 — Tri-hybrid pad (R&D, novel, patentable).** One ~Ø50 mm pad
combining three surface technologies whose blind spots are exactly
complementary:

| Zone | Owns | Dies on | Numbers |
|---|---|---|---|
| Center: Ø20–25 mm pot magnet behind ~0.5 mm elastomer face | steel (painted/chromed/zinc) | plastic, rubber | 89–430 N pull, commodity $3–8 |
| Middle annulus: gecko fibrillar tape (Setex class), fibrils laid tangentially | SMOOTH plastic & gloss (a Bowflex ABS shell is its ideal substrate) | rough texture, chalk buildup | 30–40 N/cm² shear, 1000+ cycles, stiff, residue-free |
| Outer rim: microspine arrays (JPL/Stanford climbing-robot tech), tips tangential | ROUGH surfaces — cast iron, textured rubber, powder coat | polished smooth | hundreds of micro-hooks engaging asperities in shear; partially self-cleaning |

- **Gesture**: press on, twist ~15° to lock (drags gecko fibrils and spine
  tips into their engaged shear direction simultaneously); twist back +
  peel to release. Incidental knocks don't find the release direction.
- **Physics report card**: stiffness excellent (all three interfaces thin
  and hard — passes the whip requirement); shear retention strong (~200 N
  from 6 cm² of gecko alone, above the ~150 N drop transient); **peel is
  the weak axis** — mitigate with shear-oriented mounting faces, a raised
  rigid rim, or the leash for overhead work. Chalk degrades only the gecko
  zone and recovers with a wipe — graceful degradation, never total loss.
- **Does it exist? No.** No commercial product combines even two of the
  three — confirmed again by the dedicated buyability wave (see
  "Tri-pad buyability" section below). Pairwise research precedents exist and are encouraging: a
  documented gecko+electroadhesion hybrid gripper outperformed either tech
  alone (~48 kPa, IROS 2017 [A2]), and JPL/Stanford build gecko AND
  microspine grippers — but as separate per-surface end-effectors, never
  fused with a shared engagement gesture. Novel → potential Ravelston IP;
  also a warning that integration may be nastier than it looks (zones need
  different preload; the locking twist may scrub the gecko fibrils).
- **Falsification test (~$30, one afternoon — orderable BOM in the
  buyability section)**: franken-pad = pot magnet +
  gecko tape (Gecko Nanoplast, not Setex — see buyability) + 3M GM400 /
  hook-side-Velcro ring (poor-man's microspines) on a
  printed disc; luggage-scale pull/shear on chromed sleeve, hex-rubber
  face, and a smooth plastic shell; tap-test resonance; chalk everything
  and repeat. Cost at scale if real: $8–15/pad — the expensive mount, but
  it IS the product experience.

**Option 3 — Remora pad (the endgame).** Biomimetic suction + micro-spinule
hybrid (Science Robotics: 340× body weight, adheres to smooth, rough, AND
compliant surfaces — its specialty is exactly where gyms kill plain suction
and gecko). The only adhesion technology that plausibly beats the full gym
surface set. Deep R&D; revisit when there's a hardware budget. (= round-3
candidate N9.)

## Tri-pad buyability (wave 4, 2026-08-12 — 4 sweeps, ~90 sources)

**Question**: can the tri-hybrid pad (or any "sticks to steel AND plastic
AND rubber, instantly, rigidly" solution) be *bought* rather than built?

**Verdict: no premade solution exists. Build-only.** Every commercial
product picks exactly one surface technology or cheats with a pre-glued
receiver plate. But the falsification test is fully orderable today
(~£33–47), and true fibrillar gecko material IS buyable in small
quantities — that was the open doubt, now resolved.

### Premade "universal mount" sweep — all dead ends

- **Magnet+adhesive consumer mounts** (RAM steel plates, Trio VHB discs,
  CTC sensor pads): all hybridize by *pre-installing a receiver* per
  equipment — violates the no-prep-in-commercial-gyms requirement.
- **Switchable/MR adhesion**: ferrous-only by physics; no
  magnetorheological adhesion product on sale. "There is no magnet for
  aluminum" (sign-industry consensus).
- **Powered suction** (IMT, LISEN, DJI-style pump mounts): every vendor
  still specifies smooth/clean/non-porous; no 2024–26 product claims
  chalk or texture tolerance. Suction exclusion stands.
- **Electroadhesion**: still not a buyable component (Grabit stale,
  Omnigrasp research-stage, lab payloads ~1.5 kg with kV electronics).
- **Remora discs**: commercialization went medical/underwater (wet, soft
  substrates) — nothing for dry rigid mounting.
- **Mechanical clamps** (Manfrotto Super Clamp, GoPro Jaws): the only
  truly material-agnostic rigid quick mounts on the market — they fail on
  *geometry* (need a graspable edge/tube), not physics. Consistent with
  keeping the spring claw as finalist #1.
- **VBT competitors 2024–26**: nobody solved it. Enode = magnet + fabric
  strap; Vitruve/Output = velcro strap; GymAware FLEX = magnet on steel
  sleeve end face (ferrous-only); RepOne = floor tether; Metric/OVR =
  camera, no mount at all. The market's answer to plastic/rubber
  equipment is "use a strap" or "skip mounting entirely."

### Component buyability (per zone)

| Zone | Buyable? | Best options 2026 |
|---|---|---|
| Pot magnet | Commodity, but **spec correction**: rubber-coated Ø22 pulls only ~2.6–5.9 kg (rubber coat trades pull for shear/protection). 10–25 kg at Ø25 requires a *bare* pot magnet | supermagnete GTNG-22 (Ø22 rubberized, 5.9 kg, ~£3.50); First4magnets 20515 (Ø25 bare N42, 20 kg, ~£6) — test both |
| Gecko fibrillar | **YES — resolved.** True fibrillar is hobbyist-buyable | Cheapest: **Binder Gecko Nanoplast** silicone film, ~$17/10×10 cm (Material Sample Shop / binderdirect.uk; ~1.5 N/cm² normal, water-washable — relevant for chalk). Highest-performance small-qty: **OnRobot Gecko replacement pad kit** ($202/8 robot-grade pads) or **geCKo Materials gMDA** sheet ($1,000, 3"×4", 12 N/cm² shear, 120k cycles, needs shear preload — fits the twist-lock gesture). **Setex is no longer a tape source**: industrial tape business sold to Shin-Etsu (2024, B2B "ShineGrip", contact-sales only); sample webstore defunct; only consumer anti-slip grips remain on Amazon |
| Microspines | **NO — nothing purchasable, anywhere.** No JPL/Stanford/CMU spinoff sells hardware; NASA licensing portal lists zero microspine tech. Lab-fab only (CMU documents a DIY route: sewing needles/fish hooks cast into printed compliant flexures) | Best proxy: **3M Gripping Material GM400** (~$15) — micro-replicated array of stiff polymer gripping fingers, scratch-safe, chalk-tolerant; arguably better than hook-Velcro (finer/denser/firmer). Anything with real bite (carbide grit tape, TC studs, Mitee-Bite pads) gouges chrome/powder coat — disqualified for gym use. No vendor publishes hook-vs-random-asperity shear data; the bench test is the only source of real numbers |

### Rigid-suction + magnet hybrid (Eli question, answered)

Rigid-bodied suction exists (lever-lock glass-lifter cups) and fixes the
*compliance* objection — but compliance was never the killer. The fatal
modes remain: (1) chalk creates seal leak paths → vacuum decay →
instant-and-total release without warning; (2) coverage barely improves —
magnet already owns the (curved, seal-hostile) steel sleeve, rubber/rough
surfaces still fail, leaving only smooth flat plastic, which gecko covers
with a dry stiff interface; (3) drop shock finds lip-edge peel, and a
rigid body transmits the full transient to the seal. Strictly dominated
by the tri-pad. Optionally add a ~£8 mini lever cup to the bench test as
a fourth article to falsify with data.

### Advanced suction on textured rubber (follow-up sweep, 2026-08-12)

Eli asked whether "super advanced" suction could crack the rubber hex
dumbbell. Dedicated sweep (~15 sources): **no — at any price, commercial
or academic.** Three independent physics walls:

1. **Force ceiling at Ø50 mm.** Max 157 N gross at 0.8 bar, but a foam
   sealing ring eats radial width → realistic sealed area Ø30–35 mm →
   **55–75 N**, under the 150 N drop spec before dynamics even start.
2. **Leak-vs-size scaling kills miniaturization.** Leak rate scales with
   seal *perimeter*, force with *area* — shrinking a rough-surface pad
   keeps the leak and loses the force. mm-scale knurl needs ~5–50 L/min
   makeup flow at 0.5 bar: that is literally a **GRABO** pump (the state
   of the art in portable rough-surface suction: foam double-seal +
   20 L/min pump, handles ~3 mm texture, but **1.5 kg, ~25 W, audible
   whine, ~$150–300**; no mini version exists — grabo.com). Industrial
   foam pads (Wood's Powr-Grip, Anver FP38, Schmalz FXP) bottom out at
   Ø80–100 mm + plumbed vacuum.
3. **The sealing mechanism IS a stiffness violation.** Rough-surface
   suction only works by putting compliant foam/soft skirt in the load
   path; at 30 g-node scale the atmospheric preload (~50–100 N) can't
   rigidify the foam → ≥50 kN/m is structurally unreachable.

Chalk seals the verdict: a "dust-tolerant" hybrid cup study (MDPI
Actuators 2021) held ~2 N on a dusty plate for **three attach cycles,
then failed** — fines clog and abrade seals progressively. The academic
frontier (Bristol PNAS 2024 water-film-sealed sucker, −61 kPa on rough;
octopus microdenticle cups, Adv. Sci. 2022) needs *wet* interfaces —
opposite of a chalked gym. Minimum viable rough-rubber suction mount
today ≈ Ø100–130 mm foam pad + 300–500 g pump/battery: a 10–20× mass and
power overshoot. **Suction stays ruled out; anti-recommendation
upgraded from "suction cups" to "suction of any kind, powered
included."**

Sources: grabo.com (Nemo, Pro-Lifter 20, tech specs, slender seal);
wpg.com VPFS10T + textured cups; anver.com small foam pads; schmalz.com
FXP/FMP; PNAS 2024 PMC11032437; Adv. Sci. 2022 202202978 + 2021
202100641; MDPI Actuators 10/3/50; IEEE City-Climber 4798825; tethered
drone perching (ResearchGate 366611232); hobby vacuum kits (eBay).

### Franken-pad BOM (orderable now, UK-first)

supermagnete GTNG-22 rubberized pot (~£3.50) + First4magnets 20515 bare
pot control (~£6) · Gecko Nanoplast 10×10 cm (~£15; UK-friendly — Setex
kit is US-only in practice; PU-gel nano tape only as a clearly-labelled
non-fibrillar fallback) · 3M GM400 gripping material + hook-Velcro 50 mm
(~£10 both) · optional 3M Dual Lock SJ3550 (~£11; SJ3540/SJ3550 are both
Type 250 — same stem density, different adhesive; stiffest is Type 400
SJ3551, hard to find in small lots) · 50 kg luggage scale with data-hold
(~£9) · chalk block (~£4) · M4/M5 hardware + epoxy (~£8). **Total ~£47
full, ~£33 minimum.** Tap-test FFT: **phyphox** app (free, reads
accelerometer resonance directly, not just audio).

**Net effect on the staircase**: Option 1 (magnet-primary + strap
fallback) remains the only shippable v1 — now confirmed as what the
entire market converged on. Option 2 (tri-pad) is confirmed novel and
build-only, with all test materials orderable; run the franken-pad before
any further pad talk. Option 3 (remora) moved further away —
commercialization went medical/underwater.

### Wave 4 sources (compact)

setextechnologies.com tapes + tech-sheets + Shin-Etsu sale;
setexgrip.com; binder-gmbh.com Gecko Nanoplast; binderdirect.uk;
materialsampleshop.com gecko-tape; geckomaterials.com shop +
specifications; emicorp.com OnRobot pad kit 8247; thinkbotsolutions.com
gecko spares; onrobot.com gecko-gripper; unchainedrobotics.de;
buygeckskin.com / Felsuma (dormant); NASA T2 portal (zero microspine
hits); ri.cmu.edu microspine-for-AM paper; 3M GM400 TDS + Dual Lock
SJ3550 TDS + Safety-Walk; velcro.com industrial hook; miteebite.com
TalonGrip; ergodyne TREX cleats; heskins.us; rammount.com RAM-343-PU;
trioflatmount.com; ctconline.com adhesive pads; first4magnets switchable;
signs101.com aluminum-magnet thread; gothamsound.com vacuum cup; LISEN /
PGYTECH suction; grabitinc.com (stale); omnigrasp.com; MIT MUSAS remora
(Nature 2025); manfrotto super clamp; gopro.com Jaws; enode.ai sensors +
strap; shop.vitruve.fit velcro-strap; outputsports.com; gymaware.com FLEX
+ compatibility (aluminum); reponestrength.com; supermagnete.de GTNG-22 /
GTNG-31; first4magnets.com 20515 + F606R; itapestore.com dual-lock guide;
pullumsports.co.uk chalk; phyphox.org.

## Engineering requirements (derived, with numbers)

| Parameter | Requirement | Why |
|---|---|---|
| Mount stiffness | ≥50 kN/m (resonance ≥200 Hz @ 30 g) | <1% amplitude error at 20 Hz; excludes foam/soft rubber only [P1–P6] |
| Normal retention | ≥150 N rated **at the real gap** (chalk/coating ≈0.1–0.5 mm costs 30–50% of catalog pull) | F=ma at 500 g worst-case drop transient [P7–P10, P18] |
| Shear retention | Mechanical shear feature mandatory (lip/boot/latch/strap/teeth) | magnet shear ≈ 25–30% of pull; friction μ≈0.2–0.3 on chrome [M9, P15] |
| Node mass | ≤30 g is measurement-negligible: whip Δf/f ≈ −0.6% bare bar, <−0.06% loaded (33/140 Rayleigh) — constant & calibratable | [P13, P14] |
| IMU shock | LSM6DS3 abs-max **10,000 g / 0.2 ms** (verbatim datasheet) — 10× margin | [P11] |
| Battery shock | Pouch cell is the weak link: UN 38.3 qualifies 150 g/6 ms; isolate the cell locally with 1–2 mm compliant potting (cell isolation ≠ sensor isolation — IMU stays hard-coupled) | [P12] |
| Shock envelope | Function through 200 g/6 ms, survive 1000 g/1 ms (IEC 60068-2-27); derived from drop physics: 50–190 g avg, 200–1000 g peak at the sleeve | [P7–P10, P26–P28] |
| Chalk | Air gap + friction reducer + adhesive contaminant; tension and mechanical interlock are chalk-immune, adhesives are not | [P18, P20, P21] |
| Attach UX | One-handed, <5 s, tactile snap = fully seated; zero floor accessories; the two nodes travel/store as one object | [U2–U4, C15] |

## Key findings (across all three waves)

1. **Stiffness is a solved non-problem; shock retention is the whole
   game.** Industrial condition monitoring magnet-mounts accelerometers to
   round and flat steel as standard practice; worst-case bandwidth ~1 kHz
   is 50× above our 2–20 Hz band [D1, D4, D5; P1–P6]. Only rule: no
   foam/elastomer in the sensor→bar load path.
2. **Magnet-only sheds under lifting vibration** — four independent
   documented failures (OpenBarbell deadlifts [C11], Vitruve oly-lift ban
   [C9], PUSH kettlebell testing [U1], GymAware lock-ring requirement
   [U2]). The proven pattern is **two-stage: magnet/elastic for speed,
   mechanism for shock** (GymAware FLEX survives documented 182 kg
   overhead drops [C5]; GoPro and Quad Lock use the same split [M12, M15]).
3. **Adhesion loses to the gym.** Chalk (MgCO₃) is a granular lubricant on
   exactly the smooth surfaces adhesives need; texture at tens of microns
   collapses gecko-class adhesion by orders of magnitude; drop shock always
   finds the weak peel direction (suction fails it instantly and totally,
   plus vacuum decay and elastomer compliance) [A2]. Geometry
   (wrap/clamp/cap/claw) beats adhesion — the staircase above is the
   managed exception.
4. **Standardization asymmetry.** Every Olympic bar has a Ø50 mm sleeve —
   the one universal dimension (end caps, by contrast, are chaos: rotating,
   thin, often non-ferrous, brand-specific; 1" home-gym bars are the lone
   exception, declare unsupported) [B2-1, P24]. Dumbbells standardize
   NOTHING except (quasi-) the recessed head bolt dead-center in most fixed
   dumbbells [S3]. Hence: barbell side may be fixed-geometry; dumbbell side
   must be range-based (claw teeth, straps, edge hooks).
5. **The hand owns the handle; the product owns the ends.** Confirmed
   across dumbbells/KBs/plates/stacks; dumbbells rest and land on head
   *sides*, so an end-face node never touches the floor [E-group].
6. **Occupy an existing standardized feature** — the meta-pattern of every
   successful sports sensor (golf grip vent hole, tennis butt cap,
   oarlock, bat knob) [S3]. Barbell/dumbbell analogs: sleeve end plug,
   snap-ring flange, dumbbell head-bolt recess (also the IMU-ideal
   center position).
7. **Bonus sensing**: a magnetometer channel riding a weight stack gives
   ~97.5% load accuracy (W8-Scope) — a whip-signal substitute on machines
   [E1–E3].

## Candidate catalog

### Finalists (see Current recommendation)
Spring claw (N1) · Quick-Fist C-clamp (R2-2) · split system puck+carriers
(R2-5 + R2-1) · dock/bolt occupation (N4+N5, premium track).

### Round 2 — ten candidates under requirements 1–3 (77 sources, A2–D2)

| # | Mechanism | Gesture | Plastic? | Notes |
|---|---|---|---|---|
| 1 | **Snap cap ("pen cap") over the Ø50 sleeve end** — POM/PA annular snap, TPU liner | push on <1 s | bar-only | 360° snap = strongest small snap known; ~$1–2; FTO clear [D2] |
| 2 | **Quick-Fist rubber C-clamp** (tab-over-knob) | 1–2 s | YES, Ø25–57 mm | off-road vibration pedigree; 25 lb WLL [C2] |
| 3 | **Mini spring-jaw claw** (GoPro Jaws scaled + cam lock) | ~2 s | YES — only jaw spanning sleeve, hex, Bowflex | consumer version 9× too heavy; miniaturize the mechanism [C2, B2] |
| 4 | **Silicone stretch boot** over sleeve end | 2–4 s | round heads only | Ø50 caps are a commodity; elastomer compliance = whip caveat [B2, C2] |
| 5 | **Split system: passive carrier + quarter-turn puck** (Garmin pattern) | ~1 s | YES via carrier | best gesture found; AirTag industry converged on the same split [C2, D2] |
| 6 | **Mini cam-lever C-collar** (Lock-Jaw shrunk) | ~2 s | bar + handles | collar industry already drop-proved this at Ø50 [D2] |
| 7 | **Magnet + Velcro One-Wrap combo** | <1 s / ~3 s | wrap side | ships today (OpenBarbell/OVR); two gestures is the tax [C2] |
| 8 | **Knog stretch tail + nub** | ~2 s | YES | legitimate; outranked on stiffness and speed |
| 9 | **Gecko pad** (Setex) | <2 s | smooth only | wipe ritual, weak peel, chalk decay — niche [A2] |
| 10 | **Rubber twist-tail** (Gear Tie) | 5–8 s | YES | slowest; wire fatigues; last resort [C2] |

### Round 3 — ten novel candidates, all barbell+dumbbell (68 sources, S3/F3/E3)

| # | Mechanism | Donor | Barbell | Dumbbell | Note |
|---|---|---|---|---|---|
| N1 | **Spring claw, interleaving rubber teeth** | hair claw clip + trigger capo (US7745710) | Ø50 sleeve | heads 60–180 mm, any material | <1 s one-hand; teeth self-adjust across the range — ONE SKU; proven vibration survivors |
| N2 | **Windlass strap** | CAT tourniquet (US7582102) | any Ø | any head | unlimited take-up, huge finger-torque tension, flick release |
| N3 | **Eversion cuff over undercut flange** | Blast Motion bat-knob mount | sleeve rim step | head-to-handle step | lip swallows the flange — capture, not friction; survives bat swings |
| N4 | **Press-in dock + twist-lock node** | Sony tennis adapter / Zepp insert | replaces sleeve end plug (verify vs Eleiko) | into head-bolt recess | install once, node hops in ~2 s; shipped across 100+ racket models |
| N5 | **Instrumented "smart bolt"** | Garmin CT10 grip screw | bolt-end bars (non-rotating axis) | fixed-dumbbell head screw | replace a fastener with an instrumented twin; zero per-session attach |
| N6 | **Garter-spring boot rim** | rotary lip seals | push-on sleeve boot | round heads | seal-grade sustained radial preload — fixes boot creep |
| N7 | **Rubber over-center T-hook cradle** | engine-hood latch | saddle + horn | cradle + horn | one molded TPU part, defined preload, no lever |
| N8 | **Releasable ratchet tie** | SpeedyTie (250 lb) | any Ø | any head | zip-tie speed, pinch-release under tension; cheapest tooling |
| N9 | **Remora pad** | Science Robotics remora disc | flat sleeve end | rubber/plastic heads | = staircase option 3; highest R&D |
| N10 | **Edge-hooking fold-over claws** | violin shoulder-rest feet (US5419226A) | sleeve-end lip | head edge/step | grips an EDGE, not a diameter — size/finish agnostic |

### Retired round-1 concepts (superseded by requirements 4–5)
- **Shaft saddle clamp inside the collars** — still the fallback if the
  sleeve-spin test fails end-mounting; unclaimed whitespace, gyro-safe.
- **Magnet + shear-lip base for flat steel end faces** — absorbed into
  staircase option 1; the shear-lip died on Eli's varied-edges objection.
- **Bonded quarter-turn puck** — home-gym/test-bar tool only.
- **PU strap + rigid V-block / stretch loop** — outranked within the
  tension family.

### Wildcards & principles worth keeping
Magnetorheological pad (fluid conforms, magnet rigidizes — solves
texture+stiffness+plastic at once); standalone microspine pads (the
anti-gecko: loves knurl and rough rubber); self-cinching twisted-string
lasso (firmware-released); sensor-as-a-change-plate (bar-only, gym-legal,
universal); cufflink T-bar into the plate-hub gap (bar-only); log-spiral
climbing cams into the sleeve bore (self-tightening, but bore variance +
Eleiko); ball-lock pins / LEGO-clutch as node↔carrier docking standards;
bird-tendon plicae micro-ridges (load engages, unload releases) as a jaw
texture.

### Anti-recommendations (evidence-backed)
Magnet-only anywhere ballistic [C9, C11, U1, U2]; neoprene/foam/velcro
sleeves in the sensor load path [C13]; anything retained inside a hollow
bar end (Eleiko patent) [T4, T5]; plastic quarter-turn tabs at shock,
MagSafe-class magnets (~10 N), cold shoes, elastomer "vibration dampener"
accessories [M5, M12, M14]; suction cups and gel/PopSocket adhesives [A2].

## Freedom to operate (search-level, not legal advice)

- **Live, design around**: US12005316B2 (Eleiko, ~2041) — sensor in a
  bar-end *cavity* retained by friction seals/threads/magnet/bayonet; stay
  external (grip the sleeve OD or end face). US9623285B1 (Ruiz, 2035) —
  magnet+accelerometer housing *with tilt-limit alarm*; no bar-level
  warning feature without a claim chart [T3–T5].
- **Free prior art / abandoned**: US20170128765A1 (shaft cassette),
  US20170266490A1 (sensor collar), US20130012359A1 (interchangeable curved
  bases), US10549154B2 (lapsed), US7455621B1 (expired) [T1, T2, T6–T9].
- The tri-hybrid pad appears to be unclaimed whitespace (pairwise research
  precedents only — potential Ravelston IP).

## Open questions

- **Sleeve-spin test** — the gate on all end-mounting: does whip survive
  the bushing/bearing, and does spin swamp the gyro? (Bench test 3.)
- Claw-jaw geometry: can one tooth set really span Ø50 + hex heads without
  a size-select step? (Prototype answers this.)
- Tri-hybrid franken-pad results — run before any pad R&D talk.
- Two-mode calibration (FINDINGS §4) sensitivity to ±2 mm mount-position
  repeatability — sets the mechanical datum precision.
- Dock-in-sleeve-plug vs Eleiko claim 1 — is an *exterior* press-fit into
  the plug recess "in a cavity"? Needs a real FTO read before N4 ships.

---

## Sources

### Wave 1 (111 sources, groups C/T/M/E/P/U)

#### C — Commercial products (20)
1. https://enode.ai/getting-started/
2. https://sprintingworkouts.com/blogs/training-equipment/enode-vmaxpro-review
3. https://help.enode.ai/article/107-barbell-strap-usage
4. https://sportstechnologyblog.com/2020/03/07/flex-barbell-sensor-review-our-1st-look/
5. https://gymaware.com/6-mistakes-youre-probably-making-with-the-gymaware-flex/
6. https://store.simplifaster.com/product/gymaware-velcro-strap/
7. https://gymaware.com/product/gymaware-magnetic-strap-attachment/
8. https://www.manualslib.com/manual/1881290/Kinetic-Gymaware-Powertool.html
9. https://support.vitruve.fit/accesories-of-the-encoder
10. https://www.reponestrength.com/knowledge
11. https://github.com/squatsandsciencelabs/OpenBarbell-V3/wiki/OpenBarbell-V3-FAQ
12. https://www.kingofthegym.com/beast-sensor-review/
13. https://pmc.ncbi.nlm.nih.gov/articles/PMC6915617/
14. https://eleiko.com/en/equipment/bars/3085286-eleiko-bar-sensor-kit
15. https://www.metric.coach/user-guide/record-velocity-in-the-metric-vbt-app
16. https://www.outputsports.com/performance/velocity-based-training
17. https://www.garagegymreviews.com/equipment/push-band-2.0
18. https://vbtcoach.com/blog/velocity-based-training-devices-buyers-guide/
19. https://apps.apple.com/app/spleeft-velocitybasedtraining/id1606893985
20. https://techcrunch.com/2014/06/10/apple-patents-a-weightlifting-tracking-sensor-with-possible-iwatch-integration/amp/

#### T — Patents (12)
1. https://patents.google.com/patent/US20170128765A1/en
2. https://patents.google.com/patent/US20170266490A1/en
3. https://patents.google.com/patent/US9623285B1/en
4. https://patents.google.com/patent/WO2020209772A1/en
5. https://patents.google.com/patent/US12005316B2/en
6. https://patents.google.com/patent/US7455621B1/en
7. https://patents.google.com/patent/US20130012359A1/en
8. https://patents.google.com/patent/US10617905B2/en
9. https://patents.google.com/patent/US10549154B2/en
10. https://patents.google.com/patent/CA160812S/en
11. https://eleiko.com/en/eleiko-sensor-barbell
12. https://patents.google.com/patent/US11410765B2/en

#### M — Cross-industry mechanisms (21)
1. https://www.allaboutcircuits.com/technical-articles/accelerometer-mounting-methods-types-effects-and-solutions/
2. https://blog.endaq.com/accelerometer-mounting-best-practices-for-vibration-measurement
3. https://www.pcb.com/contentstore/MktgContent/WhitePapers/WPL_46_Magnet%20Mounting%20Techniques%20for%20Machinery%20Vibration%20Monitoring.pdf
4. https://ctconline.com/products/ctc-line/mounting-hardware/flat-surface/
5. https://www.reliabilitydirectstore.com/kb_results.asp?ID=77
6. https://store.motionics.com/products/two-pole-rare-earth-accelerometer-magnetic-base
7. https://www.kjmagnetics.com/mm-d-20-neodymium-female-stud-mounting-magnet
8. https://totalelement.com/products/20mm-neodymium-rare-earth-countersunk-cup-pot-mounting-magnets-n52-8-pack
9. https://usmagnetix.com/magnet-pull-force-how-much-weight-can-a-magnet-hold/
10. https://radialmagnet.com/pull-force-explained/
11. https://www.xmwus.com/blogs/buyers-guides/how-strong-should-magsafe-magnets-be
12. https://gopro.com/en/us/shop/mounts-accessories/latch-mount-magnetic-hero13/AEMAG-001.html
13. https://snapmounts.com/
14. https://www.garmin.com/en-US/p/65215/
15. https://www.mountguys.com/quad-lock-mounts/
16. https://support.quadlockcase.com/hc/en-us/articles/6880418823311-Vibration-Dampener
17. https://us.knog.com/products/plus-mount
18. https://www.voile.com/voile-straps-key-features.html
19. https://shop.normagroup.com/au_en/norma-quick-release.html
20. https://www.primaryarms.com/american-defense-qd-picatinny-rail-mount-5-lug-ad-170-vpg-5
21. https://www.bhphotovideo.com/c/product/1734465-REG/niceyrig_509_arca_swiss_dovetail_clamp_with.html

#### E — Equipment surfaces (18)
1. https://www.researchgate.net/publication/351890860_W8-Scope_Fine-grained_practical_monitoring_of_weight_stack-based_exercises
2. https://www.sciencedirect.com/science/article/abs/pii/S1574119221000699
3. https://iie.smu.edu.sg/tech-offers/w8-scope-fine-grained-monitoring-weight-stack-based-exercises
4. https://www.garagegymreviews.com/beast-sensor-review
5. https://gadgetsandwearables.com/2016/08/08/review-beast-sensor/
6. https://www.whipsaw.com/work/kabata-smart-weights
7. https://www.t3.com/news/kabata-ai-dumbbell-launch-0524
8. http://www.karinannahummel.info/pub/puc2013_pernek.pdf
9. https://www.ironcompany.com/cap-barbell-sdh-pro-style-dumbbell-handles
10. https://powerliftingtechnique.com/dumbbell-types/
11. https://www.ironcompany.com/blog/choosing-the-best-hex-dumbbell
12. https://garagegymlab.com/bowflex-selectech-552-review/
13. https://strengthwarehouseusa.com/blogs/resources/powerblock-vs-nuobell
14. https://www.blkboxfitness.com/en-us/blogs/education/cast-iron-vs-competition-kettlebells
15. https://theapplewatchtriathlete.com/blog-1/2018/4/9/twelve-south-have-made-an-armband-for-apple-watch-and-its-great-for-kettlebells-and-weights
16. https://www.amazon.com/Pieces-Bicycle-Silicone-Straps-Cycling/dp/B07Z8KZ2XK
17. https://sportsmith.com/selector-pin-for-weight-stack-diameter-7-16-lifefitness/product/p017353001/
18. https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11117018

#### P — Physics & durability (28)
1. https://wilcoxon.com/blog/sensor-mounting-methods/
2. https://blog.endaq.com/accelerometer-mounting-best-practices-for-vibration-measurement
3. https://www.endevco.com/contentStore/mktgContent/endevco/dlm_uploads/2019/02/TP312.pdf
4. https://www.ctconline.com/blog-archive/impact-of-magnet-size-on-frequency-response/
5. https://www.acoustics.asn.au/conference_proceedings/AAS2018/papers/p16.pdf
6. https://www.pcb.com/contentstore/MktgContent/WhitePapers/WPL_46_Magnet%20Mounting%20Techniques%20for%20Machinery%20Vibration%20Monitoring.pdf
7. https://www.researchgate.net/publication/342347305_Impulse_forces_and_noise_from_dropped_weights_on_concrete_floors
8. https://keppifitness.com/blogs/knowledge/the-physics-of-a-solid-lift-plate-securement-force-explained
9. https://www.skelcore.com/blogs/news/whats-the-realistic-drop-height-rating-for-your-bumper-plates-e-g-for-heavy-cleans
10. https://blog.endaq.com/shock-analysis-response-spectrum-srs-pseudo-velocity-severity
11. https://content.arduino.cc/assets/st_imu_lsm6ds3_datasheet.pdf
12. https://www.tuvsud.com/en-us/industries/mobility-and-automotive/automotive-and-oem/automotive-testing-solutions/battery-testing/un-dot-38-3
13. https://link.springer.com/article/10.1007/s12206-017-0206-1
14. https://www.researchgate.net/publication/238951371_On_the_representation_of_a_cantilevered_beam_carrying_a_tip_mass_by_an_equivalent_spring-mass_system
15. https://amfmagnets.com/products/neodymium-pot-countersunk-32mm-x-8mm
16. https://www.first4magnets.com/us/countersunk-c41/n42-neodymium-countersunk-pot-magnet-32mm-dia-x-8mm-thick-x-5mm-hole-97-02lbs-pull-p16081
17. https://www.kjmagnetics.com/mm-a-32-neodymium-countersunk-mounting-magnet
18. https://www.blumags.com/news/how-does-airgap-affect-the-holding-force-of-a-magnet
19. https://www.kjmagnetics.com/magnet-strength-calculator.asp
20. https://commons.nmu.edu/cgi/viewcontent.cgi?article=1056&context=theses
21. https://pmc.ncbi.nlm.nih.gov/articles/PMC5841679/
22. https://www.fringesport.com/blogs/news/cerakote-vs-zinc-vs-chrome-vs-stainless-steel-barbells-whats-the-difference
23. https://garagegymlab.com/barbell-coatings/
24. https://guides.roguefitness.com/Guide/How+to+Assemble+a+Barbell/18
25. https://valorfitness.com/products/needle-bearing-bar-ob-86-v
26. https://cvgstrategy.com/wp-content/uploads/2019/08/MIL-STD-810H-Method-516.8-Shock.pdf
27. https://www.desolutions.com/resources/mil-std-810-method-516-shock-testing-overview
28. https://infinitalab.com/blog/types-of-shock-testing/

#### U — User community (12)
1. https://www.strongfirst.com/community/threads/looking-for-push-band-alternative-vbt-device-for-kettlebell-ballistics.25580/
2. https://gymaware.com/6-mistakes-youre-probably-making-with-the-gymaware-flex/
3. https://sportstechnologyblog.com/2020/03/07/flex-barbell-sensor-review-our-1st-look/
4. https://vbtcoach.com/blog/velocity-based-training-devices-buyers-guide/
5. https://www.strongfirst.com/community/threads/eleiko-powerlifting-bars-with-integrated-sensors.23629/
6. https://eleiko.com/en/stories/sensor-ready-bar-facility-benefits
7. https://www.kingofthegym.com/vitruve-encoder-review/
8. https://physiqz.com/powerlifting/gear-equipment/velocity-based-training-devices-open-barbell-gymaware/
9. https://blaubeck.com/blogs/product-use/magnetic-phone-holder-solutions-for-the-gym-secure-your-phone-during-workouts
10. https://www.exodus-strength.com/forum/viewtopic.php?t=4463
11. https://apps.apple.com/us/app/metric-vbt-gym-workout-tracker/id1595510857
12. https://www.mdpi.com/2075-4663/11/7/125

### Wave 2 (77 sources, groups A2/B2/C2/D2 — compact)

**A2 — Adhesion tech (17)**: setextechnologies.com/tapes; phys.org
nanoGriptech; binder-gmbh.com GeckoNanoplast; onrobot.com gecko-gripper;
news.stanford.edu gecko ISS; royalsocietypublishing.org self-cleaning
gecko + rough-surface microfibres; sewelldirect.com airstick;
ieeexplore.ieee.org/document/8202289 (gecko+EA hybrid); sciencedirect.com
EA gripper S0924424723005241; prnewswire.com Grabit P-Series; nature.com
s41467-025-60220-7; sciencedirect.com SMPBA S1000936123003436; pnas.org
2221049120; journals.sagepub.com chalk tribology 17543371241272903;
amazon.com ZC-GEL B07TY1GMD6; pci.upenn.edu SMP gripper.

**B2 — Bar-end mechanisms (19)**: torokhtiy.com barbell dimensions;
roguefitness.com disassembly guide; ivankobarbell.com snap-ring kit;
lowes.com Ø50 chair caps 8045097; foodhuggers.com lids; repfitness.com hex
dumbbells; garagegymreviews.com bowflex-552; amazon.com Lock-Jaw
B01N52CS48; garage-gyms.com collars guide; garagegymlab.com collars;
gymaware.com flex-mistakes; patents.google.com US12005316B2; eleiko.com
bar-sensor-kit; gopro.com Jaws ACMPM-001; arestool.com 3-jaw gripper;
circoinnovations.com snap-clamps; ironcompany.com landmine eyelet;
simplifaster.com enode; gymaware.com flex-package.

**C2 — Consumer patterns (24)**: gopro.com Jaws; rei.com Jaws 867205;
joby.com gorillapod; aquamarinepower.com gorillapod review; niteize.com
gear-tie; lovegreatfinds.com stretch-lid sizes; foodhuggers.com hug
design; github.com OpenBarbell FAQ; researchgate.net PUSH bar-mount
validity 335208904; pubmed.ncbi.nlm.nih.gov/38188099 vmaxpro;
ovrperformance.com ovr-velocity; engadget.com airtag accessories;
elevationlab.com tagvault-bike; cnn.com airtag holders;
help.popsockets.com sticking; itapestore.com one-wrap; quickfist.com
10010 + 30050; etrailer.com quick-fist Q&A 254497; keybak.com retractors;
garmin.com quarter-turn 65215; amazon.com CatEye H34 B002L2CC88;
us.knog.com big-cobber; neewer.com GP25.

**D2 — Robotics/industrial (17)**: ardupilot.org EPM688 + EPM v3;
github.com Zubax opengrab; shop.zubax.com FluxGrip; magswitch.com
MagJig 60; 3dprint.com versaball post-mortem; newatlas.com versaball;
southco.com TL-20-201-07 + draw-latches; amazon.com Lock-Jaw HEX
B01FH1IH4C; maxbarbell.com lock-jaw-pro; ivankobarbell.com +
roguefitness.com sleeve construction; fountainpendesign.wordpress.com cap
mechanics; qlutionmold.com snap-fit guide; customplasticmoldings.com
snap-fit BASF; coval.com suction on porous; repcomsrl.com Bartels mp6;
bhphotovideo.com Peak Design Capture; photographylife.com capture review;
garmin.com quarter-turn; dupe.watch spring-bars.

### Wave 3 (68 sources, groups S3/F3/E3 — compact)

**S3 — Sports sensors (23)**: garmin.com CT10 manual; shotscope.com V5 tag
setup; arccosgolf.com embedded sensors; golfdigest.com smart grips;
blast-motion.helpjuice.com golf cuff + bat mount; diamondkinetics.com HP
mount; umich.edu Marucci smart bat; sony.net tennis adapter;
tennis-warehouse.com Sony butt caps; zepp.com tennis mounts + golf glove
mount; sportstechnologyblog.com HEAD sensor; tenniscompanion.org
dampeners; stancebeam.com FAQs; designboom.com FWD Powershot;
hothardware.com Hykso; wahoofitness.com RPM mounts; getcarv.com insole +
sensors; nkhome.com EmPower oarlock; newatlas.com Trace;
ivankobarbell.com + startingstrength.com sleeve construction;
bhphotovideo.com Telesin chin mount.

**F3 — Industrial fasteners (21)**: avibank.com + aft.systems ball-lok;
mrosupply.com + kippusa.com Kipp pins; wikipedia.org Dzus; southco.com D8
PDF + D9; monroeaerospace.com turnlock; lang-technik.de Quick-Point;
amf partcommunity K5; lyndexnikken.com zero-point; narescue.com CAT;
uspto.gov US7582102; hellermanntyton.us 131-75619 + cableorganizer.com
SpeedyTie; amazon.com hood latch B0H33BPSQ9; austinhardware.com rubber
fastener; acxesspring.com garter springs; rotorclip.com CT bands;
newmantools.com tapers; blade-tech.com Tek-Lok.

**E3 — Everyday/biomimetic (24)**: oreateai.com + sacraebeauty.com claw
clips; thermoworks.com + combustion.inc pot clips; firgelliauto.com SLCD +
bayonet; wikipedia.org Camalot; petzl.com Ascension; silverclover.com +
pranga.co cufflinks; italianwatchspotter.com deployant; scienceabc.com +
researchgate.net bird tendon lock; science.org remora disc + summary;
beilstein-journals.org octopus rim; mcgill.ca marine suction;
asknature.org burdock; uspto.gov US7745710 capo; sweetwater.com capos;
kunrest.com + patents.google.com US5419226A violin rests; brainbound.blog
+ thewave.engineer LEGO clutch.

*Caveats: a handful of URLs informed multiple sweeps (unique count slightly
lower); Reddit is crawler-blocked (lifter forums used instead); no Eleiko
end-cap teardown found; patent review is search-level, not a professional
FTO opinion.*
