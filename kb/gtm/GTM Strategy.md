---
tags: [gtm, product, strategy]
---

# GTM Strategy

Go-to-market for Ravelston. Structured like the [[Hardware Roadmap]]: staged,
each stage gated, don't spend on the next until the current one passes. The
difference is that GTM stages run *alongside* hardware stages rather than
after them — the whole point is that customer learning arrives early enough
to change the product while changing it is still cheap.

**Status: pre-everything.** Stage 0 physics is unvalidated (sensors pending),
so nothing here is committed. This folder is the plan, not a record.

## The premise, stated plainly

If bar-whip load estimation works (see [FINDINGS.md](../rnd/FINDINGS.md)),
Ravelston is the only lifting tracker that knows *what you lifted* without
being told. Everything else on the market — velocity trackers, camera
systems, app loggers — requires the user to enter the weight. That is the
one sentence the whole GTM rests on, and it's also the one sentence that
dies if Stage 0 fails. See [[Positioning]].

If Stage 0 fails, the product shrinks to a ROM/technique/rest tracker and
the GTM has to be rebuilt around a crowded field. Don't write that plan
yet; know that it's the fork.

## Stages

### G0 — Customer discovery *(can start now, needs no hardware)*

Talk to real people about how they train and log today. No prototype, no
pitch, no demo — the goal is to find out whether the problem is real,
whose problem it is worst for, and what they do about it currently. See
[[Customer Discovery]] for who to talk to and how to run it.

**Gate:** ~20 conversations done, and a written answer to "which single
segment feels this pain most, and what are they doing about it today?"
that isn't a guess.

### G1 — Design partners on loaners *(needs Stage 1 hardware)*

Hand hand-built units to a small number of people who train regularly and
let them use them for weeks, unsupervised, in their own gym. This is where
the product either survives contact with reality or doesn't. See
[[Loaner Program]].

**Gate:** someone who isn't us uses it for a month without being asked to,
and asks to keep it.

### G2 — Waitlist and audience *(parallel with Stage 2)*

Only once G1 has produced something worth showing. The
[`gtm/site/`](../../gtm/site/) exists for this. Build in public
if it suits — the bar-whip physics is a genuinely interesting story and the
strength-training internet rewards technical honesty.

**Gate:** enough real signups that a first batch (tens of units, Stage 3a)
has somewhere to go.

### G3 — First paid batch *(with Stage 3a)*

Pre-orders or a small paid pilot. The first money is the only validation
that counts, and it's also what funds Stage 3b. Pricing is TBC and should
be set from what G0/G1 reveal about willingness to pay, not from BOM
markup.

**Gate:** people pay, and the units don't come back.

### G4 — Channel and growth

How sales grow beyond the first batch — see [[Channels]]. Direct-to-consumer
online is the default, but the highest-leverage routes for one person are the
multipliers: coaches with rosters, university S&C departments, clinics. Which
one leads depends on which segment G0 picks, so the channel questions get
asked *during* discovery rather than after it.

Two things worth knowing now because they shape earlier decisions: a device
clamped to a barbell in a busy gym advertises itself, which is an industrial-
design consideration, not a marketing one; and meets and demo days convert
hardware far better than any amount of posting.

## Open questions

- **Segment**: individual lifters, strength coaches with athlete rosters,
  or facilities? Different products, prices, and sales motions. G0 exists to
  answer this.
- **Price**: unknown. The VBT market spans ~$300 to ~$2000 for
  single-sensor systems; where a two-sensor load-estimating device sits in
  that is a discovery output.
- **Two sensors is a cost and a story problem**: twice the BOM, twice the
  charging, twice the "did I bring both?" — but it's also what makes
  symmetry and tilt measurable. Watch for whether users care about the
  second sensor's outputs or just tolerate it.
- **Subscription?** Every fitness hardware company eventually asks. Decide
  late; ask in G0 how people feel about it.
