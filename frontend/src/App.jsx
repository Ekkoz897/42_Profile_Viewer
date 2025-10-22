import { Link, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Me from "./pages/Me.jsx";
import { tokens } from "./lib/api.js";

export default function App() {
  const nav = useNavigate();
  const isLoggedIn = !!tokens.access;

  function logout() {
    tokens.clear();
    nav("/");
    location.reload();
  }

  return (
    <>
      <header className="container header">
        <Link to="/" className="brand">
          <div className="badge42">42</div>
          <div>
            <div className="brand-title">Profile Viewer</div>
            <div className="brand-sub">Django · 42 OAuth · JWT</div>
          </div>
        </Link>

        <div>
          {isLoggedIn ? (
            <button className="btn" onClick={logout}>Logout</button>
          ) : null}
        </div>
      </header>

      <main className="container" style={{ paddingBottom: 60 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/me" element={<Me />} />
        </Routes>
      </main>

      <footer className="container muted" style={{ padding: "18px 0 36px" }}>
        <hr className="hr" />
        <div style={{ marginTop: 12, fontSize: 12 }}>© {new Date().getFullYear()} — 42-themed API practicing</div>
      </footer>
    </>
  );
}
