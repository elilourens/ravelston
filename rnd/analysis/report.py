"""Verdict figure + summary table for a phone-on-bar session.

Two questions, one panel each:
  1. Does the ring-down frequency fall with load, as the whip model predicts?
  2. Is anything we measured damped like steel, or like a tape mount?

    python3 report.py <datadir> [outdir]
"""

import sys
import glob
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from estimate import find_hits, matrix_pencil, FS, WIN, SKIP, MIN_ALPHA, MAX_ALPHA
from barlib import load_session, bending_channel, label_of

MEAS, PRED = "#2a78d6", "#eb6834"        # validated categorical slots 1 & 2
INK, MUTED, GRID = "#0b0b0b", "#52514e", "#dcdcd8"

# Steel bar bending modes sit here; anything far above is not the bar.
STEEL_ZETA = (0.001, 0.005)


def collect(datadir):
    """Every fitted mode from every strike, tagged with load and striker."""
    rows = []
    for d in sorted(glob.glob(os.path.join(datadir, "*/"))):
        s = load_session(d)
        fs = s["fs"]
        proj, _ = bending_channel(s)
        kg, kind = label_of(s["name"])
        pk, env = find_hits(proj, s["gap"], fs)
        n = int(WIN * fs)
        for i in pk:
            a, b = i + int(SKIP * fs), i + int(SKIP * fs) + n
            if b > len(proj) or s["gap"][a:b].any():
                continue
            amp = env[i:i + 4].max()
            if amp < 0.03:
                continue
            modes = [m for m in matrix_pencil(proj[a:b], fs)
                     if 1.5 <= m[0] <= 45 and MIN_ALPHA < m[1] < MAX_ALPHA
                     and m[2] > 0.01]
            if not modes:
                continue
            f, al, c = max(modes, key=lambda m: m[2] / max(m[1], 1.0))
            rows.append(dict(kg=kg, kind=kind, f=f, zeta=al / (2 * np.pi * f), amp=amp))
    return rows


def main(datadir, outdir):
    os.makedirs(outdir, exist_ok=True)
    rows = collect(datadir)
    hits = [r for r in rows if r["kind"] == "hits"]

    fig, (axf, axz) = plt.subplots(1, 2, figsize=(12.5, 5.0))
    for ax in (axf, axz):
        ax.set_facecolor("#fcfcfb")
        for sp in ("top", "right"):
            ax.spines[sp].set_visible(False)
        for sp in ("left", "bottom"):
            ax.spines[sp].set_color(GRID)
        ax.tick_params(colors=MUTED, labelsize=9)
        ax.grid(True, color=GRID, lw=.7, alpha=.7)
        ax.set_axisbelow(True)

    # ---- panel 1: measured frequency vs load, against the whip prediction
    kgs = np.array([r["kg"] for r in hits])
    fss = np.array([r["f"] for r in hits])
    rng = np.random.default_rng(0)
    axf.scatter(kgs + rng.uniform(-1.6, 1.6, len(kgs)), fss, s=30, alpha=.55,
                color=MEAS, edgecolor="none", zorder=3)

    loads = np.array(sorted(set(kgs)))
    meds = np.array([np.median(fss[kgs == k]) for k in loads])
    axf.plot(loads, meds, color=MEAS, lw=2, marker="o", ms=7, zorder=4,
             markeredgecolor="#fcfcfb", markeredgewidth=2, label="measured")
    for k, m in zip(loads, meds):
        axf.annotate(f"{m:.1f}", (k, m + 1.1), color=INK, fontsize=9,
                     ha="center", fontweight="bold")

    # FINDINGS §10: expect one line marching ~9 Hz bare -> ~4 Hz loaded
    pl = np.linspace(20, 80, 60)
    axf.plot(pl, 9.0 * np.sqrt(20.0 / pl), color=PRED, lw=2, ls="--",
             label="whip model (FINDINGS)")

    axf.set_xlabel("total load on the bar, kg", color=MUTED)
    axf.set_ylabel("dominant ring-down frequency, Hz", color=MUTED)
    axf.set_title("Frequency rises with load, and shouldn't", color=INK,
                  fontsize=12, fontweight="bold", loc="left")
    axf.set_ylim(0, 30)
    axf.legend(frameon=False, fontsize=9, labelcolor=MUTED, loc="upper left",
               bbox_to_anchor=(0, .88))

    # ---- panel 2: damping vs what steel does
    axz.axhspan(*STEEL_ZETA, color=PRED, alpha=.18, zorder=1)
    axz.annotate("steel bar bending mode\n(ζ ≈ 0.1–0.5%)", (21, STEEL_ZETA[1] * 1.5),
                 color=PRED, fontsize=9, fontweight="bold", va="bottom")
    zs = np.array([r["zeta"] for r in hits])
    axz.scatter(kgs + rng.uniform(-1.6, 1.6, len(kgs)), zs, s=30, alpha=.55,
                color=MEAS, edgecolor="none", zorder=3)
    axz.axhline(np.median(zs), color=MEAS, lw=2, zorder=4)
    axz.annotate(f"measured median ζ = {np.median(zs):.2f}\n"
                 f"{np.median(zs)/STEEL_ZETA[1]:.0f}× too damped",
                 (79, np.median(zs) * 1.25), color=INK, fontsize=9,
                 ha="right", fontweight="bold")
    axz.set_yscale("log")
    axz.set_xlabel("total load on the bar, kg", color=MUTED)
    axz.set_ylabel("damping ratio ζ  (log)", color=MUTED)
    axz.set_title("Nothing measured is damped like steel", color=INK,
                  fontsize=12, fontweight="bold", loc="left")

    fig.suptitle("Session 1: the mount, not the bar", color=INK,
                 fontsize=14, fontweight="bold", x=.01, ha="left")
    fig.tight_layout(rect=(0, 0, 1, .95))
    out = os.path.join(outdir, "verdict.png")
    fig.savefig(out, dpi=130, facecolor="#fcfcfb")
    print(f"-> {out}\n")

    print(f"{'load':>6} {'n':>4} {'f median':>10} {'f IQR':>14} {'zeta median':>12}")
    for k in loads:
        m = kgs == k
        print(f"{k:5.0f}kg {m.sum():4d} {np.median(fss[m]):9.2f} Hz "
              f"{np.percentile(fss[m],25):6.2f}-{np.percentile(fss[m],75):5.2f} "
              f"{np.median(zs[m]):11.3f}")
    print(f"\nlowest damping seen anywhere in the hit data: zeta = {zs.min():.3f}")
    print(f"a steel bar bending mode would be zeta = {STEEL_ZETA[0]}-{STEEL_ZETA[1]}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "plots")
