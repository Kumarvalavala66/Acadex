import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import TechText from "../components/TechText";
import { registerUser } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerUser(name.trim(), username.trim(), password);

      navigate("/");
    } catch (err) {
      console.error(err);

      setError(err.message || "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-heading">
          <div className="auth-mark">
            <TechText
              text="Acadex"
              fontSize={52}
              fontWeight={700}
              color="#111827"
              accentColor="#6b7280"
              strokeWidth={1.1}
              specks={10}
              speed={1.2}
              sweep
            />
          </div>

          <h1>Create your account.</h1>

          <p>Keep your academic and personal work in one place.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Prasann"
              autoComplete="name"
              required
            />
          </label>

          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="prasann2"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>

          <Link to="/">Sign in</Link>
        </div>
      </section>
    </main>
  );
}
