"use client";
import { useState } from "react";
import Link from "next/link";
import { Fleuron, OrnRule } from "../../components/Ornaments";

// ─── Types ───────────────────────────────────────────────────────────────────

type Ground =
  | "1"    // owner-occupier / prior owner-occupier
  | "2"    // mortgagee sale
  | "3"    // out of season holiday let
  | "4"    // let to student by educational institution
  | "5"    // property required for minister of religion
  | "6"    // demolition / redevelopment
  | "7"    // death of tenant
  | "7a"   // serious anti-social behaviour (mandatory)
  | "7b"   // no right to rent in the UK (mandatory)
  | "8"    // serious rent arrears (mandatory)
  | "9"    // alternative accommodation available
  | "10"   // some rent arrears
  | "11"   // persistent late payment
  | "12"   // breach of tenancy obligation
  | "13"   // deterioration of property
  | "14"   // nuisance / annoyance
  | "14A"  // domestic abuse — victim has left (social tenancies only)
  | "14ZA" // rioting
  | "15"   // deterioration of furniture
  | "16"   // employment
  | "17";  // false statement to obtain tenancy

interface FormData {
  landlordName: string;
  landlordAddress: string;
  tenantNames: string;
  propertyAddress: string;
  tenancyStartDate: string;
  rentAmount: string;
  rentFrequency: "weekly" | "monthly";
  arrearsAmount: string;
  grounds: Ground[];
  noticeDate: string;
  additionalInfo: string;
}

// ─── Ground definitions (Housing Act 1988 Sch 2 — applicable to notices served before 1 May 2026) ────

