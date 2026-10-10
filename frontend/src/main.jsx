import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

document.body.classList.toggle(
  "dark-theme",
  localStorage.getItem("dark_mode") === "true",
);
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
