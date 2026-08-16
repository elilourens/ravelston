---
tags: [hardware, prototype, shopping]
---

# Stage 1 Shopping List

Parts for the [[Hardware Roadmap]] Stage 1 prototype: two battery-powered
XIAO nodes replacing the WitMotion units. Prices checked 2026-08-12.

## Board decision

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
| 8 | Kapton tape 10 mm + 3M foam mounting tape | Amazon | ~$12 |
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
- **Mount**: magnets + athletic tape on the flat bar-end face for
  validation; defer the printed 50 mm press-fit cap to a print service
  (JLC3DP / Craftcloud, $1–5/part) once the fit dimensions are settled —
  no printer on hand, and press-fits take iterations.
- **Skipped**: slide switch (firmware deep-sleep covers it), dedicated PD
  charger, solder station extras.
