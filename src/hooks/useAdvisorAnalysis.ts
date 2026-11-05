import { useEffect, useMemo, useState } from 'react';
import type { AdvisorScope, Dashboard } from '../../shared/types';
import { filterAdvisors } from '../../shared/advisors';
export function useAdvisorAnalysis(data: Dashboard) {
  const [scope, setScope] = useState<AdvisorScope>({
    tier: '一线城市',
    company: '全部',
    projectId: '全部',
    search: '',
  });
  const [axes, setAxes] = useState({
    x: 'monthly.advisor.signRate',
    y: 'monthly.advisor.buyRate',
    size: 'monthly.advisor.visits',
  });
  const [selected, setSelected] = useState<string | null>(null);
  const rows = useMemo(() => filterAdvisors(data.advisors, scope), [data.advisors, scope]);
  useEffect(() => {
    if (selected && !rows.some((row) => row.id === selected)) setSelected(null);
  }, [rows, selected]);
  const changeScope = (next: Partial<AdvisorScope>) => {
    setSelected(null);
    setScope((current) => ({ ...current, ...next }));
  };
  return { scope, axes, rows, selected, setSelected, setAxes, changeScope };
}
