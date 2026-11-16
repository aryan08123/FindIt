import { Link } from "react-router-dom";

/** Dashboard number tile. tone = blue | purple | green | amber. Pass `to` to make it a link. */
export default function StatCard({
  icon: Icon,
  label,
  value,
  tone = "blue",
  to,
}) {
  const content = (
    <>
      <div className={`stat-icon tone-${tone}`}>
        <Icon size={22} />
      </div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </>
  );
  return to ? (
    <Link to={to} className="stat-card">
      {content}
    </Link>
  ) : (
    <div className="stat-card">{content}</div>
  );
}


