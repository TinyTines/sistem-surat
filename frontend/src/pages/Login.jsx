import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import RedCross from "../components/RedCross";

const DEMO_ACCOUNTS = [
  { role: "Pengaju", email: "pengaju@ksrpmi.com", password: "password123" },
  { role: "Penerima", email: "sekretaris@ksrpmi.com", password: "password123" },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function fillAccount(acc) {
    setForm({ email: acc.email, password: acc.password });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login gagal. Periksa email dan password kamu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Decorative circles */}
      <div className="login-bg-circles">
        <div className="login-circle login-circle-1" />
        <div className="login-circle login-circle-2" />
        <div className="login-circle login-circle-3" />
      </div>

      {/* LEFT — Branding */}
      <div className="login-left">
        <div className="login-left-logo">
          <RedCross size={48} />
          <div style={{ marginLeft: "12px" }}>
            <div className="login-left-title">Organisasi Mahasiswa XYZ</div>
            <div className="login-left-sub">Universitas Telkom</div>
          </div>
        </div>

        <h1 className="login-hero-title">
          Sistem Pengajuan<br />Surat Digital
        </h1>
        <p className="login-hero-desc">
          Platform manajemen surat organisasi yang modern, aman, dan mudah digunakan.
          Ajukan, pantau, dan kelola surat secara digital.
        </p>

        <div className="login-features">
          {[
            "Pengajuan surat online tanpa kertas",
            "Notifikasi status surat real-time",
            "Arsip digital dengan nomor surat otomatis",
            "Akses berbasis peran yang aman",
          ].map((text, i) => (
            <div key={i} className="login-feature-item" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#ffffff",
                  borderRadius: "50%",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-card-title">Masuk</h2>
          <p className="login-card-sub">Silakan login dengan akun kamu</p>

          {/* Demo accounts */}
          <div className="demo-box">
            <div className="demo-box-title">Akun Demo — klik untuk isi otomatis</div>
            {DEMO_ACCOUNTS.map((acc) => (
              <div key={acc.email} className="demo-account">
                <span className="demo-role">{acc.role}</span>
                <span className="demo-email">{acc.email}</span>
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => fillAccount(acc)}
                >
                  Pakai
                </button>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="email@orgxyz.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="spinner-sm" /> : null}
              {loading ? "Masuk..." : "Masuk →"}
            </button>
          </form>

          <p className="login-footer">
            Organisasi Mahasiswa XYZ © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}