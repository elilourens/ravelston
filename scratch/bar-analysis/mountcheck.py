"""Is this mount stiff enough to trust? Run it at the rack, before the ladder.

Procedure: mount the sensor, then tap the SENSOR itself (not the bar) about
ten times, a second apart. This drives the sensor-on-mount resonance directly.
Feed the recording to this script.

    python3 mountcheck.py <session_dir> [--mass-g 25] [--unit 0]

Works on both a Sensor Logger export and a sensors/daq/logger.py output
directory; --unit picks which of the two WT9011 nodes to check (check both).

Pass criterion (MOUNTING.md bench test 1): mounted resonance >= 200 Hz, which
is ~8x the top of the band the whip measurement uses. A soft mount does not
just add noise - it replaces the signal, which is exactly what happened in
session 1 (200 g phone on duct tape rang at 22 Hz with zeta ~ 0.09).

Caveat: a gyro sampled at ~100 Hz cannot SEE 200 Hz. What this script can do
is prove a mount is BAD - if a heavily damped resonance shows up anywhere
below ~40 Hz, the mount is disqualified on the spot. Clearing that test is
necessary, not sufficient; a high-rate accelerometer or a mic is needed to
confirm the true resonance.
"""

import sys
import os
import numpy as np
from scipy import signal

from barlib import load_session, bending_channel, FS
from estimate import find_hits, matrix_pencil

FAIL_BELOW = 40.0        # anything ringing down here is disqualifying
TARGET = 200.0           # the real requirement, per MOUNTING.md
STEEL_ZETA_MAX = 0.01    # above this it is the mount, not the bar


def check(d, mass_g=25.0, unit=0):
    s = load_session(d, unit)
    fs = s["fs"]
    proj, _ = bending_channel(s)
    pk, env = find_hits(proj, s["gap"], fs)
    n = int(0.40 * fs)

    modes = []
    for i in pk:
        a, b = i + int(0.03 * fs), i + int(0.03 * fs) + n
        if b > len(proj) or env[i:i + 4].max() < 0.03:
            continue
        cand = [m for m in matrix_pencil(proj[a:b], fs)
                if 1.5 <= m[0] <= 45 and m[1] > 0.3 and m[2] > 0.01]
        if cand:
            f, al, c = max(cand, key=lambda m: m[2] / max(m[1], 1.0))
            modes.append((f, al / (2 * np.pi * f)))

    print(f"session : {s['name']}  ({s['source']}, unit {s['unit'] + 1} of "
          f"{s['n_units']}, {fs:.1f} Hz delivered)")
    print(f"strikes : {len(modes)} usable of {len(pk)} detected\n")
    if not modes:
        print("No usable ring-downs - check the recording before trusting anything.")
        return

    f = np.array([m[0] for m in modes])
    z = np.array([m[1] for m in modes])
    fmed, zmed = float(np.median(f)), float(np.median(z))

    print(f"dominant mode : {fmed:6.2f} Hz   (IQR {np.percentile(f,25):.2f}-"
          f"{np.percentile(f,75):.2f})")
    print(f"damping       : {zmed:6.3f}\n")

    suspect = fmed < FAIL_BELOW and zmed > STEEL_ZETA_MAX
    if suspect:
        k = (mass_g / 1000.0) * (2 * np.pi * fmed) ** 2
        need = (mass_g / 1000.0) * (2 * np.pi * TARGET) ** 2
        print("VERDICT: FAIL - this is the mount, not the bar.")
        print(f"  {fmed:.1f} Hz at zeta={zmed:.3f} is a soft lossy spring;")
        print(f"  a steel bending mode would sit near zeta<={STEEL_ZETA_MAX}.")
        print(f"  implied mount stiffness at {mass_g:.0f} g : {k:8.0f} N/m")
        print(f"  needed to reach {TARGET:.0f} Hz          : {need:8.0f} N/m"
              f"   ({need/max(k,1e-9):.0f}x stiffer)")
        print("\n  Fix stiffness, not tightness: magnet or clamp onto bare steel,")
        print("  rigid bond between magnet and sensor, no foam or tape in the load path.")
    else:
        print(f"VERDICT: no disqualifying resonance below {FAIL_BELOW:.0f} Hz.")
        print(f"  Necessary but not sufficient - a {FS:.0f} Hz gyro cannot see "
              f"{TARGET:.0f} Hz.")
        print("  Confirm the true mount resonance with a high-rate accelerometer "
              "or the mic before trusting whip data.")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    mass, unit = 25.0, 0
    if "--mass-g" in sys.argv:
        mass = float(sys.argv[sys.argv.index("--mass-g") + 1])
    if "--unit" in sys.argv:
        unit = int(sys.argv[sys.argv.index("--unit") + 1])
    check(args[0], mass, unit)
