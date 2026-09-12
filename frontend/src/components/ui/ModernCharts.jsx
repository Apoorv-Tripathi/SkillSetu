import React, { useState } from "react";

// ============================================================
// 1. Line & Area Trend Chart (e.g. CGPA progression, Performance)
// ============================================================
export function LineTrendChart({
  data = [
    { label: "Sem 1", value: 8.2 },
    { label: "Sem 2", value: 8.4 },
    { label: "Sem 3", value: 8.5 },
    { label: "Sem 4", value: 8.7 },
    { label: "Sem 5", value: 8.9 },
  ],
  height = 220,
  minVal = 0,
  maxVal = 10,
  strokeColor = "#2563eb",
  fillColor = "rgba(37, 99, 235, 0.08)",
  unit = "",
  showArea = true,
  yTicks = [0, 2, 4, 6, 8, 10],
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 35;
  const width = 600;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(1, data.length - 1)) * chartWidth;
    const norm = (d.value - minVal) / range;
    const y = paddingTop + chartHeight - norm * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${
        paddingTop + chartHeight
      } Z`
    : "";

  return (
    <div className="w-100 position-relative" style={{ minHeight: height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-100 h-100 overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id={`areaGrad-${strokeColor.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Gridlines & Y-Axis labels */}
        {yTicks.map((tick, i) => {
          const norm = (tick - minVal) / range;
          const y = paddingTop + chartHeight - norm * chartHeight;
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#94a3b8"
                fontWeight="500"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {showArea && <path d={areaD} fill={`url(#areaGrad-${strokeColor.replace(/[^a-zA-Z0-9]/g, "")})`} />}

        {/* Main Line */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive Dots and X-Axis Labels */}
        {points.map((p, i) => (
          <g key={i}>
            {/* X-Axis Label */}
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
              fontWeight="500"
            >
              {p.label}
            </text>

            {/* Data point dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === i ? 6 : 4.5}
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth={hoveredIdx === i ? 3 : 2}
              style={{ cursor: "pointer", transition: "all 0.15s ease" }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />

            {/* Hover Tooltip */}
            {hoveredIdx === i && (
              <g pointerEvents="none">
                <rect
                  x={p.x - 36}
                  y={p.y - 32}
                  width="72"
                  height="24"
                  rx="6"
                  fill="#1e293b"
                  opacity="0.95"
                />
                <text
                  x={p.x}
                  y={p.y - 16}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="700"
                >
                  {p.value} {unit}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ============================================================
// 2. Radar Spider Chart (e.g. 5-Axis Competency & Performance)
// ============================================================
export function RadarSpiderChart({
  axes = ["Academics", "Attendance", "Assignments", "Projects", "Extra-curricular"],
  values = [88, 96, 65, 82, 70],
  size = 280,
  fillColor = "rgba(99, 102, 241, 0.25)",
  strokeColor = "#4f46e5",
}) {
  const center = size / 2;
  const radius = size * 0.38;
  const levels = [25, 50, 75, 100];
  const count = axes.length;

  // Calculate coordinates on a circle
  function getPoint(angle, r) {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  }

  // Polygon points for a specific level (0-100)
  function getLevelPoints(lvl) {
    return axes
      .map((_, i) => {
        const angle = (360 / count) * i;
        const p = getPoint(angle, (lvl / 100) * radius);
        return `${p.x},${p.y}`;
      })
      .join(" ");
  }

  // Data polygon points
  const dataPolygon = values
    .map((val, i) => {
      const angle = (360 / count) * i;
      const p = getPoint(angle, (Math.min(100, Math.max(0, val)) / 100) * radius);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="overflow-visible">
        {/* Background concentric polygons */}
        {levels.map((lvl) => (
          <polygon
            key={lvl}
            points={getLevelPoints(lvl)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* Radiating Axis Lines */}
        {axes.map((axis, i) => {
          const angle = (360 / count) * i;
          const p = getPoint(angle, radius);
          const labelP = getPoint(angle, radius + 22);
          return (
            <g key={i}>
              <line x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />
              <text
                x={labelP.x}
                y={labelP.y + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#64748b"
              >
                {axis}
              </text>
            </g>
          );
        })}

        {/* Filled Data Polygon */}
        <polygon
          points={dataPolygon}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {values.map((val, i) => {
          const angle = (360 / count) * i;
          const p = getPoint(angle, (Math.min(100, Math.max(0, val)) / 100) * radius);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}

// ============================================================
// 3. Multi-segment Donut Chart (e.g. Risk Distribution)
// ============================================================
export function DonutRiskChart({
  data = [
    { label: "High Risk", value: 150, color: "#ef4444" },
    { label: "Medium Risk", value: 178, color: "#f59e0b" },
    { label: "Low Risk", value: 83, color: "#10b981" },
  ],
  size = 240,
  strokeWidth = 34,
}) {
  const [hovered, setHovered] = useState(null);
  const center = size / 2;
  const radius = (size - strokeWidth) / 2 - 10;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

  let accumulatedPercent = 0;

  return (
    <div className="d-flex flex-column align-items-center justify-content-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${center} ${center})`}>
          {data.map((slice, i) => {
            const pct = slice.value / total;
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += pct;

            const isHovered = hovered === i;

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </g>
        {/* Center summary text */}
        <text
          x={center}
          y={center - 6}
          textAnchor="middle"
          fontSize="22"
          fontWeight="800"
          fill="#1e293b"
        >
          {hovered !== null ? data[hovered].value : total}
        </text>
        <text
          x={center}
          y={center + 14}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill="#64748b"
        >
          {hovered !== null ? data[hovered].label : "Total Students"}
        </text>
      </svg>

      {/* Legend */}
      <div className="d-flex flex-wrap justify-content-center gap-3 mt-3">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="d-flex align-items-center gap-1 small"
            style={{
              cursor: "pointer",
              opacity: hovered !== null && hovered !== idx ? 0.5 : 1,
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: item.color,
                display: "inline-block",
              }}
            />
            <span className="fw-semibold text-secondary">{item.label}:</span>
            <span className="fw-bold text-dark">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
