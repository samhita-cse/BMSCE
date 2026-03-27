export function StatusMessage({ error, loadingLabel }) {
  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  if (loadingLabel) {
    return <p className="status-message loading">{loadingLabel}</p>;
  }

  return null;
}
