---
tags: [hardware, manufacturing, product, strategy]
---

# Scaling 10 → 100 → 1,000

What actually happened to comparable hardware founders, with their numbers.

Research 2026-08-16, ~110 sources, weighted to first-person founder accounts.
Companion to [[Enclosure]] and [[Compliance]].

---

## 0. The two findings that matter most for us

### The category's documented killer is measurement validity, not manufacturing

**Beast Sensor** — an IMU VBT device — died on published reliability studies.
**PUSH** was acquired by WHOOP and shut down. **Output Sports** raised €4.47M
standing on two sensor-validation PhDs. **Oura** was made by an unsolicited
Stanford study that bought two rings off Kickstarter and published an accuracy
paper.

Nobody in the VBT category publishes manufacturing economics, because
manufacturing is not what kills them.

> **A bar-whip load-estimation claim needs peer-reviewable validation, and that
> is a tooling-scale line item nobody has yet paid for us.**

This reinforces [[Competitive Landscape]] §7 risk 2. Budget for a
criterion-validity study against GymAware or mocap as a *product cost*, not a
nice-to-have.

### Two independent sources just converged on the module problem

[[Compliance]] §1 found the XIAO's FCC grant requires 20 cm separation and
excludes portable hosts. **SlimeVR lived exactly that failure:**

> *"Shipment 3 was held by customs for more than a month… FCC concluded that
> SlimeVR lacks required certifications to be imported and sold in the USA."*

They had used a pre-certified ESP-12F with the FCC ID on every sticker.

> *"What we missed was that it is only certified for use in mobile devices, not
> body-worn applications… **it's each final product that has to be certified for
> a body-worn application.** In hindsight, this perspective was wrong, of
> course."*

Remediation: **repack and re-sticker 3.2 pallets already assembled.**

**Decide in writing, now, whether a bar-clamped pod is "body-worn."** Probably
not — but the moment we offer a wrist or belt SKU, it is. That single ambiguity
cost SlimeVR a month and a pallet repack.

---

## 1. SlimeVR — the closest analogue in existence

Wireless body-worn **IMU pods**, 10 g each, injection-moulded, sold in sets.
**250,000+ trackers produced**, campaign >$1M, $279 for six. Started as
**literally two people**.

Everything below is directly transferable:

- **8 hardware revisions** before the second-generation campaign launched
- **Field defect at ~8,000 units:** *"unresponsive sensor manifesting as a blue
  light… what we call 'Blue Light Of Death'"* — **an IMU that fails to come up
  at boot.** That is our exact failure mode, and it argues for IMU self-test in
  shipping firmware
- **IMU supply collapse:** had **5,000 BNO085 against 32,000 needed**. Escape
  was a different architecture entirely. *Fused-output IMUs have no second
  source — the fusion behaviour is the product*
- **The binding constraint at volume was screws** — 40,000 on hand vs 42,304
  needed, while sitting on 68,000 IMUs
- **The tooling deadlock:** antenna tuning needs production plastic; the mould
  can't be cut until the PCB is frozen. **Cost 1–2 months.** This is exactly the
  loop [[Enclosure]] §7 warns about
- **Battery tolerance as a rejection criterion:** *"rejecting samples sent to us
  that were even 1 mm out of our tight specification allowances"*
- **How they closed the cash gap without equity:** a distributor (Mouser) placed
  a huge order, they ordered production against it. *"Replacing Mouser with
  anything else would require getting a huge bank loan or taking in outside
  investments."*

---

## 2. Espruino — the definitive UK one-person case

Gordon Williams, Oxfordshire. Companies House 05705058. **"The average number
of employees during the year was 1."**

| Year to 31 Mar | Stock | Cash | **Tangible fixed assets** |
|---|---|---|---|
| 2021 | — | £178,587 | £3,301 |
| 2023 | £67,595 | £117,386 | £6,853 |
| 2025 | £43,252 | £176,209 | **£8,311** |

> **Tangible fixed assets never exceeded £8,311.** Ever. Across four
> Kickstarters and ~6,000 smartwatches.

**The one-person company converts capex into outsourced unit cost and buys
optionality with the difference.** Pimoroni's equivalent line is £801,565 — and
Pimoroni lost £214k in FY2025 and cut headcount 45 → 30.

**Nobody in the UK maker set — Espruino, Pimoroni after 175,000 Pibows,
Boldport, Kitronik — ever cut an injection mould.**

Four campaigns: £100k+, £67,531, £115,816, £101,516, £176,522. Run sizes
~1,200–6,000.

