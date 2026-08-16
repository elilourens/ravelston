---
tags: [product, hardware, sensors, strategy]
---

# Sensor Platforms

Can someone else's hardware carry our app? Surveyed against the one constraint
that decides it: **two sensors, raw accel+gyro, ≥100 Hz (ideally 200), with
inter-unit timing good enough to difference two acceleration vectors.**

**Answer: no shippable consumer platform exists. One could serve as a B2B or
pilot platform. Plan to build.**

Companion to [[White-Label Route]] (can we rebrand?) and [[Competitive
Landscape]].

---

## 1. First, a reframe — we have been specifying the wrong thing

[[FINDINGS]] §9 says *"sub-millisecond inter-unit sync is a hard requirement."*
That phrase conflates two different properties:

| | What it means | Who has it |
|---|---|---|
| **Synchronous sampling** | The two sample clocks are phase-aligned, so samples are taken at the same instants | Almost nothing outside a wired or proprietary-radio system |
| **Common timebase + accurate per-sample timestamps** | Clocks run independently, but every sample carries an accurate timestamp on a shared clock | Several platforms |

> **For differencing two acceleration vectors, the second is sufficient.**
> Sample-clock phase offset does not corrupt the difference, because you can
> resample both streams onto a common grid. What *does* map into the differenced
> signal is **timestamp inaccuracy**.

So the spec to put to vendors is **"inter-device timestamp accuracy on a common
timebase"**, not "synchronous sampling." This is not pedantry: x-io explicitly
disclaim synchronous sampling while providing exactly the property we need, and
a naive reading would wrongly disqualify them.

The requirement itself stands. Residual error from misalignment Δt scales with
the rate of change of the acceleration difference, and bar whip is a fast
transient — which is precisely why sub-ms matters.

---

## 2. The scored table

Only verified rows carry numbers. Blanks are **not researched**, not "no".

| Candidate | SDK | Raw accel+gyro | 2-device sync | Max rate, 2 devices, raw | OEM | Price |
|---|---|---|---|---|---|---|
| **QSense QSM210** | Yes | **Yes — "Raw mode"** | **&lt;60 µs typ, &lt;150 µs max** | **400 Hz** | **Yes, explicit** | Not published |
| **x-IMU3** (x-io, Bristol) | **Open-source** — Rust, C, C++, C#, Python | **Yes** | Common µs timebase; **accuracy not published** | **400 Hz** + 1600 Hz 200 g channel | Not found | **£300** ex VAT |
| **Xsens MTw Awinda** | Yes | Not explicit | **10 µs** — best here | 120 Hz | Not found | €715 dev kit → €3,575 for six |
| **Movella / Xsens DOT** | Yes + public BLE spec | Calibrated, never truly raw | 1 ppm @30 min (a *drift rate*) | **60 Hz** | Not found | €159.72 each |
| **Mbientlab MetaMotion** | Yes | Yes | **None — no hardware sync** | 100 Hz | Not found | — |
| **APDM Opal** | — | — | Yes, accuracy not found | 128 Hz | Not found | **$2,399/unit** |
| **Polar BLE SDK** | Yes, permissive licence | ACC yes; gyro unverified | **No sync feature found** | — | N/A | N/A |
| Enode / Eleiko kit | **Not verified** | — | — | vendor claims "1,000+ Hz" IMU | — | **€829** kit |
| Vitruve, RepOne, Flex, Output, Perch, WHOOP, Garmin, Blue Trident, Notch, Shimmer | **Not researched** | | | | | |

---

## 3. Verdicts

**QSense QSM210 — PASS.** The only unambiguous one. TimeSync Mode publishes
**typical &lt;60 µs, maximum &lt;150 µs**, plus an absolute date/time stamp on every
stream. Two sensors run at **400 Hz** (degrades only at 3+: 200 Hz for 3–6,
100 Hz for 7–12). "Raw mode" gives accel, gyro and mag unfused. Clears sub-ms by
~7× at worst case and doubles our stretch rate. Battery 140 mAh, ≥20 h
low-latency / 12 h time-sync.

