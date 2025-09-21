import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import Logo from "./assets/Logo.png";

// Set up a runtime favicon using the imported Logo asset. This ensures the
// favicon reference uses the correct hashed filename produced by Vite in
// production builds. Keeping this logic in `main.jsx` centralizes asset
// handling for the app entrypoint.
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
    // Intentionally ignore favicon errors; app should continue to run even
    // if the browser refuses to set the favicon (e.g., CSP restrictions).
  }
}

setFavicon(Logo);

// Mount the React application. Using StrictMode helps surface potential
// side-effect issues during development.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