**Why crowdfunding was structurally necessary** — the clearest statement of the
cash gap anywhere:

> *"Many of the components can only be sourced cheaply at **1000+ volumes (and
> need to be paid for up-front)**, and **the moulds needed for the case cost a
> lot to create.**"*

### Four field failures, all relevant to a gym device

1. **Missing component, shipped anyway, with QC stickers.** The factory ran out
   of piezo speakers, stopped fitting them, shipped ~1,500 watches. *"the
   factory assured me all watches were tested, and they all have a 'QC Pass'
   sticker."* He couldn't afford to fix it.
2. **Sweat corrosion from a live debug pad.** 3.3 V on an exposed SWD pad →
   *"electrolytic corrosion, and in some cases even skin irritation… by the time
   I got my first report, we'd already programmed and packed the majority."*
3. **Wrong parts from Farnell**, twice, same part number.
4. **The datasheet lied about IMU startup current:** *"at startup the LSM6DS3
   accelerometer and gyro uses **over 10 times more power** than is mentioned in
   any of the documentation! It worked on a full battery, but wasn't reliable as
   the battery got flat."*

> ⚠️ **The XIAO nRF52840 Sense carries the LSM6DS3.** Measure startup current at
> end-of-life battery voltage, not on a fresh cell.

**His jig:** *"a few pogo pins glued in the right places… you could reproduce it
with a bit of protoboard."* **15–20 seconds per unit.** He also built **self-test
into shipping firmware** — hold the button through boot, green = pass.

**The ceiling, stated:** *"over 100 emails a day… **every message I answer is one
less package I get to put in the post that day**."* Escape was distribution
(20-board MOQ, no contract), **firmware licensing from £150/month**, and
consultancy — not more staff.

---

## 3. The gates, with numbers

### Gate 0 — decisions that cost nothing now and £40,000 later

1. **Pre-certified radio module.** Saves ~£15,000–40,000 and 3–5 months.
2. **Decide in writing whether this is "body-worn."** See §0.
3. **Design to self-assess EN 18031.** €0–8,000 vs €15,000–40,000 — a 5× swing.
4. **Seriously cost a coin cell.** CR2032 sidesteps UN 38.3, IATA, PI967 and
   courier DG entirely. Espruino's Puck.js is a coin-cell BLE+IMU device that
   has shipped for a decade. ⚠️ Weigh against [[Compliance]] §5 — a replaceable
   coin cell also solves EU Battery Regulation Article 11 for free.
5. **Own sensor fusion on raw IMU data.** Fused-output parts have no second
   source.
6. **Put test pads and a programming connector on the board.** Espruino omitted
   them from the Pico and paid forever.
7. **No exposed live pads on any surface that meets sweat.**
8. **Cut features ruthlessly.** Jamcorder: 25 components, one screw, one PCB, no
   USB-C — 2,500 units sold, 70% gross margin, first 500 hand-assembled in four
   days.

### Step 1 — 1 to 10. £2,000–4,000, 3–4 months

Budget **4 months for prototyping, always**. Espruino needed 5 PCB and 3 case
revisions; SlimeVR needed 8 hardware revisions.

**Gate:** IMU startup current measured at end-of-life voltage · two devices in
different environments give the same load estimate · **you have sold 2–3 units
to real strangers for real money** · you know what the whip claim needs to
survive scrutiny.

### Step 2 — 10 to 100. £4,000–8,000, 4–6 months. The hard one

**Ship a paid, unsealed developer edition** (PINE64 pattern). Price at 2.5–3×
eventual target.

**The deliverable of this step is the test jig, not the units.** £100–300 and a
weekend: pogo pins, a Pi, flash + test both IMUs + log MAC and firmware version,
**and an audible chime on pass**. One startup's 10-minute test needed 10
parallel stations; **adding a chime dropped it to ~1 minute** — a 10× capex
reduction from a UX change.

**Build two jigs.** Circuit Stickers' backup saved a production run.

**Gate:** **per-unit hands-on time under 3 minutes.** At 10 minutes, 1,000 units
is 167 hours — *"if shipping 3,000 boards takes two weeks out of my year, Sensor
Watch is not sustainable."* Plus: a defect list from real users, fixed · gross
margin ≥60% at 100, modelling ≥70% at 1,000 · unmet demand.

### Step 3 — 100 to 1,000. £32,000–55,000, 6–9 months. The one that kills

| Item | £ |
|---|---|
| Certification (module route) | 8,000–30,000 |
| Tooling, **two aluminium cavities** | 5,600 |
| PCBA, 1,000 turnkey | 10,900 |
| Moulded parts | 2,000 |
| Battery, magnets, screws | 2,500 |
| Packaging | 900 |
| Third-party inspection, 1 man-day | 200 |
| EU AR, WEEE, EPR | 250–2,000/yr |