⚠ **The open question that decides everything:** BLE is described as running
**via a wireless dongle**. Whether the sensors can be driven from a phone's
native BLE stack is **not stated**. If it is dongle-only, this is a lab platform,
not a consumer product.

**Xsens MTw Awinda — passes sync, fails everything else.** 10 µs, two orders of
magnitude better than anything here. But 120 Hz for two trackers, and it uses a
proprietary 2.4 GHz radio with a USB receiver — **cannot be driven from a
phone**. Excellent ground truth. Not a platform.

**x-IMU3 — unproven, probably fine.** The manual is explicit:

> *"Multiple x-IMU3s operating on the same Wi-Fi network will automatically
> synchronise so that the timestamps from all x-IMU3s is the number of
> microseconds since the first x-IMU3 was switched on. The sample clocks of
> synchronised x-IMU3s will remain asynchronous. If an application requires
> synchronous sampling then this must be achieved in post-processing through
> interpolation and resampling."*

Exactly the architecture in §1, at 400 Hz. **But no sync accuracy figure is
published** — measurable on our bench in an afternoon.

⚠ **Bluetooth is listed but footnoted "currently in development and not yet
supported."** USB and Wi-Fi only today. Disqualifying for a phone app;
irrelevant for a bench rig.

**Movella DOT — NO.** See §4.

**Mbientlab — NO.** **No hardware sync mechanism at all.** Their own staff
guidance is to log rather than stream, then align post-hoc by matching initial
epoch timestamps and interpolating, accepting errors "under 1%". Streaming caps
at 100 Hz and packets don't arrive at consistent intervals. Both architecture
and rate fail.

**Polar — NO.** Broad device support under a permissive licence, but **no
multi-device sync primitive described**. Per-device gyro availability unverified.

**APDM Opal — priced out.** 128 Hz synchronous streaming that doesn't degrade
with sensor count, but no published accuracy figure and **$2,399 per unit**.

---

## 4. Why not Movella DOT

Two independent reasons.

### The 60 Hz ceiling is in the wire protocol, not the SDK

Output rates are `1, 4, 10, 12, 15, 20, 30, 60 (Default), 120 (Recording)` —
and **120 Hz is recording-only**. Confirmed in the **BLE Service Specification
itself**, where the Device Control Characteristic's rate field carries exactly
those values. **There is no SDK workaround because the constraint is not in the
SDK.** Real-time tops out at 60 Hz — 40% below our floor.

The data model is otherwise right: `Rate quantities` = timestamp + acceleration
+ angular velocity, with 1 µs timestamp resolution.

**And its sync reputation is overstated.** The manual gives **1 ppm after 30 min,
4 ppm after 1 hour** — those are *drift rates*, not fixed offsets. At 1 ppm the
inter-device error reaches **~1.8 ms after 30 minutes**. Sub-ms holds only for
the first 8–15 minutes after a sync, and syncing takes ~14 seconds. Nothing like
Awinda's 10 µs.

### The vendor's equity is worthless

Movella delisted from Nasdaq to OTC Pink (April 2024), and secured lenders took
the equity in a 2025 restructuring. **Verified: MVLA traded at $0.0003 on 13
August 2026**, with 241 employees. Three hundredths of a cent. The DOT is not
announced EOL and the shop is live — but don't put a consumer supply chain on it.

**Licensing is *not* the obstacle.** The SDK EULA is favourable: Movella
*"obtains no right, title or interest… in or to any software application that
you develop"*, and it explicitly contemplates apps for general public users. The
public BLE spec also means you can bypass the SDK entirely.

> **One legitimate DOT use we shouldn't dismiss:** recording mode runs at
> **120 Hz, synced, stored onboard (64 MB, ~6 h)**, exported afterwards. Load
> estimation doesn't need real time. If we wanted a cheap synced 120 Hz
> dual-sensor dataset next week, that's the fastest route to one. R&D, not
> product.

---

## 5. The two worth talking to

### x-IMU3 — x-io Technologies, Bristol

