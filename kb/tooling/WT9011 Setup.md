---
tags: [tooling, sensors, hardware, setup]
---

# WT9011 Setup

How to configure the two WT9011DCL-BT50 bar-end IMUs before recording anything.
Vendor PDFs live at **`sensors/datasheets/`** in the repo — see
[the index there](../../sensors/datasheets/README.md) for what each one covers
and the errata we've found in them.

## The four settings that matter

The module ships configured for slow, smooth, human-readable output. Every one
of those defaults is wrong for measuring bar whip.

| Setting | Ships as | Set it to | If you don't |
|---|---|---|---|
| Output rate | **10 Hz** | 100 Hz | A 2–25 Hz whip is invisible. |
| Bandwidth | **20 Hz** | 188 Hz | The low-pass eats the signal *and* duplicates samples. |
| Algorithm | 9-axis | 6-axis | Magnetometer readings are noise on a steel bar. |
| Output content | accel+gyro+angle | leave alone | Switching it to displacement kills accel and gyro entirely. |

**Bandwidth is the subtle one.** It's a low-pass filter sitting at 20 Hz by
default — right inside the 2–25 Hz band we measure. The app manual also warns
that when output rate exceeds bandwidth you get repeated samples, so a 100 Hz
stream through the stock filter is attenuated *and* partly fake. Nothing about
the resulting data looks obviously broken, which is what makes it dangerous.

## Setting it — laptop

`logger.py` now applies all of this on every connect via
`protocol.configure_commands()`, so there is nothing to do by hand:

```powershell
.\daq.ps1 record 60kg_palm_hits    # 100 Hz, 188 Hz bandwidth, 6-axis
```

See [[Sensor DAQ]] for the full logging setup and `daq.ps1` wrapper.

## Setting it — phone app

Config lives under **WIT → gear icon**, and multi-device is supported (manual
§2.4 and §6: up to 4 units). Select each sensor separately and set it — the
registers are saved to the module, so this is a one-time job per sensor.

- **Communications → return rate** → 100 Hz
- **Scope → bandwidth** → 188 Hz
- **Algorithm** → 6-axis
- **Displacement demo mode** → make sure it's **off**. The app manual (p. 10)
  is explicit: with it on, "the sensor will not output acceleration and angular
  velocity."

Recording writes both a `.wplay` file (hex, not readable) and a `.txt` data
chart. On Android they land in `/Download/WitRecord`. On iOS they're trapped in
app storage until exported via the share sheet.

Note: **playback supports only one device at a time**, but recording does not
have that limit — that restriction is about replaying a file, not capturing one.

## Gotchas

- **No onboard memory.** The module has no flash for logging (manual §4.4.1);
  everything streams live over BLE. A dropout is data you never get back.
- **One connection at a time per sensor.** If the phone app is holding a
  sensor, the laptop can't connect, and vice versa. Close the app first.
- **Don't pair them in Windows Bluetooth settings.** The logger connects
  directly; pairing gets in the way.
- **Accelerometer calibration is factory-done.** The app manual says users
  don't need to redo it. Only recalibrate if `benchcheck.py` reports a resting
  `|a|` away from 9.81 — and do it on a genuinely flat surface, since the
  routine defines the current orientation as 0, 0, 1.

## Verifying it took

Settings are only real if they survived the save. Record ~30 s on a desk and
run the acceptance check:

```powershell
.\daq.ps1 record desk_test
.\daq.ps1 check  desk_test
```

`benchcheck.py` reports the *delivered* rate, so a module still sitting at
10 Hz shows up immediately. It also checks resting `|a|` against 1 g, the gap
fraction, and inter-unit sync.

Related: [[Sensor DAQ]] · [Hardware Roadmap](../product/Hardware%20Roadmap.md) ·
[datasheets](../../sensors/datasheets/README.md)
