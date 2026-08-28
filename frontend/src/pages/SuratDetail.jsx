import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';

const STATUS_ACTIONS = [
  { value: 'disetujui', label: '✅ Setujui', class: 'btn-success' },
  { value: 'direvisi',  label: '✏️ Minta Revisi', class: 'btn-warning' },
  { value: 'ditolak',   label: '❌ Tolak', class: 'btn-danger'  },
];

export default function SuratDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [surat, setSurat]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Modal state
  const [modal, setModal]     = useState(null); // null | 'disetujui'|'direvisi'|'ditolak'
  const [catatan, setCatatan] = useState('');
  const [saving, setSaving]   = useState(false);
  const [saveErr, setSaveErr] = useState('');

  useEffect(() => {
    api.get(`/surat/${id}`)
      .then(res => setSurat(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdateStatus() {
    setSaving(true);
    setSaveErr('');
    try {
      await api.patch(`/surat/${id}/status`, { status: modal, catatan });
      const res = await api.get(`/surat/${id}`);
      setSurat(res.data);
      setModal(null);
      setCatatan('');
    } catch (err) {
      setSaveErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <div className="loading-center" style={{ height: '60vh' }}>
          <div className="spinner" />
        </div>
      </main>
    </div>
  );

  if (error) return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <div className="alert alert-error" style={{ marginTop: '2rem' }}>{error}</div>
      </main>
    </div>
  );

  const isFinal = surat.status === 'disetujui' || surat.status === 'ditolak';

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '0.5rem' }}>
              ← Kembali
            </button>
            <h1 className="page-title">{surat.perihal}</h1>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
              <StatusBadge status={surat.status} />
              <span className="badge-jenis">{surat.jenisSurat}</span>
            </div>
          </div>

          {/* Action buttons (penerima only, status belum final) */}
          {user?.role === 'penerima' && !isFinal && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {STATUS_ACTIONS.map(a => (
                <button
                  key={a.value}
                  className={`btn ${a.class}`}
                  onClick={() => setModal(a.value)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-grid">
          {/* Kiri: Info surat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Nomor surat (jika sudah disetujui) */}
            {surat.nomorSurat && (
              <div className="card nomor-card">
                <div className="nomor-label">📋 Nomor Surat</div>
                <code className="nomor-surat-large">{surat.nomorSurat}</code>
                <div className="nomor-date">
                  Disetujui: {new Date(surat.tanggalDisetujui).toLocaleDateString('id-ID', {
                    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </div>
              </div>
            )}

            {/* Info detail */}
            <div className="card">
              <h2 className="card-title">Informasi Surat</h2>
              <div className="detail-rows">
                <div className="detail-row">
                  <span className="detail-key">Pengaju</span>
                  <span className="detail-val">{surat.pengaju?.nama}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Email</span>
                  <span className="detail-val">{surat.pengaju?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Jenis Surat</span>
                  <span className="detail-val">{surat.jenisSurat}</span>
                </div>
                {surat.departemen && (
                  <div className="detail-row">
                    <span className="detail-key">Departemen</span>
                    <span className="detail-val">{surat.departemen}</span>
                  </div>
                )}
                {surat.tandaTangan && JSON.parse(surat.tandaTangan).length > 0 && (
                  <div className="detail-row">
                    <span className="detail-key">Tanda Tangan</span>
                    <span className="detail-val" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {JSON.parse(surat.tandaTangan).map(t => (
                        <span key={t} className="badge-jenis">{t}</span>
                      ))}
                    </span>
                  </div>
                )}
                {surat.diperlukanUntuk && (
                  <div className="detail-row">
                    <span className="detail-key">Diperlukan Untuk</span>
                    <span className="detail-val" style={{ color: 'var(--red)', fontWeight: 600 }}>
                      {new Date(surat.diperlukanUntuk).toLocaleDateString('id-ID', {
                        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-key">Tanggal Diajukan</span>
                  <span className="detail-val">
                    {new Date(surat.tanggalDiajukan).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
                {surat.catatanPenerima && (
                  <div className="detail-row">
                    <span className="detail-key">Catatan Penerima</span>
                    <span className="detail-val catatan">{surat.catatanPenerima}</span>
                  </div>
                )}
                {surat.fileLampiran && (
                  <div className="detail-row">
                    <span className="detail-key">Lampiran</span>
                    <a
                      href={`http://localhost:3000/uploads/${surat.fileLampiran}`}
                      className="btn btn-ghost btn-sm"
                      target="_blank"
                      rel="noreferrer"
                    >
                      📎 Unduh Lampiran
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Isi surat */}
            <div className="card">
              <h2 className="card-title">Isi Surat</h2>
              <div className="isi-surat">{surat.isiSurat}</div>
            </div>
          </div>

          {/* Kanan: Audit trail */}
          <div className="card">
            <h2 className="card-title">Riwayat Status</h2>
            {surat.statusLogs?.length === 0 ? (
              <p className="text-muted">Belum ada riwayat</p>
            ) : (
              <div className="timeline">
                {surat.statusLogs.map((log, i) => (
                  <div key={log.id} className={`timeline-item${i === surat.statusLogs.length - 1 ? ' latest' : ''}`}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <StatusBadge status={log.statusBaru} />
                        <span className="timeline-date">
                          {new Date(log.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="timeline-by">oleh {log.user?.nama}</div>
                      {log.catatan && <div className="timeline-note">"{log.catatan}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal konfirmasi status */}
        {modal && (
          <div className="modal-overlay" onClick={() => setModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 className="modal-title">
                {modal === 'disetujui' ? '✅ Setujui Surat' :
                 modal === 'direvisi'  ? '✏️ Minta Revisi' :
                                        '❌ Tolak Surat'}
              </h3>
              <p className="modal-subtitle">
                {modal === 'disetujui'
                  ? 'Nomor surat akan di-generate otomatis setelah disetujui.'
                  : 'Tambahkan catatan untuk pengaju (opsional).'}
              </p>
              {saveErr && <div className="alert alert-error">{saveErr}</div>}
              <textarea
                className="form-input form-textarea"
                placeholder="Catatan untuk pengaju (opsional)..."
                rows={3}
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
              />
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setModal(null)}>Batal</button>
                <button
                  className={`btn ${
                    modal === 'disetujui' ? 'btn-success' :
                    modal === 'direvisi'  ? 'btn-warning' : 'btn-danger'
                  }`}
                  onClick={handleUpdateStatus}
                  disabled={saving}
                >
                  {saving ? <span className="spinner-sm" /> : null}
                  {saving ? 'Menyimpan...' : 'Konfirmasi'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
