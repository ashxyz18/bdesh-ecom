export function formatBDT(amount: number): string {
  const num = Math.round(Number(amount));
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `৳${formatted}`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-BD", { month: "short", day: "numeric" });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "#f59e0b",
    CONFIRMED: "#3b82f6",
    PROCESSING: "#6366f1",
    SHIPPED: "#8b5cf6",
    DELIVERED: "#22c55e",
    CANCELLED: "#ef4444",
    ACTIVE: "#22c55e",
    DRAFT: "#6b7280",
  };
  return colors[status] || "#6b7280";
}

export function statusBg(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "#fef3c7",
    CONFIRMED: "#dbeafe",
    PROCESSING: "#e0e7ff",
    SHIPPED: "#ede9fe",
    DELIVERED: "#dcfce7",
    CANCELLED: "#fee2e2",
  };
  return colors[status] || "#f3f4f6";
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + "...";
}
