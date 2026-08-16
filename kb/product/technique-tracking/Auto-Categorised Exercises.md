# Auto-Categorised Exercises

What the sensors can work out on their own, without the user telling them.

Condensed from [[Exercise Recognition]]. Nothing here has met real hardware.

---

## The one rule that decides everything

> **If two lifts move the bar differently, we can tell them apart.
> If they differ in where your body is, we cannot.**

The sensors are on the bar. They see the bar's path, speed, tilt and timing.
They see nothing about the lifter. A lift that changes your torso angle but
leaves the bar tracing the same line is invisible to us.

This is not a limit we can engineer away with better models or more data. It is
what the hardware is physically attached to.

---

## What we detect: six movement patterns

Detect the **pattern** first. Treat the specific exercise as a second, weaker
guess.

| Pattern | Contains | How the bar gives it away |
|---|---|---|
| **Hinge from floor** | Conventional deadlift, sumo deadlift, rack pull | Starts at floor height, dead stop, concentric first, floor impact between reps |
| **Squat** | Back squat, front squat, box squat | Unracked, walked out, eccentric first, ~1.25 m of travel |
| **Horizontal press** | Bench, incline bench, floor press | Bar travels mostly horizontally relative to the lifter, lying position |
| **Vertical press** | Overhead press, push press, jerk | Ends above standing shoulder height |
| **Horizontal pull** | Barbell row, Pendlay row, RDL* | Hinged, bar suspended, no floor impact |
| **Hip hinge standing** | RDL, stiff-leg deadlift, good morning | Eccentric first from standing, no floor contact |

\* RDL sits awkwardly between the last two — see the confusion table.

**Anything else → `unknown`.** That is a legitimate and often correct answer.
See §5.

---

## Confidence by vocabulary size

Leave-one-subject-out, per set, after voting across the whole set.

| How many classes | Expected accuracy | Ship it? |
|---|---|---|
| 5 distinct lifts + load as a clue | **88–94%** | Yes |
| 8–10 barbell movements | **78–88%** | Yes, with `unknown` |
| 15+ including variations | 65–78% | No — the marginal classes are useless |
| Variations within one pattern | see below | No, not on day one |

Knock 5–10 points off for the first real deployment. A well-known system went
from near-perfect in the lab to **~50% precision in an actual gym**, because lab
subjects lift more robotically than real ones.

---

## Within a pattern: what separates and what doesn't

### Separable — the bar genuinely moves differently

| Pair | What gives it away | Confidence |
|---|---|---|
| Overhead press vs push press vs jerk | The dip. Strict press has none, push press one, jerk a dip and a re-dip | **High (~85%+)** |
| Paused bench vs touch-and-go | Bar sits still at the chest for a measurable dwell | **High** |
| Full vs partial ROM | Different distance travelled | **High** (relative to that user) |
| Deadlift vs rack pull | Start height | **High** |
| Squat vs box squat | Dwell at the bottom | **Medium** |

### Not separable — the difference is in the lifter, not the bar

| Pair | Why not |
|---|---|
| **Front vs back squat** | Same load, path, tempo and ROM. The bar is just resting somewhere else on the body |
| **Wide vs close-grip bench** | Grip width is invisible. ROM differs by a few cm — smaller than the difference between two people |
| **High-bar vs low-bar squat** | Published work found *no* significant kinematic difference when depth, stance and load were controlled |
| **Overhand vs underhand row** | Nothing changes at the bar |
| **Sumo vs conventional deadlift** | ~5–8 cm shorter ROM, smaller than between-person height variation. ~65–75% at best |
| Incline vs flat bench | Mean velocity differs by 0.02–0.05 m/s. Effectively identical |

---

## The confusion that will actually bite

**Deadlift vs bent-over row.** The single most reproducible error in the
literature — one study had **33% of deadlifts called rows and 21% of rows called
deadlifts**, from a wrist sensor. Both are a hip hinge with an upward pull.

Our escape: the deadlift **touches the floor** between reps. That gives an
impact spike, a dead-stop period, and a concentric-first rep structure the row
doesn't have.

But it weakens for:
- touch-and-go deadlifts (no real dead stop)
- rows tapped off the floor between reps

Expect this pair to remain the dominant error. Do not silently pick one — this
is a good candidate for asking the user once.

---

## How variations become detectable later

Not by improving the model. **By learning that specific user.**

Within one person, front squats are consistently lighter, at a consistent
tempo, to a consistent depth, compared to their back squats. Those patterns hold
per-person even though they're useless across people.

Published gap between the two approaches is large: **~71% universal vs ~97%
personalised** in one benchmark; few-shot adaptation studies report **+3 to +33
points** from as little as three seconds of calibration data per class.

So the product arc is:

| When | What it can name |
|---|---|
| **Day one** | The pattern, plus any variation where the bar genuinely moves differently |
| **After a few sessions** | That user's specific variations too — because it learned their habits, not because the physics changed |

> ⚠ Keep the two models architecturally separate. The universal recogniser
> should be **factory-trained with no user enrolment step**; the per-user layer
> is a separate template. This matters for the patent position — see
> [[Competitive Landscape]] §4.

---

## When it doesn't know

`unknown` is cheaper than being confidently wrong. A wrong auto-label that the
user accepts also **poisons the training data**, while an "unknown" prompt
harvests a clean label.

| State | Behaviour |
|---|---|
| Confident, one class | Log it silently |
| Torn between 2–3 | Show the top pick with a one-tap alternative. This is also how we collect labels |
| Below the threshold | "Unknown exercise — tap to name it." Still log reps, velocity and load; those don't need the name |
| Physics rule fired (bar dropped, no concentric phase) | Handle directly, never send it to the classifier |

Best current method for the threshold: a density model over the classifier's
own logits, applied after training — **AUROC ~0.90 at zero cost to closed-set
accuracy**.

Its known weakness: when the unknown lift *resembles* a known one, every method
degrades badly. Mitigation is to train explicit non-exercise classes — **rest,
unrack/rerack, plate loading, walking with the bar** — rather than one lumped
"nothing" class.

**Tune for few false positives, not for accuracy.** Mislabelling someone's set
is more annoying than admitting ignorance.

---

## Design consequence

Never present a blank exercise picker. Present a **one-tap confirmation of a
guess**. Every shipped product that got this right (Oura, Strava) built its
training set from corrections, not from asking people cold.

And note: **asking the user to pick the exercise is already the category norm** —
every velocity-tracking device on the market does it. Auto-detection is friction
we are *removing*, not friction we are adding. It doesn't have to be perfect to
be better than what exists.

But it does have to be trivially correctable. The most-reported failure of
wrist-based auto-detection is that users start watching the device mid-set to
check it got things right — a feature meant to remove effort that added it.
**Design the correction flow before the classifier.**
