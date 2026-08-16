---
tags: [hardware, manufacturing, enclosure, product]
---

# Enclosure

Making the case: what it costs at 10, 100 and 1,000, how the magnets get in,
and the antenna problem that could force a redesign.

Research 2026-08-16, ~50 sources. Companion to [[Compliance]] and
[[Hardware Roadmap]]. Assumes a ~35 × 30 × 15 mm two-shell pod.

---

## 0. The finding that matters most

> **Nobody has shipped a magnet-clamped, chalk-exposed, IMU-plus-BLE pod on the
> barbell shaft as their primary design.**

| Product | What it actually does |
|---|---|
| **Enode** | Magnet capability exists — but **the barbell strap ships in the box** and their own docs recommend it |
| **Vitruve, RepOne** | Tether/encoder. The magnet is on the **rack-mounted base**, the radio never goes on the bar |
| **Perch** | Camera. No bar-mounted device at all |
| **Eleiko Bar Sensor Kit** | Sensor hides in the **sleeve end cap**, radiating axially into free space |
| **GymAware FLEX** | 4 magnets **plus a tightening locking ring** — magnets alone weren't trusted. And it's a laser, not an IMU |

The tether products put the radio on the rack. The IMU product ships a strap.
The magnet product adds a mechanical lock. The OEM one hides in the end cap.

**That is either a large opportunity or a large warning, and finding out which
costs under £500.** See §7.

---

## 1. The antenna problem

Four independent RF penalties stack on the design as described.

**1 · The ground plane is too small.** A 2.4 GHz quarter-wave is ~31 mm.
Guidance is that a board under 30 mm in any dimension "is physically too small
to serve as an effective counterpoise, and the antenna will detune." **Our board
is 21 × 18 mm.**

**2 · A large steel bar right against it.** Nordic: "keep all external metal at
least 30 mm from the antenna area." Metal "casts an RF shadow." We cannot get
30 mm of clearance in a 15 mm pod clamped to a bar.

**3 · Two nickel-plated magnets inside the case.** The static field is
irrelevant at 2.4 GHz — the problem is that a plated NdFeB magnet is a
**conductive body in the near field**. Chip antennas need 5–10 mm keep-out; PCB
trace antennas 15–25 mm. "A single via or decoupling cap within the exclusion
area can detune the antenna by hundreds of MHz." Two 10 mm magnets are rather
more than a stray via.

**4 · A LiPo pouch is aluminium laminate** — conductive. Keep it behind the
ground plane, never between antenna and outside world.

**Do not pot it.** A measured case: epoxy potting cost **~50% of RF range** on a
BLE module.

**Plausible total: 10–20 dB, i.e. a 3–10× range reduction.** Fine for a phone
in the same rack. Possibly not for a phone across a commercial gym floor.

### The one good strategy: recruit the bar

A **PIFA** must either have its own ground plane *or be electrically attached to
the object it is tagging*. This is how phones use their metal frame, and it's
documented for RFID tags on metal containers.

**Put the antenna on the face away from the bar, backed by the PCB ground
plane, with the bar as an extended ground/reflector behind it.** That converts
the worst liability into directional gain — and it radiates toward the lifter's
phone rather than into the steel.

Fallbacks if that isn't enough: Molex on-metal antennas (2.0/5.5 dBi, mount
directly to metal), Ignion ALL mXTEND NN02-220 (characterised on a 600 × 600 mm
metal ground plane), or — the honest one — **a strap instead of magnets**.

---

## 2. Cost per unit, all processes

Per complete two-shell set, ex-VAT.

| Route | 10 | 100 | 1,000 |
|---|---|---|---|
| **MJF PA12, 3DPRINTUK Economy** | £4.00 | **£2.60** | £1.91 |
| MJF, Express | £5.10 | £4.25 | £3.12 |
| MJF via JLC3DP (CN) | ~£1.75 | ~£1.40 | ~£1.05 |
| **MJF, dyed + vapour smoothed** *(the real spec)* | ~£6.25 | **~£4.60** | ~£3.60 |
| Vacuum casting | ~£100 | ~£36 | ~£25 |
| Injection, China Al tool, **all-in** | £275+ | £28+ | **~£3.15** |
| Injection, China P20, all-in | £500+ | £50+ | £5.32 |
| Injection at 5,000 / 10,000 | — | — | £1.25 / £0.75 |

