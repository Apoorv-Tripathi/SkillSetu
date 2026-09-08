export function EmptyState({ title, description, action }) {
  return (
    <div className="ss-state">
      <div className="ss-state__icon">—</div>
      <p className="fw-semibold mb-1">{title}</p>
      {description && <p className="small text-secondary mb-3">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="ss-state">
      <div className="ss-state__icon" style={{ color: "#8C3A34" }}>
        !
      </div>
      <p className="fw-semibold mb-1">Something went wrong</p>
      <p className="small text-secondary mb-3">{message}</p>
      {onRetry && (
        <button className="btn btn-outline-secondary btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function LoadingRows({ count = 3, height = 52 }) {
  return (
    <div className="d-flex flex-column gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ss-skeleton" style={{ height, border: "1px solid #DDD6C8" }} />
      ))}
    </div>
  );
}