- Gyro ±2000 °/s @ **400 Hz**, accel ±24 g @ **400 Hz**, both ±0.3%
- **High-g accelerometer ±200 g @ 1600 Hz** — best transient resolution here
- Every sample individually timestamped, *"independent of the sample rate"*
- **£300 ex VAT**, board-only variant available, UK supplier
- Free **open-source** GUI and APIs in Rust, C, C++, C#, Python
  *(hardware and firmware are not open-source)*
- USB + Wi-Fi (TCP/UDP, low-latency option); **Bluetooth not yet supported**
- Battery 10 h BT / 9 h Wi-Fi 2.4 GHz / 6 h 5 GHz
- No OEM programme found; certification position not verified

**The right R&D instrument for our problem, at a fifth of an Opal's price, from
a supplier a train ride away. Wrong radio for the product.**

### QSense / 2M Engineering, Valkenswaard NL

Rates `1…800 Hz`; two sensors at up to 400 Hz. Five data modes including genuine
**Raw** (accel + gyro + mag) and a Mixed mode.

**The OEM offer is substantive** — custom enclosure, mechanical/electrical/
firmware adaptation, DFM support, algorithm development, *"scalable manufacturing
and supply chain support"* from pilot to volume, and **"validation & regulatory
pathway support"** covering **CE, FCC and where applicable MDR**.

⚠ **Not disclosed:** MOQ, lead times, pricing, white-label mechanics, SDK
languages — and **UKCA is not mentioned**, only CE, FCC and MDR.

⚠ *"Regulatory pathway support"* is a services offer, **not a guarantee that test
reports and the DoC transfer to us as the party placing the product on the
market.** Per [[White-Label Route]] §2, the name on the product carries the
obligations. Get it in writing.

---

## 6. ⚠ The agent's certification arithmetic is out of date

The report argues the compliance burden is smaller than assumed — *"$500–2,000
in paperwork plus $4,000–8,000 for Bluetooth SIG Declaration"* with a
pre-certified module, versus $15,000–50,000 for custom radio hardware, and
concludes **"$5–10k is not a reason to surrender your hardware margin."**

**The direction is right; the number is wrong.** Its source is undated. Against
the [[White-Label Route]] figures verified from the **Bluetooth SIG fee schedule
effective 1 March 2026**, the cheapest realistic SIG path is **$3,500 dues +
$8,000 qualification = $11,500**, and plain Adopter qualification is **$12,000**
flat. So Bluetooth SIG alone exceeds the whole "$5–10k" estimate.

Realistic all-in on a pre-certified module is **£20,000–35,000** — see
[[Compliance]]. **The strategic conclusion survives anyway:** £20–35k is a real
cost but not a reason to hand over the supply chain, the sample rate and the
filter chain.

---

## 7. Competitive intelligence worth flagging

**Enode has already shipped a two-sensor bar kit with Eleiko at €829**, sensors
mounting into the barbell endcap via a patented sleeve system, marketed
explicitly as measuring *"bar path, even under flex."*

The mitigating detail: their spec sheet says **"Redundant Connection — Works
with only 1 Sensor connected"**, which reads as two sensors for redundancy and
coverage, **not for differencing to infer load from whip.** Our mechanism may
still be novel.

But "two sensors on a bar, flex-aware" is **no longer unoccupied ground**. And
if our differentiation is the estimator rather than the enclosure, then owning
the sensor stack — sample rate, timestamping, filter chain — *is* owning the
thing that makes the estimator work. Not a component to outsource.

---

## 8. Dead companies: two free patent families

| Company | Status | IP now | Patents | Usable? |
|---|---|---|---|---|
| **Beast Technologies** (IT) | *In liquidazione* | **Nobody** | **EP3057505B1 — lapsed**, non-payment | **Free** |
| **Moov Inc** (US) | Wound down | Abandoned | **US9699859, US10350454, US10563981, US10726738 — all four expired**, fee-related | **Free — best asset here** |
| **PUSH** (CA) | Acquired, bricked | **WHOOP** (2 Sep 2021) | WO2015048884A1 ceased | Closed |
| **Atlas Wearables** (US) | Acqui-hired Nov 2020 | **Peloton** | **US9171201B2 live to 2034**, pledged to JPMorgan | Closed |
| **Gymwatch** (DE) | Struck off 07.06.2023 | **Hero Workout GmbH** — trading | **US9125620B2, US9750454B2 live to 2032** | **FTO risk** |
| **Zepp / Motus** | Sold separately | Shunyuan Kaihua / **Driveline** | Motus US10314536B2 live to 2035 | Closed |

