import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Sidebar from "../components/Sidebar";

const JENIS_OPTIONS = [
  { value: "TOR",     label: "TOR (Term of Reference)" },
  { value: "SPJ",     label: "SPJ (Surat Pertanggungjawaban)" },
  { value: "SK",      label: "SK (Surat Keterangan)" },
  { value: "UND",     label: "UND (Surat Undangan)" },
  { value: "Lainnya", label: "Lainnya (kode kustom)" },
];

const DEPARTEMEN_OPTIONS = [
  "Diklat",
  "Pengmas",
  "Kominfo",
  "Logistik",
  "Humas",
  "Kesekretariatan",
  "Lainnya",
];

const TANDA_TANGAN_OPTIONS = ["Pembina", "Komandan"];

export default function SuratBuat() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    perihal: "",
    jenisSurat: "UND",
    kodeJenisCustom: "",
    isiSurat: "",
    departemen: "",
    diperlukanUntuk: "",
  });
  const [tandaTangan, setTandaTangan] = useState([]);
  const [file, setFile]     = useState(null);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function toggleTandaTangan(val) {
    setTandaTangan(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        tandaTangan: JSON.stringify(tandaTangan),
      };
      const res = await api.post("/surat", payload);
      const suratId = res.data.id;

      if (file) {
        const fd = new FormData();
        fd.append("lampiran", file);
        await api.upload(`/surat/${suratId}/file`, fd);
      }
      navigate(`/surat/${suratId}`);
    } catch (err) {
      setError(err.message || "Gagal mengajukan surat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Buat Pengajuan Surat</h1>
            <p className="page-subtitle">Isi formulir berikut untuk mengajukan surat baru</p>
          </div>
        </div>

        <div className="card card-form">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* ── Perihal ── */}
            <div className="form-group">
              <label className="form-label" htmlFor="perihal">
                Perihal Surat <span className="required">*</span>
              </label>
              <input
                id="perihal" name="perihal" type="text"
                className="form-input"
                placeholder="Contoh: Undangan Rapat Anggota"
                value={form.perihal} onChange={handleChange} required
              />
            </div>

            {/* ── Jenis + Departemen ── */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="jenisSurat">
                  Jenis Surat <span className="required">*</span>
                </label>
                <select
                  id="jenisSurat" name="jenisSurat"
                  className="form-input form-select"
                  value={form.jenisSurat} onChange={handleChange}
                >
                  {JENIS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="departemen">
                  Departemen <span className="required">*</span>
                </label>
                <select
                  id="departemen" name="departemen"
                  className="form-input form-select"
                  value={form.departemen} onChange={handleChange} required
                >
                  <option value="">— Pilih Departemen —</option>
                  {DEPARTEMEN_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kode custom jika jenis = Lainnya */}
            {form.jenisSurat === "Lainnya" && (
              <div className="form-group">
                <label className="form-label" htmlFor="kodeJenisCustom">
                  Kode Jenis (maks. 10 huruf) <span className="required">*</span>
                </label>
                <input
                  id="kodeJenisCustom" name="kodeJenisCustom" type="text"
                  className="form-input" placeholder="Contoh: NOTA"
                  maxLength={10} value={form.kodeJenisCustom}
                  onChange={handleChange} required
                />
              </div>
            )}

            {/* ── Isi Surat ── */}
            <div className="form-group">
              <label className="form-label" htmlFor="isiSurat">
                Isi / Deskripsi Surat <span className="required">*</span>
              </label>
              <textarea
                id="isiSurat" name="isiSurat"
                className="form-input form-textarea"
                placeholder="Tuliskan isi atau deskripsi lengkap surat di sini..."
                rows={5} value={form.isiSurat} onChange={handleChange} required
              />
            </div>

            {/* ── Tanda Tangan + Tanggal Diperlukan ── */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tanda Tangan Dibutuhkan</label>
                <div className="checkbox-group">
                  {TANDA_TANGAN_OPTIONS.map(opt => (
                    <label key={opt} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={tandaTangan.includes(opt)}
                        onChange={() => toggleTandaTangan(opt)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-label">{opt}</span>
                    </label>
                  ))}
                </div>
                {tandaTangan.length === 0 && (
                  <p className="form-hint">Kosongkan jika tidak perlu tanda tangan khusus</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="diperlukanUntuk">
                  Diperlukan Untuk Kapan
                </label>
                <input
                  id="diperlukanUntuk" name="diperlukanUntuk" type="date"
                  className="form-input"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.diperlukanUntuk} onChange={handleChange}
                />
                <p className="form-hint">Tanggal kebutuhan surat (opsional)</p>
              </div>
            </div>

            {/* ── Lampiran ── */}
            <div className="form-group">
              <label className="form-label">Lampiran (opsional)</label>
              <div className="upload-area" onClick={() => document.getElementById("file-input").click()}>
                {file ? (
                  <div className="upload-preview">
                    <span className="upload-icon">📎</span>
                    <span>{file.name}</span>
                    <button
                      type="button" className="upload-remove"
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                    >✕</button>
                  </div>
                ) : (
                  <>
                    <span className="upload-icon">📁</span>
                    <span className="upload-hint">Klik untuk upload PDF, DOC, atau DOCX</span>
                    <span className="upload-limit">Maks. 5 MB</span>
                  </>
                )}
              </div>
              <input
                id="file-input" type="file"
                accept=".pdf,.doc,.docx" style={{ display: "none" }}
                onChange={e => setFile(e.target.files[0] || null)}
              />
            </div>

            {/* ── Actions ── */}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate("/surat")}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner-sm" /> Mengajukan...</> : "📤 Ajukan Surat"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}