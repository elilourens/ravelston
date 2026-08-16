---
tags: [hardware, roadmap, product]
---

# Hardware Roadmap

From two off-the-shelf test sensors to a mass-manufacturable product. Each stage has a gate — don't spend on the next stage until the current one passes.

## Stage 0 — Physics validation *(current, sensors on order)*

Prove the core claims on a real bar with the two WitMotion WT9011DCL-BT50 units. No firmware work; just host-side logging (see `sensors/README.md`).

- Collect empty-bar and loaded ring-down data in a rack; does the frequency-vs-load curve behave like the simulation in [FINDINGS.md](../../research/FINDINGS.md)?
- Test ROM / rep detection / rest-time from the same streams.
- Characterise the known weaknesses: BLE drops, no sample counters, cross-sensor sync drift.

**Gate:** the whip-frequency signal is measurable and repeatable on a real bar. If it isn't, the weight-estimation premise dies here and the roadmap shrinks to a ROM/technique/rest tracker.

## Stage 1 — Custom prototype on pre-made parts

Replace the closed WitMotion firmware with our own so we control sampling, timestamps, and sync. Cheapest path is a dev board with a **pre-certified radio module** — no EE work beyond soldering a battery.

Options (not yet decided):

- **Seeed XIAO nRF52840 Sense** (~$16) — IMU + BLE + LiPo charging on one tiny board; Arduino/CircuitPython
- **Arduino Nano 33 BLE Sense Rev2** (~$45) — nicer BMI270 IMU, pricier
- **Adafruit Feather nRF52840 Sense** (~$25) — bigger board, best docs
- **ESP32-S3 board + IMU breakout** (~$10–20) — cheapest chips, more wiring, weaker BLE stack for this use
- **WitMotion OEM/white-label** — least work, but likely still no firmware control, which Stage 0's sync findings probably rule out

Work: firmware with sample counters + synced clocks, battery, detachable mount (see [MOUNTING.md](../../research/MOUNTING.md) — shaft saddle inside the collars, not the rotating end cap), re-run Stage 0 tests on it. Parts: [[Stage 1 Shopping List]].

**Gate:** our prototype matches or beats the WitMotion data quality, and the mount survives real training sessions.

## Stage 2 — Algorithms on-device + app loop

- Move what belongs on-sensor into firmware (e.g. onboard ring-down FFT so only a frequency estimate crosses BLE).
- Real app (`app/`) talking to both sensors: pairing, live set tracking, calibration flow (empty-bar tare from FINDINGS.md).
- Test with users who aren't us; find out what breaks in a real gym (interference, chalk, drops, battery life).

**Gate:** a stranger can use it for a full session without help.

## Stage 3a — Ship the module (no-EE path)

If the Stage 1 board (e.g. a XIAO-class module) proved good enough, it can go
straight into the sellable product — dev modules like the XIAO are explicitly
sold for embedding and available in volume trays. Manufacturing becomes
assembly: buy modules, flash firmware, solder battery, case it up. Doable
solo or via a small assembly house.

- **Pros:** no contract EE, no custom PCB, radio stays pre-certified so
  end-product testing is the cheap tier.
- **Cons:** ~$32 of module per product vs ~$8–10 custom BOM; locked to the
  module's onboard IMU; supply/revision risk if the vendor changes the board.

Viable up to roughly 1–2k units. Beyond that, 3b pays for itself.

**Gate:** a first batch (tens of units) assembled from modules works as well
as the hand-built prototypes.

## Stage 3b — Custom PCB (cost reduction, once demand is proven)

- Contract EE designs a custom PCB: pre-certified BLE **module** (keeps radio cert cheap) + IMU chip (e.g. ICM-42688 / BMI270 class) + charging.
- Injection-mould-ready enclosure design (or high-quality printed for a first batch).
- EVT → DVT → PVT prototype rounds with a contract manufacturer.

**Gate:** a small pilot batch (tens of units) built by someone else works as well as the hand-built ones.

## Stage 4 — Certification & compliance

Needed before selling, not before:

- **FCC (US) / CE-RED (EU)** end-product testing — cheap-ish if the radio module is pre-certified
- **Bluetooth SIG** product listing (~$8k declaration fee; one-off)
- Battery shipping regs (UN38.3) if units ship with LiPo installed

## Stage 5 — Mass production

- Contract manufacturer (CM) runs the line; tooling for the enclosure is the big one-off cost (~$5–20k for injection moulds).
- Test jigs, firmware-flash-at-factory, per-unit QA (does it ring-down-test itself?).
- Packaging, warranty, spares.

## Cost shape (very rough)

| Stage | Spend |
| --- | --- |
| 0 | ~$100 (done — sensors ordered) |
| 1 | ~$50–100 |
| 2 | time, mostly |
| 3a | ~$1–3k (modules + enclosures for a first batch) |
| 3b | $5–20k (EE contract + pilot batch) |
| 4 | $10–20k |
| 5 | $20k+ (tooling + first run) |

Stages 0–2 are affordable solo, and 3a keeps even the first sellable batch in reach. Stage 3b onward is where funding/pre-orders/grants enter the picture — which is also roughly where the [`marketing-site/`](../../marketing-site/) starts mattering.

The customer-facing side runs alongside these stages rather than after them — see [[GTM Strategy]]. Its first stage (customer discovery) needs no hardware and can start now.
