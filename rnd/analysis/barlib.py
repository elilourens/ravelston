"""Shared loading / event-detection / ring-down analysis for bar data.

Two source formats, auto-detected by load_session():

**Sensor Logger** (Pixel 9, v1.62.1) — the phone sessions:
  Gyroscope.csv    ~100.8 Hz   <- primary whip channel, rad/s
  Accelerometer.csv ~50.4 Hz
  Microphone.csv    dBFS envelope only (~17 Hz); raw audio is in Microphone.mp4

**WT9011DCL-BT50** — the real nodes, written by sensors/daq/logger.py:
  <address>.csv    100 Hz nominal, host arrival timestamps, gyro in deg/s
  one CSV per sensor, plus gaps.csv and meta.json

Gyro is converted to rad/s on load so the amplitude thresholds downstream
mean the same thing in both formats. Sample rate is measured per session and
returned as s["fs"] — never assume the nominal rate, the delivered one is
what sets every frequency you report.
"""

import os
import re
import glob
import numpy as np
import pandas as pd
from scipy import signal

FS = 100.8          # delivered gyro rate, Sensor Logger on the Pixel 9
WHIP_LO, WHIP_HI = 2.0, 25.0   # search band for the bending mode

DEG2RAD = np.pi / 180.0
GAP_FACTOR = 3.0    # inter-sample spacing above this x nominal counts as a gap


# ---------------------------------------------------------------- loading

def _grid(t, values, fs):
    """Uniform-grid resample plus a gap mask, shared by both loaders."""
    tu = np.arange(t[0], t[-1], 1.0 / fs)
    ch = {k: np.interp(tu, t, v) for k, v in values.items()}
    dt = np.diff(t, prepend=t[0])
    gap = np.interp(tu, t, dt) > (GAP_FACTOR / fs)
    return tu, ch, gap


def unit_csvs(d):
    """WT9011 per-sensor CSVs in a logger output directory, in address order."""
    out = []
    for p in sorted(glob.glob(os.path.join(d, "*.csv"))):
        if os.path.basename(p) == "gaps.csv":
            continue
        with open(p) as fh:
            if "host_ts" in fh.readline():
                out.append(p)
    return out


def load_witmotion(d, unit=0):
    """Read one sensor from a sensors/daq/logger.py output directory.

    `unit` indexes the CSVs in address order; a two-node session has 0 and 1.
    The delivered rate is measured, not assumed -- BLE under-delivers and the
    whole point of the exercise is a frequency number.
    """
    paths = unit_csvs(d)
    if not paths:
        raise FileNotFoundError(f"no WT9011 CSVs in {d}")
    df = pd.read_csv(paths[unit])
    t = df["host_ts"].values.astype(float)
    t = t - t[0]
    fs = (len(t) - 1) / (t[-1] - t[0])

    vals = {ax: df[g].values.astype(float) * DEG2RAD
            for ax, g in zip("xyz", ("gx", "gy", "gz"))}
    vals.update({f"a{ax}": df[a].values.astype(float)
                 for ax, a in zip("xyz", ("ax", "ay", "az"))})
    tu, ch, gap = _grid(t, vals, fs)

    return dict(t=tu, gap=gap, fs=fs, name=os.path.basename(d.rstrip("/")),
                unit=unit, n_units=len(paths),
                source="wt9011", **ch)


def load_sensorlogger(d):
    """Read one unzipped Sensor Logger export directory onto a uniform grid."""
    g = pd.read_csv(os.path.join(d, "Gyroscope.csv"))
    t = g["seconds_elapsed"].values.astype(float)
    vals = {ax: g[ax].values.astype(float) for ax in "xyz"}
    tu, ch, gap = _grid(t, vals, FS)
    return dict(t=tu, gap=gap, fs=FS, name=os.path.basename(d.rstrip("/")),
                unit=0, n_units=1, source="sensorlogger", **ch)


def load_session(d, unit=0):
    """Load a session directory in whichever format it happens to be."""
    if os.path.exists(os.path.join(d, "Gyroscope.csv")):
        return load_sensorlogger(d)
    if unit_csvs(d):
        return load_witmotion(d, unit)
    raise FileNotFoundError(
        f"{d} is neither a Sensor Logger export (Gyroscope.csv) nor a "
        f"WT9011 logger output (per-address CSVs with a host_ts column)")


