export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-icon">
          <Icon size={30} />
        </div>
      )}
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

