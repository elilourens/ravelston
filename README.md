# Ravelston

A gym performance tracker built around two sensors that mount on either side of a barbell or dumbbell (and can attach to other machines). Using their internal sensors, they measure:

- **Range of motion** — how deep and complete each rep is
- **Technique** — bar path, tilt, and symmetry between the two sensors
- **Rest time** — time between sets, tracked automatically
- **Weight** — an estimate of the load on the bar

## Repo structure

| Folder | Purpose |
| --- | --- |
| [`marketing-site/`](marketing-site/) | Public-facing marketing website |
| [`app/`](app/) | The companion app |
| [`research/`](research/) | Sensor research, signal processing, and experiments |
| [`sensors/`](sensors/) | Host-side sensor code — BLE acquisition now, custom firmware later |
| [`kb/`](kb/) | Knowledge base — shared reference docs and notes |
| [`scratch/`](scratch/) | Throwaway prototypes and one-off explorations |
| [`setup/`](setup/) | Environment and tooling setup — **[dependencies and which machine needs what](setup/README.md)** |
