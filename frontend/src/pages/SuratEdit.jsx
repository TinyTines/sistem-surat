import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

function SuratEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    perihal: "",
    jenisSurat: "Lainnya",
    kodeJenisCustom: "",
    isiSurat: "",
    departemen: "",
    diperlukanUntuk: "",
  });
  const [tandaTangan, setTandaTangan] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suratLoaded, setSuratLoaded] = useState(false);

  useEffect(() => {
    if (user?.role !== "pengaju") {
      navigate("/");
      return;
    }

    const fetchSurat = async () => {
      try {
        const res = await api.get(`/surat/${id}`);
        const data = res.data;
        
        // Cek H-3
        if (data.diperlukanUntuk) {
          const deadline = new Date(data.diperlukanUntuk);
          const now = new Date();
          deadline.setHours(0,0,0,0);
          now.setHours(0,0,0,0);
          const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
          if (diffDays < 3) {
            setError("Surat ini tidak dapat diedit lagi karena sudah melewati batas maksimal (H-3 dari tanggal diperlukan).");
          }
        }

        if (data.status === 'disetujui' || data.status === 'ditolak') {
           setError(`Surat tidak dapat diedit karena berstatus ${data.status}`);
        }

        setForm({
          perihal: data.perihal,
          jenisSurat: data.jenisSurat,
          kodeJenisCustom: data.kodeJenisCustom || "",
          isiSurat: data.isiSurat,
          departemen: data.departemen || "",
          diperlukanUntuk: data.diperlukanUntuk ? data.diperlukanUntuk.split("T")[0] : "",
        });

        if (data.tandaTangan) {
          try {
            setTandaTangan(JSON.parse(data.tandaTangan));
          } catch (e) {
            console.error(e);
          }
        }
        setSuratLoaded(true);
      } catch (err) {
        setError(err.message || "Gagal memuat surat");
      }
    };
    fetchSurat();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTTChange = (e) => {
    const val = e.target.value;
    if (e.target.checked) {
      setTandaTangan([...tandaTangan, val]);
    } else {
      setTandaTangan(tandaTangan.filter((t) => t !== val));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) return;
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("perihal", form.perihal);
      formData.append("jenisSurat", form.jenisSurat);
      formData.append("isiSurat", form.isiSurat);
      if (form.jenisSurat === "Lainnya" && form.kodeJenisCustom) {
        formData.append("kodeJenisCustom", form.kodeJenisCustom);
      }
      if (form.departemen) formData.append("departemen", form.departemen);
      if (tandaTangan.length > 0) formData.append("tandaTangan", JSON.stringify(tandaTangan));
      if (form.diperlukanUntuk) formData.append("diperlukanUntuk", form.diperlukanUntuk);
      if (file) formData.append("lampiran", file);

      await api.put(`/surat/${id}`, formData);
      navigate(`/surat/${id}`);
    } catch (err) {
      setError(err.message || "Gagal menyimpan surat");
    } finally {
      setLoading(false);
    }
  };

  if (!suratLoaded && !error) return <div className="page-container"><p>Memuat...</p></div>;

  return (
    <div className="page-container fade-in">
      <div className="card">
        <h1 style={{ marginBottom: "1.5rem" }}>Edit Surat</h1>
        
        {error && (
          <div className="status-badge" style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger-text)", marginBottom: "1rem", whiteSpace: "normal" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            
            <div>
              <div className="form-group">
                <label className="form-label" htmlFor="perihal">Perihal Surat *</label>
                <input
                  id="perihal" name="perihal" type="text" required
                  className="form-input" placeholder="Contoh: Permohonan Peminjaman Tenda"
                  value={form.perihal} onChange={handleChange} disabled={!!error}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="jenisSurat">Jenis Surat *</label>
                <select
                  id="jenisSurat" name="jenisSurat" className="form-input"
                  value={form.jenisSurat} onChange={handleChange} disabled={!!error}
                >
                  <option value="TOR">TOR (Term of Reference)</option>
                  <option value="SPJ">SPJ (Surat Pertanggungjawaban)</option>
                  <option value="SK">SK (Surat Keputusan)</option>
                  <option value="UND">UND (Undangan)</option>
                  <option value="Lainnya">Lainnya...</option>
                </select>
              </div>

              {form.jenisSurat === "Lainnya" && (
                <div className="form-group">
                  <label className="form-label" htmlFor="kodeJenisCustom">Kode Jenis (Custom) *</label>
                  <input
                    id="kodeJenisCustom" name="kodeJenisCustom" type="text" required
                    className="form-input" placeholder="Contoh: SRT"
                    value={form.kodeJenisCustom} onChange={handleChange} disabled={!!error}
                  />
                  <p className="form-hint">Maksimal 10 karakter. Akan digunakan dalam penomoran (opsional, disarankan).</p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="departemen">Departemen/Divisi</label>
                <select
                  id="departemen" name="departemen" className="form-input"
                  value={form.departemen} onChange={handleChange} disabled={!!error}
                >
                  <option value="">-- Tidak ada --</option>
                  <option value="Diklat">Diklat</option>
                  <option value="Pengmas">Pengmas</option>
                  <option value="Kominfo">Kominfo</option>
                  <option value="Logistik">Logistik</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tanda Tangan Dibutuhkan</label>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input type="checkbox" value="Pembina" checked={tandaTangan.includes("Pembina")} onChange={handleTTChange} disabled={!!error} /> Pembina
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input type="checkbox" value="Komandan" checked={tandaTangan.includes("Komandan")} onChange={handleTTChange} disabled={!!error} /> Komandan
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="diperlukanUntuk">Diperlukan Untuk Kapan *</label>
                <input
                  id="diperlukanUntuk" name="diperlukanUntuk" type="date" required
                  className="form-input" min={new Date().toISOString().split("T")[0]}
                  value={form.diperlukanUntuk} onChange={handleChange} disabled={!!error}
                />
                <p className="form-hint">Tanggal kebutuhan surat (*Wajib)</p>
              </div>
            </div>

            <div>
              <div className="form-group" style={{ height: "calc(100% - 6rem)" }}>
                <label className="form-label" htmlFor="isiSurat">Deskripsi / Isi Surat *</label>
                <textarea
                  id="isiSurat" name="isiSurat" required
                  className="form-input" style={{ height: "100%", resize: "none" }}
                  placeholder="Tuliskan detail pengajuan surat di sini..."
                  value={form.isiSurat} onChange={handleChange} disabled={!!error}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="file">Lampiran (File Pendukung)</label>
                <input
                  id="file" type="file" className="form-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files[0])} disabled={!!error}
                />
                <p className="form-hint">Kosongkan jika tidak ingin mengubah lampiran lama.</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
            <button
              type="button" className="btn btn-secondary"
              onClick={() => navigate(`/surat/${id}`)}
            >
              Batal
            </button>
            <button
              type="submit" className="btn btn-primary"
              disabled={loading || !!error}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SuratEdit;
