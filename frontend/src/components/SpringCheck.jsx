import { useState } from "react";
import "./SpringCheck.css";

export default function SpringCheck({
  label,
  defaultChecked = false,
  onChange,
  color = "#ffffff",
  fillColor = "#ffffff",
  checkColor = "#0b0b0f",
  boxSize = 28,
  boxRadius = 9,
  fontSize = 18,
  bounce = 0.2,
  strikeLag = 0.12,
  doneOpacity = 0.42,
  strike = "left",
  disabled = false,
}) {
  const [checked, setChecked] =
    useState(defaultChecked);

  function toggle() {
    if (disabled) return;

    const next = !checked;

    setChecked(next);

    if (onChange) {
      onChange(next);
    }
  }

  return (
    <button
      type="button"
      className={
        checked
          ? "spring-check checked"
          : "spring-check"
      }
      onClick={toggle}
      disabled={disabled}
      style={{
        "--box-size": `${boxSize}px`,
        "--box-radius": `${boxRadius}px`,
        "--font-size": `${fontSize}px`,
        "--box-fill": fillColor,
        "--check-color": checkColor,
        "--text-color": color,
        "--done-opacity": doneOpacity,
        "--strike-delay": `${strikeLag}s`,
        "--bounce": bounce,
      }}
    >
      <span className="spring-box">
        <svg
          viewBox="0 0 24 24"
          className="spring-icon"
          aria-hidden="true"
        >
          <path
            d="M5 12.5 9.5 17 19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className="spring-label">
        {label}
      </span>
    </button>
  );
}
