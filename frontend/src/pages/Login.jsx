import { useState } from "react";
import { loginUser } from "../services/api";
import { Link, useNavigate } from "react-router-dom";

import TechText from "../components/TechText";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await loginUser({
        username: formData.username,
        password: formData.password,
      });

      localStorage.setItem("access_token", response.access_token);

      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand-wrap">
          <TechText
            text="Acadex"
            fontSize={110}
            fontWeight={700}
            color="#111827"
            accentColor="#7c8aa3"
            letterSpacing={-0.06}
            strokeWidth={1.2}
            speed={1.15}
            specks={14}
            sweep
          />
        </div>

        <h1>Welcome back.</h1>

        <p className="auth-subtitle">
          Sign in to continue managing your academic work.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