**Below ~5,000 units the tool *is* the product cost.**

### Break-even against printing

```
N = tool cost ÷ (MJF per set − moulded per set)
```

| Scenario | Tool | Break-even |
|---|---|---|
| **China aluminium** | £3,000 | **395 sets** |
| **China P20** | £5,000 | **651 sets** |
| UK P20 | £12,000 | 1,611 sets |
| Protolabs (2 tools) | £11,400 | 1,966 sets |

Lower than most guidance suggests, because the dyed-and-smoothed MJF spec is
~£4.60 rather than the bare £2.60 people quote.

---

## 3. Print process: MJF, not SLS, not resin

The decisive table is Z-axis ductility retention — how much strength survives
in the weak direction:

| Process | XY elong. | Z elong. | **Z retention** |
|---|---|---|---|
| **MJF PA12** | 20% | 15% | **75%** |
| Formlabs SLS Nylon 12 Tough | 25% | 15% | 60% |
| **EOS SLS PA 2200** | 18% | **4%** | **22%** |
| FDM ABS | 8.1% | 1.8% | 22% |
| Injection ABS / PC | 25% / 80% | isotropic | 100% |

Same nominal polymer, and **MJF keeps 75% where EOS SLS keeps 22%** — worse
than FDM ABS. For a dropped part, buy MJF.

**MJF is also black through the whole part** (carbon fusing agent). Dyed SLS is
white 0.2 mm under the surface, so gym-floor scratches show white.

**Resin is disqualified on materials, not price.** Formlabs Clear: 8%
elongation, HDT 59 °C. Tough 1500 loses **~88% of its modulus after a week in
IPA** — the standard gym wipe-down chemical.

⚠️ **PA12 is ductile but notch-sensitive.** Its notched Izod is ~25% of moulded
ABS and under 10% of moulded PC. **Radius every internal corner and boss root.**

### Vapour smoothing is the highest-leverage spend

| Direction | Tensile | **Elongation at break** |
|---|---|---|
| PA12 XY | −3.8% | **+21.4%** |
| **PA12 Z** | −2.5% | **+74.1%** |

Roughness Ra 5.99 → 1.20 µm. It removes surface micro-porosity that acts as
crack-initiation sites — **~3% tensile traded for up to +74% elongation, biggest
gain on the weakest axis.** UK price: +25% + £1/unit.

It also seals the surface, which matters enormously for chalk (§6).

### Skip vacuum casting

Tools last 20–30 parts (isocyanate diffuses into the silicone and forms
polyurea clusters that crack it). Cost is dominated by **~30 min of technician
labour per pour**, and labour doesn't shrink when your part does. At 100 units
that's ~£27–36/set against MJF's £2.60 — a 10–14× penalty.

The band survives on cosmetics, elastomers and exact colour match. None apply.

---

## 4. Magnets

### Retention: mechanical capture, adhesive as anti-rattle

| Method | Verdict |
|---|---|
| **Pocket + retaining lip, captured by the other case half** | ✅ **Right answer** — "fails only if the housing fails". Zero extra tooling if designed in from the start |
| Adhesive in a pocket | ✅ Use as secondary, anti-rattle only. **Loctite HY 4090** (CA-epoxy hybrid, 5 mm gap fill, water resistant) |
| **Press-fit into a plastic boss** | ⚠️ **Worst option.** Tensile hoop stress on a brittle body, plating scraped on insertion, and the plastic **creeps so the fit loosens** |
| Insert moulding | ❌ Possible via post-mould magnetisation, but +$0.40–1.20/part, +12–25 s cycle, a second supplier, and no rework — for nothing the pocket doesn't already give |

### Can you insert-mould neodymium? Technically yes, practically no

