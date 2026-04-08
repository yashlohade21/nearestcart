export function formatRupees(n: number): string {
  return `₹${Math.abs(n).toLocaleString("en-IN")}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
