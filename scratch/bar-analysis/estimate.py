"""Per-strike modal estimation via matrix pencil, then frequency vs load.

Why not FFT: a ring-down that dies in ~0.25 s gives ~3 Hz of FFT resolution,
which cannot separate a 4 Hz mode from a 7 Hz one. Matrix pencil fits
damped sinusoids directly and resolves both frequency and damping from short
records, which is exactly the regime here.

    python3 estimate.py <datadir> [outdir]
"""

import sys
import glob
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import signal

from barlib import load_session, bending_channel, label_of, FS

BAND = (1.5, 40.0)
WIN = 0.40
SKIP = 0.03
MIN_SEP = 0.45          # he struck roughly once per second

# Decay-rate acceptance band, 1/s. The floor must admit REAL STEEL: a bar
# bending mode at zeta ~ 0.001 and 1.5 Hz decays at only 0.01 1/s. Session 1's
# tape mount rang at zeta ~ 0.09, i.e. alpha ~ 12, so an aggressive floor
# looked harmless there -- on a good mount it silently discards the signal.
MIN_ALPHA = 0.01
MAX_ALPHA = 60.0

# Envelope must not be flat across the window. Only steady vibration (gym PA,
# a running treadmill) should fail this; a lightly damped ring-down barely
# decays inside 0.4 s and must still pass.
MAX_ENVELOPE_RATIO = 0.98


def find_hits(proj, gap, fs, min_sep=MIN_SEP, k=4.0):
    env = np.abs(signal.hilbert(proj))
    jerk = np.diff(env, prepend=env[0])
    jerk[jerk < 0] = 0
    med = np.median(jerk)
    mad = np.median(np.abs(jerk - med)) + 1e-12
    pk, _ = signal.find_peaks(jerk, height=med + k * 1.4826 * mad,
                              distance=int(min_sep * fs))
    return pk[~gap[pk]], env


def matrix_pencil(y, fs, order=6):
    """Return (freq Hz, damping 1/s, amplitude) for each fitted mode."""
    y = np.asarray(y, float)
    y = y - y.mean()
    N = len(y)
    L = N // 3
    if L <= order + 1:
        return []

    H = np.lib.stride_tricks.sliding_window_view(y, L + 1)      # (N-L, L+1)
    U, sv, Vt = np.linalg.svd(H, full_matrices=False)
    M = min(order, np.sum(sv > sv[0] * 1e-3))
    if M < 2:
        return []
    V = Vt[:M].T
    z = np.linalg.eigvals(np.linalg.pinv(V[:-1]) @ V[1:])

    modes = []
    for zi in z:
        if zi == 0:
            continue
        f = np.angle(zi) * fs / (2 * np.pi)
        alpha = -np.log(abs(zi)) * fs                # >0 means decaying
        if f <= 0:
            continue
        modes.append((f, alpha))

    if not modes:
        return []

    # least-squares amplitudes for the fitted poles
    n = np.arange(N)
    A = np.column_stack([np.exp((-a + 2j * np.pi * f) * n / fs) for f, a in modes])
    try:
        c, *_ = np.linalg.lstsq(A, y.astype(complex), rcond=None)
    except np.linalg.LinAlgError:
        return []
    return [(f, a, abs(ci)) for (f, a), ci in zip(modes, c)]


def dominant_mode(y, fs):
    """Strongest decaying mode inside the search band."""
    cand = [(f, a, amp) for f, a, amp in matrix_pencil(y, fs)
            if BAND[0] <= f <= BAND[1] and MIN_ALPHA < a < MAX_ALPHA]
    if not cand:
        return None
    # weight by energy actually delivered: amplitude divided by decay rate
    f, a, amp = max(cand, key=lambda m: m[2] / max(m[1], 1.0))
    return dict(f=f, alpha=a, amp=amp, zeta=a / (2 * np.pi * f), tau=1 / a)


def process(d, unit=0):
    s = load_session(d, unit)
    fs = s["fs"]
    proj, _ = bending_channel(s)
    kg, kind = label_of(s["name"])
    pk, env = find_hits(proj, s["gap"], fs)

    n = int(WIN * fs)
    out = []
    for idx, i in enumerate(pk):
        a = i + int(SKIP * fs)
        b = a + n
        if b > len(proj) or s["gap"][a:b].any():
            continue
        seg = proj[a:b]
        e = env[a:b]
        if e.max() < 0.05:
            continue
        if e[-n // 4:].mean() / max(e[:n // 4].mean(), 1e-9) > MAX_ENVELOPE_RATIO:
            continue                                  # steady, not a ring-down
        m = dominant_mode(seg, fs)
        if m is None:
            continue
        m.update(kg=kg, kind=kind, i=idx, t=s["t"][i], session=s["name"])
        out.append(m)
    return s, out


if __name__ == "__main__":
    datadir = sys.argv[1]
    outdir = sys.argv[2] if len(sys.argv) > 2 else "plots"
    os.makedirs(outdir, exist_ok=True)

    allres = []
    for d in sorted(glob.glob(os.path.join(datadir, "*/"))):
        s, res = process(d)
        allres += res
        if res:
            f = np.array([r["f"] for r in res])
            tau = np.array([r["tau"] for r in res])
            print(f"{s['name'][:42]:44s} n={len(res):3d}  "
                  f"f={np.median(f):6.2f} Hz [{np.percentile(f,25):5.2f}-{np.percentile(f,75):5.2f}]  "
                  f"tau={np.median(tau)*1000:5.0f} ms")

    # ---- frequency vs load, split by recording type
    fig, axes = plt.subplots(1, 2, figsize=(13, 5.2), sharey=True)
    for ax, kind, title in [(axes[0], "hits", "palm + metal hits"),
                            (axes[1], "rerack", "drop-racks")]:
        sub = [r for r in allres if r["kind"] == kind]
        if not sub:
            continue
        kgs = np.array([r["kg"] for r in sub])
        fs_ = np.array([r["f"] for r in sub])
        ax.scatter(kgs + np.random.uniform(-1.5, 1.5, len(kgs)), fs_,
                   s=26, alpha=.65, color="#2a6db0", edgecolor="none")
        for kg in sorted(set(kgs)):
            v = fs_[kgs == kg]
            ax.plot([kg - 4, kg + 4], [np.median(v)] * 2, color="#c0392b", lw=2.5)
            ax.annotate(f"{np.median(v):.1f}", (kg + 5, np.median(v)),
                        fontsize=8, color="#c0392b", va="center")
        ax.set_title(f"{title}  (n={len(sub)})")
        ax.set_xlabel("total load, kg")
        ax.grid(alpha=.25)
    axes[0].set_ylabel("dominant ring-down frequency, Hz")
    fig.suptitle("Does the ring-down frequency move with load?")
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, "freq_vs_load.png"), dpi=115)
    print(f"\n-> {outdir}/freq_vs_load.png")

    np.save(os.path.join(outdir, "modes.npy"), np.array(allres, dtype=object),
            allow_pickle=True)
