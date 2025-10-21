import { useEffect, useMemo, useState } from "react";
import { apiFetch, decodeJwt, saveTokensFromHash, tokens } from "../lib/api.js";

export default function Me() {
  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Grab tokens from URL fragment set by the backend redirect
  useEffect(() => { saveTokensFromHash(); }, []);

  // Load authenticated profile
  useEffect(() => {
    (async () => {
      setLoading(true); setErr("");
      try {
        const r = await apiFetch("/api/auth/me/");
        if (r.status === 401) { setProfile(null); return; }
        if (!r.ok) throw new Error(`Failed to load profile (${r.status})`);
        setProfile(await r.json());
      } catch (e) { setErr(e.message || "Failed to load profile"); }
      finally { setLoading(false); }
    })();
  }, []);

  const accessClaims  = useMemo(() => decodeJwt(tokens.access), [tokens.access]);
  const refreshClaims = useMemo(() => decodeJwt(tokens.refresh), [tokens.refresh]);

  // ---- avatar: prefer backend's 'profile_picture', then 'avatar_url', then identicon
  const avatarSrc = profile
    ? (
        profile.profile_picture ||
        profile.avatar_url ||
        `https://api.dicebear.com/8.x/identicon/svg?seed=${encodeURIComponent(profile.username)}`
      )
    : "";

  return (
    <>
      <section className="section" style={{ marginTop: 8 }}>
        <div className="section-head">
          <h2 className="section-title">Your Profile</h2>
          {tokens.access && (
            <span className="pill">
              <span className="pill-dot" /> Authenticated
            </span>
          )}
        </div>

        {err && (
          <div
            className="token"
            style={{ borderColor: "#3a1f22", background: "#170f10", color: "#ffb3bd", marginBottom: 12 }}
          >
            {err}
          </div>
        )}

        {loading ? (
          <div className="skeleton" />
        ) : profile ? (
          <div className="profile">
            <img className="avatar" src={avatarSrc} alt="avatar" />
            <div>
              <div className="kv" style={{ marginBottom: 6 }}>
                <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: 0.2 }}>{profile.username}</h3>
                {profile.email && <span className="tag">{profile.email}</span>}
              </div>
              <div className="muted" style={{ marginBottom: 10, fontSize: 13 }}>
                User ID: {profile.id}
              </div>
              <div className="kv">
                {accessClaims?.exp  && <span className="tag">Access exp: {new Date(accessClaims.exp * 1000).toLocaleString()}</span>}
                {refreshClaims?.exp && <span className="tag">Refresh exp: {new Date(refreshClaims.exp * 1000).toLocaleString()}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="muted">Couldn’t load your profile. Try logging in again.</div>
        )}
      </section>

      {tokens.access && (
        <section className="section" style={{ marginTop: 16 }}>
          <div className="section-head">
            <h2 className="section-title">Tokens</h2>
          </div>
          <div className="grid grid-2">
            <TokenCard title="Access Token" token={tokens.access} />
            <TokenCard title="Refresh Token" token={tokens.refresh} />
          </div>
        </section>
      )}

      {tokens.access && (
        <section className="section" style={{ marginTop: 16 }}>
          <div className="section-head">
            <h2 className="section-title">Developer</h2>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" onClick={() => location.href = "/"}>Reload</button>
            <button className="btn" onClick={() => navigator.clipboard.writeText(tokens.access)}>Copy Access</button>
            <button className="btn" onClick={() => navigator.clipboard.writeText(tokens.refresh)}>Copy Refresh</button>
            <button className="btn" onClick={() => { localStorage.clear(); location.reload(); }}>Clear tokens</button>
          </div>
        </section>
      )}
    </>
  );
}

function TokenCard({ title, token }) {
  const claims = decodeJwt(token);
  return (
    <div className="token">
      <div className="token-title">
        <div>{title}</div>
        <button className="btn" onClick={() => navigator.clipboard.writeText(token || "")}>Copy</button>
      </div>
      {token ? (
        <>
          <div className="code">{token}</div>
          {claims ? (
            <div className="claims">
              {Object.entries(claims).map(([k, v]) => (
                <div key={k} className="claim">
                  <b>{k}</b> {String(v)}
                </div>
              ))}
            </div>
          ) : (
            <div className="muted" style={{ marginTop: 8 }}>Invalid or non-JWT token</div>
          )}
        </>
      ) : (
        <div className="muted">No token stored yet.</div>
      )}
    </div>
  );
}
