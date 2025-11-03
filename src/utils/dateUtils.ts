export function formatDateToDDMMYYYY(dateStr?: string) {
  if (!dateStr) return "";
  // Espera "yyyy-mm-dd" ou "dd-mm-yyyy"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  }
  // Se já está em dd-mm-aaaa, retorna igual
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  return dateStr;
}