**US10563981** covers sensor drift correction, orientation estimation and
velocity correction against camera ground truth — directly on our problem, free
to practise, and a detailed published disclosure we can read and reimplement.

**EP3057505B1**'s granted claims spell out integrating acceleration to velocity,
fitting a linear drift trend by least-squares, subtracting it, and giving
real-time in-set feedback. Also free, also a worked design.

Neither gives tooling or a manufacturing partner. Both are "read and
reimplement". **Have an attorney confirm lapse in Patent Center first** — revival
for unintentional delay is possible in principle, unlikely at these dates.

### ⚠ Gymwatch's IP was never in the company that died

Filed by the inventors personally, assigned to **Hero Workout GmbH** in October
2020. Hero Workout is trading, counts **RSG Group (McFIT / Gold's Gym)** among
its shareholders, filed **four new German applications in 2022–23** on sensor
orientation, motion-model parameter estimation and limb dimensions, and holds
two US patents **in force to 2032**. Clear FTO before selling limb-motion
strength tracking into the EU or UK.

### Corrections

- **There was no Zepp–Motus merger.** Separate competitors. Zepp's assets went to
  Huami in July 2018 (Huami renamed itself Zepp Health in Feb 2021 — same name,
  different company); Motus's sensor business went to **Driveline Baseball** in
  Feb 2020, still shipping as PULSE Throw at $245. The claim that Garmin bought
  or killed the Zepp Golf app has **no primary source** — don't repeat it.
- **PUSH is where WHOOP's strength product came from.** WHOOP bought the team,
  hardware, platform and customers in Sept 2021; founder Rami Alhamad became
  CPO; **WHOOP Strength Trainer shipped 25 April 2023** on PUSH's algorithms. No
  patents transferred.

**There is no defunct product whose hardware we could acquire or
re-manufacture.** Six companies, zero contract manufacturers, zero open firmware,
zero acquirable designs.

---

## 9. What to do

1. **Email 2M Engineering.** Three questions: is BLE phone-native or dongle-only?
   MOQ and unit price at 100 / 1,000 / 10,000? Do CE/UKCA/FCC test reports and
   the DoC transfer to us as the party placing the product on the market? Their
   answers decide whether QSense is a product path or only a pilot path.
2. **Buy two x-IMU3s (£600) and build the bench rig.** 400 Hz raw plus a 1600 Hz
   200 g channel, open-source Python APIs, µs common timebase, UK supplier.
   **Measure their actual inter-unit timestamp accuracy ourselves** — an
   afternoon's work, and it answers the one thing x-io don't publish. De-risks
   the physics before any hardware commitment.
3. **Read US10563981 and EP3057505B1 before writing more estimator code.**
4. **Don't build on Movella DOT.** 60 Hz is in the wire protocol and the parent's
   equity trades at $0.0003.
5. **Base case stays: custom design on a pre-certified BLE module**, with
   QSense as the alternative if 2M's answers are strong.

## Gaps to close

In priority order: **Enode's SDK and partner terms** (the incumbent, most likely
to change the picture), **Output Sports** and **Vitruve** (most likely to expose
a real API), **Shimmer and the Chinese/Asian ODM tier** (the low-cost benchmark
QSense's pricing must be judged against), and whether **Polar Verity Sense**
exposes gyro and at what rate.

## Method caveats

Several research streams did not return; the session's search budget was
exhausted. Wayback playback returned 503 throughout, so capture *dates* are
verified but archived content was not read. Patent assignment records came via a
text proxy because Google Patents blocked direct fetches, and
`assignment-api.uspto.gov` now returns NXDOMAIN — **verify at assignment.uspto.gov
before relying on any of it.** Marketplace retrieval was blocked, so
"still purchasable" is unverified except Driveline PULSE.
