const MARK = { met: "✓", weak: "△", missing: "✕" };

export default function MatchBreakdown({ rows }) {
  return (
    <div>
      {rows.map((row, i) => (
        <div className={`ss-match-row ss-match-row--${row.status}`} key={row.skill?._id || i}>
          <span className="ss-match-row__mark">{MARK[row.status] || "•"}</span>
          <span className="flex-grow-1">{row.skill?.name || row.skillName}</span>
          <span className="text-secondary">
            Required {row.required}/5 · Current {row.current}/5
          </span>
        </div>
      ))}
    </div>
  );
}
