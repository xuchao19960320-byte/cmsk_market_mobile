import { Input, Segmented, Select } from 'antd';
import type { AdvisorScope, Dashboard } from '../../shared/types';
import { metricDefinitions } from '../../shared/metrics';
interface Axes {
  x: string;
  y: string;
  size: string;
}
interface Props {
  data: Dashboard;
  scope: AdvisorScope;
  axes: Axes;
  onScope: (value: Partial<AdvisorScope>) => void;
  onAxes: (value: Axes) => void;
}
const tiers = ['全部', '一线城市', '新一线城市', '二线城市', '三四线城市'];
function matchesSearch(input: string, option?: { label?: string }) {
  return input
    .trim()
    .split(/\s+/)
    .every((word) => (option?.label || '').includes(word));
}
export function AdvisorFilters({ data, scope, axes, onScope, onAxes }: Props) {
  return renderAdvisorFiltersView(useAdvisorFiltersModel({ data, scope, axes, onScope, onAxes }));
}
function useAdvisorFiltersModel({ data, scope, axes, onScope, onAxes }: Props) {
  const tierProjects = data.projects.filter((p) => scope.tier === '全部' || p.tier === scope.tier);
  const projects = tierProjects.filter((p) => scope.company === '全部' || p.company === scope.company);
  const companies = [...new Set(tierProjects.map((p) => p.company))];
  const metricOptions = metricDefinitions.map((m) => ({ value: m.key, label: m.label }));

  return { data, scope, axes, onScope, onAxes, tierProjects, projects, companies, metricOptions };
}
function renderAdvisorFiltersView(model: ReturnType<typeof useAdvisorFiltersModel>) {
  const { data, scope, axes, onScope, onAxes, tierProjects, projects, companies, metricOptions } = model;
  return (
    <>
      {renderAdvisorFiltersViewPart1(model)}
      <div className="chart-toolbar">
        {(
          [
            ['y', 'Y轴'],
            ['x', 'X轴'],
            ['size', '气泡'],
          ] as const
        ).map(([key, label]) => (
          <div className="axis-field" key={key}>
            <span>{label}</span>
            <Select
              aria-label={`${label}指标`}
              className="axis-select"
              showSearch
              value={axes[key]}
              filterOption={matchesSearch}
              options={metricOptions}
              onChange={(value) => onAxes({ ...axes, [key]: value })}
            />
          </div>
        ))}
      </div>
      <div className="chart-toolbar">
        <span className="helper-text">城市群组</span>
        <Segmented
          value={scope.tier}
          options={tiers}
          onChange={(tier) => onScope({ tier, company: '全部', projectId: '全部' })}
        />
        <Select
          aria-label="城市筛选"
          showSearch
          value={scope.company}
          className="project-select"
          options={[
            { value: '全部', label: '全部城市' },
            ...companies.map((company) => ({ value: company, label: company })),
          ]}
          onChange={(company) => onScope({ company, projectId: '全部' })}
        />
      </div>
    </>
  );
}

function renderAdvisorFiltersViewPart1(model: ReturnType<typeof useAdvisorFiltersModel>) {
  const { data, scope, axes, onScope, onAxes, tierProjects, projects, companies, metricOptions } = model;
  return (
    <div className="toolbar">
      <div className="axis-field">
        <span>分析项目</span>
        <Select
          aria-label="搜索分析项目"
          className="project-select"
          showSearch
          value={scope.projectId}
          filterOption={matchesSearch}
          options={[{ value: '全部', label: '全部项目' }, ...projects.map((p) => ({ value: p.id, label: p.name }))]}
          onChange={(projectId) => onScope({ projectId })}
        />
      </div>
      <Input.Search
        aria-label="搜索顾问"
        placeholder="搜索顾问 / 项目 / 城市"
        className="project-select"
        value={scope.search}
        onChange={(e) => onScope({ search: e.target.value })}
        allowClear
      />
    </div>
  );
}
