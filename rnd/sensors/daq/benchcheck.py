"""Hardware acceptance test for a recorded session. Run this BEFORE the gym.

The logger will happily record garbage. This answers the four questions that
decide whether any downstream number means anything:

  1. Did we actually get the rate we asked for, steadily?
  2. Is the scaling right?  (a still sensor must read 1 g, not 0.1 g or 10 g)
  3. How much of the session is missing?  (BLE drops, no sample counters)
  4. Are the two units synced, and do their clocks drift apart?

Question 4 is the one that matters most for the dual-IMU work: the lever-arm
solution DIFFERENCES two acceleration vectors, so sync error maps straight
into the differenced signal (FINDINGS section 9).

    python3 benchcheck.py <session_dir>

Procedure for the recording it wants: put both sensors flat on a desk, start
recording, leave them still for ~10 s, then rap the desk hard 5-6 times a
second or two apart, then stop. The still part answers 2, the raps answer 4.

numpy only, so it runs in WSL on CSVs copied over from the Windows host.
"""

import sys
import os
import glob
import json
import numpy as np

NOMINAL_HZ = 100.0
G = 9.80665

# Pass thresholds. Sources: rate/gap are ours; the accel and gyro noise floors
# are the WT901 datasheet class (~0.03 g, ~0.05 deg/s/sqrt(Hz)) with slack.
RATE_TOL = 0.05          # delivered rate within 5% of nominal
MAX_GAP_FRAC = 0.02      # at most 2% of wall time missing
G_TOL = 0.30             # |a| at rest, m/s^2
GYRO_NOISE_MAX = 1.0     # deg/s std at rest
SYNC_MAX_MS = 5.0        # bulk offset we are willing to correct out
DRIFT_MAX_PPM = 500.0    # relative clock rate difference

STILL_WIN = 3.0          # seconds of quiet needed for the rest checks
TAP_BAND_LO = 5.0        # sync correlation uses only sharp transients


def load(path):
    """Read a logger CSV into arrays, keeping host arrival timestamps."""
    d = np.genfromtxt(path, delimiter=",", names=True)
    t = d["host_ts"].astype(float)
    return dict(
        name=os.path.basename(path).replace(".csv", ""),
        t=t - t[0],
        t0=t[0],
        acc=np.column_stack([d["ax"], d["ay"], d["az"]]).astype(float),
        gyr=np.column_stack([d["gx"], d["gy"], d["gz"]]).astype(float),
    )


def uniform(s, fs=NOMINAL_HZ):
    """Resample onto a uniform grid. Host timestamps jitter; correlation
    needs an even time base. Gaps are handled separately, not interpolated
    away silently -- see gap_fraction()."""
    tu = np.arange(s["t"][0], s["t"][-1], 1.0 / fs)
    out = {"t": tu}
    for k in ("acc", "gyr"):
        out[k] = np.column_stack([np.interp(tu, s["t"], s[k][:, i])
                                  for i in range(3)])
    return out


def gap_fraction(t, fs=NOMINAL_HZ, factor=2.5):
    """Fraction of wall time inside a detected BLE gap."""
    dt = np.diff(t)
    bad = dt > factor / fs
    return float(dt[bad].sum() / (t[-1] - t[0])), int(bad.sum())


def quietest_window(u, win_s=STILL_WIN, fs=NOMINAL_HZ):
    """Index range of the least-moving window. Finding it beats assuming the
    whole recording is still -- he will have knocked the desk at some point."""
    n = int(win_s * fs)
    m = np.linalg.norm(u["gyr"], axis=1)
    if len(m) <= n:
        return 0, len(m)
    c1 = np.concatenate([[0.0], np.cumsum(m)])
    c2 = np.concatenate([[0.0], np.cumsum(m ** 2)])
    mean = (c1[n:] - c1[:-n]) / n
    var = (c2[n:] - c2[:-n]) / n - mean ** 2
    i = int(np.argmin(var))
    return i, i + n


def highpass(x, fs, fc):
    X = np.fft.rfft(x)
    X[np.fft.rfftfreq(len(x), 1 / fs) < fc] = 0
    return np.fft.irfft(X, len(x))


def xcorr_lag(x, y, fs, maxlag_s=0.5):
    """Sub-sample lag of x relative to y, plus a 0-1 correlation quality.

    Positive result means x arrives LATER than y. Parabolic interpolation on
    the correlation peak gets below the 10 ms sample period, but only as far
    as the transient SNR allows -- read the quality number before the lag.
    """
    x = x - x.mean()
    y = y - y.mean()
    n = min(len(x), len(y))
    x, y = x[:n], y[:n]
    ml = int(maxlag_s * fs)
    nfft = 1 << int(np.ceil(np.log2(2 * n)))
    c = np.fft.irfft(np.fft.rfft(x, nfft) * np.conj(np.fft.rfft(y, nfft)), nfft)
    c = np.concatenate([c[-ml:], c[: ml + 1]])
    k = int(np.argmax(c))
    d = 0.0
    if 0 < k < len(c) - 1:
        den = c[k - 1] - 2 * c[k] + c[k + 1]
        if den != 0:
            d = 0.5 * (c[k - 1] - c[k + 1]) / den
    q = c[k] / (np.sqrt(np.sum(x ** 2) * np.sum(y ** 2)) + 1e-30)
    return (k - ml + d) / fs, float(q)


