// pages/index.js
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fake-news-detection-qpdb.onrender.com";

  async function onPredict() {
    setLoading(true);
    setResult(null);
    try {
      const resp = await axios.post(`${API_URL}/predict`, { text });
      setResult(resp.data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Fake News Detector</h1>
      <p>Paste a headline or short article here and click <b>Check</b>.</p>
      <textarea
        rows={8}
        style={{ width: "100%", fontSize: 16 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text..."
      />
      <div style={{ marginTop: 12 }}>
        <button onClick={onPredict} disabled={!text.trim() || loading}>
          {loading ? "Checking..." : "Check"}
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        { result && result.predictions ? (
          <div>
            <h3>Predictions</h3>
            <ul>
              {result.predictions.map((p) => (
                <li key={p.label}>
                  <strong>{p.label}</strong>: {(p.score * 100).toFixed(2)}%
                </li>
              ))}
            </ul>
          </div>
        ) : result && result.error ? (
          <div style={{ color: "red" }}>Error: {result.error}</div>
        ) : null }
      </div>
    </div>
  );
}
