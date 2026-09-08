const COLOR_BY_STATUS = {
  met: "#3D6B4F",
  developing: "#A77B3D",
  gap: "#8C3A34",
};

// scale: the max value the bar represents (5 for proficiency scores, 100 for percentage scores)
// target is optional — omit it for a plain "current level" bar with no benchmark line.
export default function SkillBar({ name, current, target, status, scale = 5 }) {
  const fillPct = Math.min(100, Math.round((current / scale) * 100));
  const hasTarget = target !== undefined && target !== null;
  const targetPct = hasTarget ? Math.min(100, Math.round((target / scale) * 100)) : null;
  const color = COLOR_BY_STATUS[status] || "#5C7185";

  return (
    <div className="ss-skill-bar">
      <div className="ss-skill-bar__row">
        <span className="ss-skill-bar__name">{name}</span>
        <span className="ss-skill-bar__value">
          {current}/{scale}
          {hasTarget && <span className="text-secondary"> · target {target}</span>}
        </span>
      </div>
      <div className="ss-skill-bar__track">
        <div className="ss-skill-bar__fill" style={{ width: `${fillPct}%`, backgroundColor: color }} />
        {hasTarget && (
          <div className="ss-skill-bar__target" style={{ left: `${targetPct}%` }} title={`Target: ${target}/${scale}`} />
        )}
      </div>
    </div>
  );
}