| Grade | Max working temp |
|---|---|
| **N (standard)** | **≤80 °C** |
| M / H / SH | 100 / 120 / 150 °C |
| UH / EH / TH | 180 / 200 / 230 °C |

Melt temps: ABS 210–250 °C, PC 280–320 °C. **Every resin exceeds every grade.**

The industry trick is **post-mould magnetisation** — mould an unmagnetised
blank, then charge the whole assembly in a coil. It also solves the other
problem, which is that a live N42 magnet flies across the shop and clamps
itself to the tool steel.

Still the wrong answer here. Use a pocket.

### ⚠️ Corrosion is a bigger problem than heat

| Coating | Salt spray |
|---|---|
| **Ni-Cu-Ni alone** (the default) | **Red rust in 8 hours** |
| Ni-Cu-Ni + epoxy | "Substantially higher"; standard for salt exposure |
| Parylene | Pinhole-free; used for skin contact |

**Sweat is salt water.** Eight hours is not a margin. **Specify Ni-Cu-Ni +
epoxy minimum.** Costs pennies on a 10 mm disc.

### ⚠️ Impact demagnetises NdFeB — peer-reviewed, not folklore

*Journal of Alloys and Compounds* (2022, 2024): impact "causes magnetic
disorder inside the magnet and further demagnetization," with **both reversible
and irreversible** components demonstrated.

Consequences: **fully constrain the magnet** so it can't hammer its pocket wall
(the adhesive bond line or a 0.2 mm shim absorbs it); **budget for gradual pull-
force loss over life** and don't spec at the minimum acceptable force; and note
a cracked magnet inside a sealed case is invisible until the pod falls off
mid-set.

### ⚠️ Pull force on a knurled bar is nothing like the datasheet

Ratings assume a **clean, flat, thick steel plate with full contact**. A barbell
shaft is a ~28–32 mm **knurled, plated cylinder**.

- A flat disc on a cylinder makes **line contact, not face contact**
- "An air gap of just 0.5 mm might cut the strength in half"
- Knurl depth is typically 0.2–0.5 mm, plus a plating layer, plus the case wall

**Stacked, this could plausibly cost 60–80% of quoted pull force.** Either
profile the magnet face to the bar radius, mount to the smooth centre band, or
buy much bigger magnets than the catalogue implies.

**And they collect iron filings.** Gym floors have steel dust from plate
collisions and knurl wear. That becomes an **abrasive slurry between pod and
bar** — scratching customers' bars and widening the air gap.

---

## 5. The finger loop: separate part, never overmoulded

A 2K mould costs **1.5–2.5×** a single-material tool and only breaks even at
**5,000–10,000/year**. A separate LSR loop tools at **$1,500–3,000** and runs
£0.15–0.30/part.

But the design argument settles it before the cost one: **the loop is meant to
be removable.** Overmoulding is permanent. Overmoulding a removable accessory
is a category error.

Whoop uses a separate bracket; the entire Apple Watch strap ecosystem exists
because the strap is a separate part with a mechanical interface. Retain it
with a **straight-pull feature** (T-slot or through-slot) moulded in at zero
tooling cost — which also makes it a spare-part line and a colour-variant SKU
without touching the main tool.

---

## 6. Sealing, chalk, and two design bans

**Realistic target: IP54 unqualified, IP65 with a designed gasket. IP67 needs
welding or potting**, and both are incompatible with a user-replaceable battery
([[Compliance]] §5).

Use a **die-cut PORON or silicone gasket in a moulded groove at >50%
compression**. Low tooling, pennies per part, works from 10 to 10,000.

Ultrasonic welding is permanent — wrong for a serviceable product. Potting
costs ~50% of RF range.

### Chalk plus sweat forms a paste, and that drives two bans

Gym chalk is magnesium carbonate, Mohs ~3.5–4.5 — harder than the polymer.
Field evidence from wearables: pull-up bars are "coated in chalk residue and
subject to sweat-induced electrolytic corrosion"; sweat pooling near charging
pins "forms micro-corrosion layers on the gold-plated contacts."

