# WT9011DCL-BT50 — vendor documentation

Manufacturer PDFs for the two bar-end IMUs. Kept in the repo because the
protocol constants in [`../daq/protocol.py`](../daq/protocol.py) are derived
from them and need to stay checkable against a fixed copy — WitMotion revises
these documents without changing the filenames.

| File | What it's good for |
|---|---|
| `WT9011DCL-BT50 Communication Protocol.pdf` | **The authoritative one.** Packet layout, scale factors, every register and its command bytes. Source for `protocol.py`. |
| `WT9011DCL Manual.pdf` | Full manual (53 pp). Multi-connection (§2.4, §6), PC software, calibration. |
| `WT9011DCL-BT50 APP manual description.pdf` | Phone app screen by screen — where the rate, bandwidth and algorithm settings live. |
| `App Recording and playback.pdf` | Recording to the phone, file formats, and how to get files off Android/iOS. |
| `WT9011DCL Datasheet.pdf` | Electrical and mechanical specs. |
| `WT9011DCL-BT50 Product Specifications.pdf` | Ranges, noise, resolution. |

## Settings that matter to us, with sources

| Setting | Register | Factory default | We need | Why |
|---|---|---|---|---|
| Output rate | `0x03` | **10 Hz** | 100 Hz (`0x09`) | 10 Hz cannot see a 2–25 Hz whip at all. |
| Bandwidth | `0x1F` | **20 Hz** | 188 Hz (`0x01`) | The default low-pass sits *inside* the whip band. |
| Algorithm | `0x24` | 9-axis | 6-axis (`0x01`) | Magnetometer is meaningless on a steel bar with magnets glued to it. |
| Output content | `0x96` | accel+gyro+angle | leave at `0x00` | Setting it to `1` stops accel and gyro output entirely. |

**The bandwidth default is the dangerous one.** Protocol doc §3.9 sets it to
20 Hz out of the box, and the app manual (p. 23) warns that when the output
rate exceeds the bandwidth "two or more adjacent data are exactly the same" —
so a 100 Hz stream through the stock filter is both attenuated in-band and
partly duplicated. `protocol.configure_commands()` sets rate, bandwidth and
algorithm together for exactly this reason.

## Known errata in the vendor docs

- **Unlock command is inconsistent.** §3 gives `FF AA 69 88 B5`; §3.5 and §3.8
  give `FF AA 68 B5 88`. The first is correct and is what `protocol.py` and
  the community implementations use.
- **Rate table.** §3.4 lists `0x01` as 0.1 Hz. An earlier version of
  `protocol.py` had it as 0.2 Hz; corrected to match.
- **Angular velocity formulas** (§2.2) copy-paste `WXH`/`WXL` into all three
  axes. Obviously meant to be `WY`/`WZ`.
- **"No memory chip in the sensor module"** (manual §4.4.1) — there is no
  onboard logging. Everything streams over BLE, so a dropout is lost data,
  not something you can retrieve afterwards.

Related: [Sensor DAQ](../../../kb/tooling/Sensor%20DAQ.md) ·
[WT9011 Setup](../../../kb/tooling/WT9011%20Setup.md)
