import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Root render. Keep minimal; all views are inside App.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);