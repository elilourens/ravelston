"""Does anything in the spectrum actually move with load?

Averages the ring-down spectrum over all clean strikes at each load and
overlays the loads. A bar bending mode must shift down as mass is added;
a mount/phone resonance stays put. That contrast is the whole test.

    python3 spectra.py <datadir> [outdir]
"""

import sys
import glob
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import signal

from barlib import load_session, find_events, bending_channel, label_of

datadir = sys.argv[1]
outdir = sys.argv[2] if len(sys.argv) > 2 else "plots"
os.makedirs(outdir, exist_ok=True)

FS = 100.8
WIN = 0.35        # real ring-downs die in ~0.2-0.3 s
SKIP = 0.03
BAND = (2.0, 45.0)


def clean_ringdowns(d):
    """Keep only events whose envelope genuinely decays - drops handling wobble."""
    s = load_session(d)
    proj, _ = bending_channel(s)
    peaks, _ = find_events(s)
    env = np.abs(signal.hilbert(proj))

    n = int(WIN * FS)
    segs = []
    for i in peaks:
        a, b = i + int(SKIP * FS), i + int(SKIP * FS) + n
        if b > len(proj) or s["gap"][a:b].any():
            continue
        e = env[a:b]
        # a struck bar rings down; walking/handling does not
        first, last = e[: n // 4].mean(), e[-n // 4:].mean()
        if first <= 0 or last / first > 0.55:
            continue
        if e.max() < 0.05:                       # ignore near-silent triggers
            continue
        segs.append(proj[a:b])
    return s, segs


def avg_spectrum(segs, pad=16):
    """Amplitude spectrum averaged over strikes, each normalised so one hard
    hit cannot dominate the mean."""
    n = len(segs[0])
    nfft = int(2 ** np.ceil(np.log2(n))) * pad
    f = np.fft.rfftfreq(nfft, 1 / FS)
    m = (f >= BAND[0]) & (f <= BAND[1])
    acc = []
    w = signal.windows.hann(n)
    for seg in segs:
        S = np.abs(np.fft.rfft((seg - seg.mean()) * w, nfft))[m]
        if S.max() > 0:
            acc.append(S / S.max())
    return f[m], np.mean(acc, axis=0), len(acc)


for kind, pat in [("rerack", ("rerack", "tracking")), ("hits", ("palm",))]:
    dirs = [d for d in sorted(glob.glob(os.path.join(datadir, "*/")))
            if any(p in os.path.basename(d.rstrip("/")).lower() for p in pat)]
    if not dirs:
        continue

    fig, ax = plt.subplots(figsize=(11, 5.5))
    colors = plt.cm.viridis(np.linspace(0, .85, len(dirs)))
    summary = []

    for d, c in zip(sorted(dirs, key=lambda p: label_of(os.path.basename(p.rstrip('/')))[0]), colors):
        s, segs = clean_ringdowns(d)
        kg, _ = label_of(s["name"])
        if not segs:
            print(f"  {kg:5.0f} kg  no clean ring-downs")
            continue
        f, S, n = avg_spectrum(segs)
        ax.plot(f, S, color=c, lw=1.6, label=f"{kg:.0f} kg  (n={n})")
        pk = f[np.argmax(S)]
        ax.axvline(pk, color=c, lw=.8, ls=":")
        summary.append((kg, pk, n))
        print(f"  {kg:5.0f} kg  n={n:3d}  dominant peak {pk:6.2f} Hz")

    ax.set_xlabel("Hz")
    ax.set_ylabel("mean normalised |FFT|")
    ax.set_title(f"Ring-down spectra by load - {kind}")
    ax.legend()
    ax.grid(alpha=.25)
    fig.tight_layout()
    out = os.path.join(outdir, f"spectra_{kind}.png")
    fig.savefig(out, dpi=115)
    plt.close(fig)
    print(f"-> {out}\n")