def label_of(name):
    """'40kg_10_palm_hits...' -> (40.0, 'hits').

    Load comes from a leading or embedded '<n>kg'; a bare bar may instead be
    named raw/empty/bare and is taken as the 20 kg reference. Name WT9011
    sessions the same way (logger.py --out 60kg_palm_hits) so one convention
    covers both formats.
    """
    low = name.lower()
    kind = "hits" if "palm" in low else "rerack"
    if low.startswith(("raw", "empty", "bare")):
        return 20.0, kind
    m = re.search(r"(\d+(?:\.\d+)?)\s*kg", low)
    if not m:
        raise ValueError(
            f"cannot read a load from session name {name!r} -- name sessions "
            f"like '60kg_palm_hits', or 'empty_...' for the bare bar")
    return float(m.group(1)), kind


def bending_channel(s):
    """The whip shows up as rotation about one bar-transverse axis.

    Rather than assume which phone axis that is, project onto the principal
    axis of band-passed gyro motion. Falls back gracefully if one axis
    dominates (it does here - y carries ~10x the others).
    """
    b, a = signal.butter(4, [WHIP_LO, WHIP_HI], btype="band", fs=s["fs"])
    X = np.column_stack([signal.filtfilt(b, a, s[ax] - np.mean(s[ax])) for ax in "xyz"])
    # principal direction of the filtered motion
    _, _, Vt = np.linalg.svd(X - X.mean(0), full_matrices=False)
    proj = X @ Vt[0]
    return proj, Vt[0]


# ------------------------------------------------------- event detection

def find_events(s, min_sep=1.2, k=5.0):
    """Locate impulse onsets (hits, drop-racks) via jerk in the bending channel.

    Returns sample indices. `k` is the threshold in robust sigmas, `min_sep`
    the refractory period in seconds so one strike yields one event.
    """
    proj, _ = bending_channel(s)
    env = np.abs(signal.hilbert(proj))
    jerk = np.diff(env, prepend=env[0])
    jerk[jerk < 0] = 0.0                      # onsets only, not decays

    med = np.median(jerk)
    mad = np.median(np.abs(jerk - med)) + 1e-12
    thr = med + k * 1.4826 * mad

    peaks, _ = signal.find_peaks(jerk, height=thr, distance=int(min_sep * s["fs"]))
    peaks = peaks[~s["gap"][peaks]]
    return peaks, env


# ------------------------------------------------------ ring-down analysis

def ringdown(s, i0, skip=0.08, win=1.2, pad=8):
    """Analyse one ring-down starting `skip` s after an onset.

    Skipping the first ~80 ms drops the broadband impact transient itself so
    the fit sees the decaying mode rather than the hit. Returns peak frequency
    (interpolated), damping ratio from a log-envelope fit, and diagnostics.
    """
    fs = s["fs"]
    proj, _ = bending_channel(s)

    a = i0 + int(skip * fs)
    b = a + int(win * fs)
    if b > len(proj) or s["gap"][a:b].any():
        return None

    seg = proj[a:b] * signal.windows.hann(b - a)
    if np.allclose(seg, 0):
        return None

    # zero-padded FFT + parabolic interpolation for sub-bin frequency
    n = int(2 ** np.ceil(np.log2(len(seg)))) * pad
    S = np.abs(np.fft.rfft(seg, n))
    f = np.fft.rfftfreq(n, 1 / fs)
    m = (f >= WHIP_LO) & (f <= WHIP_HI)
    j = np.argmax(S[m]) + np.flatnonzero(m)[0]
    if j <= 0 or j >= len(S) - 1:
        return None
    y0, y1, y2 = S[j - 1], S[j], S[j + 1]
    denom = y0 - 2 * y1 + y2
    delta = 0.5 * (y0 - y2) / denom if denom != 0 else 0.0
    fpk = f[j] + delta * (f[1] - f[0])

    # damping: slope of log envelope over the window
    env = np.abs(signal.hilbert(proj[a:b]))
    tt = np.arange(len(env)) / fs
    good = env > env.max() * 0.05
    zeta = np.nan
    if good.sum() > 10:
        slope = np.polyfit(tt[good], np.log(env[good]), 1)[0]
        if slope < 0 and fpk > 0:
            zeta = -slope / (2 * np.pi * fpk)

    snr = S[m].max() / (np.median(S[m]) + 1e-18)
    return dict(f=fpk, zeta=zeta, snr=snr, amp=float(np.abs(proj[i0:i0 + 5]).max()),
                spec_f=f[m], spec_S=S[m])


def analyse(d, **kw):
    """Full pass over one session directory -> list of per-event results."""
    s = load_session(d)
    kg, kind = label_of(s["name"])
    peaks, env = find_events(s, **kw)
    out = []
    for p in peaks:
        r = ringdown(s, p)
        if r is None:
            continue
        r.update(kg=kg, kind=kind, t=s["t"][p], session=s["name"])
        out.append(r)
    return s, peaks, env, out
