import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AccessProvider } from "./context/AccessContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Outermost on purpose: a crash inside a provider should still show the
        error screen rather than a blank page. */}
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          {/* Inside AuthProvider, because the plan is a fact about whoever is
              signed in and has to be re-asked when that changes. */}
          <AccessProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AccessProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
