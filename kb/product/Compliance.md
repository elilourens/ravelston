---
tags: [compliance, hardware, product, legal]
---

# Compliance

What it legally takes to sell a pair of BLE barbell pods, costed and sequenced.

Research 2026-08-16, ~50 sources. **Research, not legal advice** — verify every
figure against the primary source before spending against it.

---

## 0. The headline

**~£19,000 and ~10 weeks to legally sell 100 units in Great Britain.** Roughly
half of that is one line item nobody expects: the Bluetooth SIG fee.

The radio testing — the thing everyone worries about — is the *cheap* part if
the module is chosen correctly. Choosing it wrongly costs £9k–£34k.

---

## 1. ⚠️ The module decision, which is urgent

[[Stage 1 Shopping List]] recommends the **Seeed XIAO nRF52840 Sense**. On
compliance grounds it looks like the wrong choice, for two independent reasons.

### Its FCC grant excludes our use case

The grant for FCC ID `Z4T-XIAONRF52840` states:

> "Antennas must maintain a **separation distance of at least 20 cm from all
> persons**."
>
> "**Installation of this device into portable RF Exposure category host
> devices requires the submission of a Class II permissive change or new
> application.**"

A pod clamped to a barbell sits **0–10 cm under the lifter's hands**. That is
the *portable* category. The grant as written does not cover it.

### Its RED evidence is thin

Seeed states only that the board "has CE, AOC and FCC certification" and links a
download bundle. That is not an accredited EN 300 328 V2.2.2 report + EN 301
489-17 report + EU DoC + written integration instructions.

**Per REDCA TGN 01, without those documents in hand you get zero evidence reuse
and owe the full campaign** — £14k–£44k instead of £4k–£10k.

### What to demand from any module vendor

1. Full **EN 300 328 V2.2.2** test report
2. **EN 301 489-17** report
3. **EU DoC** naming the module
4. Written **antenna keepout / integration instructions**
5. Current **Bluetooth QDID**
6. An **FCC grant covering portable RF-exposure hosts at 0 mm separation**

If any is missing, walk. Vendors that ship complete RED files as standard:
**Raytac MDBT50Q**, **Fanstel BT840**, **Insight SiP ISP1807**, **u-blox
NORA-B1 / ANNA-B112**, **Ezurio/Laird BL654**.

> **A module costing £2 more per unit that ships a complete RED file is the
> cheapest £9,000 you will ever spend.**

---

## 2. The seven decisions to make before laying out a PCB

Each is free now and expensive later.

| # | Decision | What it saves |
|---|---|---|
| 1 | Module chosen on **paperwork**, not price (§1) | £9k–£34k |
| 2 | Buy a cell with **UN 38.3 + IEC 62133-2 already certified**, protection circuit on the cell's own tab PCB. **Do not build a pack** | ~£10k and 12 weeks |
| 3 | **User-replaceable cell** — four screws and a JST connector | Avoids a full redesign before Feb 2027 (§5) |
| 4 | **Lock BLE TX power to 0 dBm** in firmware and document it | Guarantees the EU 20 mW EMF exclusion and the FCC SAR exclusion |
| 5 | **LE Secure Connections pairing, no default credentials, signed OTA or no OTA** | €0 vs €40,000 (§4) |
| 6 | **Antenna keepout respected; no LiPo pouch behind the chip antenna** | The commonest cause of a failed final-product EIRP test |
| 7 | **Marks etched or moulded into the enclosure**, not stickers | No display = no e-labelling; a sticker won't survive chalk and sweat |

---

## 3. There is no EU modular approval

This is the opposite of the FCC position and the most misunderstood point in
hardware compliance.

> "There was no certification of the radio module and there is no certification
> of the final radio product, so there is no certification to transfer from the
> module to the host." — ACB Europe

But RED forbids reusing *approvals*, not *evidence*. With a complete module test
file you can skip roughly half the campaign:

| EN 300 328 test | Reuse module data? |
|---|---|
| Duty cycle, Tx-sequence, Tx-gap | ✅ skip |
| Hopping sequence and separation | ✅ skip |
| Medium utilisation, adaptivity (LBT) | ✅ skip |
| Occupied channel bandwidth | ✅ skip |
| Power spectral density (conducted) | ✅ skip |
| **RF output power / EIRP** | ❌ **repeat** — enclosure, ground plane, battery all detune the antenna |
| **Radiated Tx/Rx spurious emissions** | ❌ **repeat** |
| **EN 301 489-1/-17, all of it** | ❌ **full test on the finished product** |

