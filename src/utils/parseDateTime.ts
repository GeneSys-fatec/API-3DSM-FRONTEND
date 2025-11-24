export function parseDateTime(date?: string, time?: string): Date {
  if (!date) return new Date();
  const [day, month, year] = date.split("/").map(Number);
  const [hours = 0, minutes = 0] = time?.split(":").map(Number) || [];
  return new Date(year, month - 1, day, hours, minutes);
}

export function formatDateTime(ev: string | Date | null): string {
  if (!ev) return "";
  if (ev instanceof Date) return ev.toLocaleString();
  if (typeof ev === "string") {
    const [datePart, timePart] = ev.split(" ");
    const d = parseDateTime(datePart, timePart);
    return d.toLocaleString();
  }
  return "";
}