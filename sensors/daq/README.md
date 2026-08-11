# daq — WT9011DCL-BT50 data acquisition

Host-side logging for the two bar-end WitMotion sensors.

**Run the logger on Windows** — WSL cannot see Bluetooth adapters. The parser
and tests are pure Python and run anywhere.

## Setup (Windows PowerShell)

```powershell
pip install bleak
python logger.py scan                       # find the sensors' addresses
python logger.py record --address <A> --address <B> --rate 100 `
    --out session_2026-08-14 --label "squat 60kg bumpers"
```

Ctrl+C stops recording. Output: one CSV per sensor (host arrival timestamps +
accel m/s², gyro °/s, angles °), `gaps.csv` (the stream has **no sample
counters**, so BLE drops are detected from arrival timing and must be treated
as missing data), and `meta.json`.

## Tests

```bash
python -m pytest sensors/daq/tests/
```

Synthetic-packet tests cover scaling, sign handling, packet framing across
BLE chunk boundaries, resync after corruption, and exact register command
bytes. Protocol constants were cross-checked against the WitMotion manual and
two community implementations — but **verify on first real connection**:
`logger.py scan` finding the service UUID and a sane 1 g on a resting z-axis
confirms the lot.
