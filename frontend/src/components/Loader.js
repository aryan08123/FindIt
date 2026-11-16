export default function Loader({ text = "Loading…", fullPage = false }) {
  return (
    <div className={`loader-wrap ${fullPage ? "loader-full" : ""}`} role="status">
      <div className="spinner" />
      {text && <p>{text}</p>}
    </div>
  );
}

