import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import Logo from "./assets/Logo.png";

// Ensure favicon works in production builds by using Vite's asset handling.
// Importing the image and setting the link href at runtime guarantees the
// correct hashed URL is used after build.
function setFavicon(href) {
  try {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
  } catch (e) {
    // ignore
  }
}

setFavicon(Logo);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
