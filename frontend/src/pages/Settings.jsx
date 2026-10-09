import { useEffect, useState } from "react";
import {
  changePassword,
  getProfile,
  updateProfile,
} from "../services/api";
import "./Settings.css";

const EMPTY_PASSWORD = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

export default function Settings({ user, onLogout }) {
  const [profile, setProfile] = useState({
    name: user?.name || "",
    username: user?.username || "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [password, setPassword] = useState(EMPTY_PASSWORD);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [defaultPriority, setDefaultPriority] = useState(
    localStorage.getItem("default_task_priority") || "medium"
  );
  const [defaultLearningMinutes, setDefaultLearningMinutes] = useState(
    localStorage.getItem("default_learning_minutes") || "60"
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("dark_mode") === "true"
  );
  const [compactMode, setCompactMode] = useState(
    localStorage.getItem("compact_mode") === "true"
  );
  const [showCompletedTasks, setShowCompletedTasks] = useState(
    localStorage.getItem("show_completed_tasks") === "true"
  );
  const [preferencesMessage, setPreferencesMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", darkMode);
    document.body.classList.toggle("compact-theme", compactMode);
    localStorage.setItem("dark_mode", String(darkMode));
    localStorage.setItem("compact_mode", String(compactMode));
    localStorage.setItem("show_completed_tasks", String(showCompletedTasks));
  }, [darkMode, compactMode, showCompletedTasks]);

  async function loadProfile() {
    try {
      setProfileLoading(true);
      setProfileError("");
      const data = await getProfile();
      setProfile({ name: data.name || "", username: data.username || "" });
    } catch (err) {
      setProfileError(err.message || "Failed to load profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    try {
      setProfileSaving(true);
      setProfileMessage("");
      setProfileError("");
      const data = await updateProfile(profile);
      setProfile({ name: data.name || "", username: data.username || "" });
      localStorage.setItem(
        "user",
        JSON.stringify({ id: data.id, name: data.name, username: data.username })
      );
      setProfileMessage("Profile updated successfully.");
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function submitPassword(event) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (password.new_password !== password.confirm_password) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (password.new_password.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    try {
      setPasswordSaving(true);
      await changePassword({
        current_password: password.current_password,
        new_password: password.new_password,
      });
      setPassword(EMPTY_PASSWORD);
      setPasswordMessage("Password changed successfully.");
    } catch (err) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  function savePreferences(event) {
    event.preventDefault();
    localStorage.setItem("default_task_priority", defaultPriority);
    localStorage.setItem("default_learning_minutes", defaultLearningMinutes);
    localStorage.setItem("dark_mode", String(darkMode));
    localStorage.setItem("compact_mode", String(compactMode));
    localStorage.setItem("show_completed_tasks", String(showCompletedTasks));
    setPreferencesMessage("Preferences saved.");
    window.setTimeout(() => setPreferencesMessage(""), 2500);
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    if (onLogout) onLogout();
  }

  return (
    <main className="settings-page">
      <header className="settings-header">
        <div>
          <span className="eyebrow">Acadex</span>
          <h1>Settings</h1>
          <p>Manage your account and organizer preferences.</p>
        </div>
      </header>

      <div className="settings-grid">
        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Profile</h2>
              <p>Update the information shown in your organizer.</p>
            </div>
          </div>

          {profileLoading ? (
            <p className="settings-muted">Loading profile…</p>
          ) : (
            <form onSubmit={saveProfile} className="settings-form">
              <label>
                Name
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                  maxLength={100}
                />
              </label>

              <label>
                Username
                <input
                  value={profile.username}
                  onChange={(e) =>
                    setProfile({ ...profile, username: e.target.value })
                  }
                  required
                  maxLength={50}
                />
              </label>

              <div className="settings-actions">
                <button type="submit" disabled={profileSaving}>
                  {profileSaving ? "Saving…" : "Save profile"}
                </button>
              </div>

              {profileMessage && <p className="settings-success">{profileMessage}</p>}
              {profileError && <p className="settings-error">{profileError}</p>}
            </form>
          )}
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Academic preferences</h2>
              <p>Choose sensible defaults for new work and learning tasks.</p>
            </div>
          </div>

          <form onSubmit={savePreferences} className="settings-form">
            <label>
              Default task priority
              <select
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label>
              Default learning estimate
              <select
                value={defaultLearningMinutes}
                onChange={(e) => setDefaultLearningMinutes(e.target.value)}
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </label>

            <label className="settings-toggle">
              <span>Dark mode</span>
              <button
                type="button"
                className={`toggle-switch ${darkMode ? "on" : ""}`}
                aria-pressed={darkMode}
                onClick={() => setDarkMode((value) => !value)}
              >
                <span className="toggle-knob" />
              </button>
            </label>

            <label className="settings-toggle">
              <span>Compact mode</span>
              <button
                type="button"
                className={`toggle-switch ${compactMode ? "on" : ""}`}
                aria-pressed={compactMode}
                onClick={() => setCompactMode((value) => !value)}
              >
                <span className="toggle-knob" />
              </button>
            </label>

            <label className="settings-toggle">
              <span>Show completed tasks</span>
              <button
                type="button"
                className={`toggle-switch ${showCompletedTasks ? "on" : ""}`}
                aria-pressed={showCompletedTasks}
                onClick={() => setShowCompletedTasks((value) => !value)}
              >
                <span className="toggle-knob" />
              </button>
            </label>

            <div className="settings-actions">
              <button type="submit">Save preferences</button>
            </div>
            {preferencesMessage && (
              <p className="settings-success">{preferencesMessage}</p>
            )}
          </form>
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Account</h2>
              <p>Keep your account credentials up to date.</p>
            </div>
          </div>

          <form onSubmit={submitPassword} className="settings-form">
            <label>
              Current password
              <input
                type="password"
                value={password.current_password}
                onChange={(e) =>
                  setPassword({ ...password, current_password: e.target.value })
                }
                required
              />
            </label>

            <label>
              New password
              <input
                type="password"
                value={password.new_password}
                onChange={(e) =>
                  setPassword({ ...password, new_password: e.target.value })
                }
                minLength={6}
                required
              />
            </label>

            <label>
              Confirm new password
              <input
                type="password"
                value={password.confirm_password}
                onChange={(e) =>
                  setPassword({ ...password, confirm_password: e.target.value })
                }
                minLength={6}
                required
              />
            </label>

            <div className="settings-actions">
              <button type="submit" disabled={passwordSaving}>
                {passwordSaving ? "Changing…" : "Change password"}
              </button>
            </div>

            {passwordMessage && <p className="settings-success">{passwordMessage}</p>}
            {passwordError && <p className="settings-error">{passwordError}</p>}
          </form>
        </section>

        <section className="settings-card settings-card-danger">
          <div className="settings-card-header">
            <div>
              <h2>Session & local data</h2>
              <p>
                Your organizer uses your local app database. Logging out only removes
                this browser session; it does not delete your academic data.
              </p>
            </div>
          </div>

          <div className="settings-danger-row">
            <div>
              <strong>Log out</strong>
              <span>Sign out of this account on this browser.</span>
            </div>
            <button type="button" className="danger-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
