"""Per-session diagnostic plots: did event detection find the hits, and does
each ring-down show a clean line?

    python3 explore.py <datadir> [outdir]
"""

import sys
import glob
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from barlib import analyse, bending_channel

datadir = sys.argv[1]
outdir = sys.argv[2] if len(sys.argv) > 2 else "plots"
os.makedirs(outdir, exist_ok=True)

rows = []
for d in sorted(glob.glob(os.path.join(datadir, "*/"))):
    s, peaks, env, res = analyse(d)
    proj, axis = bending_channel(s)

    fig, ax = plt.subplots(2, 1, figsize=(13, 6), height_ratios=[2, 3])
    ax[0].plot(s["t"], proj, lw=.5, color="#446", label="bending channel")
    ax[0].plot(s["t"], env, lw=.8, color="#c33", alpha=.7, label="envelope")
    for p in peaks:
        ax[0].axvline(s["t"][p], color="#2a7", lw=.8, alpha=.8)
    ax[0].set_title(f"{s['name']}   {len(peaks)} events   axis={np.round(axis,2)}")
    ax[0].set_xlabel("s"); ax[0].set_ylabel("rad/s"); ax[0].legend(fontsize=7)

    for r in res:
        ax[1].plot(r["spec_f"], r["spec_S"] / r["spec_S"].max(), lw=.8, alpha=.6)
        ax[1].axvline(r["f"], color="#c33", lw=.5, alpha=.4)
    ax[1].set_xlim(0, 25); ax[1].set_xlabel("Hz"); ax[1].set_ylabel("norm |FFT|")
    if res:
        fs = [r["f"] for r in res]
        ax[1].set_title(f"ring-down spectra   median {np.median(fs):.2f} Hz   "
                        f"spread {np.percentile(fs,16):.2f}-{np.percentile(fs,84):.2f}")
    fig.tight_layout()
    fig.savefig(os.path.join(outdir, s["name"][:40] + ".png"), dpi=110)
    plt.close(fig)

    for r in res:
        rows.append((r["kg"], r["kind"], r["t"], r["f"], r["zeta"], r["snr"], r["amp"]))
    print(f"{s['name'][:42]:44s} events={len(peaks):3d} usable={len(res):3d} "
          f"f_med={np.median([r['f'] for r in res]) if res else float('nan'):6.2f} Hz")

np.save(os.path.join(outdir, "events.npy"), np.array(rows, dtype=object), allow_pickle=True)
print(f"\nplots + events.npy -> {outdir}/")
