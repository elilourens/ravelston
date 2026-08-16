---
tags: [tooling, sensors, daq]
---

# Sensor DAQ

Data acquisition for the two WitMotion WT9011DCL-BT50 bar-end IMUs lives at **`rnd/sensors/daq/`** in the repo. Written before the hardware arrived, against the documented BLE protocol, so day one is "pair and record" not "start coding".

## What's there

- `protocol.py` — packet parser (20-byte `0x55 0x61` frames → m/s², °/s, °), BLE UUIDs, and register commands (unlock / rate / bandwidth / algorithm / save). Pure Python, no dependencies.
- `logger.py` — CLI that scans for the sensors, connects to both, applies the config from [[WT9011 Setup]] (100 Hz, 188 Hz bandwidth, 6-axis), and records CSVs with host-arrival timestamps. Detects BLE gaps by timing (the stream has **no sample counters**) and writes them to `gaps.csv` — treat those spans as missing data.
- `benchcheck.py` — the acceptance test. Run it on a desk recording *before*
  trusting anything: delivered rate and jitter, gap fraction, resting `|a|`
  against 1 g, gyro bias and noise, inter-unit lag and clock drift. numpy only.
- `daq.ps1` — Windows wrapper (`scan` / `record` / `check` / `list`) that reads
  the repo over `\\wsl.localhost`, so there's no second copy on Windows.
- `tests/` — 26 synthetic-packet tests: scaling, sign handling, framing across BLE chunk boundaries, resync after corruption, exact command bytes. Run anywhere: `python -m pytest rnd/sensors/daq/tests/`

## Gotchas

- **Run the logger on Windows** — WSL can't see Bluetooth adapters. `pip install bleak` is the only dependency.
- The stream packets have **no checksum**, so corruption inside a packet is undetectable at the parser; whole-notification drops are what actually happen on BLE and the timing-based gap detection catches those.
- Protocol constants were cross-checked against the manual and two community repos, but verify on first real connection: resting sensor should show ~1 g on one axis.
- First-use: calibrate the accelerometer via the WitMotion app (flat surface, 5 s) before trusting the data.

Related: [[WT9011 Setup]] · [[Code Review Skill]] · [Hardware Roadmap](../product/Hardware%20Roadmap.md)
