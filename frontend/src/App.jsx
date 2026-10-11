import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";

import TechText from "./components/TechText";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Work from "./pages/Work";
import Board from "./pages/Board";
import Calendar from "./pages/Calendar";
import Exams from "./pages/Exams";
import Learning from "./pages/Learning";
import Achievements from "./pages/Achievements";
import Settings from "./pages/Settings";

const NAVIGATION_ICON_PATHS = {
  "/dashboard": "M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z",
  "/work": "M3 8h18v12H3z M8 8V5h8v3 M3 12h18 M10 12v2h4v-2",
  "/board": "M4 4h4v16H4z M10 4h4v16h-4z M16 4h4v16h-4z",
  "/calendar": "M4 6h16v15H4z M8 3v6 M16 3v6 M4 11h16 M8 15h2 M14 15h2",
  "/learning": "M4 5.5A3.5 3.5 0 0 1 7.5 2H20v17H7.5A3.5 3.5 0 0 0 4 22z M4 5.5v16.5 M8 6h8 M8 10h8",
  "/exams": "M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  "/achievements": "M8 4H4v3a5 5 0 0 0 5 5 M16 4h4v3a5 5 0 0 1-5 5 M12 13v5 M8 21h8 M9 18h6 M8 3h8v6a4 4 0 0 1-8 0z",
  "/settings": "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 2.9-.2-.1a1.7 1.7 0 0 0-1.9.3l-.1.1h-3.4l-.1-.2a1.7 1.7 0 0 0-1.6-1.1 1.7 1.7 0 0 0-.8.2l-.2.1-2.9-1.7.1-.2a1.7 1.7 0 0 0-.3-1.9l-.1-.1v-3.4l.2-.1a1.7 1.7 0 0 0 1.1-1.6 1.7 1.7 0 0 0-.2-.8l-.1-.2 1.7-2.9.2.1a1.7 1.7 0 0 0 1.9-.3l.1-.1h3.4l.1.2a1.7 1.7 0 0 0 1.6 1.1 1.7 1.7 0 0 0 .8-.2l.2-.1 2.9 1.7-.1.2a1.7 1.7 0 0 0 .3 1.9l.1.1v3.4z",
  more: "M5 12h.01 M12 12h.01 M19 12h.01",
  logout: "M10 17l5-5-5-5 M15 12H3 M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7",
};

function NavigationIcon({ name }) {
  return (
    <svg
      className="mobile-navigation-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={NAVIGATION_ICON_PATHS[name]} />
    </svg>
  );
}

function ProtectedLayout() {
  const token = localStorage.getItem("access_token");
  const location = useLocation();
  const [mobileMenuState, setMobileMenuState] = useState({
    pathname: location.pathname,
    open: false,
  });
  const isMobileMenuOpen =
    mobileMenuState.pathname === location.pathname && mobileMenuState.open;

  useEffect(() => {
    document.title = "Acadex";
  }, []);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const navGroups = [
    {
      label: "MAIN",
      items: [
        {
          path: "/dashboard",
          label: "Dashboard",
        },
        {
          path: "/work",
          label: "Work",
        },
        {
          path: "/board",
          label: "Board",
        },
        {
          path: "/calendar",
          label: "Calendar",
        },
      ],
    },
    {
      label: "ACADEMIC",
      items: [
        {
          path: "/exams",
          label: "Exams",
        },
        {
          path: "/learning",
          label: "Learning",
        },
        {
          path: "/achievements",
          label: "Achievements",
        },
      ],
    },
  ];
  const mobilePrimaryItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/work", label: "Work" },
    { path: "/board", label: "Board" },
    { path: "/calendar", label: "Calendar" },
    { path: "/learning", label: "Learning" },
  ];
  const mobileOverflowItems = [
    ...navGroups.flatMap((group) => group.items),
    { path: "/settings", label: "Settings" },
  ].filter(
    (item) => !mobilePrimaryItems.some((primary) => primary.path === item.path),
  );
  const isMobileOverflowActive = mobileOverflowItems.some(
    (item) => item.path === location.pathname,
  );

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    window.location.href = "/";
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">A</div>

          <div className="sidebar-brand">
            <TechText
              text="Acadex"
              fontSize={22}
              fontWeight={700}
              color="var(--color-text)"
              accentColor="var(--color-text-muted)"
              letterSpacing={-0.05}
              strokeWidth={1}
              specks={6}
              speed={1.2}
            />

            <span>Academic workspace</span>
          </div>
        </div>

        <div className="sidebar-navigation">
          {navGroups.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <span className="sidebar-group-label">{group.label}</span>

              <div className="sidebar-links">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          <div className="sidebar-group sidebar-system">
            <span className="sidebar-group-label">SYSTEM</span>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span>Settings</span>
            </NavLink>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>

            <div className="sidebar-user-info">
              <strong>{user.name || "Student"}</strong>

              <span>@{user.username || "user"}</span>
            </div>
          </div>

          <button type="button" className="sidebar-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/work" element={<Work />} />

          <Route path="/board" element={<Board />} />

          <Route path="/calendar" element={<Calendar />} />

          <Route path="/exams" element={<Exams />} />

          <Route path="/learning" element={<Learning />} />

          <Route path="/achievements" element={<Achievements />} />

          <Route
            path="/settings"
            element={<Settings user={user} onLogout={logout} />}
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <nav className="mobile-navigation" aria-label="Main navigation">
        <div className="mobile-navigation-primary">
          {mobilePrimaryItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mobile-navigation-link ${isActive ? "active" : ""}`
              }
              onClick={() =>
                setMobileMenuState({
                  pathname: location.pathname,
                  open: false,
                })
              }
              aria-label={item.label}
              title={item.label}
            >
              <NavigationIcon name={item.path} />
              <span className="mobile-navigation-label">{item.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className={`mobile-navigation-link mobile-navigation-more ${
              isMobileOverflowActive || isMobileMenuOpen ? "active" : ""
            }`}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-label="More navigation options"
            title="More navigation options"
            onClick={() =>
              setMobileMenuState({
                pathname: location.pathname,
                open: !isMobileMenuOpen,
              })
            }
          >
            <NavigationIcon name="more" />
            <span className="mobile-navigation-label">More</span>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-navigation-menu" id="mobile-navigation-menu">
            <div className="mobile-navigation-menu-heading">More options</div>
            {mobileOverflowItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `mobile-navigation-menu-link ${isActive ? "active" : ""}`
                }
                onClick={() =>
                  setMobileMenuState({
                    pathname: location.pathname,
                    open: false,
                  })
                }
              >
                <NavigationIcon name={item.path} />
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              className="mobile-navigation-menu-link mobile-navigation-menu-signout"
              aria-label="Sign out"
              onClick={logout}
            >
              <NavigationIcon name="logout" />
              Sign out
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}

function PlaceholderPage({ title, description }) {
  return (
    <section className="page-container">
      <div className="page-heading">
        <span className="eyebrow">Acadex</span>

        <h2>{title}</h2>

        <p>{description}</p>
      </div>

      <div className="coming-soon">
        <span>In development</span>

        <h3>{title}</h3>

        <p>This section will be connected to the backend as we build it.</p>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
