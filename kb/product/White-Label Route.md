---
tags: [product, compliance, manufacturing, strategy]
---

# White-Label Route

Can we skip building hardware — buy a finished certified sensor, put our logo
on it, and sell it with our app?

**Short answer: legally yes, and cheaper than building. But no barbell product
exists to rebrand, and the one candidate that fits has no EU evidence.**

Companion to [[Compliance]] (which costs the build-your-own route) and
[[Scaling]] (which costs going from 10 to 1,000).

---

## 1. The product does not exist

Searched Alibaba, Made-in-China and Global Sources. **Zero white-label barbell
or VBT sensors.** Alibaba's own "velocity-based training device manufacturer"
page lists 17 suppliers — GPS football vests, sprint timers, sleds,
foot-pressure treadmills — and not one barbell sensor.

Every VBT device on the market (GymAware, Vitruve, Enode, Output, RepOne) is a
proprietary in-house design. Nobody rebadges.

What exists is a **generic cased BLE IMU pod** sold to the industrial and maker
market, which you would rebrand and pair with your own app and mount.

### The candidates

| Product | Verdict |
|---|---|
| **WitMotion WT9011DCL-BT50** | The only real candidate. Cased, 100 mAh, USB-C, 200 Hz, BLE 5.0. **Real FCC grant** — grantee **2AZAR**, ID **2AZARWT9011DCLBT50**, granted 2025-08-12, with a downloadable 2.9 MB RF test report. Explicit OEM/ODM offer. ⚠ **No published CE certificate, no RED report, no notified-body number.** MPU6050/9250 are end-of-life parts; ±16 g is marginal for bar impacts; no IP rating; exposed USB-C |
| Mbientlab MetaMotionS | Better silicon (BMI270, nRF52) but **100 Hz streaming cap**, $130, and **no FCC grant exists for the MMS model** (grantee 2ACEB holds only MMR/MMC/METAR1). Their forum claims CE is "self marked and self declared" and that you needn't recertify in your own case — **that advice is wrong** |
| LP-Research LPMS-B2 | 400 Hz, but Bluetooth 2.1/4.1, **$369**, no certifications listed |
| Minew, Chongqing Jinou, Feasycom | Coin-cell **beacons**, 1-second broadcast. Wrong device class |
| Movella DOT | **No FCC ID found**; no published white-label programme |
| **Guangdong Eternity** | Publishes CE-RED certificate, RoHS, **and the actual RF and EMC reports**. MOQ 500, samples 1–10, 15–30 day lead. Makes screenless wrist bands, no sensor pod — **the candidate for a semi-custom build, not a rebadge** |

⚠ **No MOQ or volume pricing could be verified for anything** — Alibaba returned
HTTP 410 to every fetch. Those numbers need direct RFQs.

---

## 2. Putting your logo on it makes you the manufacturer

No exceptions, no de minimis.

**EU — RED Art. 14** (not Art. 12, which is importer duties):

> *"An importer or distributor shall be considered a manufacturer … where he
> places radio equipment on the market under his name or trade mark **or**
> modifies radio equipment …"*

Note the disjunctive "or". **Branding alone is sufficient.**

**GB — Radio Equipment Regulations 2017, reg. 36** says the same thing in the
same shape.

**Blue Guide 2022 §3.1** confirms it covers labelling specifically, and that you
take *"the entire responsibility for the conformity assessment (design and
production) … even if this has been actually done by somebody else."*

The ODM's address comes **off** the product. Yours goes on.

### You are an importer either way

Buying direct from Shenzhen makes you the **importer** for GB and the EU — not a
distributor. You only become a distributor by buying from someone who has
already placed the goods on the UK or EU market.

