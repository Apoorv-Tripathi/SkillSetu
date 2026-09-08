import { useTranslation } from "../../context/LanguageContext.jsx";

const VARIANT_BY_STATUS = {
  met: "met",
  developing: "developing",
  gap: "gap",
  missing: "gap",
  weak: "developing",
  applied: "applied",
  shortlisted: "shortlisted",
  assessment: "assessment",
  interview: "interview",
  offer: "offer",
  rejected: "rejected",
  evaluated: "met",
  pending: "neutral",
  accepted: "met",
  declined: "gap",
  verified: "met",
  unverified: "neutral",
  high: "high",
  medium: "medium",
  low: "low",
  improved: "improved",
  good: "good",
  average: "average",
};

export default function StatusBadge({ status, label, pill = true }) {
  const { t } = useTranslation();
  const variant = VARIANT_BY_STATUS[status?.toLowerCase()] || "neutral";
  const rawLabel = label || (status ? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ") : "");
  const displayLabel = t(rawLabel);

  if (pill) {
    return <span className={`ss-badge-pill ss-badge-pill--${variant}`}>{displayLabel}</span>;
  }
  return <span className={`ss-status ss-status--${variant}`}>{displayLabel}</span>;
}
