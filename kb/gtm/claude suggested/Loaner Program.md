---
tags: [gtm, prototype, users]
---

# Loaner Program

Stage G1 of the [[GTM Strategy]]. Putting hand-built Stage 1 units into the
hands of a few real lifters and letting them use them, unsupervised, in
their own gym, for weeks. Runs after [[Customer Discovery]] has picked a
segment and after Stage 1 hardware exists.

This is the single highest-value activity in the project. Every serious
failure mode of wearable gym hardware — charging, forgetting it, the mount,
chalk, drops, data that goes nowhere — only shows up when someone who
doesn't care about the project has to live with it.

## Shape

- **3–5 people**, from the segment G0 identified. More than that and you
  can't support them; fewer and one person's quirks look like a trend.
- **4 weeks minimum.** The novelty effect lasts about a week. Week 3 is
  where you find out if it survived.
- **Free, and theirs to keep or return.** Not a sale, not a beta with
  obligations. The ask is honesty and a weekly conversation.
- **Two units per person**, because the product is two sensors. Which means
  the parts count for G1 is 6–10 nodes, not 2 — worth knowing before
  ordering (the [[Stage 1 Shopping List]] covers one prototype pair only).
- **Unsupervised.** Watching them use it is a usability test and worth doing
  once; the loaner's value is in the sessions you don't see.

## What to instrument

The point is to learn without asking, because self-reported usage is
unreliable and asking weekly biases behaviour.

- **Session logs from the device** — did they actually use it, on which
  days, for how long. The gap between "yeah I've been using it" and the log
  is the most informative number in the program.
- **Charge cycles / battery deaths** — how often it died mid-session.
- **Mount events** — attach/detach counts, and any detection of a fall.
  (Mount design is TBC; instrument whatever the chosen mount allows.)
- **Data quality in the wild** — BLE dropouts, sync drift, sessions where
  load estimation produced nonsense. Real-gym data will be worse than bench
  data and this is the first honest look at how much worse.
- **Whether they open the app** — capturing data nobody looks at is the
  most common way these products fail.

## What to ask, weekly

Short check-ins, one question each week rather than a survey:

- "When did you not use it this week, and why?" — the abandonment signal.
- "Did the numbers change anything you did?" — the value signal.
- "What did you have to explain to someone at the gym?" — social friction,
  which is real and underrated for bar-mounted hardware.
- At the end: **"Can I have them back?"** The reaction to that question is
  the most reliable measurement in the whole program. Reluctance is
  product-market fit; relief is not.

## Practicalities to sort before shipping units

- **LiPo cells in hand-built devices going to other people** — no
  certification, exposed electronics, a lithium cell near a dropped
  barbell. Write a plain-language "this is a prototype, treat it as such"
  note, keep cells protected-type (the shopping list already specifies
  this), and don't post them internationally.
- **A leash or drop rule** for overhead work, whatever the mount ends up
  being. A node falling from a press is a hazard to other people in the gym.
- **A way to get data back** — decide before handing units out whether logs
  sync automatically or get collected manually. Manual collection means you
  will lose data to people forgetting.
- **Gym permission** — some commercial gyms object to attaching hardware to
  their equipment. Ask the loaner to check rather than discovering it
  through an ejection.
- **Failure is expected.** Build spares into the batch; a unit that dies in
  week 2 shouldn't end that participant's month.

## Gate

Someone who isn't us uses it for a month without being prompted, and asks to
keep it. Until that happens, don't spend Stage 3a money on a batch.