Full campaign ≈ 7–9 chamber days. Reduced ≈ 3–4.

| | Full | Reduced | Saving |
|---|---|---|---|
| EN 300 328 | £3,400–12,800 | £1,200–2,500 | £2,200–10,300 |
| EN 301 489 | £3,400–10,200 | £2,400–4,700 | £1,000–5,500 |
| EN 62368-1 | £4,300–12,800 | £700–2,000 | £3,600–10,800 |
| SAR/EMF | £2,600–8,500 | £0–800 | £2,600–7,700 |
| **Total** | **£13,700–44,300** | **£4,300–10,000** | **≈£9,400–34,300** |

### The free win: EN 62479 / EN 50663

The low-power exclusion is **20 mW**. The XIAO's granted power is **3.2 mW** —
6× under. **No SAR test in the EU or UK**, just a 2–4 page paper assessment.
Labs quote €3,000–€10,000 *per SAR configuration*; with two pods and two body
positions that's €12k–€40k avoided.

⚠️ **This does not transfer to the US** — see §6.

---

## 4. RED cybersecurity is the biggest 2026 wildcard

Binding since **1 August 2025** (Articles 3.3(d)/(e), EN 18031-1/-2).

Our pod connects to a phone app that connects to the internet and handles data
tied to a user account, so **assume both apply**.

The OJEU citation carries restrictions, and **where restrictions apply a
Notified Body is required**. A BLE pod with *no authentication* — pair and
stream, the default — sits inside the restricted region.

| Route | Cost |
|---|---|
| Self-assessment in-house | **€0–€8,000** |
| Accredited third-party lab | €15,000–€40,000 |
| Notified Body | €40,000–€100,000+ |

**Mitigation must happen before design freeze** (§2 item 5). Retrofitting
security into a shipped BLE profile is an OTA-fleet problem you cannot solve
without an OTA mechanism.

**UK is far lighter**: RED 3.3 is EU-only. GB applies **PSTI** instead — see §7.

---

## 5. Batteries: one design constraint that bites in 2027

### EU Battery Regulation 2023/1542, Article 11

From **18 February 2027**, portable batteries must be *"readily removable and
replaceable by the end user at any time during the lifetime of the product"*,
with spares available for **five years** after the last unit ships.

**A sealed pod launched in 2026 is a product you must redesign in 2027.**

The wet-environment exemption is read narrowly by the Commission — sweat
exposure is *not* the same as "splash water, water jets or underwater
conditions regularly prevail". **Do not bet the product on it.**

The fix costs nothing now: **four screws and a JST connector.** It also gives
you a spare-parts revenue line and a repairability story.

Also: labelling from **18 Aug 2026**, QR code from **18 Feb 2027**.

⚠️ **The UK has no removability mandate.** Build for GB only and you rebuild
before you can export.

### UN 38.3 and shipping

Buy a **finished protected cell** and you inherit the vendor's UN 38.3 — £0.
Add your own BMS inside the pack and you've made a new battery assembly:
**£4,000–£5,500** and 4–6 weeks.

**Demand the UN 38.3 Test Summary in writing before placing a production
order.** Without it freight forwarders will not move the goods.

Two pods per box = 2 cells = inside the **PI 967 Section II ≤4-cell exemption**,
so no lithium battery mark needed. Don't put four boxes in one carton and lose
it.

| Carrier | Reality |
|---|---|
| **Royal Mail** | UK domestic only, cells installed in equipment only. Parcels with prohibited batteries are **destroyed with no recourse** |
| **DPD** | Lithium **prohibited** on standard UK inland parcel services |
| **DHL Express** | **Accepts** as restricted commodity — use this for anything crossing a border |

⚠️ **From 1 January 2026, lithium cells packed with equipment must be shipped at
≤30% state of charge by air.**

---

## 6. US: the SAR asymmetry

Using a certified module, you don't get your own FCC ID for the radio. But:

1. **KDB spurious investigation on the composite system** — required
2. **Part 15B unintentional-radiator testing of the host** — required
3. Both can be **self-declared under SDoC** — no TCB, no filing fee
4. ⚠️ **The responsible party must be a US resident** — £800–£2,400/yr, hard blocker

