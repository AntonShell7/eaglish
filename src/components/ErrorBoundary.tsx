import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * The screen shown when something in the app throws.
 *
 * Without it React unmounts the whole tree and the visitor gets a white page —
 * no explanation, no way back, and no idea that anything is worth reporting.
 * A tester who sees a blank screen closes the tab; one who sees this sends a
 * report, which is the entire point of a launch to friends.
 *
 * Deliberately plain: it must not depend on theme context, translations or
 * routing, because any of those could be what broke.
 */
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Kept in the console rather than sent anywhere: shipping crash reports to a
    // third party would contradict what the privacy policy promises.
    console.error("[eaglish] unhandled error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#0b0715",
          color: "#f3f0fa",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ maxWidth: 460, textAlign: "center" }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>🦅</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Что-то сломалось</h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#b9b2cf" }}>
            Ошибка на нашей стороне, не на твоей. Прогресс сохранён — он лежит в этом браузере и
            никуда не делся.
          </p>

          <div style={{ marginTop: 22, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: "11px 22px",
                borderRadius: 999,
                border: "none",
                background: "var(--color-ink)",
                color: "#150e22",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Перезагрузить
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                padding: "11px 22px",
                borderRadius: 999,
                border: "1px solid #2c2440",
                background: "transparent",
                color: "#b9b2cf",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              На главную
            </button>
          </div>

          <p style={{ marginTop: 20, fontSize: 12, color: "#7e7796" }}>
            Если повторится — напиши на eaglish@yandex.ru, это правда помогает.
          </p>

          <pre
            style={{
              marginTop: 18,
              padding: 12,
              borderRadius: 10,
              background: "#150e22",
              color: "#7e7796",
              fontSize: 11,
              textAlign: "left",
              overflowX: "auto",
            }}
          >
            {this.state.error.message}
          </pre>
        </div>
      </div>
    );
  }
}
