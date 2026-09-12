export function EmptyState({ title, description, action, icon }) {
  return (
    <div className="ss-state text-center py-5 px-4 bg-white rounded-4 border border-slate-200 shadow-xs my-3">
      <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 56, height: 56, backgroundColor: "#eff6ff", color: "#3b82f6" }}>
        {icon || (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
      </div>
      <h6 className="fw-bold text-slate-900 mb-1" style={{ fontSize: "1.05rem" }}>{title}</h6>
      {description && <p className="text-secondary small mb-3 mx-auto" style={{ maxWidth: 440, lineHeight: 1.5 }}>{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="ss-state text-center py-5 px-4 bg-white rounded-4 border border-danger-subtle shadow-xs my-3">
      <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: 56, height: 56, backgroundColor: "#fef2f2", color: "#ef4444" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h6 className="fw-bold text-slate-900 mb-1">Something went wrong</h6>
      <p className="text-secondary small mb-3 mx-auto" style={{ maxWidth: 440 }}>{message}</p>
      {onRetry && (
        <button className="btn btn-outline-primary btn-sm rounded-3 px-3 fw-semibold" onClick={onRetry}>
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
        <div key={i} className="ss-skeleton rounded-3" style={{ height, border: "1px solid #e2e8f0" }} />
      ))}
    </div>
  );
}

