import { useEffect, useState } from 'react';
import type { AdvisorScope, HistoryPoint } from '../../shared/types';
import { useResource } from './useResource';
import { useWorkspace } from '../stores/useWorkspace';
interface Axes {
  x: string;
  y: string;
  size: string;
}
export function useAdvisorHistory(selected: string | null, scope: AdvisorScope, axes: Axes) {
  const filters = useWorkspace((s) => s.filters),
    [months, setMonths] = useState(6),
    [index, setIndex] = useState(5),
    [playing, setPlaying] = useState(false);
  const resource = useResource<HistoryPoint[]>(
    'advisor-history',
    { ...filters, ...scope, ...axes, id: selected || '', months },
    !!selected,
  );
  const resetKey = JSON.stringify({ selected, scope, axes, filters, months });
  useEffect(() => {
    setPlaying(false);
    setIndex(months - 1);
  }, [resetKey, months]);
  useEffect(() => {
    if (!playing || !selected || !resource.data?.length) return;
    const interval = setInterval(() => setIndex((current) => Math.min(months - 1, current + 1)), 1000);
    return () => clearInterval(interval);
  }, [playing, selected, months, resource.data]);
  useEffect(() => {
    if (index >= months - 1) setPlaying(false);
  }, [index, months]);
  const toggle = () => {
    if (!selected) return;
    if (!playing && index === months - 1) setIndex(0);
    setPlaying((value) => !value);
  };
  const selectIndex = (value: number) => {
    setPlaying(false);
    setIndex(value);
  };
  return { ...resource, months, setMonths, index, playing, toggle, selectIndex, point: resource.data?.[index] || null };
}
