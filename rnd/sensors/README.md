# Sensors

Code for talking to the physical sensors: two **WitMotion WT9011DCL-BT50**
Bluetooth 5.0 IMUs (one per bar end).

## No firmware flashing

The WT9011's onboard firmware is WitMotion's closed code — there is no
bootloader access or SDK for the chip itself, so we don't flash it. Instead:

- **Configure** it over BLE (sample rate up to 200 Hz, output content,
  calibration) via the WitMotion app or register write commands.
- **Acquire** on the host side: a BLE client connects to both sensors,
  parses the WitMotion packet protocol, and logs the streams.

Target config per FINDINGS.md: **100 Hz per unit** (2×200 Hz BLE is fragile,
and 100 Hz is 10× Nyquist for the whip band). The stream has no sample
counters, so logging must be gap-aware.

## Useful references

- [Official WT9011DCL manual (PDF)](https://cdn.robotshop.com/rbm/f83835f4-5e29-4ee0-9cc2-e49300031503/d/d8719ac7-3d35-4dd9-975f-22c94582aa69/a581f4c3_wt9011dcl-btl5-manual.pdf)
- [witmotion_python_wt9011dcl](https://github.com/enthusiasticgeek/witmotion_python_wt9011dcl) — Python GUI/CLI acquisition
- [FreecityDong/WT9011DCL](https://github.com/FreecityDong/WT9011DCL) — BLE testing/visualization helper

## Layout

- `daq/` — data acquisition: BLE protocol parser + dual-sensor logger, with synthetic-packet tests (see `daq/README.md`)
- `firmware/` — reserved for custom hardware later (e.g. ESP32 + IMU); empty
  while we're on WitMotion units
