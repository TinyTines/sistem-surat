import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';

const STAT_CARDS = [
  { key: 'total',     label: 'Total Surat',  icon: '✉', color: '#6366F1' },
  { key: 'diajukan',  label: 'Diajukan',     icon: '📤', color: '#3B82F6' },
  { key: 'disetujui', label: 'Disetujui',    icon: '✅', color: '#10B981' },
  { key: 'ditolak',   label: 'Ditolak',      icon: '❌', color: '#EF4444' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/surat?limit=5')
      .then(res => setSuratList(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total:     suratList.length,
    diajukan:  suratList.filter(s => s.status === 'diajukan').length,
    disetujui: suratList.filter(s => s.status === 'disetujui').length,
    ditolak:   suratList.filter(s => s.status === 'ditolak').length,
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              Selamat datang, {user?.nama?.split(' ')[0]} 👋
            </h1>
            <p className="page-subtitle">
              {user?.role === 'penerima'
                ? 'Berikut ringkasan semua surat masuk'
                : 'Berikut ringkasan pengajuan surat kamu'}
            </p>
          </div>
          {user?.role === 'pengaju' && (
            <Link to="/surat/buat" className="btn btn-primary">
              + Buat Surat
            </Link>
          )}
        </div>

        {/* Stat Cards */}
        <div className="stats-grid">
          {STAT_CARDS.map(card => (
            <div key={card.key} className="stat-card" style={{ '--accent': card.color }}>
              <div className="stat-card-icon">{card.icon}</div>
              <div className="stat-card-value">
                {loading ? '–' : stats[card.key]}
              </div>
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-glow" />
            </div>
          ))}
        </div>

        {/* Recent Surat */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Surat Terbaru</h2>
            <Link to="/surat" className="btn btn-ghost btn-sm">Lihat Semua →</Link>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : suratList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>Belum ada surat</p>
              {user?.role === 'pengaju' && (
                <Link to="/surat/buat" className="btn btn-primary btn-sm">Buat Surat Pertama</Link>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Perihal</th>
                    <th>Jenis</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {suratList.slice(0, 5).map(s => (
                    <tr key={s.id}>
                      <td className="td-perihal">{s.perihal}</td>
                      <td><span className="badge-jenis">{s.jenisSurat}</span></td>
                      <td><StatusBadge status={s.status} /></td>
                      <td className="td-date">
                        {new Date(s.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td>
                        <Link to={`/surat/${s.id}`} className="btn btn-ghost btn-sm">Detail</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
