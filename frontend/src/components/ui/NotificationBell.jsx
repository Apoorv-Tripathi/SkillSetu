import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";

export default function NotificationBell() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  function load() {
    api
      .getMyNotifications(token)
      .then(({ notifications, unreadCount }) => {
        setNotifications(notifications || []);
        setUnreadCount(unreadCount || 0);
      })
      .catch(() => {});
  }

  useEffect(load, [token]);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleOpen(notification) {
    if (!notification.read) {
      await api.markNotificationRead(notification._id, token).catch(() => {});
    }
    setOpen(false);
    load();
    if (notification.link) navigate(notification.link);
  }

  async function handleMarkAllRead() {
    await api.markAllNotificationsRead(token).catch(() => {});
    load();
  }

  return (
    <div className="position-relative" ref={ref}>
      <button
        className="ss-icon-btn position-relative"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        title="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "0.6rem", padding: "0.2rem 0.35rem" }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg border"
          style={{ width: "340px", zIndex: 1050, maxHeight: "420px", overflowY: "auto" }}
        >
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
            <span className="fw-bold small text-dark">Notifications</span>
            {unreadCount > 0 && (
              <button className="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-semibold" style={{ fontSize: "0.75rem" }} onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <div>
            {notifications.length === 0 ? (
              <p className="small text-muted p-4 text-center mb-0">You're all caught up.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  className="d-block w-100 text-start btn p-3 border-bottom rounded-0 transition"
                  style={{
                    backgroundColor: n.read ? "transparent" : "#FFF7ED",
                  }}
                  onClick={() => handleOpen(n)}
                >
                  <p className="small fw-bold mb-1 text-dark">{n.title}</p>
                  <p className="small text-secondary mb-0 line-clamp-2">{n.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

