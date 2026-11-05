export type Query = Record<string, string | number | boolean | undefined>;
export function apiUrl(path: string, query: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value !== undefined) params.set(key, String(value));
  return `${import.meta.env.VITE_API_BASE || ''}/api/${path}?${params}`;
}
export async function request<T>(path: string, query: Query, signal?: AbortSignal): Promise<T> {
  const response = await fetch(apiUrl(path, query), { signal });
  if (!response.ok) {
    const error = (await response.json()) as { message?: string };
    throw new Error(error.message || '数据加载失败');
  }
  return response.json() as Promise<T>;
}