**The SAR trap:** the FCC reduced the Bluetooth SAR exclusion threshold at
2450 MHz from 10 mW to **3 mW** for separations ≤5 mm. At 3.2 mW we are
marginally over; at +8 dBm clearly over.

**Fix: lock TX power to 0 dBm, or pick a module whose grant already covers
portable body-worn use.** The second costs nothing at design time and is the
correct answer.

US total, module route: **£2,750–£8,650**.

⚠️ **E-labelling is unavailable** (needs a display). Etch or mould
`Contains FCC ID: […]` into the housing.

---

## 7. UK PSTI — cheap, mandatory, and routinely missed

The **PSTI Act 2022** has applied since **29 April 2024** and explicitly covers
network-connectable products including *"connected fitness trackers"* over
Bluetooth.

> ⚠️ **Revised 2026-08-17 — we are probably out of scope, and it's our choice.**
> s.5's two gateways both fail for a plain BLE peripheral: the first needs an
> **IP-suite protocol** (BLE GATT is not IP), the second needs capability to
> connect to **two or more products at the same time**. One link at a time to
> one phone is outside PSTI; sequential pairing doesn't count, because the test
> is *simultaneous*. **But BLE SoCs support concurrent links, so enabling two in
> firmware puts us straight back in scope.** Decide it deliberately and record
> the decision. See [[White-Label Route]] §5.

Three duties: no universal default passwords; a published vulnerability
disclosure policy; a published **minimum security update period**. Plus a
statement of compliance with the product.

**Cost: ~£0 and about two days of writing.** Penalties: **up to £10m or 4% of
global turnover**, plus £20,000/day for continuing contraventions.

The cheapest possible way to be non-compliant in your home market.

---

## 8. Bluetooth SIG — the biggest single line

Not a government requirement. It's a **trademark licence**: to use the word
"Bluetooth", the logo, or an assigned identifier, you must be a member with a
qualified product listing. Retailers ask for the Declaration ID.

**2026 fee schedule, effective 1 March 2026:**

| Tier | Dues | Product Qualification Fee |
|---|---|---|
| **Adopter** | **£0** | **$12,000 (~£9,500)** |
| Contributing Adopter (small) | $3,500/yr | $8,000 first, then $12,000 |

⚠️ **The widely-cited "$8,000 declaration fee" is out of date** — renamed the
Product Qualification Fee in July 2024, and rising to $12,000.

⚠️ **Using a module with an existing QDID does NOT waive the fee.** It removes
the *testing*, not the *fee*.

Good news: **one payment covers both pods and future SKUs on the same design.**

Buy it **last** — Receipt Numbers now expire six months after payment.

---

## 9. WEEE, EPR and the per-country problem

**UK is trivial:**

| | Threshold | Cost |
|---|---|---|
| WEEE small producer | <5 t/yr | **£30/yr** |
| Battery small producer | ≤1 t/yr | **£30/yr** |
| Packaging EPR | <£1m turnover or <25 t | **£0** |

**Total UK environmental compliance: £60/year** plus a wheelie-bin symbol on the
housing.

**The EU is where it gets expensive, and it is per country.** A UK seller
generally cannot register directly — you need an Authorised Representative in
each member state, for each waste stream.

| Scope | Annual |
|---|---|
| **3 countries (DE, FR, NL)** | **£2,600–£5,100** |
| **All EU27** | **£21,000–£46,000** |

> **"Sell to the EU" is not one decision. Pick three countries.** EU27 costs
> 5–10× more and buys very little at low volume.

Separately, an **EU Authorised Representative** for Art. 4 / GPSR is
**£130–£470/yr** — the cheapest item on this whole list and the hardest blocker.
Missing it is *the* most common cause of Amazon EU delistings.

**One GB simplification worth knowing:** CE marking is recognised in Great
Britain **indefinitely** for radio equipment since Oct 2024. One campaign covers
both markets; a UKCA DoC is paperwork, not a second test.

---

## 10. Insurance — disclose the hazard

Comparison sites advertise product liability from ~£65/yr. Those prices are for
low-hazard goods. Ours is:

- A **falling/projectile object** on a loaded barbell, near a head
- Used during maximal lifts where the failure mode is releasing mid-rep
- Containing a **lithium cell** subject to repeated impact and sweat

