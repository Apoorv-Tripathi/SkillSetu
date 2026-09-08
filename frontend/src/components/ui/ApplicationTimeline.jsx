import { useTranslation } from "../../context/LanguageContext.jsx";

const STAGES = ["applied", "shortlisted", "interview", "offer"];

export default function ApplicationTimeline({ status }) {
  const { t } = useTranslation();

  if (status === "rejected") {
    return <span className="ss-status ss-status--gap">{t("status_rejected", "Rejected")}</span>;
  }

  const currentIndex = STAGES.indexOf(status);

  return (
    <div className="ss-timeline">
      {STAGES.map((stage, i) => (
        <div
          key={stage}
          className={`ss-timeline__stage${i < currentIndex ? " is-done" : ""}${
            i === currentIndex ? " is-current" : ""
          }`}
        >
          <span className="ss-timeline__dot" />
          {t(`status_${stage}`, stage)}
        </div>
      ))}
    </div>
  );
}