**Five rules:**

1. **Do not hire a contract manufacturer.** A real CM's MOQ is ~5,000 units and
   they want ~$1M/yr of BOM spend. **JLCPCB's assembly MOQ is 2.** Use a PCBA
   house + a separate moulder + your own final assembly.
2. **Gate on a one-panel first article.** Jaltek assembled 30, all 30 worked,
   then ran. **A QC Pass sticker is not evidence.**
3. **Run 500 first, not 1,000.** Boldport died on £11,855 of dead stock.
4. **Ship a duplicate jig to the assembler, keep an identical one at home.**
5. **Order 5% overage** — and order screws and connectors at 2× need.

**Gate before committing tooling money:** ≥500 units of **paid** demand · no
enclosure CAD change in 8 weeks · certification booked · **four tooling quotes**
(the spread across 190 RFQs was 2×).

### Step 4 — the ceiling is fulfilment and support, not design

Three exits, none requiring growth: **distribute** (Espruino: no contract,
20-board MOQ) · **license the design** (Boldport → Pimoroni and Velleman — the
designer keeps the IP, the company with the pick-and-place keeps operations) ·
**non-unit revenue** (firmware licensing from £150/month). For us that's
coach-facing subscription, gym-fleet licensing, validation-data licensing.

---

## 4. The five ways this kills you

Ranked by frequency across the post-mortems.

### 1 · The cash gap — you pay the factory months before customers pay you

**Appears in Zano, Skully, Lily, Coolest Cooler, Ossic, CST-01, Pebble, Boosted,
Chipolo, Pavlok, Jawbone, Triggertrap — more than every technical failure
combined.**

**50% deposit at PO** (the standard first-timer term), balance before shipment,
4–6 weeks freight, then however long to sell. **Cash out day 0, cash in day
150+.**

Three specific mechanisms:
- **The money you raised is not the money you have.** PayPal withheld £200k+ of
  Zano's pre-orders pending fulfilment; Stripe and Tilt held $12M of Lily's.
- **The CM's inventory becomes your hostage.** Camtronics claimed ~£1m of
  unfinished Zano stock; Flextronics sued Skully over $1.5M of long-lead parts.
- **Supplier trust, once broken, can't be bought back.** Jawbone post-recall:
  *"The supply chain in Asia doesn't necessarily want to front us the money."*

Lily is the purest form: **$34M+ of customer money collected, $0 of product
shipped.**

**Defences:** hold customer cash before paying the CM · earn factory credit
(bunnie: *"factory credit can directly replace raising venture capital"*) ·
never carry inventory you haven't sold (Core Devices manufactures nothing
before it's sold).

Pavlok's real bridge numbers: **$80,000 borrowed, $109,200 due 11 months later.**
And his warning: *"Pre-selling product can actually hurt your chances of getting
a loan"* — it books as a liability.

### 2 · You priced below what it actually costs

CST-01 estimated **$70/unit and paid $300**. Triggertrap came in **9.4× budget**
and produced zero units. BusKill dreamed of $20 and sold at $99 — netting
**€3,108 on $18,507 raised, at €0.66/hour**.

**COGS is ~3× BOM, not 1×.** Labour is ~600 s/unit on a simple board and *"often
exceeds BOM costs."* Packaging adds ~30%. Then 10% to a platform or **up to 40%
to retail** — and on a first run *"each unit sold in physical retail actually
LOSES money."*

**Rules: ≥2.5× BOM-to-MSRP so each unit funds two more · ~33% COGS as a share of
retail · ≥70% gross margin if solo.**

### 3 · Anything you didn't specify, and didn't test on every unit, is wrong

> *"Anything you don't specify will fail to meet the implicit specification."*

Jawbone's $100M version: *"we were testing with **pure H2O**. Well, it turns out
that, like, pure H2O doesn't really exist in the world."* Sweat and skin oil got
through seals that passed lab test. **A gym product lives in exactly that
fluid.**

**Defence:** build the test before the tool (Espruino scheduled the test
procedure a month before machining moulds) · gate every run on a first article ·
test 100% on your own jig · specify the boring things — bag thickness, screw
type, carton stacking · **sign golden samples**.

### 4 · One custom, single-sourced part on the critical path

Sensor Watch lost **14 months** to one MCU. Playdate was told **730 days** for
its CPU. Glowforge's 5-month slip on one power supply became a **12-month**
product slip. Sensel died on **resistive ink**. Coolest Cooler on a **blender
motor factory strike**.

