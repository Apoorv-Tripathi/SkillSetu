import { useTranslation } from "../../context/LanguageContext.jsx";

export default function PageHeader({ eyebrow, title, description, actions }) {
  const { t } = useTranslation();

  return (
    <div className="ss-page-header d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
      <div>
        {eyebrow && <span className="ss-eyebrow mb-1">{t(eyebrow)}</span>}
        <h1 className="h4 ss-page-header__title mb-1 fw-bold">{t(title)}</h1>
        {description && <p className="ss-page-header__desc text-muted small mb-0">{t(description)}</p>}
      </div>
      {actions && <div className="d-flex align-items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