1. **No USB-C port.** A recessed connector is a chalk-paste trap you cannot
   clean or seal. Use **2-pin magnetic pogo charging** — flat sealed surface,
   100,000+ mating cycles, £0.60–1.50.
2. **No buttons.** Every button is an ingress path. **Wake on motion** using the
   IMU you already have, plus magnet-detach detection.
3. **Vapour-smooth the parts** — the difference between "wipes clean" and
   "permanently grey".
4. **Design the seam wipeable** — no undercut lips or textured recesses at the
   parting line.

---

## 7. What to prototype first — in this order

**None of it is the enclosure.** All four cost under £500 and under three weeks
combined, and each can invalidate what comes after.

### 1 · The magnetometer check — 30 minutes, £0

Already answered: we are 6-axis by design and `AGENTS.md` rules out magnetometer
and yaw entirely. **This is confirmation, not a risk.** Worth a 30-second sanity
check that the magnets don't disturb accel/gyro, but the design decision holds.

### 2 · The RF experiment — one week, ~£200. **The real gate.**

Build the worst case deliberately: candidate module on a 21 × 18 mm ground
plane, printed shell, **real magnets fitted, real LiPo fitted, clamped to a real
barbell.** Measure in order:

- Baseline free space, RSSI at 1/5/10/20 m
- Clamped to the bar, antenna facing **away** — record the delta in dB
- Antenna facing **toward** the bar — the difference tells you reflector vs shield
- **Magnets removed vs fitted**, everything else identical — isolates the
  parasitic-conductor effect and gives your keep-out empirically
- Battery in front of vs behind the ground plane
- **Sweep through a full squat rep** — the bar rotates in its sleeves, so
  antenna orientation changes continuously. A null at the bottom of the lift is
  a dropout the customer blames on the app

Use Nordic **DTM packet-error-rate**, not RSSI alone — PER predicts real
dropouts.

**Have the mitigation ready:** antenna on the far face with the bar as extended
ground, an on-metal antenna part, or a strap instead of magnets.

### 3 · Magnet-on-knurl pull test — one afternoon, ~£30

Three magnet sizes and a spring scale. Measure real pull force on a flat plate
(the datasheet condition), a smooth bar section, and a knurled section — then
repeat with a 0.5 mm plastic layer simulating the case wall. Then rack-drop it,
then leave it in a gym a week and see what it collects.

### 4 · Drop test on candidate materials — one week, ~£100

Same shell in MJF dyed, MJF vapour-smoothed, and Formlabs Tough 2000 V2. Real
mass inside, 1.2 m onto concrete and rubber, 20× each orientation. Look for
cracks initiating at **boss roots, snap arms and the lid seam**. Sets your
radius requirements before they're cut into steel.

**Test 2 can force a strap. Test 3 can force a different mount geometry. Test 4
only sets radii. Don't authorise a tool until all four pass.**

---

## 8. Tooling, when you get there

### The five decisions worth the most money

1. **Zero side actions.** Bypass shut-offs under every snap hook (on *internal
   ribs*, not the outer wall — a window in the sidewall is an ingress path);
   magnets in floor-facing counterbores; loop on a straight-pull feature.
   **£1,000–2,600 saved per action avoided.**
2. **Wall 2.0 → 1.6 mm.** Cooling scales with wall², so −36% cooling and ~−4 s
   cycle. Machine time is 58% of piece price — worth ~5× any resin negotiation.
3. **Don't buy multi-cavity.** Break-even on 2+2 is **38,500 sets**.
4. **Cut steel safe** on snap engagement, and get free T1–T3 iterations written
   into the PO before the deposit. Removing steel is milling; adding it back
   means welding, which locally hardens and weakens the tool.
5. **Tool ownership in writing, in Chinese, before the deposit.**

### ⚠️ Tool ownership is the largest uninsured risk

Paying for a tool is not owning it. Suppliers demand **"an extra 15% on top of
the initial tooling price"** to release it, with **cases as high as 30%**. Their
logic: you paid for cutting the steel, not the IP of the mould design.

