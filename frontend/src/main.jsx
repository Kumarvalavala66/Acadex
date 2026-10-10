import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";
import { applyTheme, getStoredTheme } from "./theme";

const initialTheme = getStoredTheme();
applyTheme(initialTheme);
document.body.classList.toggle(
  "compact-theme",
  localStorage.getItem("compact_mode") === "true",
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
