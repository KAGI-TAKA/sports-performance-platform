export function convertToCSV(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string {
  const sanitize = (val: string | number | boolean | null | undefined): string => {
    if (val == null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(sanitize).join(",");
  const bodyRows = rows
    .map((row) => row.map(sanitize).join(","))
    .join("\r\n");

  // Include UTF-8 BOM (\uFEFF) so Microsoft Excel opens Indonesian & special characters cleanly
  return "\uFEFF" + headerRow + "\r\n" + bodyRows;
}
