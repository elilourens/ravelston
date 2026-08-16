# Ravelston

A gym performance tracker built around two sensors that mount on either side of
a barbell or dumbbell (and can attach to other machines). Using their internal
sensors, they measure:

- **Range of motion** — how deep and complete each rep is
- **Technique** — bar path, tilt, and symmetry between the two sensors
- **Rest time** — time between sets, tracked automatically
- **Weight** — an estimate of the load on the bar

The whole business lives in this repo — research, product, go-to-market and the
notes behind all three.

## Repo structure

| Folder | Purpose |
| --- | --- |
| [`rnd/`](rnd/) | **Finding out what's true.** Sensor acquisition, signal processing, datasheets. |
| [`product/`](product/) | **The thing we sell.** The companion app; firmware when it exists. |
| [`gtm/`](gtm/) | **Reaching customers.** The marketing site. |
| [`kb/`](kb/) | **Every written note** — an Obsidian vault. Prose only; see below. |
| [`setup/`](setup/) | Environment and tooling — **[dependencies and which machine needs what](setup/README.md)** |
| [`scratch/`](scratch/) | Throwaway. Anything here can be deleted without loss. |
| [`.agents/`](.agents/) | Skills and instructions that apply to any agent working in this repo. |

### Where does a new file go?

Four questions, in order — the first "yes" wins:

1. **Is it prose you'd want to link to from other notes?** → `kb/`, under the
   matching subfolder (`kb/rnd/`, `kb/product/`, `kb/gtm/`, `kb/tooling/`).
   The exception is `README.md`, which always stays beside the code it
   documents.
2. **Is its purpose to find out whether something is true?** → `rnd/`.
   It can become obsolete once you know the answer.
3. **Is it, or does it define, the thing customers get?** → `product/`.
4. **Is it aimed at a customer?** → `gtm/`.

Otherwise it's `scratch/`, and you should be willing to delete it.

**The migration rule:** when something in `rnd/` starts shipping, it moves to
`product/`. Today's `rnd/sensors/daq` is a prototype logger; the firmware that
replaces it will be product code.

### Notes vs code

`kb/` is an Obsidian vault and holds **only prose**. Its subfolders mirror the
top-level categories, so `kb/rnd/` holds the research write-ups while `rnd/`
holds the code that produced them. Notes cross-reference with Obsidian wiki-style links, which resolve by
filename and so survive being moved.

## Start here

- [`setup/README.md`](setup/README.md) — what to install, and on which machine
- [`kb/rnd/FINDINGS.md`](kb/rnd/FINDINGS.md) — the physics the product rests on
- [`kb/tooling/WT9011 Setup.md`](kb/tooling/WT9011%20Setup.md) — configuring the sensors
- [`AGENTS.md`](AGENTS.md) — how agents should behave in this repo