**Realistic band: £600–£2,500/yr** for £2m–£5m, broker-placed, properly
disclosed. Buying a mis-declared £65 policy means buying one that voids when you
need it.

⚠️ **Most UK policies automatically exclude the US and Canada**, and US cover
runs roughly 10× UK pricing. Add it explicitly before the first US order.

**Underwriting hygiene that also reduces real risk:** documented pull-off and
drop testing, a **secondary retention feature** (lanyard or captive collar) so
the pod cannot become a projectile, explicit warnings, and **batch traceability**
linking every pod to a cell lot.

---

## 11. Costs, three scopes

| | UK only | UK + EU | UK + EU + US |
|---|---|---|---|
| **One-off, realistic** | **£19,000** | **£24,000** | **£29,000** |
| One-off, best case | £15,200 | £15,400 | £18,100 |
| One-off, worst case | £30,000 | £75,000+ | £90,000+ |
| **Annual (3 EU countries)** | **£660–1,560** | **£3,460–7,630** | **£6,090–16,030** |
| Annual (all EU27) | — | £21,860–48,530 | £24,490–56,930 |
| **Weeks to first legal sale** | **~10** | ~14 | ~18 |

Worst case assumes a Notified Body for cyber, a SAR test, and one PCB respin.

---

## 12. The cheapest legal path to first revenue

**Sell the first 100 units in Great Britain only, direct from your own site,
with a design that is already EU- and US-ready.**

**Phase 0 — before laying out a PCB.** The seven decisions in §2. Two weeks,
£0, worth more than every later phase combined.

**Phase 1 — GB launch, 8–10 weeks, £15,000–19,000.** Pre-compliance day →
EN 301 489 full + EN 300 328 reduced → paper assessments → CE mark + both DoCs
→ PSTI statement → WEEE/battery registration (£60) → insurance → DHL account
with DG acceptance → **Bluetooth SIG last**.

**Skip Amazon for the first 100.** Marketplace compliance gates are the largest
single source of delisting pain and you don't need them at that volume.

**Phase 2 — EU, only once GB is proven.** +£5,000 one-off, +£2,700–5,600/yr.
Appoint the AR *before shipping a single unit*. Pick three countries.

**Phase 3 — US.** +£2,000–5,100 one-off, +£3,300–10,400/yr. The real cost is
the product liability extension, not the FCC work.

---

## 13. What not to cut

1. **Bluetooth SIG (£9,500).** Tempting because no border checks it. The only
   legal alternative is never writing "Bluetooth" anywhere — packaging, app,
   website, manual — and calling it "2.4 GHz wireless".
2. **EN 301 489 immunity on the finished product.** No module report ever covers
   it. ESD is exactly what a chalky hand on a dry gym floor produces.
3. **Honestly-disclosed product liability.** Liability is *strict* under the
   Consumer Protection Act 1987 — the claimant needn't prove carelessness.
4. **The EU Authorised Representative.** €150/yr, and without it every EU sale
   is unlawful.
5. **UN 38.3 evidence and a written carrier DG agreement**, before pre-orders.
6. **Mechanical retention testing and a secondary retention feature.** Not a
   regulatory requirement — the one that decides whether there's a business in
   three years.
7. **Batch traceability.** Without it, one bad cell lot means recalling
   everything ever sold.
8. **The user-replaceable battery.** Not cuttable, only deferrable — and
   deferring means new tooling before Feb 2027.

---

## Key sources

- REDCA TGN 01 v1.2a — https://www.redca.eu/Unrestricted%20Documents/TGN/REDCA%20TGN%2001%20RED%20Radio%20equipment%20modules%20V1.2a%20March%202020.pdf
- ACB Europe on radio modules — https://acbcert.com/radio-modules/radio-enabled-products-using-radio-modules/
- FCC KDB 996369 D04 Module Integration Guide
- XIAO nRF52840 FCC grant — https://fccid.io/Z4T-XIAONRF52840
- Bluetooth SIG fee schedule — https://www.bluetooth.com/fee-schedule/
- EU Battery Regulation removability guidance C/2025/214
- UK PSTI — https://www.gov.uk/government/collections/the-product-security-and-telecommunications-infrastructure-psti-act
- CE recognition extended in GB — https://www.conformance.co.uk/ce-mark-recognition-extended-indefinitely-by-uk-government
- SparkFun's real certification invoice — https://news.sparkfun.com/3124
