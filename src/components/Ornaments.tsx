"use client";

export function Fleuron({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M12 2 C 9 6, 9 10, 12 12 C 15 10, 15 6, 12 2 Z" />
      <path d="M12 22 C 9 18, 9 14, 12 12 C 15 14, 15 18, 12 22 Z" />
      <path d="M2 12 C 6 9, 10 9, 12 12 C 10 15, 6 15, 2 12 Z" />
      <path d="M22 12 C 18 9, 14 9, 12 12 C 14 15, 18 15, 22 12 Z" />
      <circle cx="12" cy="12" r="1.2" fill={color} stroke="none" />
    </svg>
  );
}

export function Diamond({ size = 8, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <rect x="1" y="1" width="6" height="6" transform="rotate(45 4 4)" fill={color} />
    </svg>
  );
}

export function Star({ size = 10, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill={color} />
    </svg>
  );
}

export function OrnRule({ piece = "fleuron" }: { piece?: "fleuron" | "diamond" | "star" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, color: "var(--forest)" }}>
      <div style={{ flex: 1, borderTop: "1px solid var(--forest)" }} />
      <div style={{ flex: 1, borderTop: "1px solid var(--forest)", marginTop: 4 }} />
      {piece === "fleuron" ? <Fleuron size={20} /> : piece === "diamond" ? <Diamond size={10} /> : <Star size={12} />}
      <div style={{ flex: 1, borderTop: "1px solid var(--forest)", marginTop: 4 }} />
      <div style={{ flex: 1, borderTop: "1px solid var(--forest)" }} />
    </div>
  );
}
