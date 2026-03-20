// pages/index.js
import { useMemo, useState } from "react";
import Head from "next/head";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function formatScore(score) {
  return `${(score * 100).toFixed(2)}%`;
}

function getTopPrediction(predictions) {
  if (!Array.isArray(predictions) || predictions.length === 0) return null;
  return [...predictions].sort((a, b) => b.score - a.score)[0];
}

function verdictText(label) {
  if (!label) return "Awaiting scan";
  return label === "FAKE" ? "Threat detected" : "Verified report";
}

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const predictions = useMemo(() => {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    if (Array.isArray(result.predictions)) return result.predictions;
    if (Array.isArray(result.prediction)) return result.prediction;
    return [];
  }, [result]);

  const top = useMemo(() => getTopPrediction(predictions), [predictions]);

  async function handlePredict() {
    setError("");
    setResult(null);

    if (!API_URL) {
      setError("Missing NEXT_PUBLIC_API_URL in Vercel environment variables.");
      return;
    }

    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();

      const normalized =
        data?.predictions ??
        data?.prediction ??
        (Array.isArray(data) ? data : null);

      if (!normalized) {
        throw new Error("Backend response did not contain predictions.");
      }

      setResult(normalized);
    } catch (err) {
      setError(err?.message || "Something went wrong while scanning.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setText("");
    setResult(null);
    setError("");
  }

  return (
    <>
      <Head>
        <title>News Arcade</title>
        <meta
          name="description"
          content="Retro arcade-style fake news detector"
        />
        <meta name="theme-color" content="#07111f" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <main className="page">
        <div className="background">
          <div className="stars stars-a" />
          <div className="stars stars-b" />
          <div className="grid" />
          <div className="glow glow-one" />
          <div className="glow glow-two" />
        </div>

        <section className="cabinet">
          <div className="topbar">
            <div className="chip">ARCADE MODE</div>
            <div className="chip chip-alt">NEWS SCAN v1.0</div>
          </div>

          <header className="hero">
            <p className="kicker">90s Pixel Terminal</p>
            <h1>NEWS DETECTOR</h1>
            <p className="subtitle">
              Type or paste the news article here. The scanner classifies it as
              <span> REAL</span> or <span> FAKE</span>.
            </p>
          </header>

          <div className="content">
            <section className="panel input-panel">
              <div className="panel-title">INPUT CARGO</div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="> Paste news text here..."
                maxLength={3000}
              />

              <div className="controls">
                <button
                  className="pixel-button"
                  onClick={handlePredict}
                  disabled={loading}
                >
                  {loading ? "SCANNING..." : "RUN DETECTOR"}
                </button>

                <button className="pixel-button secondary" onClick={clearAll}>
                  CLEAR
                </button>

                <div className="counter">{text.length}/3000</div>
              </div>
            </section>

            <section className="panel output-panel">
              <div className="panel-title">SCAN RESULTS</div>

              {!loading && !error && !top && (
                <div className="empty-state">
                  <div className="empty-title">READY FOR INPUT</div>
                  <p>
                    Press <strong>RUN DETECTOR</strong> to begin the scan.
                  </p>
                </div>
              )}

              {loading && (
                <div className="loading-state">
                  <div className="loader-ring" />
                  <p>Analyzing text...</p>
                  <div className="loading-bar">
                    <span />
                  </div>
                </div>
              )}

              {error && (
                <div className="error-box">
                  <div className="error-title">SYSTEM ERROR</div>
                  <p>{error}</p>
                </div>
              )}

              {!loading && top && (
                <div className="result-card">
                  <div className="result-header">
                    <div>
                      <div className="result-label">{top.label}</div>
                      <div className="result-subtitle">
                        {verdictText(top.label)}
                      </div>
                    </div>
                    <div className="score-badge">{formatScore(top.score)}</div>
                  </div>

                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.round(top.score * 100)}%` }}
                    />
                  </div>

                  <div className="bars">
                    {predictions.map((item) => (
                      <div key={item.label} className="bar-row">
                        <div className="bar-meta">
                          <span>{item.label}</span>
                          <span>{formatScore(item.score)}</span>
                        </div>
                        <div className="mini-bar">
                          <div
                            className="mini-bar-fill"
                            style={{ width: `${Math.round(item.score * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          <footer className="footer">
            <div className="footer-title">MISSION LOG</div>
            <div className="footer-text">
              {top
                ? `Latest scan complete — ${top.label} detected with ${formatScore(top.score)} confidence.`
                : "No scan data yet."}
            </div>
          </footer>
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
            radial-gradient(circle at top, rgba(89, 255, 217, 0.08), transparent 30%),
            linear-gradient(180deg, #060b18 0%, #050814 100%);
          color: #edf8ff;
          font-family: "Courier New", monospace;
          overflow-x: hidden;
        }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
        }

        .background {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .stars,
        .grid,
        .glow {
          position: absolute;
          inset: 0;
        }

        .stars-a {
          opacity: 0.4;
          background-image:
            radial-gradient(2px 2px at 20% 15%, rgba(255,255,255,0.7) 50%, transparent 51%),
            radial-gradient(1.5px 1.5px at 75% 25%, rgba(255,255,255,0.6) 50%, transparent 51%),
            radial-gradient(2px 2px at 60% 70%, rgba(255,255,255,0.55) 50%, transparent 51%),
            radial-gradient(1.5px 1.5px at 40% 40%, rgba(255,255,255,0.55) 50%, transparent 51%),
            radial-gradient(2px 2px at 85% 80%, rgba(255,255,255,0.65) 50%, transparent 51%);
        }

        .stars-b {
          opacity: 0.25;
          background-image:
            radial-gradient(1px 1px at 10% 30%, rgba(255,255,255,0.8) 50%, transparent 51%),
            radial-gradient(1px 1px at 35% 20%, rgba(255,255,255,0.7) 50%, transparent 51%),
            radial-gradient(1px 1px at 55% 55%, rgba(255,255,255,0.7) 50%, transparent 51%),
            radial-gradient(1px 1px at 80% 35%, rgba(255,255,255,0.8) 50%, transparent 51%),
            radial-gradient(1px 1px at 92% 18%, rgba(255,255,255,0.7) 50%, transparent 51%);
          animation: drift 20s linear infinite;
        }

        .grid {
          opacity: 0.12;
          background-image:
            linear-gradient(rgba(130, 247, 255, 0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(130, 247, 255, 0.18) 1px, transparent 1px);
          background-size: 42px 42px;
        }

        .glow-one {
          background: radial-gradient(circle at 25% 20%, rgba(255, 79, 228, 0.12), transparent 25%);
        }

        .glow-two {
          background: radial-gradient(circle at 75% 30%, rgba(88, 255, 207, 0.14), transparent 28%);
        }

        .cabinet {
          width: min(1140px, 100%);
          border: 3px solid #70f7ff;
          border-radius: 24px;
          padding: 18px;
          background: linear-gradient(180deg, rgba(10, 16, 38, 0.96), rgba(5, 7, 20, 0.97));
          box-shadow:
            0 0 0 4px rgba(112, 247, 255, 0.08),
            0 18px 60px rgba(0, 0, 0, 0.45),
            inset 0 0 36px rgba(255, 255, 255, 0.03);
          position: relative;
        }

        .cabinet::before {
          content: "";
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 18px;
          pointer-events: none;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .chip {
          padding: 8px 12px;
          border: 2px solid #ff4fe4;
          color: #ffb7f5;
          background: rgba(255, 79, 228, 0.07);
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: 1.5px;
        }

        .chip-alt {
          border-color: #58ffcf;
          color: #a5ffe9;
          background: rgba(88, 255, 207, 0.07);
        }

        .hero {
          text-align: center;
          padding: 12px 10px 28px;
        }

        .kicker {
          margin: 0 0 8px;
          color: #7dfde1;
          letter-spacing: 3px;
          font-size: 12px;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(34px, 7vw, 74px);
          line-height: 1;
          letter-spacing: 4px;
          color: #ffffff;
          text-shadow:
            0 0 10px rgba(112, 247, 255, 0.7),
            0 0 24px rgba(255, 79, 228, 0.22);
        }

        .subtitle {
          max-width: 760px;
          margin: 14px auto 0;
          font-size: 15px;
          line-height: 1.7;
          color: rgba(237, 248, 255, 0.88);
        }

        .subtitle span {
          color: #7dfde1;
          font-weight: 700;
        }

        .content {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 16px;
          align-items: stretch;
        }

        .panel,
        .footer {
          border: 2px solid rgba(112, 247, 255, 0.5);
          background: linear-gradient(180deg, rgba(14, 20, 44, 0.95), rgba(8, 11, 25, 0.98));
          border-radius: 18px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
        }

        .panel {
          padding: 16px;
          min-height: 360px;
        }

        .panel-title,
        .footer-title {
          color: #89ffd7;
          letter-spacing: 2px;
          font-size: 12px;
          margin-bottom: 12px;
        }

        textarea {
          width: 100%;
          min-height: 240px;
          resize: vertical;
          border: 2px solid rgba(255,255,255,0.1);
          outline: none;
          border-radius: 14px;
          padding: 16px;
          font: inherit;
          color: #effcff;
          background:
            linear-gradient(180deg, rgba(6, 10, 20, 0.98), rgba(10, 14, 30, 0.96));
          box-shadow: inset 0 0 0 1px rgba(112, 247, 255, 0.08);
        }

        textarea::placeholder {
          color: rgba(237, 248, 255, 0.5);
        }

        textarea:focus {
          border-color: #70f7ff;
          box-shadow:
            0 0 0 3px rgba(112, 247, 255, 0.14),
            inset 0 0 0 1px rgba(112, 247, 255, 0.12);
        }

        .controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        .pixel-button {
          cursor: pointer;
          border: 0;
          padding: 14px 18px;
          border-radius: 14px;
          background: linear-gradient(180deg, #ff50e4 0%, #7c5cff 100%);
          color: white;
          font: inherit;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          box-shadow:
            0 0 0 3px rgba(255,255,255,0.05),
            0 12px 28px rgba(124, 92, 255, 0.26);
          transition: transform 0.15s ease, filter 0.15s ease;
        }

        .pixel-button:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.04);
        }

        .pixel-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .pixel-button.secondary {
          background: linear-gradient(180deg, #122041 0%, #0b1228 100%);
          border: 1px solid rgba(112, 247, 255, 0.32);
          box-shadow: none;
        }

        .counter {
          color: rgba(237, 248, 255, 0.7);
          font-size: 12px;
          letter-spacing: 1px;
        }

        .output-panel {
          display: flex;
          flex-direction: column;
        }

        .empty-state,
        .loading-state {
          flex: 1;
          display: grid;
          place-items: center;
          min-height: 240px;
          text-align: center;
          padding: 18px;
          border-radius: 14px;
          border: 1px dashed rgba(112, 247, 255, 0.26);
          background: rgba(255,255,255,0.02);
          color: rgba(237, 248, 255, 0.84);
        }

        .empty-title {
          color: #89ffd7;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }

        .loading-state {
          gap: 14px;
          align-content: center;
        }

        .loader-ring {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 3px solid rgba(112, 247, 255, 0.2);
          border-top-color: #70f7ff;
          border-right-color: #ff4fe4;
          animation: spin 1s linear infinite;
        }

        .loading-bar {
          width: min(320px, 100%);
          height: 12px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255,255,255,0.08);
        }

        .loading-bar span {
          display: block;
          height: 100%;
          width: 45%;
          background: linear-gradient(90deg, #58ffcf 0%, #70f7ff 50%, #ff4fe4 100%);
          animation: sweep 1.15s ease-in-out infinite;
        }

        .error-box {
          border: 2px solid rgba(255, 111, 111, 0.86);
          background: rgba(255, 111, 111, 0.08);
          border-radius: 14px;
          padding: 16px;
          color: #ffd7d7;
        }

        .error-title {
          color: #ffaaaa;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        .result-card {
          border-radius: 16px;
          padding: 16px;
          background: linear-gradient(180deg, rgba(18, 26, 54, 0.94), rgba(8, 12, 26, 0.97));
          border: 1px solid rgba(112, 247, 255, 0.2);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03);
        }

        .result-header {
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
          text-shadow: 0 0 14px rgba(112, 247, 255, 0.45);
        }

        .result-subtitle {
          margin-top: 4px;
          color: #7dfde1;
          font-size: 12px;
          letter-spacing: 2px;
        }

        .score-badge {
          font-size: 28px;
          color: #ffec8a;
          font-weight: 800;
        }

        .progress {
          height: 16px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255,255,255,0.09);
          margin-bottom: 16px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #58ffcf 0%, #70f7ff 40%, #ff4fe4 100%);
          box-shadow: 0 0 18px rgba(112, 247, 255, 0.42);
        }

        .bars {
          display: grid;
          gap: 10px;
        }

        .bar-row {
          display: grid;
          gap: 8px;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
        }

        .bar-meta {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #eaf9ff;
        }

        .mini-bar {
          height: 10px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255,255,255,0.08);
        }

        .mini-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #70f7ff 0%, #ff4fe4 100%);
        }

        .footer {
          margin-top: 16px;
          padding: 14px 16px;
        }

        .footer-text {
          color: rgba(237, 248, 255, 0.84);
          line-height: 1.7;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(240%);
          }
        }

        @keyframes drift {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-20px);
          }
        }

        @media (max-width: 900px) {
          .content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 12px;
          }

          .cabinet {
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
