/** Horizontal bar chart. items = [{ label, value, tone }], tone = blue | purple | green | amber | red. */
export default function BarList({ title, items }) {
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{title}</h2>
        <span className="muted">{total} total</span>
      </div>
      <ul className="bar-list">
        {items.map(({ label, value, tone }) => {
          const pct = total ? Math.round((value / total) * 100) : 0;
          return (
            <li key={label}>
              <div className="bar-label">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
              <div className="bar-track">
                <div className={`bar-fill tone-bg-${tone}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

