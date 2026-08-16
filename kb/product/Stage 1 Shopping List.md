---
tags: [hardware, prototype, shopping]
---

# Stage 1 Shopping List

Parts for the [[Hardware Roadmap]] Stage 1 prototype: two battery-powered
XIAO nodes replacing the WitMotion units. Prices checked 2026-08-12.

## Board decision

> ⚠️ **Fine for Stage 1 bench work. Probably wrong for a sellable product** —
> see [[Compliance]] §1. Two independent problems:
>
> 1. Its **FCC grant requires 20 cm separation from persons** and states that
>    installation into a portable RF-exposure host needs a new application. A
>    pod under a lifter's hands is 0–10 cm.
> 2. Seeed publishes no accredited **EN 300 328 / EN 301 489-17 reports or EU
>    DoC**. Without those, no evidence reuse is permitted under REDCA TGN 01 —
>    the full test campaign costs **£14k–£44k instead of £4k–£10k**.
>
> Before committing to a module for the *product*, evaluate **Raytac MDBT50Q**,
> **Fanstel BT840**, **Insight SiP ISP1807**, **u-blox ANNA-B112** or
> **Ezurio BL654**, all of which ship complete RED files. Buying three XIAOs to
> prototype with is still the right call today.

**Seeed XIAO nRF52840 Sense**, over the other Stage 1 options:

- Onboard **LSM6DS3** — the exact IMU named in the FINDINGS production path,
  samples well above the 400 Hz internal target.
- **Nordic nRF52840** radio → sub-µs radio time-sync is available, which the
  sub-ms inter-unit sync requirement effectively demands. Rules out ESP32.
- IMU + BLE + **LiPo charger (BQ25101)** + USB-C on one 21×17.8 mm board —
  assembly is literally two solder joints per node.
- Cheapest per node (~$13.47 in the 3-pack) and sold in volume trays, so it
  stays a candidate for Stage 3a.
- Nano 33 BLE Sense Rev2 has a nicer IMU (BMI270) but costs 3× and is
  physically larger; Feather Sense is bigger and pricier with the same chip.

## The list

| # | Item | Source | Price |
|---|------|--------|-------|
| 1 | XIAO nRF52840 Sense **3-pack** (2 nodes + spare) | [Seeed direct](https://www.seeedstudio.com/Seeed-Studio-XIAO-nRF52840-Sense-3PCS-p-5922.html) | $40.41 |
| 2 | 2× LiPo 3.7 V **protected**, JST-PH leads — Adafruit 350 mAh (36×20×5.2 mm) or EEMB 502030 250 mAh | [Adafruit #2750](https://www.adafruit.com/product/2750) $6.95 ea / [EEMB on Amazon](https://www.amazon.com/EEMB-Battery-Rechargeable-Lithium-Connector/dp/B08FD3V6TF) | ~$14 |
| 3 | 2× JST-PH 2-pin female pigtail (solder to BAT pads so batteries stay pluggable) | Adafruit #261 or any JST-PH kit | ~$2 |
| 4 | **Pinecil V2** soldering iron (USB-C PD) | [Pine64 store](https://pine64.com/product/pinecil-smart-mini-portable-soldering-iron/) | $25.99 |
| 5 | Rosin-core solder, 63/37 leaded, 0.8 mm, small spool | Amazon | ~$9 |
| 6 | Flush cutters + fine tweezers | Amazon (often bundled) | ~$8 |
| 7 | Neodymium disc magnets, ~10×3 mm, small pack (validation mount) | Amazon | ~$8 |
| 8 | Kapton tape 10 mm | Amazon | ~$6 |
| 9 | Jubilee clips / hose clamps to fit a ~28 mm shaft | Any hardware shop | ~$5 |
| | **Total** | | **≈ $120** |

Within the roadmap's $50–100 Stage 1 estimate once the ~$45 of tools
(iron, solder, cutters) is set aside as one-off equipment.

## Notes

- **Pinecil power**: it needs a USB-C PD supply (≥45 W for full heat) — a
  laptop charger works; don't buy one specially without checking.
- **Battery leads**: solder a JST pigtail to the XIAO's underside BAT+/BAT−
  pads rather than the battery wires directly — batteries become swappable
  and re-soldering never touches the cell. Trim/solder one lead at a time.
- **Charging**: onboard BQ25101 charges at 50 mA by default (100 mA if
  P0.13 is driven low in firmware) — slow but safe for 250–350 mAh cells.
- **Mount (revised 2026-08-16)**: on the **shaft, inboard of the collars** —
  not the bar-end face, which is the rotating sleeve. See [[MOUNTING]]
  "Intended direction" and [[Kinematics Pipeline]] §7. Two magnets in line
  along the bar axis on the contact line, or a jubilee clip for a
  glue-free rigid mount.
  **No foam tape, no athletic tape, no VHB, no Blu-tack** — anything soft in
  the load path becomes a spring and you measure the mount instead of the bar.
  That is the session-1 failure. Kapton is thin enough to be acceptable;
  foam is not.
  The printed 50 mm press-fit cap is retired with the bar-end concept.
- **Skipped**: slide switch (firmware deep-sleep covers it), dedicated PD
  charger, solder station extras.
