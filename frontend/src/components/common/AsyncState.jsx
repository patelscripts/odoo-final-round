export function AsyncState({ loading, error, empty, children }) {
  if (loading) {
    return <div className="card text-sm text-ink-muted">Loading data…</div>;
  }
  if (error) {
    return <div className="card border-warning/30 text-warning text-sm mb-5">{error}</div>;
  }
  if (empty) {
    return <div className="card text-sm text-ink-muted">{empty}</div>;
  }
  return children || null;
}
