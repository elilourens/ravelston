---
tags: [tooling, sensors, daq]
---

# Sensor DAQ

Data acquisition for the two WitMotion WT9011DCL-BT50 bar-end IMUs lives at **`sensors/daq/`** in the repo. Written before the hardware arrived, against the documented BLE protocol, so day one is "pair and record" not "start coding".

## What's there

- `protocol.py` — packet parser (20-byte `0x55 0x61` frames → m/s², °/s, °), BLE UUIDs, and register commands (unlock / set output rate / save). Pure Python, no dependencies.
- `logger.py` — CLI that scans for the sensors, connects to both, sets 100 Hz, and records CSVs with host-arrival timestamps. Detects BLE gaps by timing (the stream has **no sample counters**) and writes them to `gaps.csv` — treat those spans as missing data.
- `tests/` — 20 synthetic-packet tests: scaling, sign handling, framing across BLE chunk boundaries, resync after corruption, exact command bytes. Run anywhere: `python -m pytest sensors/daq/tests/`

## Gotchas

- **Run the logger on Windows** — WSL can't see Bluetooth adapters. `pip install bleak` is the only dependency.
- The stream packets have **no checksum**, so corruption inside a packet is undetectable at the parser; whole-notification drops are what actually happen on BLE and the timing-based gap detection catches those.
- Protocol constants were cross-checked against the manual and two community repos, but verify on first real connection: resting sensor should show ~1 g on one axis.
- First-use: calibrate the accelerometer via the WitMotion app (flat surface, 5 s) before trusting the data.

Related: [[Code Review Skill]] · [Hardware Roadmap](../product/Hardware%20Roadmap.md)
