// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// IMPORT THE NEW, COMPILED CSS FILE
import "./output.css"; // <-- CHANGE THIS LINE

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
