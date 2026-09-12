import React from "react";

/**
 * MetricCard: Matches the 4-card metric rows from the SIH Finalist Reference Benchmark.
 * Supports both solid fill (Student/Faculty) and clean surface with colored icons (Admin/Analytics).
 */
export default function MetricCard({
  label,
  value,
  meta,
  metaColor,
  icon,
  variant = "blue", // "blue" | "green" | "amber" | "cyan" | "purple" | "red" | "surface-blue" | "surface-green" | etc.
  progress,         // number (0 - 100)
  className = "",
  onClick,
}) {
  const isSurface = variant.startsWith("surface");
  const baseClass = isSurface ? `ss-kpi-card--surface ss-kpi-card--${variant}` : `ss-kpi-card--${variant}`;

  return (
    <div
      className={`ss-kpi-card ${baseClass} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="ss-kpi-card__top">
        <span className="ss-kpi-card__label">{label}</span>
        {icon && <div className="ss-kpi-card__icon">{icon}</div>}
      </div>

      <div className="ss-kpi-card__value">{value}</div>

      {meta && (
        <div
          className="ss-kpi-card__meta"
          style={metaColor ? { color: metaColor } : undefined}
        >
          {meta}
        </div>
      )}

      {typeof progress === "number" && (
        <div className="ss-kpi-card__progress">
          <div
            className="ss-kpi-card__progress-fill"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
