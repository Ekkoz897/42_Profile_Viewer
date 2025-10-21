import { useState } from "react";
import { getAuthorizeUrl } from "../lib/api.js";
import { Link } from "react-router-dom";

export default function Home() {
  const [err, setErr] = useState("");

  async function login() {
    setErr("");
    try {
      const url = await getAuthorizeUrl();
      window.location.href = url;
    } catch (e) {
      setErr(e.message || "Login failed");
    }
  }

  return (
    <section className="section" style={{ marginTop: 8 }}>
      <div className="section-head">
        <h2 className="section-title">Welcome</h2>
      </div>

      {err && (
        <div className="token" style={{ borderColor: "#3a1f22", background: "#170f10", color: "#ffb3bd", marginBottom: 12 }}>
          {err}
        </div>
      )}

      <p className="muted" style={{ marginBottom: 16 }}>
        Connect your 42 account to view your profile. You’ll be redirected to Intra 42, then back to <code>/me</code>.
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-primary" onClick={login}>Sign in with 42</button>
        <Link className="btn btn-ghost" to="/me">Go to /me</Link>
      </div>
    </section>
  );
}
