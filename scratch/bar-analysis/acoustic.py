"""FINDINGS §10 step 6: are the plates acoustically coupled to the sleeve?

Mode 5 near 347 Hz means decoupled; near 288 Hz means coupled. The two
computable bounds sit ~20% apart, so a peak that lands cleanly on one is a
decisive answer.

Needs audio.wav next to each Microphone.mp4:
    ffmpeg -i Microphone.mp4 -ac 1 -ar 16000 -c:a pcm_s16le audio.wav

    python3 acoustic.py <datadir> [outdir]
"""

import sys
import glob
import os
import wave
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy import signal

from barlib import label_of

MEAS, PRED = "#2a78d6", "#eb6834"
INK, MUTED, GRID = "#0b0b0b", "#52514e", "#dcdcd8"

COUPLED, DECOUPLED = 288.0, 347.0
BAND = (150.0, 700.0)
WIN = 0.25          # acoustic ring-down window after each tap


def read_wav(p):
    with wave.open(p, "rb") as w:
        fs = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
    return x.astype(float) / 32768.0, fs


def find_taps(x, fs, min_sep=0.45):
    """Metal taps are sharp broadband transients; find onsets on a HF envelope."""
    b, a = signal.butter(4, [200, min(3000, fs / 2 - 100)], btype="band", fs=fs)
    e = signal.filtfilt(b, a, x) ** 2
    e = signal.savgol_filter(e, max(31, int(0.004 * fs) | 1), 2)
    e[e < 0] = 0
    d = np.diff(np.sqrt(e), prepend=0)
    d[d < 0] = 0
    med = np.median(d)
    mad = np.median(np.abs(d - med)) + 1e-12
    pk, _ = signal.find_peaks(d, height=med + 6 * 1.4826 * mad,
                              distance=int(min_sep * fs))
    return pk


def tap_spectrum(x, fs, taps, skip=0.004):
    """Average normalised spectrum of the windows just after each tap,
    with a pre-tap noise reference subtracted (music/room rejection)."""
    n = int(WIN * fs)
    w = signal.windows.hann(n)
    nfft = 1 << int(np.ceil(np.log2(n)) + 3)
    f = np.fft.rfftfreq(nfft, 1 / fs)
    m = (f >= BAND[0]) & (f <= BAND[1])

    sig, ref = [], []
    for i in taps:
        a = i + int(skip * fs)
        if a + n > len(x) or i - n < 0:
            continue
        S = np.abs(np.fft.rfft(x[a:a + n] * w, nfft))[m]
        N = np.abs(np.fft.rfft(x[i - n:i] * w, nfft))[m]
        if S.max() <= 0:
            continue
        sig.append(S / S.max())
        ref.append(N / max(N.max(), 1e-12))
    if not sig:
        return None, None, 0
    S = np.mean(sig, axis=0)
    N = np.mean(ref, axis=0)
    return f[m], np.clip(S - N, 0, None), len(sig)


def decaying_modes(x, fs, taps, lo=200, hi=500, q=8):
    """Modes in [lo,hi] that actually ring down after a tap.

    This is the discriminator that survives a noisy room: steady programme
    material does not decay on the schedule of your strikes, so gating on a
    falling envelope rejects music far better than raw SNR would suggest.
    """
    from estimate import matrix_pencil

    b, a = signal.butter(4, [lo, hi], btype="band", fs=fs)
    xd = signal.decimate(signal.filtfilt(b, a, x), q, ftype="fir")
    fsd = fs / q

    freqs, n_decay, n_tot = [], 0, 0
    for i in taps:
        j = int(i / q) + int(0.005 * fsd)
        n = int(0.20 * fsd)
        if j < 0 or j + n > len(xd):
            continue
        n_tot += 1
        env = np.abs(signal.hilbert(xd[j:j + n]))
        head = env[: n // 4].mean()
        if head <= 0 or env[-n // 4:].mean() / head > 0.7:
            continue                                  # steady -> not a ring-down
        n_decay += 1
        freqs += [f for f, al, c in matrix_pencil(xd[j:j + n], fsd, order=8)
                  if lo <= f <= hi and 2 < al < 400 and c > 0.005]
    return np.array(freqs), n_decay, n_tot


def main(datadir, outdir):
    os.makedirs(outdir, exist_ok=True)
    dirs = [d for d in sorted(glob.glob(os.path.join(datadir, "*/")))
            if "palm" in os.path.basename(d.rstrip("/")).lower()
            and os.path.exists(os.path.join(d, "audio.wav"))]

    fig, ax = plt.subplots(figsize=(11.5, 5.4))
    ax.set_facecolor("#fcfcfb")
    for sp in ("top", "right"):
        ax.spines[sp].set_visible(False)
    for sp in ("left", "bottom"):
        ax.spines[sp].set_color(GRID)
    ax.grid(True, color=GRID, lw=.7, alpha=.7)
    ax.set_axisbelow(True)
    ax.tick_params(colors=MUTED, labelsize=9)

    for x0, lab in [(COUPLED, "288 Hz\ncoupled"), (DECOUPLED, "347 Hz\ndecoupled")]:
        ax.axvline(x0, color=PRED, lw=1.6, ls="--", zorder=2)
        ax.annotate(lab, (x0, 1.02), color=PRED, fontsize=9, ha="center",
                    va="bottom", fontweight="bold", xycoords=("data", "axes fraction"))

    shades = plt.cm.Blues(np.linspace(.45, .95, len(dirs)))
    print(f"{'load':>6} {'taps':>5} {'peak in 250-400 Hz':>20}")
    for d, c in zip(sorted(dirs, key=lambda p: label_of(os.path.basename(p.rstrip('/')))[0]), shades):
        kg, _ = label_of(os.path.basename(d.rstrip("/")))
        x, fs = read_wav(os.path.join(d, "audio.wav"))
        taps = find_taps(x, fs)
        f, S, n = tap_spectrum(x, fs, taps)
        if f is None:
            print(f"{kg:5.0f}kg  no usable taps")
            continue
        S = S / max(S.max(), 1e-12)
        ax.plot(f, S, color=c, lw=1.7, label=f"{kg:.0f} kg (n={n})", zorder=3)
        w = (f >= 250) & (f <= 400)
        pk = f[w][np.argmax(S[w])]
        fr, nd, nt = decaying_modes(x, fs, taps)
        extra = ""
        if len(fr) > 5:
            h, edges = np.histogram(fr, bins=np.arange(200, 505, 10))
            extra = (f"   decaying {nd}/{nt} taps, {len(fr)} modes, "
                     f"densest bin {edges[np.argmax(h)]:.0f}-{edges[np.argmax(h)]+10:.0f} Hz "
                     f"(n={h.max()})")
        print(f"{kg:5.0f}kg {n:5d} {pk:17.1f} Hz{extra}")

    ax.set_xlim(*BAND)
    ax.set_xlabel("Hz", color=MUTED)
    ax.set_ylabel("noise-subtracted mean |FFT|", color=MUTED)
    ax.set_title("Plate–sleeve coupling: tap spectra by load", color=INK,
                 fontsize=12, fontweight="bold", loc="left")
    ax.legend(frameon=False, fontsize=9, labelcolor=MUTED)
    fig.tight_layout()
    out = os.path.join(outdir, "acoustic.png")
    fig.savefig(out, dpi=130, facecolor="#fcfcfb")
    print(f"\n-> {out}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "plots")
