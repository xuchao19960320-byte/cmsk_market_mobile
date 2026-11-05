import { useEffect, useState, useCallback } from 'react';
import { request, type Query } from '../api/client';
export interface Resource<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}
export function useResource<T>(path: string, query: Query = {}, enabled = true): Resource<T> {
  const key = JSON.stringify(query),
    [revision, setRevision] = useState(0);
  const [state, setState] = useState<Omit<Resource<T>, 'reload'>>({ data: null, loading: enabled, error: null });
  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const controller = new AbortController();
    setState({ data: null, loading: true, error: null });
    request<T>(path, JSON.parse(key) as Query, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState({ data: null, loading: false, error: error instanceof Error ? error.message : '请求失败' });
      });
    return () => controller.abort();
  }, [path, key, revision, enabled]);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  return { ...state, reload };
}
