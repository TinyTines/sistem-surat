const fs = require('fs');
const file = 'frontend/src/pages/SuratDetail.jsx';
let content = fs.readFileSync(file, 'utf8');

const calcStr = `
  let canEdit = false;
  if (user?.role === 'pengaju' && surat?.status !== 'disetujui' && surat?.status !== 'ditolak') {
    canEdit = true;
    if (surat?.diperlukanUntuk) {
      const deadline = new Date(surat.diperlukanUntuk);
      const now = new Date();
      deadline.setHours(0,0,0,0);
      now.setHours(0,0,0,0);
      const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 3) canEdit = false;
    }
  }

  const isFinal = surat?.status === 'disetujui' || surat?.status === 'ditolak';
`;

content = content.replace("const isFinal = surat?.status === 'disetujui' || surat?.status === 'ditolak';", calcStr);

const uiStr = `
            {/* Action buttons (pengaju only) */}
            {user?.role === 'pengaju' && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {canEdit && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(\`/surat/\${id}/edit\`)}
                  >
                    Edit Surat
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    if (!window.confirm("Yakin ingin menghapus surat ini?")) return;
                    try {
                      await api.del(\`/surat/\${id}\`);
                      navigate('/');
                    } catch (err) {
                      alert(err.message || "Gagal menghapus surat");
                    }
                  }}
                >
                  Hapus
                </button>
              </div>
            )}

            {/* Action buttons (penerima only, status belum final) */}
`;

content = content.replace("{/* Action buttons (penerima only, status belum final) */}", uiStr);

fs.writeFileSync(file, content);
