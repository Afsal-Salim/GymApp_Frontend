/** Shown while the settings segment RSC + client bundle load (Websites → Settings). */
export default function WebsiteSettingsRouteLoading() {
  return (
    <div className="container py-5">
      <div
        className="d-flex flex-column align-items-center justify-content-center gap-3 text-muted"
        style={{ minHeight: '42vh' }}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="spinner-border text-primary" aria-hidden />
        <span className="small">Opening settings…</span>
      </div>
    </div>
  );
}