> "If your manufacturing contract doesn't clearly define ownership terms, when
> disputes arise, **control usually wins**."

Insist on: explicit ownership of mould + design + native CAD; **right to remove
at any time without fee**; tool ID stamped with your company name; shot counter
and maintenance log; setup parameters delivered; **China-law** agreement.

Two free defences: **pull the tool between runs as routine habit**, and consider
third-party tool custody (which also stops unauthorised production runs).

### Duty planning

| Goods | Code | UK duty (China origin) |
|---|---|---|
| Injection mould tool | 8480 71 0000 | **0%** |
| Loose moulded parts | 3926 90 97 90 | **6%** |
| **Finished BLE device** | **8517 62 0000** | **0%** |

**Import assembled pods, not loose shells.** Ask for **FOB**, not EXW or DDP.

---

## 9. Assembly and test

**Realistic touch time: 2.5–5 min/unit** steady state — flash, battery, magnets,
close, test, pack. Solo throughput 12–20/hour.

- **100 units = 5–8 hours.** Do it yourself.
- **1,000 units = 50–80 hours** — *two full working weeks of founder time.*

| Volume | DIY | UK CEM | China CM |
|---|---|---|---|
| 10 | ~1.5 h | NRE kills it | $50–150/unit |
| 100 | 5–8 h | ~£5.50–9.00/unit | ~$5–7/unit |
| 1,000 | **£2,000–3,200 of your time** | **£2.50/unit** | $1–2/unit |

**Outsourcing pays between 100 and 300 units.** Below 100, do it yourself. Above
~500, doing it yourself destroys value.

### The test jig is a £50–200 problem

Not £2,000. DIY laser-cut acrylic + 24 pogo pins is **under £15**; a
professionally made fixture ~£150. Tag-Connect TC2030 cable is $33.95 and
removes the programming connector from the BOM.

For radio, use Nordic **DTM** with a **second dev kit as the golden receiver** —
a go/no-go radio test for ~£40 instead of a £20k Anritsu.

**Test every unit, in this order of failure likelihood:**

1. **Sleep current** — the most common silent failure in battery BLE. Catches a
   stuck pull-up or leaky sensor before it ships
2. Charge current and battery voltage under load
3. BLE advertise + RSSI at fixed distance (implicitly tests the antenna)
4. IMU self-test — sane 1 g / 0 dps
5. **Magnet polarity** — a reversed magnet is invisible until the customer tries
   to mount it

Expect **90–97% first-pass** at low volume, dominated by hand-solder and
connector defects. Cautionary tale: the **CST-01 Kickstarter, where barely half
of units worked after assembly, effectively doubling manufacturing cost.**

**Build the jig before the first batch, not after.**

---

## Key sources

- 3DPRINTUK pricing and batch tiers — https://www.3dprint-uk.co.uk/pricing/
- 3D People pricing — https://www.3dpeople.uk/pricing-information/
- HP PA12 datasheet; AMT/HP vapour smoothing whitepaper
- Wortmann et al., *ACS Applied Polymer Materials* — silicone tool degradation, https://pubs.acs.org/doi/10.1021/acsapm.0c00744
- Get It Made UK tooling quotes — https://get-it-made.co.uk/resources/how-much-injection-moulding-costs
- Zetar mould price log — https://zetarmold.com/injection-mold-price-list-2026/
- Radial Magnets on retention — https://radialmagnet.com/magnet-assembly-retention-design/
- Amazing Magnets on post-mould magnetisation — https://amazingmagnets.com/magnetology/overmolding-magnets-in-plastic/
- *J. Alloys and Compounds* on impact demagnetisation (2022, 2024)
- QualityInspection.org on tool hostage fees — https://qualityinspection.org/mold-tooling-ownership-the-term-chinese-suppliers-push-for-will-shock-you/
- Adafruit test jig guide — https://learn.adafruit.com/how-to-build-a-testing-fixture/overview
- Nordic DTM and nAN34 production test guidance
