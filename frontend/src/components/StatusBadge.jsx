const STATUS_CONFIG = {
  diajukan:  { label: 'Diajukan',  color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  direvisi:  { label: 'Direvisi',  color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  disetujui: { label: 'Disetujui', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  ditolak:   { label: 'Ditolak',   color: '#EF4444', bg: 'rgba(239,68,68,0.15)'  },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)' };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: cfg.color,
      background: cfg.bg,
      border: `1px solid ${cfg.color}40`,
      letterSpacing: '0.02em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}