**Slip correlates almost perfectly with the count of custom-tooled,
single-sourced parts on the critical path.** Boosted used ~80% off-the-shelf and
shipped 3 months late; Glowforge went fully custom and shipped 12–19 months
late.

**And the shortage will surprise you.** SlimeVR had 68,000 IMUs and ran short on
screws.

### 5 · You scale yourself instead of the product

| | Headcount | Result |
|---|---|---|
| Espruino, BusKill, Jamcorder, U2F Zero | **1** | shipped, profitable |
| Sensor Watch, Boldport | 1–3 | shipped |
| **Core Devices 2026** | **6** | 23,000+ units shipped |
| Kano at 20k units | 22 | shipped |
| **Skully** | **50+, $1M/month** | **zero units** |
| **Lily** | **69, >$1M/month** | **zero units** |
| Pebble at peak | ~180 | fire sale |

**Headcount before shipping is the single clearest leading indicator of death in
this dataset.**

UK control group: **Technology Will Save Us** raised £7.48m and burned £7.21m at
26–32 staff → administration. **Kitronik** raised **£1,003**, zero outside
equity, 36 staff, £1.41m net assets, exited to an Employee Ownership Trust.
Similar headcount — **the variable was whether working capital was
customer-funded or investor-funded.**

---

## 5. Timeline reality

**84% of Kickstarter's top 50 shipped late. 75% of tech/design projects miss.
~9% never deliver.** CMs quote 180 days; first-timers *"usually take at least
50% longer."* Chinese New Year is ~24 days of staggered closures.

| Company | Slip |
|---|---|
| Kano | <2 months |
| Chipolo | 2–3 months |
| Boosted | ~3 months |
| **Pebble (2012 and 2026, both)** | **+4 months** |
| Playdate | +4–5 months |
| Sensor Watch | +14 months (MCU allocation) |
| Glowforge | +12–19 months |
| Skully, Lily, CST-01, Ossic, Triggertrap | ∞ |

The one on-time case in the whole corpus had **a full month of deliberate
padding and used every last bit of it.**

---

## 6. The one-paragraph version

Build ten by hand and sell three. Build a hundred as a paid, unsealed developer
edition and, in the same breath, build the pogo-pin jig that flashes and tests
each one in under a minute with an audible chime — **that jig is the real
product of this step**, and the per-unit time it produces is the number that
decides whether a thousand is a business or a job. Use a pre-certified module
and design so you can self-assess EN 18031; that pair of decisions is worth
£15,000–40,000 and five months. Don't cut a mould until roughly 800 units and
never cut steel — two aluminium cavities at ~£5,600 outlive the run forty times
over. Don't hire a contract manufacturer below 5,000 units; JLCPCB's assembly
MOQ is two. Sell the pods as a pair and the mount separately. And take not one
penny of the tooling money until you're holding customer cash, because the thing
that kills small hardware companies is not the plastic, the radio or the
firmware — **it is the hundred and fifty days between paying the factory and
being paid.**

---

## Key sources

- SlimeVR production updates — https://www.crowdsupply.com/slimevr/slimevr-full-body-tracker/updates/certifications-and-shipping-delays
- Espruino / Pur3 Ltd, Companies House 05705058; https://www.espruino.com/Business
- Sensor Watch lessons learned — https://www.crowdsupply.com/oddly-specific-objects/sensor-watch/updates/all-boards-shipping-lessons-learned-and-a-fork-in-the-road-for-sensor-watch
- BusKill Crowd Supply review — https://tech.michaelaltfield.net/2022/10/20/crowd-supply-review/
- U2F Zero year in review — https://conorpp.com/blog/u2f-zero-year-in-review/
- Jamcorder, "hardware is not so hard" — https://chipweinberger.com/articles/20260719-hardware-is-not-so-hard
- Senic / Nuimo 8-part series — https://medium.com/senic-gmbh
- Pavlok funding breakdown — https://medium.com/the-pavlok-blog
- Zano post-mortem — https://medium.com/kickstarter/how-zano-raised-millions-on-kickstarter-and-left-backers-with-nearly-nothing-85c0abe4a6cb
- bunnie, Exclave — https://www.bunniestudios.com/blog/2018/exclave-hardware-testing-in-mass-production-made-easier/
- Migicovsky on Pebble — https://ericmigi.com/blog/what-working-on-pebble-taught-me-about-building-hardware/
- Core Devices updates — https://repebble.com/blog/pebble-mega-update-july-2026