const GROUNDS: Record<Ground, {
  label: string;
  description: string;
  mandatory: boolean;
  noticePeriod: string;
  noticeDays: number;
}> = {
  "1": {
    label: "Ground 1 — Landlord Needs to Move In",
    description: "The landlord (or the landlord's spouse or civil partner) previously occupied the dwelling-house as their only or main home before the tenancy began, or now requires it as their or their spouse's / civil partner's only or main home. Prior written notice must usually have been given at the start of the tenancy.",
    mandatory: false,
    noticePeriod: "2 months",
    noticeDays: 61,
  },
  "2": {
    label: "Ground 2 — Mortgage Repossession",
    description: "The dwelling-house is subject to a mortgage granted before the tenancy began, and the mortgagee (lender) is entitled to exercise a power of sale and requires vacant possession for that purpose.",
    mandatory: false,
    noticePeriod: "2 months",
    noticeDays: 61,
  },
  "3": {
    label: "Ground 3 — Out of Season Holiday Let",
    description: "The tenancy is a fixed-term tenancy of not more than 8 months and at some time within the 12 months ending on the commencement of the tenancy the dwelling-house was occupied for a holiday.",
    mandatory: false,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
  "4": {
    label: "Ground 4 — Let to Student by an Educational Institution",
    description: "The tenancy is a fixed-term tenancy of not more than 12 months and at some time within the 12 months ending on the commencement of the tenancy the dwelling-house was let to a student under an arrangement with a specified educational institution.",
    mandatory: false,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
  "5": {
    label: "Ground 5 — Property Required for Use by Minister of Religion",
    description: "The dwelling-house is held for the purpose of being available for occupation by a minister of religion as a residence from which to perform the duties of his office and the court is satisfied that the dwelling-house is required for occupation by a minister of religion.",
    mandatory: false,
    noticePeriod: "2 months",
    noticeDays: 61,
  },
  "6": {
    label: "Ground 6 — Demolition / Redevelopment",
    description: "The landlord intends to demolish or reconstruct the whole or a substantial part of the dwelling-house or to carry out substantial works on the dwelling-house or any part of it or any building of which it forms part, and the works cannot reasonably be carried out without the tenant giving up possession.",
    mandatory: false,
    noticePeriod: "2 months",
    noticeDays: 61,
  },
  "7": {
    label: "Ground 7 — Death of Tenant",
    description: "The tenancy is a periodic tenancy which has devolved under the will or intestacy of the former tenant and the proceedings for the recovery of possession are begun not later than 12 months after the death of the former tenant or, if the court so directs, after the date on which the landlord or the landlord's agent became aware of the former tenant's death.",
    mandatory: false,
    noticePeriod: "2 months",
    noticeDays: 61,
  },
  "7a": {
    label: "Ground 7A — Serious Anti-Social Behaviour (Mandatory)",
    description: "The tenant, a person residing in or visiting the dwelling-house, has been convicted of a serious offence, found to have breached a civil injunction, been convicted of breaching a criminal behaviour order, or caused serious housing-related nuisance. This is a mandatory ground.",
    mandatory: true,
    noticePeriod: "4 weeks (periodic tenancy) / 1 month (fixed-term tenancy)",
    noticeDays: 28,
  },
  "7b": {
    label: "Ground 7B — No Right to Rent in the UK (Mandatory)",
    description: "Each of the tenants under the tenancy is a person with no right to rent in the United Kingdom. This is a mandatory ground.",
    mandatory: true,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
  "8": {
    label: "Ground 8 — Serious Rent Arrears (Mandatory)",
    description: "At both the date of service of this notice and the date of the court hearing, at least two months' rent (if payable monthly) or eight weeks' rent (if payable weekly) is unpaid. Because this is a mandatory ground, the court must make a possession order if the arrears threshold is met at both dates.",
    mandatory: true,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
  "9": {
    label: "Ground 9 — Alternative Accommodation Available",
    description: "Suitable alternative accommodation is available for the tenant or will be available for them when the possession order takes effect.",
    mandatory: false,
    noticePeriod: "2 months",
    noticeDays: 61,
  },
  "10": {
    label: "Ground 10 — Some Rent in Arrears",
    description: "Some rent lawfully due from the tenant was in arrears at the date of service of this notice and at the date of the court application. This is a discretionary ground — the court will consider whether it is reasonable to order possession.",
    mandatory: false,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
  "11": {
    label: "Ground 11 — Persistent Delay in Paying Rent",
    description: "Whether or not any rent is currently in arrears, the tenant has persistently delayed paying rent which has become lawfully due. The court will look at the history of late payments when deciding whether it is reasonable to order possession.",
    mandatory: false,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
  "12": {
    label: "Ground 12 — Breach of Tenancy Agreement",
    description: "The tenant has broken one or more of the terms of the tenancy agreement, other than the obligation to pay rent (which is covered by Grounds 8, 10 and 11). The notice should specify the obligation(s) broken.",
    mandatory: false,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
  "13": {
    label: "Ground 13 — Tenant Deteriorated Property",
    description: "The condition of the dwelling-house or any common areas managed by the landlord has deteriorated owing to acts of waste by, or the neglect or default of, the tenant or any other person residing in the dwelling-house. If the deterioration was caused by a lodger or sub-tenant, the landlord must show the tenant failed to take reasonable steps to remove that person.",
    mandatory: false,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
  "14": {
    label: "Ground 14 — Nuisance / Annoyance, Illegal or Immoral Use",
    description: "The tenant or a person residing in or visiting the dwelling-house has been guilty of conduct that is a nuisance or annoyance to a person residing, visiting or engaging in a lawful activity in the locality, or has been convicted of using the dwelling-house or allowing it to be used for immoral or illegal purposes, or has been convicted of an indictable offence committed in or in the locality of the dwelling-house.",
    mandatory: false,
    noticePeriod: "None — proceedings may be commenced immediately after service",
    noticeDays: 0,
  },
  "14A": {
    label: "Ground 14A — Domestic Abuse: Victim Has Left (Social Tenancies Only)",
    description: "The dwelling-house was occupied by a married couple, civil partners, or cohabitants, one of whom is a victim of domestic abuse perpetrated by the other, and the victim has left because of that abuse and is unlikely to return. This ground is only available to social landlords where the victim has permanently left the property.",
    mandatory: false,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
  "14ZA": {
    label: "Ground 14ZA — Rioting",
    description: "The tenant or an adult residing in the dwelling-house has been convicted of an offence which took place during, and at the scene of, a riot in the United Kingdom.",
    mandatory: false,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
  "15": {
    label: "Ground 15 — Tenant Has Deteriorated Furniture",
    description: "The condition of any furniture provided for use under the tenancy has deteriorated owing to ill-treatment by the tenant or any other person residing in the dwelling-house. If the ill-treatment was by a lodger or sub-tenant, the landlord must show the tenant failed to take reasonable steps to remove that person.",
    mandatory: false,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
  "16": {
    label: "Ground 16 — Employment",
    description: "The dwelling-house was let to the tenant in consequence of the tenant's employment by the landlord seeking possession or a previous landlord under the tenancy, and the tenant has ceased to be in that employment.",
    mandatory: false,
    noticePeriod: "2 months",
    noticeDays: 61,
  },
  "17": {
    label: "Ground 17 — False Statement to Obtain Tenancy",
    description: "The landlord was induced to grant the tenancy by a false or reckless statement made by the tenant or any person acting on the tenant's behalf. The court must be satisfied that the landlord would not have granted the tenancy had the true position been known.",
    mandatory: false,
    noticePeriod: "2 weeks",
    noticeDays: 14,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return "___________";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function noticeExpiryDate(noticeDateIso: string, grounds: Ground[]): string {
  if (!noticeDateIso || grounds.length === 0) return "___________";
  const base = new Date(noticeDateIso + "T12:00:00");
  const maxDays = grounds.reduce((max, g) => Math.max(max, GROUNDS[g].noticeDays), 0);
  if (maxDays === 0) {
    return formatDate(noticeDateIso) + " (immediately)";
  }
  const expiry = new Date(base);
  expiry.setDate(expiry.getDate() + maxDays);
  return expiry.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Section8NoticePage() {
  const [step, setStep] = useState<"form" | "preview">("form");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState<FormData>({
    landlordName: "",
    landlordAddress: "",
    tenantNames: "",
    propertyAddress: "",
    tenancyStartDate: "",
    rentAmount: "",
    rentFrequency: "monthly",
    arrearsAmount: "",
    grounds: ["8"],
    noticeDate: new Date().toISOString().split("T")[0],
    additionalInfo: "",
  });

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function toggleGround(g: Ground) {
    setForm(f => ({
      ...f,
      grounds: f.grounds.includes(g) ? f.grounds.filter(x => x !== g) : [...f.grounds, g],
    }));
  }

  function generateNoticeText(): string {
    const groundsList = form.grounds
      .map(g => `    Ground ${g}: ${GROUNDS[g].label.split("—")[1]?.trim() ?? GROUNDS[g].label}`)
      .join("\n");
    const expiry = noticeExpiryDate(form.noticeDate, form.grounds);
    const hasMandatoryGround8 = form.grounds.includes("8");
    const hasMandatory7a = form.grounds.includes("7a");
    const hasMandatory7b = form.grounds.includes("7b");
    const hasMandatory = hasMandatoryGround8 || hasMandatory7a || hasMandatory7b;

    const mandatoryNote = hasMandatory
      ? `\n    NOTE ON MANDATORY GROUNDS:\n${[
          hasMandatoryGround8 ? "    · Ground 8 is mandatory — the court MUST grant possession if the\n      arrears threshold is met at both the notice date and hearing date." : "",
          hasMandatory7a ? "    · Ground 7A is mandatory — the court MUST grant possession if the\n      serious anti-social behaviour conditions are established." : "",
          hasMandatory7b ? "    · Ground 7B is mandatory — the court MUST grant possession if\n      the no right to rent conditions are established." : "",
        ].filter(Boolean).join("\n")}`
      : "";

    return `NOTICE SEEKING POSSESSION OF A PROPERTY LET ON AN ASSURED TENANCY
(Housing Act 1988, Section 8 — Form 3)
Applicable to notices served before 1 May 2026

─────────────────────────────────────────────────────────────────

TO:    ${form.tenantNames || "[Full name(s) of all tenant(s)]"}

OF:    ${form.propertyAddress || "[Full address of the property]"}

─────────────────────────────────────────────────────────────────

FROM:  ${form.landlordName || "[Landlord's full name or company name]"}
       ${form.landlordAddress || "[Landlord's address for correspondence]"}

DATE OF THIS NOTICE:  ${formatDate(form.noticeDate)}

─────────────────────────────────────────────────────────────────

1.  THE PROPERTY

    The dwelling-house to which this notice relates is:

    ${form.propertyAddress || "[Property address]"}

2.  THE TENANCY

    The assured tenancy to which this notice relates${form.tenancyStartDate ? ` began on\n    ${formatDate(form.tenancyStartDate)}` : " is the tenancy of the above property"}.
${form.rentAmount ? `\n    The current rent is £${form.rentAmount} per ${form.rentFrequency}.\n` : ""}
3.  GROUNDS FOR POSSESSION

    The landlord intends to apply to the court for an order for
    possession of the above-mentioned property on the following
    ground(s) under Schedule 2 to the Housing Act 1988 (as amended):

${groundsList}

4.  PARTICULARS IN SUPPORT OF EACH GROUND
${form.grounds.map(g => {
  let detail = `\n    Ground ${g} — ${GROUNDS[g].label.split("—")[1]?.trim() ?? GROUNDS[g].label}\n\n    ${GROUNDS[g].description}`;
  if (g === "8" || g === "10" || g === "11") {
    detail += `\n\n    Arrears as at the date of this notice:\n    £${form.arrearsAmount || "[state exact arrears amount]"}`;
  }
  if (form.additionalInfo && ["12","13","14","14A","14ZA","15","17","6","7a"].includes(g)) {
    detail += `\n\n    Further particulars:\n    ${form.additionalInfo}`;
  }
  return detail;
}).join("\n\n    ─────────────────────────────────────────────────────────────\n")}

5.  COURT PROCEEDINGS

    After the date specified in paragraph 6 below, the landlord
    may begin proceedings in the County Court for a possession
    order.${mandatoryNote}

6.  EARLIEST DATE ON WHICH COURT PROCEEDINGS MAY BEGIN

    Possession proceedings may not be commenced before:

    ${expiry}

    IMPORTANT: Under the Renters' Rights Act 2025, if this notice
    was served before 1 May 2026, court proceedings must be issued
    by whichever date comes FIRST:
    · 12 months after the date of this notice; OR
    · 3 months beginning on 1 May 2026 (i.e. by 1 August 2026)

7.  INFORMATION FOR TENANTS

    If you need advice about this notice and what you should do,
    take it immediately to a citizens advice bureau, a housing
    advice centre, a law centre, or a solicitor.

    You may be eligible for Legal Aid. You should also consider
    contacting:

    · Shelter England    0808 800 4444   (free, 24/7)
    · Citizens Advice    0800 144 8848
    · National Debtline  0808 808 4000   (if rent arrears apply)

    You have the right to challenge this notice in court and to
    remain in the property until a court order is made and executed.

─────────────────────────────────────────────────────────────────

SIGNED: _______________________________

NAME:   ${form.landlordName || "[Landlord's name]"}

DATE:   ${formatDate(form.noticeDate)}

─────────────────────────────────────────────────────────────────

IMPORTANT NOTICES

This notice has been prepared with reference to:
  · Housing Act 1988, Schedule 2 (as amended)
  · Housing Act 1996, Section 151
  · Renters' Rights Act 2025

This notice is subject to the time limits introduced by the
Renters' Rights Act 2025. Court proceedings using a Section 8
notice served before 1 May 2026 must be issued no later than
1 August 2026 (3 months from 1 May 2026) or 12 months from
the date of service, whichever is sooner.

Section 21 no-fault evictions have been abolished from
1 May 2026 under the Renters' Rights Act 2025.

This document is provided for informational purposes only and
does not constitute legal advice. The landlord is strongly
advised to seek independent legal advice before serving this
notice, particularly where mandatory grounds are relied upon
or the arrears position is complex.

─────────────────────────────────────────────────────────────────
Generated by Ravelston.ai · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generateNoticeText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  const isFormValid = form.landlordName && form.tenantNames && form.propertyAddress && form.grounds.length > 0;

  return (
    <div className="paper" style={{
      maxWidth: 1440, margin: "0 auto",
      borderLeft: "1px solid var(--forest)", borderRight: "1px solid var(--forest)",
      minHeight: "100vh",
    }}>
      {/* ── Header ── */}
      <header style={{ borderBottom: "1px solid var(--forest)" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "11px 40px",
          fontSize: 11,
          borderBottom: "1px solid var(--rule-soft)"
        }} className="smallcaps s8-hide-mobile">
          <div style={{ display: "flex", gap: 24 }}>
            <Link href="/" style={{ cursor: "pointer" }}>← Home</Link>
            <Link href="/#notices" style={{ cursor: "pointer" }}>Notices</Link>
            <Link href="/#pricing" style={{ cursor: "pointer" }}>Pricing</Link>
          </div>
          <div className="mono" style={{ color: "var(--forest)", opacity: .8, letterSpacing: ".2em", fontSize: 11, fontWeight: 700 }}>
            Free Section 8 Notice Generator · UK 2026
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link href="/signup" style={{ cursor: "pointer" }}>Get started →</Link>
          </div>
        </div>

        <div style={{ padding: "clamp(8px,1.5vw,14px) clamp(20px,5vw,40px) clamp(6px,1vw,10px)" }}>
          <hr className="hr-thin" style={{ margin: "0 0 4px" }} />
          <Link href="/" className="display" style={{
            fontSize: "clamp(28px,5vw,72px)", lineHeight: .9,
            letterSpacing: "-.025em", fontWeight: 500,
            color: "var(--forest)", display: "block", textAlign: "center"
          }}>
            Ravelston<span style={{ color: "var(--pink-ink)", fontStyle: "italic" }}>.ai</span>
          </Link>
          <hr className="hr-thin" style={{ margin: "4px 0 0" }} />
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{
        padding: "clamp(32px,5vw,56px) clamp(20px,5vw,40px) clamp(24px,4vw,40px)",
        borderBottom: "1px solid var(--rule)"
      }}>
        <div style={{ maxWidth: 820 }}>
          <div className="smallcaps mono" style={{ fontSize: 11, color: "var(--emerald)", letterSpacing: ".2em", marginBottom: 14 }}>
            Free tool · For notices served before 1 May 2026 · Housing Act 1988, Schedule 2
          </div>
          <h1 className="display" style={{
            fontSize: "clamp(32px,5vw,72px)", lineHeight: 1,
            color: "var(--forest)", fontWeight: 500,
            letterSpacing: "-.02em", margin: "0 0 20px"
          }}>
            Section 8 Notice Generator
          </h1>
          <p style={{ fontSize: "clamp(15px,1.5vw,18px)", lineHeight: 1.65, color: "var(--forest-ink)", maxWidth: "64ch", margin: 0 }}>
            Generate a Section 8 Notice Seeking Possession under the <strong>Housing Act 1988</strong> (Form 3), using the grounds applicable to notices served before <strong>1 May 2026</strong>. Free, instant, and ready to print or serve.
          </p>
        </div>

        <div style={{ display: "flex", gap: 32, marginTop: 28, flexWrap: "wrap" }}>
          {[
            ["Housing Act 1988", "Schedule 2, Annex A grounds"],
            ["Notices before 1 May 2026", "Pre-RRA 2025 grounds apply"],
            ["All Schedule 2 Grounds", "Grounds 1 – 17 included"],
          ].map(([title, sub]) => (
            <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span className="seal" style={{ marginTop: 4 }} />
              <div>
                <div className="smallcaps" style={{ fontSize: 11, color: "var(--forest)", letterSpacing: ".14em" }}>{title}</div>
                <div style={{ fontSize: 12, color: "var(--forest-ink)", opacity: .7, fontStyle: "italic" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <a href="#guide" className="smallcaps" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          marginTop: 24, fontSize: 11, letterSpacing: ".18em",
          color: "var(--emerald)", borderBottom: "1px solid var(--emerald)",
          paddingBottom: 2, textDecoration: "none",
        }}>
          Everything you need to know ↓
        </a>
      </section>

      {/* ── Legal context banner ── */}
      <section style={{
        padding: "clamp(20px,3vw,32px) clamp(20px,5vw,40px)",
        background: "var(--forest)",
        color: "var(--cream)",
        borderBottom: "1px solid var(--forest)"
      }}>
        <div style={{ maxWidth: 960 }}>
          <div className="smallcaps mono" style={{ fontSize: 11, color: "var(--pink)", letterSpacing: ".18em", marginBottom: 12 }}>
            Important — time limits for notices served before 1 May 2026
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.75, margin: "0 0 12px", opacity: .9 }}>
            The tenancy reforms of the <strong style={{ color: "var(--cream)" }}>Renters&apos; Rights Act 2025</strong> came into force on <strong style={{ color: "var(--cream)" }}>1 May 2026</strong>. From that date, <strong style={{ color: "var(--cream)" }}>Section 21 no-fault evictions are abolished</strong> for all tenancies in England. If you served a Section 8 notice on a tenant <strong style={{ color: "var(--cream)" }}>before 1 May 2026</strong>, you may still use it to start court proceedings — but strict time limits apply.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.75, margin: 0, opacity: .9 }}>
            Court proceedings using a pre-1 May 2026 Section 8 notice must be issued by whichever date comes <strong style={{ color: "var(--cream)" }}>first</strong>: (1) <strong style={{ color: "var(--cream)" }}>12 months</strong> after the date the notice was given; or (2) <strong style={{ color: "var(--cream)" }}>3 months beginning on 1 May 2026</strong> (i.e. by 1 August 2026). The grounds and notice periods shown on this page are those set out in <strong style={{ color: "var(--cream)" }}>Annex A</strong> of the GOV.UK guidance — applicable to notices served before 1 May 2026.
          </p>
        </div>
      </section>

      {/* ── Form / Preview ── */}
      <main style={{ padding: "clamp(32px,5vw,56px) clamp(20px,5vw,40px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(24px,4vw,48px)", alignItems: "start" }} className="s8-grid">

          {/* ── LEFT: Form ── */}
          <div>
            <div className="display" style={{ fontSize: "clamp(22px,2.5vw,32px)", color: "var(--forest)", marginBottom: 4 }}>
              {step === "form" ? "Enter the details" : "Your notice is ready"}
            </div>
            <hr className="hr-thin" style={{ margin: "0 0 28px" }} />

            {step === "form" && (
              <form onSubmit={e => { e.preventDefault(); setStep("preview"); }}>
                {/* Landlord */}
                <fieldset style={{ border: 0, margin: "0 0 28px", padding: 0 }}>
                  <legend className="smallcaps" style={{ fontSize: 11, color: "var(--emerald)", letterSpacing: ".18em", marginBottom: 16, display: "block", width: "100%", borderBottom: "1px solid var(--rule-soft)", paddingBottom: 8 }}>
                    Landlord details
                  </legend>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <Field label="Full name or company name" required>
                      <input type="text" value={form.landlordName} onChange={e => set("landlordName", e.target.value)}
                        placeholder="e.g. James Mackenzie or Edinburgh Lettings Ltd" required style={inputStyle} />
                    </Field>
                    <Field label="Address for correspondence" required>
                      <textarea value={form.landlordAddress} onChange={e => set("landlordAddress", e.target.value)}
                        placeholder="Full address including postcode" rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                    </Field>
                  </div>
                </fieldset>

                {/* Tenant */}
                <fieldset style={{ border: 0, margin: "0 0 28px", padding: 0 }}>
                  <legend className="smallcaps" style={{ fontSize: 11, color: "var(--emerald)", letterSpacing: ".18em", marginBottom: 16, display: "block", width: "100%", borderBottom: "1px solid var(--rule-soft)", paddingBottom: 8 }}>
                    Tenant details
                  </legend>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <Field label="Full name(s) of all tenants" required hint="List every named tenant on the agreement — e.g. Sarah Jones and David Jones">
                      <input type="text" value={form.tenantNames} onChange={e => set("tenantNames", e.target.value)}
                        placeholder="e.g. Sarah Jones and David Jones" required style={inputStyle} />
                    </Field>
                  </div>
                </fieldset>

                {/* Property */}
                <fieldset style={{ border: 0, margin: "0 0 28px", padding: 0 }}>
                  <legend className="smallcaps" style={{ fontSize: 11, color: "var(--emerald)", letterSpacing: ".18em", marginBottom: 16, display: "block", width: "100%", borderBottom: "1px solid var(--rule-soft)", paddingBottom: 8 }}>
                    Property & tenancy
                  </legend>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <Field label="Property address" required>
                      <textarea value={form.propertyAddress} onChange={e => set("propertyAddress", e.target.value)}
                        placeholder="Full address including postcode" rows={3} required style={{ ...inputStyle, resize: "vertical" }} />
                    </Field>
                    <Field label="Tenancy start date" hint="Leave blank if unknown">
                      <input type="date" value={form.tenancyStartDate} onChange={e => set("tenancyStartDate", e.target.value)} style={inputStyle} />
                    </Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Field label="Rent amount (£)">
                        <input type="number" value={form.rentAmount} onChange={e => set("rentAmount", e.target.value)}
                          placeholder="e.g. 1200" min="0" style={inputStyle} />
                      </Field>
                      <Field label="Frequency">
                        <select value={form.rentFrequency} onChange={e => set("rentFrequency", e.target.value as "weekly" | "monthly")} style={inputStyle}>
                          <option value="monthly">Monthly</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </Field>
                    </div>
                    <Field label="Total rent arrears (£)" hint="Required if relying on Ground 8, 10 or 11">
                      <input type="number" value={form.arrearsAmount} onChange={e => set("arrearsAmount", e.target.value)}
                        placeholder="e.g. 2400" min="0" style={inputStyle} />
                    </Field>
                  </div>
                </fieldset>

                {/* Grounds */}
                <fieldset style={{ border: 0, margin: "0 0 28px", padding: 0 }}>
                  <legend className="smallcaps" style={{ fontSize: 11, color: "var(--emerald)", letterSpacing: ".18em", marginBottom: 16, display: "block", width: "100%", borderBottom: "1px solid var(--rule-soft)", paddingBottom: 8 }}>
                    Grounds for possession
                  </legend>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(Object.entries(GROUNDS) as [Ground, typeof GROUNDS[Ground]][]).map(([key, g]) => (
                      <label key={key} style={{
                        display: "flex", gap: 12, alignItems: "flex-start",
                        padding: "12px 14px",
                        border: form.grounds.includes(key) ? "1px solid var(--forest)" : "1px solid var(--rule-soft)",
                        background: form.grounds.includes(key) ? "rgba(10,72,0,.04)" : "transparent",
                        cursor: "pointer",
                        transition: "border-color .15s, background .15s"
                      }}>
                        <input type="checkbox" checked={form.grounds.includes(key)} onChange={() => toggleGround(key)}
                          style={{ marginTop: 3, accentColor: "var(--forest)", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--forest)", marginBottom: 3, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                            {g.label}
                            {g.mandatory && <span style={{ fontSize: 10, background: "var(--pink)", color: "var(--forest-ink)", padding: "1px 6px", fontWeight: 400, fontFamily: "inherit" }}>mandatory</span>}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--forest-ink)", lineHeight: 1.55, opacity: .8 }}>{g.description}</div>
                          <div className="mono" style={{ fontSize: 11, color: "var(--emerald)", marginTop: 4 }}>Notice period: {g.noticePeriod}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Notice date + additional info */}
                <fieldset style={{ border: 0, margin: "0 0 28px", padding: 0 }}>
                  <legend className="smallcaps" style={{ fontSize: 11, color: "var(--emerald)", letterSpacing: ".18em", marginBottom: 16, display: "block", width: "100%", borderBottom: "1px solid var(--rule-soft)", paddingBottom: 8 }}>
                    Notice details
                  </legend>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <Field label="Date of notice" required>
                      <input type="date" value={form.noticeDate} onChange={e => set("noticeDate", e.target.value)} required style={inputStyle} />
                    </Field>
                    <Field label="Additional particulars" hint="Optional — describe specific breaches, incidents with dates, or other supporting detail">
                      <textarea value={form.additionalInfo} onChange={e => set("additionalInfo", e.target.value)}
                        placeholder="Provide further detail relevant to the ground(s) relied upon" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                    </Field>
                  </div>
                </fieldset>

                <button type="submit" disabled={!isFormValid} className="smallcaps" style={{
                  width: "100%", padding: "16px 24px",
                  background: isFormValid ? "var(--forest)" : "var(--rule-soft)",
                  color: isFormValid ? "var(--cream)" : "var(--rule)",
                  border: "1px solid var(--forest)",
                  fontSize: 13, letterSpacing: ".2em", fontFamily: "inherit",
                  cursor: isFormValid ? "pointer" : "not-allowed",
                  boxShadow: isFormValid ? "4px 4px 0 var(--pink)" : "none",
                  transition: "box-shadow .15s, background .15s",
                }}>
                  Generate Notice →
                </button>
              </form>
            )}

            {step === "preview" && (
              <div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--forest-ink)", margin: "0 0 24px" }}>
                  Your notice has been generated. Copy the text, paste it into a word processor, add your signature, and serve on the tenant(s) by hand or first-class post.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button onClick={handleCopy} className="smallcaps" style={{
                    width: "100%", padding: "14px 24px",
                    background: copied ? "var(--emerald)" : "var(--forest)",
                    color: "var(--cream)", border: "1px solid var(--forest)",
                    fontSize: 13, letterSpacing: ".2em", fontFamily: "inherit",
                    cursor: "pointer", boxShadow: "4px 4px 0 var(--pink)",
                    transition: "background .2s",
                  }}>
                    {copied ? "✓ Copied to clipboard" : "Copy notice text →"}
                  </button>
                  <button onClick={() => setStep("form")} className="smallcaps" style={{
                    width: "100%", padding: "14px 24px",
                    background: "transparent", color: "var(--forest)",
                    border: "1px solid var(--rule)", fontSize: 13,
                    letterSpacing: ".2em", fontFamily: "inherit", cursor: "pointer",
                  }}>
                    ← Edit details
                  </button>
                </div>

                <div style={{ marginTop: 32, padding: "20px", background: "rgba(255,185,229,.15)", border: "1px solid var(--pink-ink)" }}>
                  <div className="display" style={{ fontSize: 16, color: "var(--forest)", marginBottom: 8 }}>
                    Want AI-drafted notices with one click?
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, margin: "0 0 14px", color: "var(--forest-ink)" }}>
                    Ravelston generates, stores, and tracks all your Section 8 and Section 13 notices — plus certificates, risk scores, and an encrypted audit vault.
                  </p>
                  <Link href="/signup" className="smallcaps" style={{
                    display: "inline-block", padding: "10px 18px",
                    background: "var(--forest)", color: "var(--cream)",
                    fontSize: 11, letterSpacing: ".18em",
                    boxShadow: "3px 3px 0 var(--pink)",
                  }}>
                    Get started →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Preview ── */}
          <div style={{ position: "sticky", top: 24 }}>
            <div className="display" style={{ fontSize: "clamp(22px,2.5vw,32px)", color: "var(--forest)", marginBottom: 4 }}>
              {step === "preview" ? "Your notice" : "Live preview"}
            </div>
            <hr className="hr-thin" style={{ margin: "0 0 20px" }} />

            <div style={{
              background: "#fff",
              border: "1px solid var(--rule)",
              padding: "clamp(20px,3vw,36px)",
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "clamp(10px,1vw,12px)",
              lineHeight: 1.7,
              color: "#1a1a1a",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "70vh",
              overflowY: "auto",
              boxShadow: "4px 4px 0 var(--pink)",
            }}>
              {generateNoticeText()}
            </div>

            <div className="mono" style={{ fontSize: 11, color: "var(--emerald)", marginTop: 12, opacity: .7 }}>
              {form.grounds.length > 0 && form.noticeDate && (
                <>Earliest court date: {noticeExpiryDate(form.noticeDate, form.grounds)}</>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── FAQ / SEO content ── */}
      <section id="guide" style={{ borderTop: "1px solid var(--forest)", padding: "clamp(40px,6vw,72px) clamp(20px,5vw,40px)" }}>
        <div style={{ maxWidth: 800 }}>
          <div className="display ital" style={{ fontSize: "clamp(28px,4vw,48px)", color: "var(--forest)", marginBottom: 8 }}>
            Everything you need to know.
          </div>
          <hr className="hr-double" style={{ marginBottom: 40 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {faqs.map((faq, i) => (
              <div key={i}>
                <h2 className="display" style={{ fontSize: "clamp(18px,2vw,24px)", color: "var(--forest)", margin: "0 0 10px", fontWeight: 500 }}>
                  {faq.q}
                </h2>
                <div style={{ fontSize: 15, lineHeight: 1.75, color: "var(--forest-ink)" }} dangerouslySetInnerHTML={{ __html: faq.a }} />
                {i < faqs.length - 1 && <hr className="hr-thin" style={{ marginTop: 36 }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section style={{
        borderTop: "1px solid var(--forest)",
        background: "var(--cream-2)",
        padding: "clamp(40px,6vw,72px) clamp(20px,5vw,40px)",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20
      }}>
        <Fleuron size={20} color="var(--emerald)" />
        <div className="display" style={{ fontSize: "clamp(28px,4vw,56px)", color: "var(--forest)", lineHeight: 1, maxWidth: "20ch" }}>
          Stop managing compliance in spreadsheets.
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.65, maxWidth: "52ch", color: "var(--forest-ink)", margin: 0 }}>
          Ravelston gives letting agents a portfolio risk dashboard, AI-drafted Section 8 and Section 13 notices, certificate tracking, and an encrypted audit vault — built for the post-Section 21 world.
        </p>
        <Link href="/signup" className="smallcaps" style={{
          display: "inline-block", padding: "16px 32px",
          background: "var(--forest)", color: "var(--cream)",
          fontSize: 13, letterSpacing: ".2em",
          boxShadow: "4px 4px 0 var(--pink-ink)",
        }}>
          Get started →
        </Link>
        <OrnRule />
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: "clamp(24px,4vw,40px) clamp(20px,5vw,40px)", background: "var(--forest)", color: "var(--cream)" }}>
        <hr className="hr-thin" style={{ borderColor: "rgba(255,250,223,.2)", margin: "0 0 24px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, fontSize: 11 }} className="smallcaps">
          <div>© 2026 Ravelston Ltd. All rights reserved.</div>
          <div style={{ opacity: .6, fontStyle: "italic", fontFamily: '"Cormorant Garamond",serif', textTransform: "none", letterSpacing: 0, fontSize: 13 }}>
            This tool does not constitute legal advice. Always consult a solicitor.
          </div>
          <Link href="/" style={{ color: "var(--cream)" }}>← Back to Ravelston</Link>
        </div>
      </footer>

      <style>{`
        @media (max-width: 860px) {
          .s8-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .s8-hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px",
  border: "1px solid var(--rule)", background: "var(--cream)",
  fontFamily: "inherit", fontSize: 14, color: "var(--forest-ink)",
  outline: "none", boxSizing: "border-box",
};

function Field({ label, children, hint, required }: {
  label: string; children: React.ReactNode; hint?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="smallcaps mono" style={{ display: "block", fontSize: 11, color: "var(--emerald)", marginBottom: 6, letterSpacing: ".14em" }}>
        {label}{required && <span style={{ color: "var(--pink-ink)", marginLeft: 4 }}>*</span>}
      </label>
      {hint && <div style={{ fontSize: 12, color: "var(--forest-ink)", opacity: .6, fontStyle: "italic", marginBottom: 6 }}>{hint}</div>}
      {children}
    </div>
  );
}

// ─── FAQ content (SEO) ────────────────────────────────────────────────────────

const faqs: { q: string; a: string }[] = [
  {
    q: "What is a Section 8 notice?",
    a: "A Section 8 notice — formally a <em>Notice Seeking Possession of a Property Let on an Assured Tenancy</em> (Form 3) — is the legal document a landlord in England must serve on a tenant before applying to the County Court for a possession order. It is governed by Section 8 of the <strong>Housing Act 1988</strong>. The notice must state which ground(s) in Schedule 2 to the Act the landlord is relying upon, and must give the tenant at least the minimum notice period for each ground before court proceedings can begin.",
  },
  {
    q: "Is Section 21 still valid in 2026?",
    a: "No. The <strong>Renters' Rights Act 2025</strong> abolished Section 21 'no-fault' evictions from <strong>1 May 2026</strong> for all tenancies in England — both new and existing. From that date, landlords must rely exclusively on <strong>Section 8 and Schedule 2 grounds</strong> to recover possession. If you served a valid Section 21 notice before 1 May 2026, you may still use it to start court proceedings, but only up to and including whichever date comes first: the time left on the notice, or <strong>31 July 2026</strong>.",
  },
  {
    q: "I served a Section 8 notice before 1 May 2026 — what time limits apply?",
    a: "If you gave a Section 8 notice to your tenant before 1 May 2026, you can only use it to start court proceedings up to and including whichever date comes <strong>first</strong>: <ul style='margin:10px 0;padding-left:20px;line-height:2'><li><strong>12 months</strong> after the date you gave the notice; or</li><li><strong>3 months beginning on 1 May 2026</strong> — i.e. by 1 August 2026.</li></ul>This limit is set by the Renters' Rights Act 2025 and may give you less time to start court proceedings than the 12-month period shown on Form 3. Check any notices you served before 1 May 2026 to confirm when the period expires.",
  },
  {
    q: "What are the Section 8 grounds and notice periods for notices served before 1 May 2026?",
    a: "The following grounds and notice periods applied to notices served before 1 May 2026 (Annex A of the GOV.UK guidance): <ul style='margin:10px 0;padding-left:20px;line-height:2.1'><li><strong>Ground 1</strong> — Landlord needs to move in (2 months)</li><li><strong>Ground 2</strong> — Mortgage repossession (2 months)</li><li><strong>Ground 3</strong> — Out of season holiday let (2 weeks)</li><li><strong>Ground 4</strong> — Let to student by educational institution (2 weeks)</li><li><strong>Ground 5</strong> — Property required for minister of religion (2 months)</li><li><strong>Ground 6</strong> — Demolition / redevelopment (2 months)</li><li><strong>Ground 7</strong> — Death of tenant (2 months)</li><li><strong>Ground 7A</strong> — Serious anti-social behaviour — <em>mandatory</em> (4 weeks / 1 month)</li><li><strong>Ground 7B</strong> — No right to rent in the UK — <em>mandatory</em> (2 weeks)</li><li><strong>Ground 8</strong> — Serious rent arrears — <em>mandatory</em> (2 weeks)</li><li><strong>Ground 9</strong> — Alternative accommodation available (2 months)</li><li><strong>Ground 10</strong> — Some rent in arrears (2 weeks)</li><li><strong>Ground 11</strong> — Persistent late payment (2 weeks)</li><li><strong>Ground 12</strong> — Breach of tenancy agreement (2 weeks)</li><li><strong>Ground 13</strong> — Tenant deteriorated property (2 weeks)</li><li><strong>Ground 14</strong> — Nuisance / annoyance (none — immediate)</li><li><strong>Ground 14A</strong> — Domestic abuse, victim has left — social tenancies only (2 weeks)</li><li><strong>Ground 14ZA</strong> — Rioting (2 weeks)</li><li><strong>Ground 15</strong> — Tenant has deteriorated furniture (2 weeks)</li><li><strong>Ground 16</strong> — Employment (2 months)</li><li><strong>Ground 17</strong> — False statement to obtain tenancy (2 weeks)</li></ul>Where multiple grounds are used, the longest notice period generally applies. For antisocial behaviour grounds 7A and 14, the antisocial behaviour ground's notice period takes precedence.",
  },
  {
    q: "What is the difference between mandatory and discretionary grounds?",
    a: "If a <strong>mandatory ground</strong> is made out, the court <em>must</em> grant a possession order — it has no discretion. Mandatory grounds applicable to pre-1 May 2026 notices are: Ground 7A (serious anti-social behaviour), Ground 7B (no right to rent), and Ground 8 (serious rent arrears). For <strong>discretionary grounds</strong> (such as Grounds 10, 11, 12, 13, 14), the court will only grant possession if it is <em>reasonable</em> to do so, taking all the circumstances into account. It is common to plead Ground 8 alongside Grounds 10 and 11 to preserve the mandatory route even if arrears reduce slightly before the hearing.",
  },
  {
    q: "For Ground 8, what level of arrears is required?",
    a: "Ground 8 requires that at <strong>both</strong> the date of service of the notice <strong>and</strong> the date of the possession hearing, the tenant owes at least: <ul style='margin:10px 0;padding-left:20px;line-height:2'><li><strong>Two months' rent</strong> (if rent is payable monthly); or</li><li><strong>Eight weeks' rent</strong> (if rent is payable weekly).</li></ul>Because the arrears must be present at both dates, it is common to also rely on the discretionary Grounds 10 and 11 in the alternative, in case the arrears fall below the threshold before the hearing.",
  },
  {
    q: "What makes a Section 8 notice valid?",
    a: "For a Section 8 notice (served before 1 May 2026) to be valid: <ul style='margin:10px 0;padding-left:20px;line-height:2'><li>You must have used <strong>Form 3</strong> or a form to substantially the same effect.</li><li>It must have included the <strong>right amount of notice</strong> for each ground relied upon.</li><li>You must have <strong>set out fully the substance</strong> of each ground and the reasons why you believed it applied.</li><li>It must have been <strong>correctly served</strong> on the tenant(s) — by hand, first-class post, or email if the tenancy agreement expressly permits it.</li></ul>A defective notice may be struck out by the court, forcing you to restart the process.",
  },
  {
    q: "What happens if I get the notice wrong?",
    a: "A defective Section 8 notice may be struck out by the court at the hearing, forcing you to start again and serve a fresh notice. Common errors include: failing to name all tenants on the agreement; citing the wrong ground number or understating arrears; serving the notice on the wrong address; using an expired notice (older than 12 months or after the Renters' Rights Act 2025 deadline); and failing to give the correct notice period for each ground. For mandatory grounds especially, the notice must be precisely correct. Always seek legal advice for complex cases.",
  },
  {
    q: "Can I serve a Section 8 notice by email?",
    a: "Only if the tenancy agreement <em>expressly</em> permits service by email and the tenant has consented to receiving legal notices electronically. In the absence of that provision, you should serve the notice: (1) by hand delivery to the property, keeping photographic evidence and a signed certificate of service; or (2) by first-class post to the property address. For postal service, courts typically treat the notice as served on the second working day after posting. Using both methods and retaining evidence of both is advisable.",
  },
  {
    q: "Do I need to attend court for a possession hearing?",
    a: "If you make a <strong>standard possession claim</strong> under Section 8, there will always be a court hearing you should attend. You must send a copy of all case documents to the court at least 14 days before the hearing. If you were using the <strong>accelerated procedure</strong> under Section 21 (which is no longer available for new notices from 1 May 2026), a judge would normally decide on the papers without a hearing unless your tenant raised a defence. For all Section 8 claims, both the standard (online or paper) process requires attendance at a hearing.",
  },
  {
    q: "Is this notice generator free?",
    a: "Yes — this tool is completely free to use. It generates a Section 8 notice using the grounds applicable to notices served before 1 May 2026, as set out in Annex A of the GOV.UK guidance. For a full compliance suite — portfolio risk dashboard, AI-drafted notices, certificate tracking, and an encrypted audit vault — <a href='/signup' style='color:var(--emerald);text-decoration:underline'>get started with Ravelston</a>.",
  },
];
