/**
 * RedCross — Red Cross icon komponen
 * Digunakan sebagai lambang PMI di seluruh aplikasi
 */
export default function RedCross({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Red Cross"
    >
      {/* Background putih */}
      <rect width="32" height="32" rx="6" fill="white" />
      {/* Palang merah horizontal */}
      <rect x="4" y="12" width="24" height="8" rx="1.5" fill="#DC2626" />
      {/* Palang merah vertikal */}
      <rect x="12" y="4" width="8" height="24" rx="1.5" fill="#DC2626" />
    </svg>
  );
}