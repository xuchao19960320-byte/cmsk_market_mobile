import { useEffect, useMemo, useState } from 'react';
import { Input, Pagination, Tooltip } from 'antd';
import type { Project, AdvisorScope } from '../../shared/types';
interface Props {
  projects: Project[];
  scope: AdvisorScope;
  onSelect: (id: string) => void;
}
export function ProjectList({ projects, scope, onSelect }: Props) {
  const [query, setQuery] = useState(''),
    [page, setPage] = useState(1);
  const rows = useMemo(
    () =>
      projects.filter(
        (p) =>
          (scope.tier === '全部' || p.tier === scope.tier) &&
          (scope.company === '全部' || p.company === scope.company) &&
          p.name.includes(query),
      ),
    [projects, scope.tier, scope.company, query],
  );
  useEffect(() => setPage(1), [query, scope.tier, scope.company]);
  return (
    <aside className="project-sidebar">
      <Input
        aria-label="搜索右侧项目列表"
        placeholder="搜索项目名称"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        allowClear
      />
      <p className="helper-text mt-3">共 {rows.length} 个项目 · 点击查看顾问</p>
      <button className={scope.projectId === '全部' ? 'selected' : ''} onClick={() => onSelect('全部')}>
        全部项目
      </button>
      {rows.slice((page - 1) * 20, page * 20).map((p) => (
        <Tooltip title={p.name} key={p.id}>
          <button className={`ellipsis ${scope.projectId === p.id ? 'selected' : ''}`} onClick={() => onSelect(p.id)}>
            {p.name}
          </button>
        </Tooltip>
      ))}
      {rows.length > 20 && (
        <Pagination size="small" simple current={page} pageSize={20} total={rows.length} onChange={setPage} />
      )}
    </aside>
  );
}
