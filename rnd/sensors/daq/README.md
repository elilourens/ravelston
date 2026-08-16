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

## Acceptance test — run this before the first gym trip

`logger.py` will happily record garbage. `benchcheck.py` decides whether it
didn't.

Both sensors flat on a desk. Start recording, leave them still ~10 s, then rap
the desk hard 5–6 times a second apart, then stop.

```bash
python benchcheck.py session_2026-08-16-desk
```

It reports delivered rate and jitter, gap fraction, rest `|a|` against 1 g
(the scaling check the protocol constants need), gyro bias and noise floor,
and the inter-unit lag and clock drift from the raps. Non-zero exit on any
failure. numpy only, so it runs in WSL on CSVs copied off the Windows host.

Sync caveat: interpolating a 100 Hz grid biases the lag estimate toward zero.
Read a small number as "no gross offset", not as a sync figure.

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