def check(session_dir):
    csvs = sorted(p for p in glob.glob(os.path.join(session_dir, "*.csv"))
                  if not p.endswith("gaps.csv"))
    if not csvs:
        print(f"No sensor CSVs in {session_dir}")
        return 1

    meta_path = os.path.join(session_dir, "meta.json")
    meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}
    fs_nom = float(meta.get("rate_hz", NOMINAL_HZ))
    if meta.get("label"):
        print(f"label   : {meta['label']}")
    print(f"nominal : {fs_nom:.0f} Hz\n")

    fails = []
    sessions = [load(p) for p in csvs]

    for s in sessions:
        dur = s["t"][-1]
        fs = len(s["t"]) / dur
        dt = np.diff(s["t"]) * 1000.0
        gfrac, ngap = gap_fraction(s["t"], fs_nom)

        u = uniform(s, fs_nom)
        a, b = quietest_window(u, fs=fs_nom)
        amag = np.linalg.norm(u["acc"][a:b], axis=1)
        gbias = u["gyr"][a:b].mean(axis=0)
        gnoise = u["gyr"][a:b].std(axis=0)
        anoise = u["acc"][a:b].std(axis=0)

        print(f"--- {s['name']}")
        print(f"  samples      : {len(s['t'])} over {dur:.1f} s")
        print(f"  rate         : {fs:.2f} Hz delivered   "
              f"(period median {np.median(dt):.2f} ms, "
              f"IQR {np.percentile(dt,25):.2f}-{np.percentile(dt,75):.2f})")
        print(f"  gaps         : {ngap} spans, {gfrac*100:.2f}% of wall time")
        print(f"  rest window  : {u['t'][a]:.1f}-{u['t'][b-1]:.1f} s")
        print(f"  |a| at rest  : {amag.mean():.3f} m/s^2   "
              f"(expect {G:.3f}, error {amag.mean()-G:+.3f})")
        print(f"  gyro bias    : {gbias[0]:+.3f} {gbias[1]:+.3f} {gbias[2]:+.3f} deg/s")
        print(f"  gyro noise   : {gnoise[0]:.3f} {gnoise[1]:.3f} {gnoise[2]:.3f} deg/s")
        print(f"  accel noise  : {anoise[0]:.4f} {anoise[1]:.4f} {anoise[2]:.4f} m/s^2")

        if abs(fs - fs_nom) / fs_nom > RATE_TOL:
            fails.append(f"{s['name']}: delivered {fs:.1f} Hz, asked for {fs_nom:.0f}")
        if gfrac > MAX_GAP_FRAC:
            fails.append(f"{s['name']}: {gfrac*100:.1f}% of the session is missing")
        if abs(amag.mean() - G) > G_TOL:
            fails.append(f"{s['name']}: rest |a| = {amag.mean():.2f}, not 1 g "
                         f"-- scaling or calibration is wrong")
        if gnoise.max() > GYRO_NOISE_MAX:
            fails.append(f"{s['name']}: gyro noise {gnoise.max():.2f} deg/s "
                         f"-- was it actually still?")
        print()

    # ---- inter-unit sync, the check that gates the dual-IMU work
    if len(sessions) == 2:
        A, B = sessions
        t0 = max(A["t0"], B["t0"])
        t1 = min(A["t0"] + A["t"][-1], B["t0"] + B["t"][-1])
        tu = np.arange(0, t1 - t0, 1.0 / fs_nom)

        def band(s):
            m = np.linalg.norm(s["acc"], axis=1)
            x = np.interp(tu, s["t"] - (t0 - s["t0"]), m)
            return highpass(x, fs_nom, TAP_BAND_LO)

        xa, xb = band(A), band(B)
        lag, q = xcorr_lag(xa, xb, fs_nom)
        h = len(tu) // 2
        l1, q1 = xcorr_lag(xa[:h], xb[:h], fs_nom)
        l2, q2 = xcorr_lag(xa[h:], xb[h:], fs_nom)
        span = (tu[-1] - tu[h]) / 2 + (tu[h] - tu[0]) / 2
        drift_ppm = (l2 - l1) / max(span, 1e-9) * 1e6

        print("--- sync (host clock, both units on the common overlap)")
        print(f"  overlap      : {tu[-1]:.1f} s")
        print(f"  bulk lag     : {lag*1000:+.2f} ms   "
              f"(A relative to B, correlation quality {q:.3f})")
        print(f"  first half   : {l1*1000:+.2f} ms (q={q1:.3f})")
        print(f"  second half  : {l2*1000:+.2f} ms (q={q2:.3f})")
        print(f"  drift        : {drift_ppm:+.0f} ppm")

        if q < 0.05:
            fails.append("sync: no shared transient found -- rap the desk "
                         "harder, or both units were not seeing the same event")
        else:
            if abs(lag) * 1000 > SYNC_MAX_MS:
                fails.append(f"sync: {lag*1000:+.1f} ms bulk offset")
            if abs(drift_ppm) > DRIFT_MAX_PPM:
                fails.append(f"sync: {drift_ppm:+.0f} ppm clock drift between units")
        print("\n  Note: a 100 Hz stream with host arrival timestamps cannot")
        print("  PROVE sub-millisecond sync. Interpolating a 10 ms grid biases")
        print("  the estimate TOWARD zero, so read a small number as 'no gross")
        print("  offset', never as 'synced to that figure'. What this measures")
        print("  reliably is the bulk offset and the drift -- the correctable")
        print("  parts. Real sub-ms sync needs the counter-stamped hardware in")
        print("  FINDINGS section 9.")
    elif len(sessions) == 1:
        print("--- sync: only one sensor recorded, skipped")

    print()
    if fails:
        print("VERDICT: FAIL")
        for f in fails:
            print(f"  - {f}")
        return 1
    print("VERDICT: PASS - stream is sane, scaling is right, units are aligned.")
    print("  Necessary, not sufficient: this says nothing about the MOUNT.")
    print("  Run mountcheck before trusting any whip data.")
    return 0


if __name__ == "__main__":
    sys.exit(check(sys.argv[1]))
