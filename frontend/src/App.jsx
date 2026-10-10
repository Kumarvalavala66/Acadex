import { useEffect } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";

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

function ProtectedLayout() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    document.title = "Acadex";
  }, []);

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
