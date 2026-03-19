// pages/index.js
import { useEffect, useState } from "react";
import Head from "next/head";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [result, setResult] = useState(null);

  // Fake boot animation
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  async function predict() {
    setLoading(true);
    setResult(null);

    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setResult(data.prediction);
    setLoading(false);
  }

  if (booting) return <BootScreen />;

  return (
    <>
      <Head>
        <title>Fake News Arcade</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <div className="container">
        <h1 className="glitch" data-text="FAKE NEWS DETECTOR">
          FAKE NEWS DETECTOR
        </h1>

        <textarea
          placeholder="> Enter news text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={predict} disabled={loading}>
          {loading ? "SCANNING..." : "RUN DETECTOR"}
        </button>

        {loading && <Loader />}

        {result && <ResultDisplay result={result} />}
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          background: black;
          color: #00ffcc;
          font-family: "Courier New", monospace;
          overflow: hidden;
        }

        .container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
        }

        textarea {
          width: 80%;
          height: 120px;
          background: black;
          border: 2px solid #00ffcc;
          color: #00ffcc;
          padding: 10px;
          margin: 20px 0;
        }

        button {
          background: #ff00ff;
          color: white;
          border: none;
          padding: 12px 20px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 0 10px #ff00ff;
        }

        button:hover {
          transform: scale(1.05);
        }

        .glitch {
          font-size: 48px;
          position: relative;
          color: white;
          text-shadow: 2px 2px #ff00ff, -2px -2px #00ffff;
          animation: glitch 1s infinite;
        }

        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </>
  );
}

function Loader() {
  return (
    <div style={{ marginTop: 20 }}>
      <p>SCANNING DATA...</p>
      <div className="bar"></div>

      <style jsx>{`
        .bar {
          width: 200px;
          height: 10px;
          background: #333;
          overflow: hidden;
        }

        .bar::before {
          content: "";
          display: block;
          width: 50%;
          height: 100%;
          background: #00ffcc;
          animation: loading 1s infinite;
        }

        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

function ResultDisplay({ result }) {
  return (
    <div style={{ marginTop: 30 }}>
      <h2>RESULT</h2>
      {result.map((r) => (
        <p key={r.label}>
          {r.label}: {(r.score * 100).toFixed(2)}%
        </p>
      ))}
    </div>
  );
}

function BootScreen() {
  return (
    <div className="boot">
      <p>INITIALIZING SYSTEM...</p>
      <p>LOADING AI MODULE...</p>
      <p>READY</p>

      <style jsx>{`
        .boot {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: black;
          color: #00ffcc;
          font-family: monospace;
          animation: flicker 0.1s infinite;
        }

        @keyframes flicker {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
