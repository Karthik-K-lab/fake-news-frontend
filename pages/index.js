// pages/index.js
import { useMemo, useState } from "react";
import Head from "next/head";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getTopPrediction(predictions) {
  if (!Array.isArray(predictions) || predictions.length === 0) return null;
  return predictions.reduce((best, item) =>
    item.score > best.score ? item : best
  );
}

function confidenceText(score) {
  if (score >= 0.9) return "HIGH CONFIDENCE";
  if (score >= 0.75) return "MEDIUM CONFIDENCE";
  return "LOW CONFIDENCE";
}

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const top = useMemo(
    () => getTopPrediction(result?.predictions),
    [result]
  );

  async function onPredict() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Fake News Arcade</title>
        <meta
          name="description"
          content="Retro arcade-style fake news detector"
        />
        <meta name="theme-color" content="#0b1020" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <main className="shell">
        <div className="bg-grid" />
        <div className="bg-scanlines" />
        <div className="bg-glow" />

        <section className="frame">
          <div className="header-bar">
            <div className="badge">SYSTEM ONLINE</div>
            <div className="badge badge-alt">AI NEWS CHECKER</div>
          </div>

          <div className="hero">
            <p className="kicker">1990s Cyber Terminal</p>
            <h1>FAKE NEWS DETECTOR</h1>
            <p className="subtitle">
              Paste a headline or short article. The machine will classify it
              as <span>REAL</span> or <span>FAKE</span>.
            </p>
          </div>

          <div className="layout">
            <section className="panel input-panel">
              <div className="panel-title">INPUT BUFFER</div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste news text here..."
                maxLength={3000}
              />
              <div className="actions">
                <button
                  onClick={onPredict}
                  disabled={!text.trim() || loading}
                  className="pixel-button"
                >
                  {loading ? "SCANNING..." : "RUN DETECTOR"}
                </button>
                <div className="meta">
                  {text.trim().length}/3000 chars
                </div>
              </div>
            </section>

            <section className="panel output-panel">
              <div className="panel-title">RESULTS</div>

              {!result && !error && (
                <div className="empty-state">
                  <strong>RUN DETECTOR</strong>
                </div>
              )}

              {error && (
                <div className="error-box">
                  <div className="error-title">ERROR</div>
                  <div>{error}</div>
                </div>
              )}

              {result && top && (
                <div className="result-card">
                  <div className="top-line">
                    <div>
                      <div className="result-label">{top.label}</div>
                      <div className="result-confidence">
                        {confidenceText(top.score)}
                      </div>
                    </div>
                    <div className="result-score">
                      {(top.score * 100).toFixed(2)}%
                    </div>
                  </div>

                  <div className="meter">
                    <div
                      className="meter-fill"
                      style={{ width: `${Math.round(top.score * 100)}%` }}
                    />
                  </div>

                  <div className="score-list">
                    {result.predictions.map((p) => (
                      <div key={p.label} className="score-row">
                        <span>{p.label}</span>
                        <span>{(p.score * 100).toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <section className="footer-panel">
            <div className="footer-title">MISSION LOG</div>
            <div className="footer-text">
              {top
                ? `Latest scan complete — ${top.label} detected with ${(top.score * 100).toFixed(2)}% confidence.`
                : "Awaiting scan input."}
            </div>
          </section>
        </section>
      </main>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #__next {
          height: 100%;
          margin: 0;
        }

        body {
          background:
            radial-gradient(circle at top, rgba(87, 255, 180, 0.12), transparent 35%),
            linear-gradient(180deg, #050816 0%, #090c18 45%, #04050b 100%);
          color: #e7f7ff;
          font-family: "Courier New", monospace;
          overflow-x: hidden;
        }

        .shell {
          position: relative;
          min-height: 100vh;
          padding: 32px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bg-grid,
        .bg-scanlines,
        .bg-glow {
          position: fixed;
          inset: 0;
          pointer-events: none;
        }

        .bg-grid {
          opacity: 0.12;
          background-image:
            linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px);
          background-size: 36px 36px;
          mix-blend-mode: screen;
        }

        .bg-scanlines {
          opacity: 0.11;
          background: repeating-linear-gradient(
            180deg,
            rgba(255,255,255,0.06) 0px,
            rgba(255,255,255,0.06) 1px,
            transparent 2px,
            transparent 5px
          );
        }

        .bg-glow {
          background:
            radial-gradient(circle at 20% 20%, rgba(255, 61, 242, 0.12), transparent 22%),
            radial-gradient(circle at 80% 25%, rgba(70, 255, 210, 0.14), transparent 20%),
            radial-gradient(circle at 50% 70%, rgba(68, 112, 255, 0.16), transparent 26%);
          filter: blur(18px);
        }

        .frame {
          position: relative;
          width: min(1120px, 100%);
          border: 3px solid #72f6ff;
          border-radius: 24px;
          padding: 18px;
          background: linear-gradient(180deg, rgba(9, 15, 35, 0.92), rgba(5, 7, 20, 0.95));
          box-shadow:
            0 0 0 4px rgba(114, 246, 255, 0.08),
            0 0 48px rgba(67, 255, 213, 0.12),
            inset 0 0 40px rgba(255, 255, 255, 0.03);
        }

        .header-bar {
          display: flex;
          gap: 10px;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .badge {
          padding: 8px 12px;
          border: 2px solid #ff4fe4;
          color: #ffb1f4;
          background: rgba(255, 79, 228, 0.08);
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: 1.5px;
        }

        .badge-alt {
          border-color: #58ffcf;
          color: #9fffe8;
          background: rgba(88, 255, 207, 0.08);
        }

        .hero {
          text-align: center;
          padding: 18px 8px 28px;
        }

        .kicker {
          margin: 0 0 8px;
          color: #75fce2;
          letter-spacing: 3px;
          font-size: 12px;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(36px, 7vw, 72px);
          letter-spacing: 4px;
          color: #ffffff;
          text-shadow:
            0 0 10px rgba(114, 246, 255, 0.8),
            0 0 28px rgba(255, 79, 228, 0.35);
        }

        .subtitle {
          max-width: 720px;
          margin: 14px auto 0;
          font-size: 15px;
          line-height: 1.7;
          color: #cbe7ff;
        }

        .subtitle span {
          color: #7cfed4;
          font-weight: 700;
        }

        .layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 16px;
          align-items: stretch;
        }

        .panel,
        .footer-panel {
          border: 2px solid rgba(114, 246, 255, 0.55);
          background: linear-gradient(180deg, rgba(15, 21, 45, 0.92), rgba(8, 10, 22, 0.96));
          border-radius: 18px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
        }

        .panel {
          padding: 16px;
          min-height: 340px;
        }

        .panel-title,
        .footer-title {
          color: #85ffd0;
          letter-spacing: 2px;
          font-size: 12px;
          margin-bottom: 12px;
        }

        textarea {
          width: 100%;
          min-height: 220px;
          resize: vertical;
          border: 2px solid rgba(255,255,255,0.12);
          outline: none;
          border-radius: 14px;
          padding: 16px;
          font: inherit;
          color: #effcff;
          background:
            linear-gradient(180deg, rgba(7, 10, 21, 0.96), rgba(10, 14, 30, 0.92));
          box-shadow: inset 0 0 0 1px rgba(114, 246, 255, 0.08);
        }

        textarea::placeholder {
          color: rgba(231, 247, 255, 0.5);
        }

        textarea:focus {
          border-color: #72f6ff;
          box-shadow:
            0 0 0 3px rgba(114, 246, 255, 0.18),
            inset 0 0 0 1px rgba(114, 246, 255, 0.14);
        }

        .actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        .pixel-button {
          cursor: pointer;
          border: 0;
          padding: 14px 18px;
          border-radius: 14px;
          background: linear-gradient(180deg, #ff50e4 0%, #7b5cff 100%);
          color: white;
          font: inherit;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          box-shadow:
            0 0 0 3px rgba(255,255,255,0.06),
            0 10px 30px rgba(123, 92, 255, 0.3);
          transition: transform 0.15s ease, filter 0.15s ease;
        }

        .pixel-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }

        .pixel-button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .meta {
          color: rgba(231, 247, 255, 0.7);
          font-size: 12px;
          letter-spacing: 1px;
        }

        .output-panel {
          display: flex;
          flex-direction: column;
        }

        .empty-state {
          flex: 1;
          display: grid;
          place-items: center;
          min-height: 220px;
          color: rgba(231, 247, 255, 0.78);
          text-align: center;
          padding: 18px;
          border-radius: 14px;
          border: 1px dashed rgba(114, 246, 255, 0.28);
          background: rgba(255,255,255,0.02);
        }

        .error-box {
          border: 2px solid rgba(255, 91, 91, 0.85);
          background: rgba(255, 91, 91, 0.09);
          border-radius: 14px;
          padding: 16px;
          color: #ffd7d7;
        }

        .error-title {
          color: #ff9b9b;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .result-card {
          border-radius: 16px;
          padding: 16px;
          background:
            linear-gradient(180deg, rgba(16, 24, 52, 0.92), rgba(8, 12, 28, 0.96));
          border: 1px solid rgba(114, 246, 255, 0.2);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
        }

        .top-line {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .result-label {
          font-size: 34px;
          font-weight: 800;
          letter-spacing: 3px;
          color: #ffffff;
          text-shadow: 0 0 18px rgba(114, 246, 255, 0.5);
        }

        .result-confidence {
          color: #7cfed4;
          font-size: 12px;
          letter-spacing: 2px;
          margin-top: 4px;
        }

        .result-score {
          font-size: 28px;
          color: #ffec8a;
          font-weight: 800;
        }

        .meter {
          height: 16px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255,255,255,0.09);
          margin-bottom: 16px;
        }

        .meter-fill {
          height: 100%;
          background: linear-gradient(90deg, #58ffcf 0%, #72f6ff 42%, #ff4fe4 100%);
          box-shadow: 0 0 18px rgba(114, 246, 255, 0.5);
        }

        .score-list {
          display: grid;
          gap: 10px;
        }

        .score-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          color: #eaf9ff;
        }

        .footer-panel {
          margin-top: 16px;
          padding: 14px 16px;
        }

        .footer-text {
          color: rgba(231, 247, 255, 0.85);
          line-height: 1.7;
        }

        @media (max-width: 900px) {
          .layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .shell {
            padding: 12px;
          }

          .frame {
            padding: 14px;
            border-radius: 18px;
          }

          h1 {
            font-size: 34px;
          }

          .result-label {
            font-size: 26px;
          }
        }
      `}</style>
    </>
  );
}
