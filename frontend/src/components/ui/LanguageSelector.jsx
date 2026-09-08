import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../../context/LanguageContext.jsx";

export default function LanguageSelector({ className = "", compact = false }) {
  const { language, setLanguage, languages, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className={`ss-lang-selector position-relative ${className}`} ref={ref}>
      <button
        type="button"
        className="ss-lang-btn d-flex align-items-center gap-1"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t("language")}
        title={t("language")}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-secondary"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>

        {!compact && (
          <span className="small fw-semibold text-dark font-monospace" style={{ fontSize: "0.78rem" }}>
            {currentLang.nativeName}
          </span>
        )}

        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {open && (
        <div
          className="dropdown-menu show shadow-lg border p-1 position-absolute end-0 mt-1"
          style={{
            minWidth: "190px",
            maxHeight: "320px",
            overflowY: "auto",
            zIndex: 1050,
            borderRadius: "10px",
          }}
        >
          <div className="px-2 py-1 text-muted small border-bottom mb-1" style={{ fontSize: "0.68rem" }}>
            {t("language").toUpperCase()} / भारतीय भाषाएं
          </div>
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`dropdown-item rounded small d-flex align-items-center justify-content-between py-1 px-2 ${
                language === l.code ? "active fw-bold" : ""
              }`}
              style={{ fontSize: "0.82rem" }}
              onClick={() => {
                setLanguage(l.code);
                setOpen(false);
              }}
            >
              <span>
                <strong className="me-1">{l.nativeName}</strong>
                {l.code !== "en" && <span className="text-secondary" style={{ fontSize: "0.72rem" }}>({l.name})</span>}
              </span>
              {language === l.code && <span className="ms-2">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
