# setup

Everything this repo depends on, and which machine needs it.

**There are two environments, and they are not interchangeable.** WSL cannot
see Bluetooth adapters, so recording has to happen on Windows; everything else
is easier in WSL.

| | Windows | WSL |
|---|---|---|
| Record from the sensors | **yes** — `bleak` | can't, no Bluetooth |
| Check a recording (`benchcheck.py`) | yes | yes |
| Analyse sessions (`bar-analysis/`) | — | **yes** |
| Node tooling (screenshots) | — | **yes** |

## Python

```bash
# WSL — signal processing and figures
pip install -r setup/requirements-analysis.txt

# WSL or Windows — running the tests
pip install -r setup/requirements-dev.txt
```

```powershell
# Windows — the BLE logger. This one cannot live in WSL.
pip install -r setup\requirements-daq.txt
```

Verified working versions (2026-08-16): numpy 2.4.4, scipy 1.17.1, pandas 3.0.2,
matplotlib 3.10.8, pytest 9.1.1 in WSL; bleak 3.0.2 on Windows Python 3.12.

Note: this WSL Python is externally managed (PEP 668), so a bare
`pip install -r ...` is refused. The analysis packages are already present
system-wide; if you need to add one, either use a venv or pass
`--break-system-packages`. The requirements files are the authoritative list
either way.

## Node

```bash
npm install          # playwright-core, for headless screenshots
npm run shot -- page.html --out shot.png --theme both --full
```

`setup/screenshot.mjs` drives the Chromium headless shell already cached in
`~/.cache/ms-playwright/`. It uses `playwright-core` with an explicit
`executablePath` rather than the full `playwright` package, because installing
browsers and system libs on this box needs a password. As of 2026-08-16 the
shell runs without the `LD_LIBRARY_PATH` workaround that used to be needed.

## Command-line tools

**`anydoc`** — converts PDFs and office documents to Markdown. Used for the
vendor datasheets in [`sensors/datasheets/`](../sensors/datasheets/).

```bash
npm install -g @firecrawl/anydoc
anydoc "sensors/datasheets/WT9011DCL-BT50 Communication Protocol.pdf"
```

Preferred over `pypdf` because it keeps word spacing intact — `pypdf` runs
words together (`Settingbandwidth`, `FFAA1F0100`) and extracts no tables. It is
*not* faster than pypdf on these files despite the marketing claims, and its
table extraction sometimes absorbs page footers, so check critical values
against the source PDF.

## Where data lives

Recorded sessions are **not** in the repo. The logger writes to
`%USERPROFILE%\bar-data` on Windows, which WSL reads at
`/mnt/c/Users/<you>/bar-data/`. See [Sensor DAQ](../kb/tooling/Sensor%20DAQ.md)
and [WT9011 Setup](../kb/tooling/WT9011%20Setup.md).

## Other

`review.sh` runs the repo's code-review skill — see
[Code Review Skill](../kb/tooling/Code%20Review%20Skill.md).
