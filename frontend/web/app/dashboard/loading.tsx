export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#030712" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="dark-spinner" />
        <span className="text-sm" style={{ color: "#64748B" }}>Loading dashboard...</span>
      </div>
    </div>
  );
}
