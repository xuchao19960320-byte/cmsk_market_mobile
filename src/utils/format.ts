export const number = (value: number | null | undefined, digits = 0): string =>
  Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const percent = (value: number | null | undefined): string => number(value, 2) + '%';
export const metricLabel = (metric: string): string =>
  ({ leads: '获客人数', visits: '到访人数', buy: '认购套数', sign: '签约套数' })[metric] || metric;
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char,
  );
}
export function downloadCsv(filename: string, rows: (string | number)[][]): void {
  const text =
    '\uFEFF' +
    rows.map((row) => row.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