That matters for [[#5 · Liability]]: as importer you are strictly liable anyway,
so rebranding costs you nothing extra on that axis.

---

## 3. But you can reuse their evidence — and this is the good news

**Blue Guide 2022 §3.1**, continuing directly:

> *"he must be in the possession of all documentation (such as the technical
> documentation including any relevant test reports) and certificates necessary
> to demonstrate the conformity of the product, **but these do not need to be
> under his name**. In such cases, it must be clear that the documentation and
> certificates demonstrate compliance of the specific product placed on the
> market."*

**There is no legal requirement to retest a product you have not changed.** You
need *possession* of the evidence plus a demonstrable link to the exact SKU you
ship.

The file need not physically live with you either — an on-demand or escrow
clause is acceptable. But relying on it is a commercial risk: when OPSS asks,
you are on the hook, not a factory that stopped answering email.

### There is no EU "permissive change" scheme

Unlike the FCC's Class I / Class II permissive changes, RED gives a **binary "is
this a new product?" test, resolved by your own documented risk assessment**. No
form, no fee, nobody to ask for a blessing. Fast and free when you're right,
entirely your liability when you're wrong.

### ⚠ Correction: REDCA TGN 01 is not about rebranding

A full-text search of TGN 01 v1.2a found that **"brand", "rebrand", "private
label", "OEM", "own name", "trade mark" and "reuse" do not appear anywhere in
it.** Its subject is integrating a radio *module* into a final product — which
is what [[Compliance]] §1 cites it for, correctly. It is **not** authority on
private-label reuse, and **no REDCA TGN on rebranding exists.** If a consultant
cites it that way, they haven't opened it.

TGN 01 is still the best statement of the reuse *principle* in a radio context,
and it is more cautious than people expect: reuse is *"at the discretion and
responsibility of the manufacturer of the final radio product."* It is also
where the trade's favourite aphorism comes from — **"CE + CE ≠ CE."**

---

## 4. What breaks the evidence

The legal test is the Blue Guide's "new product" test, applied case by case.

| Change | Breaks it? | Why |
|---|---|---|
| **Logo, silkscreen, packaging** | **No** | No effect on any essential requirement. Document the reasoning; no retest |
| **Colour of the plastic** | **Usually no — not automatically** | Black masterbatch is carbon-loaded and carbon absorbs at 2.4 GHz; metallic pigments detune outright. Moving from natural/white to black needs written confirmation the antenna was tuned in that material |
| **Enclosure geometry or material** | **Yes** | Directly affects EIRP, spurious emissions and RF exposure. Also breaks EN 62368-1, because the enclosure is a safety barrier |
| **Antenna position or clearance** | **Yes, unambiguously** | The most retest-triggering change there is |
| **Adding magnets** | **Probably** | Treat as an antenna change. Separately: magnet ingestion is a GPSR-level hazard, and magnets in wearables need pacemaker/ICD warnings |
| **Changing the battery cell** | **Yes** | Cell evidence is cell-specific. New EN/IEC 62133-2 and new UN 38.3. Also re-opens EN 62368-1 |
| **Firmware** | **Depends** | Transmit power, duty cycle, channel plan or adaptivity → re-opens EN 300 328. Auth, updates or crypto → re-opens EN 18031. UI changes generally don't |

> **One-line rule:** if a change alters *what the radio emits, where it emits
> from, what surrounds it, or what powers it*, the evidence is gone.

### What this means for our mount

The magnets and finger loop must live in a **separate cradle the pod clips
into**, never on or inside the pod. See [[MOUNTING]].

That's fine legally. The problem is mechanical: a clip-in cradle adds two
compliant interfaces between bar and IMU, and anything soft in the load path
becomes a spring. Fine for reps, tempo and velocity. **Probably fatal for whip**,
which is a 2–25 Hz bending measurement at ζ ≈ 0.001–0.005. Bench-test it: tap
the bar and read the ring-down. ζ of 0.05–0.2 means you measured the plastic.

---

## 5. PSTI probably does not apply — and that's a firmware decision

PSTI Act 2022 s.5 has two gateways:

- **Internet-connectable** — capable of connecting to the internet using an IP
  suite protocol. Plain BLE GATT is not IP, so **fails**.
- **Network-connectable** — needs either a direct IP connection (fails again),
  **or** capability to connect directly to **two or more products at the same
  time**.

> **A BLE peripheral holding one connection at a time to one phone falls outside
> PSTI.** Sequential pairing with several phones does not count — the statutory
> test is *simultaneous*.

⚠ **But modern BLE SoCs support multiple concurrent links.** If firmware
*enables* two simultaneous connections — one sensor relaying for another, or
links to phone and watch at once — you drop straight into scope. **This is a
firmware configuration decision with a direct legal consequence.** Decide it
deliberately and record the decision.

Penalties if in scope and wrong: **£10m or 4% of worldwide turnover**, plus
£20,000/day continuing. Duties fall on manufacturers, importers **and**
distributors — so staying an importer does not dodge it.

This revises [[Compliance]] §7, which assumed we were in scope.

---

## 6. EN 18031 is the biggest technical risk

RED cybersecurity has applied since **1 August 2025** under Delegated Regulation
(EU) 2022/30.

**Art. 3(3)(e)** applies **irrespective of internet connection** to *"wearable
radio equipment"* — defined as designed to be *"worn on, strapped to, or hung
from any part of the human body or clothing."*

> A sensor that **straps to a body** is squarely in scope. A sensor that
> **clamps to equipment** is arguable. That distinction is worth engineering and
> marketing around deliberately — it decides whether the whole EN 18031 problem
> applies to us.

⚠ **The trapdoor.** EN 18031-1/-2/-3:2024 were cited in the OJ on 28 January
2025 **with restrictions**. Clauses 6.2.5.1 and 6.2.5.2 permit a design where
the user need not set a password; the Commission says conformity *"would not be
ensured"* if that option is implemented.

The consequence chain: restricted case → lose presumption of conformity →
standards only "partially applied" → **RED Art. 17(4) forces Annex III or IV →
notified body EU-type examination.** That converts a self-declared product into
a certified one: **£10,000–£25,000 and 6–12 weeks.**

Still unamended as of Implementing Decision (EU) 2025/2499. Sunsets 11 December
2027 when the CRA takes over.

---

## 7. The 18 February 2027 battery deadline may kill the rebrand outright

EU Battery Regulation Art. 11: portable batteries must be *"readily removable
and replaceable by the end user"*, spares available 5 years, any special tool
supplied free.

**Most sealed Chinese sensor pods are glued or ultrasonically welded with a
soldered LiPo.** If ours is, and we place units on the EU market after 17
February 2027, we need either a defensible Art. 11(3) wet-environment derogation
or a mechanical redesign — **and a redesign takes us out of §3's "reuse
everything" and into §4's "retest everything".**

Discover this before buying inventory, not after.

---

## 8. Liability — rebranding costs nothing we don't already owe

**UK, CPA 1987 s.2(2):** strict liability falls on the producer, on *"any person
who, by putting his name on the product … has held himself out to be the
producer"*, **and** on any person who imported it into the UK in the course of
business.

So s.2(2)(b) catches us as own-brander and s.2(2)(c) catches us as importer
anyway. **Importing direct from China means strict liability either way.**
Rebranding only adds liability if we'd otherwise buy from a UK or EU stockist.

A **pure distributor** escapes almost entirely under s.2(3) — liable only if
they fail to identify their supplier on request.

**EU, new PLD 2024/2853**, transposition 9 December 2026:

- Art. 8(1)(a) treats an own-brander as manufacturer
- **Software is expressly a product**, including SaaS and cloud (Recital 13)
- **The €500 lower threshold is removed entirely** — small claims become viable
- Defectiveness now expressly includes **cybersecurity** and post-market updates
- A liability cascade runs manufacturer → importer / AR → fulfilment → distributor

Our recourse is a contractual indemnity against a Chinese entity, enforceable in
a Chinese court. Worth less in practice than it reads. **Product liability
insurance is not optional** — £1,000–£3,000/yr for £2m–£5m cover *(estimate)*.

---

## 9. "CE certificates" are meaningless by design

**There is no such thing as a CE certificate.** The Commission's own page says
CE marking *"does not indicate that a product has been approved as safe by the
EU or by another authority."*

The RED Guide is blunter: the DoC is *signed by the manufacturer*; lab and
notified-body documents are signed by the lab or body, and the two must not be
confused.

And for a BLE device applying harmonised standards in full, **RED Art. 17
requires no notified body at all**. So a supplier presenting a glossy "CE
Certificate" with a four-digit number is showing a document that is either not
required, not a legal instrument, or not from a notified body.

> The "China Export" logo story has circulated for two decades. **There is no
> such registered mark and no legal basis for it.** Malformed CE logos are sloppy
> artwork, not a covert scheme. Don't measure logo proportions — audit documents.

### Verification checklist

1. **Full test reports, not certificates.** REDCA maintains two notes on exactly
   this failure mode — TGN 18 *"Guidance on real test results in test reports"*
   and TGN 21 *"Guidance for Report Checking"*. That tells you how endemic
   padded and copied reports are
2. **Check the reports describe *our* device** — photos, model, PCB revision,
   firmware version, antenna type, battery part number. Reports for a cousin
   product are the commonest defect and the hardest to catch
3. **Verify the lab's ISO/IEC 17025 certificate *and its scope annex*** against
   CNAS/UKAS/A2LA directly — a lab accredited for something else is a common trick
4. **Look up any notified body number** in the Single Market Compliance Space
   (NANDO's replacement), and confirm it's notified **specifically under
   2014/53/EU**. Then ask why one was involved at all
5. **Cross-check public registries** — an FCC ID lookup gives the full US test
   reports, internal photos and block diagrams free. A Bluetooth SIG QDID lookup
   confirms the radio design is qualified
6. **Check the DoC against RED Annex VI.** Red flags: standards without version
   years; withdrawn standards; a notified body cited where none is needed;
   signature by a test lab rather than the manufacturer

---

## 10. What to demand from WitMotion

The FCC file is genuinely valuable — a real accredited lab measured a real
sample, and the public exhibits give internal photos, block diagram, antenna
description. It confirms the supplier is serious.

**It cannot substitute for RED evidence.** The regimes don't overlap enough:

- EN 300 328 tests **adaptivity/DAA, medium utilisation, duty cycle and receiver
  blocking**. Receiver performance is a RED Art. 3(2) requirement with **no FCC
  analogue at all**
- **FCC has no immunity requirement** — EN 301 489 immunity has no counterpart
- No EU-form RF exposure evidence, no EN 62368-1, no battery evidence
- **No EN 18031 assessment whatsoever** — mandatory in the EU since 1 Aug 2025

### The twelve-item list

1. **EU DoC** signed by WitMotion, RED Annex VI compliant, standards **with
   years**, for the exact model
2. Full **EN 300 328** report — specifically the adaptivity, medium utilisation
   and **receiver blocking** sections
3. Full **EN 301 489-1 and -17** — **emissions *and* immunity**
4. **EN 62368-1** safety report
5. **RF exposure** assessment (EN 62479 or EN 50663/50665)
6. **EN 18031-1 and -2**, plus a written answer to: *does the design invoke
   clauses 6.2.5.1 or 6.2.5.2, and if so is there a notified body certificate?*
7. **EN IEC 63000** RoHS documentation with supplier declarations
8. **UN 38.3** report and **EN/IEC 62133-2** certificate for the specific cell
9. The lab's **ISO/IEC 17025 certificate and scope annex**
10. **Bluetooth SIG QDID or Declaration ID**
11. **Written licence** to use their evidence for our DoC, an escrow/on-demand
    clause, and a **change-control notification** obligation — a silent BOM or
    firmware change invalidates our file without us knowing
12. Written confirmation on **battery removability** and their Art. 11 plan

### If they can only produce the FCC file

**Conclude they have never done RED, and the product is not lawfully CE-marked**
— whatever CE logo is moulded into the case. Chinese ODMs routinely self-affix
CE on the strength of an FCC grant and a template DoC, and the absence of both a
RED report and a notified-body reference is consistent with exactly that.

Then §3's "reuse everything" evaporates. We'd fund a **full RED campaign
ourselves, £8,000–£20,000 plus EN 18031**, on a device we didn't design, can't
modify, and whose firmware we don't control. If it fails EN 300 328 adaptivity
or EN 301 489 immunity — both plausible for a cheap sensor never designed
against them — the only fix is asking WitMotion to change their firmware, which
they have no obligation and no incentive to do.

> **At that point the rebrand route has lost its entire rationale.** It costs
> what building costs on the certification line, while giving none of the design
> control that would let us fix a failure.

---

## 11. What it actually costs

### Route A — rebrand

**One-off**

| Item | Cost |
|---|---|
| **Bluetooth SIG** — Contributing Adopter (small) dues + first qualification | **$11,500 (~£9,000)** *verified fee schedule*, or $12,000 flat as plain Adopter |
| Technical file review by a compliance consultant | £3,000–8,000 *(est)* |
| Legal review of the supply agreement — IP licence, evidence escrow, indemnity, change control | £2,000–5,000 *(est)* |
| Delta testing if colour or firmware changes | £0–4,000 *(est)* |
| **EN 18031 gap assessment** — and notified body if the 6.2.5.1 restriction bites | £0 clean; **£10,000–25,000 + 6–12 weeks if forced** *(est)* |
| Packaging, artwork, manuals in required languages | £1,500–4,000 *(est)* |

**Recurring**

| Item | Cost |
|---|---|
| EU authorised representative *(required — 2019/1020 Art. 4 covers RED and RoHS)* | £500–2,000/yr *(est — every vendor price failed verification; get three quotes)* |
| Product liability insurance, £2m–5m | £1,000–3,000/yr *(est)* |
| UK WEEE small producer (<5 t) | **~£33/yr** |
| UK battery small producer (<1 t) | **~£32/yr** |
| EU WEEE / battery, 1–2 launch countries | £500–2,000/yr *(est; stiftung ear base is €9.50 per brand × equipment type, but AR fees and B2C insolvency guarantees dominate)* |
| CITEO packaging, France, <10,000 units | **€80/yr** |
| **UK packaging EPR** | **£0 below £1m turnover or 25 t** — the turnover gate is the binding one |

> **All-in first year: £20,000–35,000.** Or **£35,000–60,000** if a notified body
> gets pulled in via EN 18031.

**Timeline: 8–14 weeks** if the evidence is genuine. The critical path is the
document audit and the Bluetooth SIG listing, not testing.
**If the evidence is bad: add 3–5 months.** On current information about
WitMotion, that is the more likely branch.

### Route B — build our own

Add industrial design, electronics, firmware, tooling *(see [[Enclosure]] §8)*,
prototype iterations, and a full RED campaign at **£8,000–20,000** plus EN 18031.
Lab lead time 2–4 weeks queue + 4–8 weeks testing for a clean design on a
pre-certified module; **3–6 months if a first campaign fails and forces a
hardware spin.**

> **All-in: £80,000–200,000 and 9–18 months** *(est)*, dominated by engineering
> time rather than compliance fees.

### One build serves both markets

CE marking is recognised in **Great Britain indefinitely** since **1 October
2024** (SI 2024/696). A CE-marked device with an EU DoC is lawful in GB. UKCA is
optional. **Don't do both.**

---

## 12. The four decisions

1. **Send WitMotion the twelve-item list.** One week, and it separates a £20k
   rebrand from a £60k disaster.
2. **Resolve battery removability now.** A sealed pack with a soldered cell has a
   hard EU expiry of 18 February 2027.
3. **Decide the "wearable" question deliberately.** Straps to a person → RED Art.
   3(3)(e) and EN 18031-2 apply regardless of internet. Clamps to equipment →
   arguable. A five-figure consequence from a product-definition choice.
4. **Decide the simultaneous-connection question deliberately.** One BLE link at
   a time keeps us outside PSTI. Cheap at specification, expensive in the field.

## Genuinely unsettled

Each is worth a paid hour with a RED notified body:

- Whether a BLE sensor relayed by a phone is "internet-connected" under 2022/30
  Art. 1. The text says *"via any other equipment"*, which reads broadly;
  notified-body practice reads it narrowly. **Don't build a plan on the narrow
  reading.**
- Whether a sports sensor is "wearable radio equipment" when it may clamp to
  equipment rather than a person.
- Whether the Art. 11(3) wet-environment derogation covers a sweat-exposed
  device, or is confined to genuinely submerged ones.

---

## 13. The lower-obligation alternatives

| Route | Escapes | Still owes |
|---|---|---|
| **App only, customer buys the sensor** | RED, CE/UKCA, PSTI, WEEE, battery regs, packaging EPR, RoHS, hardware liability, **Bluetooth SIG**, the 2027 battery deadline. **By far the largest reduction available** | **EU CRA** — standalone software is a product with digital elements; reporting from **11 Sept 2026**, full from 11 Dec 2027. **New PLD** — software is expressly a product, no €500 floor. Consumer Rights Act digital content duties. UK GDPR |
| **Resell unmodified under their brand** | Manufacturer duties, DoC authorship | You're an **importer**, not a distributor, if buying from China: verify the assessment, keep the DoC 10 years, add your name and address. **Strict liability under CPA s.2(2)(c) regardless. PSTI applies to importers too.** A logo on the box flips you back to §2 |
| **Sell only the mount, no electronics** | RED, PSTI, CRA, RoHS, WEEE, battery regs, Bluetooth SIG, every radio question | **EU GPSR in full** — non-harmonised, so GPSR is the *primary* law: risk analysis, technical file, traceability, an **EU responsible person**, Safety Gateway reporting. CPA and PLD liability. **£2,000–6,000 first year** *(est)* |

⚠ **Watch the claims on the app.** The moment it claims to diagnose, prevent or
treat injury, we are arguing about MDR Art. 2(1) and software as a medical
device — far heavier than anything else here. **Keep the copy on performance and
training, never injury prevention, rehab or diagnosis.**

---

## Key sources

- RED 2014/53/EU Art. 14 — https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014L0053
- Radio Equipment Regulations 2017 reg. 36 — https://www.legislation.gov.uk/uksi/2017/1206/regulation/36/made
- Blue Guide 2022, OJ C 247 §3.1 — https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:52022XC0629(04)
- REDCA TGN 01 v1.2a — https://www.redca.eu/Unrestricted%20Documents/TGN/REDCA%20TGN%2001%20RED%20Radio%20equipment%20modules%20V1.2a%20March%202020.pdf
- REDCA TGN catalogue — https://www.redca.eu/Pages/Documents1.htm
- PSTI Act 2022 s.5 — https://www.legislation.gov.uk/ukpga/2022/46/section/5
- Delegated Regulation (EU) 2022/30 — https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R0030
- Implementing Decision (EU) 2025/138 (EN 18031 restrictions) — https://eur-lex.europa.eu/eli/dec_impl/2025/138/oj
- Consumer Protection Act 1987 s.2 — https://www.legislation.gov.uk/ukpga/1987/43/section/2
- Product Liability Directive (EU) 2024/2853 — https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202402853
- Bluetooth SIG fee schedule — https://www.bluetooth.com/fee-schedule/
- Single Market Compliance Space (NANDO) — https://webgate.ec.europa.eu/single-market-compliance-space/
- FCC grant 2AZARWT9011DCLBT50 — https://fccid.io/2AZARWT9011DCLBT50
