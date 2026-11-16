/** Colored pill for ACTIVE / CLAIMED / RECOVERED / PENDING / APPROVED / REJECTED / LOST / FOUND. */
export default function StatusBadge({ status }) {
  if (!status) return null;
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`badge badge-${status.toLowerCase()}`}>{label}</span>;
}

