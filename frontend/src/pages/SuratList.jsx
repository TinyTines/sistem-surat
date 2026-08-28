import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";

const STATUS_KEYS = ["diajukan", "direvisi", "disetujui", "ditolak"];

const TAB_COLORS = {
  diajukan:  { color: "#2563EB", bg: "#EFF6FF" },
  direvisi:  { color: "#D97706", bg: "#FFFBEB" },
  disetujui: { color: "#059669", bg: "#ECFDF5" },
  ditolak:   { color: "#DC2626", bg: "#FEF2F2" },
};

export default function SuratList() {
  const { user } = useAuth();
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("");
  const [page, setPage]           = useState(1);
  const [meta, setMeta]           = useState({});
  const [counts, setCounts]       = useState({});

  // Fetch count semua status
  useEffect(() => {
    Promise.all(
      STATUS_KEYS.map(s =>
        api.get(`/surat?status=${s}&limit=1`).then(res => ({ [s]: res.meta?.total ?? 0 }))
      )
    )
      .then(results => setCounts(Object.assign({}, ...results)))
      .catch(() => {});
  }, []);

  // Fetch surat berdasar tab aktif
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 10 });
    if (tab) params.set("status", tab);
    api.get(`/surat?${params}`)
      .then(res => { setSuratList(res.data); setMeta(res.meta); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab, page]);

  function handleTab(key) { setTab(key); setPage(1); }

  const totalSemua = Object.values(counts).reduce((a, b) => a + b, 0);

  const TABS = [
    { key: "",          label: "Semua",    count: totalSemua || null },
    { key: "diajukan",  label: "Diajukan", count: counts.diajukan  },
    { key: "direvisi",  label: "Direvisi", count: counts.direvisi  },
    { key: "disetujui", label: "Disetujui",count: counts.disetujui },
    { key: "ditolak",   label: "Ditolak",  count: counts.ditolak   },
  ];

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Daftar Surat</h1>
            <p className="page-subtitle">
              {user?.role === "penerima" ? "Semua surat masuk" : "Pengajuan surat kamu"}
            </p>
          </div>
          {user?.role === "pengaju" && (
            <Link to="/surat/buat" className="btn btn-primary">+ Buat Surat</Link>
          )}
        </div>

        <div className="card">
          {/* Tabs with badge */}
          <div className="tabs">
            {TABS.map(t => {
              const isActive = tab === t.key;
              const cfg = TAB_COLORS[t.key];
              return (
                <button
                  key={t.key}
                  className={`tab${isActive ? " active" : ""}`}
                  onClick={() => handleTab(t.key)}
                >
                  {t.label}
                  {t.count > 0 && (
                    <span
                      className="tab-badge"
                      style={isActive && cfg ? {
                        background: cfg.color,
                        color: "#fff",
                      } : cfg ? {
                        background: cfg.bg,
                        color: cfg.color,
                      } : {}}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Table */}
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : suratList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>Tidak ada surat dengan status ini</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Perihal</th>
                      <th>Jenis</th>
                      {user?.role === "penerima" && <th>Pengaju</th>}
                      <th>Status</th>
                      <th>Nomor Surat</th>
                      <th>Tanggal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {suratList.map((s, i) => (
                      <tr key={s.id}>
                        <td className="td-num">{(page - 1) * 10 + i + 1}</td>
                        <td className="td-perihal">{s.perihal}</td>
                        <td><span className="badge-jenis">{s.jenisSurat}</span></td>
                        {user?.role === "penerima" && (
                          <td className="td-pengaju">{s.pengaju?.nama}</td>
                        )}
                        <td><StatusBadge status={s.status} /></td>
                        <td className="td-nomor">
                          {s.nomorSurat
                            ? <code className="nomor-surat">{s.nomorSurat}</code>
                            : <span className="text-muted">–</span>}
                        </td>
                        <td className="td-date">
                          {new Date(s.createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </td>
                        <td>
                          <Link to={`/surat/${s.id}`} className="btn btn-ghost btn-sm">
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta.totalPage > 1 && (
                <div className="pagination">
                  <button className="btn btn-ghost btn-sm" disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span className="pagination-info">
                    Halaman {meta.page} / {meta.totalPage}
                  </span>
                  <button className="btn btn-ghost btn-sm" disabled={page === meta.totalPage}
                    onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}