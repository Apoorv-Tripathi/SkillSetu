import { useTranslation } from "../../context/LanguageContext.jsx";

export default function PageHeader({ eyebrow, title, description, actions }) {
  const { t } = useTranslation();

  return (
    <div className="ss-page-header">
      <div>
        {eyebrow && <span className="ss-eyebrow">{t(eyebrow)}</span>}
        <h1 className="h4 ss-page-header__title">{t(title)}</h1>
        {description && <p className="ss-page-header__desc">{t(description)}</p>}
      </div>
      {actions && <div className="d-flex gap-2">{actions}</div>}
    </div>
  );
}
