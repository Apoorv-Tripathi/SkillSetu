import { useTranslation } from "../../context/LanguageContext.jsx";

const STAGES = ["applied", "shortlisted", "interview", "offer"];

export default function ApplicationTimeline({ status }) {
  const { t } = useTranslation();

  if (status === "rejected") {
    return <span className="ss-status ss-status--gap">{t("status_rejected", "Rejected")}</span>;
  }

  const currentIndex = STAGES.indexOf(status);

  return (
    <div className="ss-timeline-wrapper">
      <div className="ss-timeline">
        {STAGES.map((stage, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div
              key={stage}
              className={`ss-timeline__stage ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
            >
              <div className="ss-timeline__node">
                <span className="ss-timeline__dot">
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </span>
                {i < STAGES.length - 1 && (
                  <div className={`ss-timeline__connector ${i < currentIndex ? "is-done" : ""}`} />
                )}
              </div>
              <span className="ss-timeline__label">
                {t(`status_${stage}`, stage.charAt(0).toUpperCase() + stage.slice(1))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
