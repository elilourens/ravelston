# Ravelston — agent instructions

Ravelston is a gym performance tracker built on two IMU sensors that clamp to
the ends of a barbell. From their motion it derives range of motion, technique,
rest time, and an estimate of the load on the bar.

The whole business lives in this repo. **You will be asked to work on physics,
firmware, marketing copy and strategy notes in the same session** — read the
category rules below before deciding where anything goes.

## Repo map

| Folder | Contains | Test for belonging |
|---|---|---|
| `rnd/` | Sensor acquisition, signal processing, datasheets | Purpose is to find out what's true; obsolete once you know |
| `product/` | The companion app; firmware later | Is, or defines, the thing customers get |
| `gtm/` | The marketing site | Aimed at a customer |
| `kb/` | **All standalone prose.** Obsidian vault | Anything you'd want to link to from another note |
| `setup/` | Dependency manifests, dev tooling | How to run anything here |
| `scratch/` | Throwaway | Deletable without loss |

`kb/` mirrors the categories: `kb/rnd/`, `kb/product/`, `kb/gtm/`, `kb/tooling/`.
So research *code* is in `rnd/`, and the research *write-up* is in `kb/rnd/`.

**`README.md` is the exception** — it always stays beside the code it documents,
never in `kb/`.

**Migration rule:** when something in `rnd/` starts shipping, move it to
`product/`. Don't leave shipped code in `rnd/`.

## Physics rules that override intuition

This project is mostly signal processing, and the failure modes are quiet ones.
Getting these wrong produces plausible numbers rather than obvious errors.

- **Frequency must fall as load rises.** A bar's bending mode goes as
  `f ∝ 1/√m`. If an analysis shows frequency *rising* with added weight, the
  measurement is of the sensor mount, not the bar. This has already happened
  once and cost a session.
- **Always report damping (ζ) alongside frequency.** Steel bending modes sit at
  ζ ≈ 0.001–0.005; tape, foam or glue mounts at 0.05–0.2. Frequency alone
  cannot tell you which one you measured.
- **Never assume the sample rate.** Measure it from the data. Session rates are
  not the nominal rate, and a hardcoded constant silently rescales every
  frequency in the output.
- **Never widen a rejection filter to "get more data"** without checking what it
  was rejecting. Two filters here were tuned against a broken mount whose
  ring-downs died in 60–100 ms; real steel rings for seconds, and those
  thresholds discarded exactly the good data. Thresholds must be justified by
  physics, not by yield.
- **Treat BLE gaps as missing data**, never as continuous time. The stream has
  no sample counters, so gaps are detected from arrival timing only.
- **Ignore magnetometer and yaw entirely.** Steel bar, magnets in the mount.
- **Units matter.** Hz, kg, m/s², °/s and rad/s get mixed up here easily.
  Gyro data is converted to rad/s on load so amplitude thresholds mean the same
  thing across source formats.

## Working conventions

- **Two environments, not interchangeable.** WSL cannot see Bluetooth adapters,
  so anything that talks to a sensor must run on Windows Python. Analysis and
  tooling run in WSL. See [`setup/README.md`](setup/README.md).
- **Recorded sessions are not in the repo.** They live at
  `%USERPROFILE%\bar-data` on Windows, readable from WSL at
  `/mnt/c/Users/<you>/bar-data/`.
- **Vendor claims are checked, not repeated.** Datasheet values that matter are
  verified against the PDFs in `rnd/sensors/datasheets/`, whose README records
  the errata found so far (the unlock command is documented two different ways).
- **Nothing here has met real hardware yet.** Protocol constants, register
  commands and the acceptance test are all verified against documentation and
  synthetic data only. Say so rather than implying otherwise.
- **Notes link with Obsidian wiki-style links**, which resolve by filename and
  so survive moves. Relative markdown links do not — prefer wiki links inside `kb/`.

## Commands

```bash
pytest                                       # 26 tests; testpaths set in pyproject.toml
npm --prefix setup run shot -- page.html --theme both   # headless screenshot
setup/review.sh                              # code review skill, headless
```

Node tooling lives in `setup/`, so `node_modules` stays out of the repo root.
Generated tool state goes to `.cache/`.

Dependencies are declared in `setup/requirements-*.txt` and `setup/package.json`.
This WSL Python is externally managed (PEP 668), so installs need a venv or
`--break-system-packages`.

## Style

Match the surrounding code's density and idiom. Comments explain *why* a
threshold or constant is what it is — especially physical ones, where the
number is meaningless without its justification. Don't add comments that
restate the code.

For prose: plain words, short sentences, no marketing register in technical
notes. State uncertainty where it exists rather than rounding it away.
