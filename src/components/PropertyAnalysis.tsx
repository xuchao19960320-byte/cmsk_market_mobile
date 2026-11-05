import { useState } from 'react';
import { Tabs } from 'antd';
import type { AmountMetric, Dimension, Project } from '../../shared/types';
import {
  areaCounts,
  areaProjectCounts,
  areas,
  propertyCounts,
  propertyTypes,
  supplyMetricNames,
} from '../../shared/supply';
import { distribution } from '../utils/distribution';
import { propertyColors, token } from '../utils/tokens';
import { AnalysisPanel } from './AnalysisPanel';
import { PropertyDonut } from './PropertyDonut';
import { DistributionChart } from './DistributionChart';
export function PropertyAnalysis({ projects }: { projects: Project[] }) {
  return renderPropertyAnalysisView(usePropertyAnalysisModel({ projects }));
}
function usePropertyAnalysisModel({ projects }: { projects: Project[] }) {
  const [metric, setMetric] = useState<AmountMetric>('available'),
    [property, setProperty] = useState('全部业态'),
    [area, setArea] = useState(areas[1]),
    [dimension, setDimension] = useState<Dimension>('group');
  const rows = propertyCounts(projects, metric),
    areasData = areaCounts(projects, metric, property),
    projectValues = areaProjectCounts(projects, metric, property, area);
  const map = new Map(projects.map((p, i) => [p.id, projectValues[i]])),
    groups = distribution(projects, dimension, (p) => map.get(p.id) || 0);
  const colorIndex = propertyTypes.findIndex((r) => r.name === property),
    color = propertyColors()[colorIndex] || token('--color-primary');

  return {
    projects,
    metric,
    setMetric,
    property,
    setProperty,
    area,
    setArea,
    dimension,
    setDimension,
    rows,
    areasData,
    projectValues,
    map,
    groups,
    colorIndex,
    color,
  };
}
function renderPropertyAnalysisView(model: ReturnType<typeof usePropertyAnalysisModel>) {
  const {
    projects,
    metric,
    setMetric,
    property,
    setProperty,
    area,
    setArea,
    dimension,
    setDimension,
    rows,
    areasData,
    projectValues,
    map,
    groups,
    colorIndex,
    color,
  } = model;
  return (
    <AnalysisPanel className={colorIndex >= 0 ? `property-${colorIndex}` : ''}>
      <Tabs
        aria-label="业态套数分析"
        activeKey={metric}
        onChange={(key) => setMetric(key as AmountMetric)}
        items={(['available', 'buy', 'sign'] as AmountMetric[]).map((key) => ({ key, label: supplyMetricNames[key] }))}
      />
      <p className="helper-text mb-4">点击业态联动面积段，点击面积段柱子联动组织分布；全部为演示套数。</p>
      {renderPropertyAnalysisViewPart1(model)}
      <p className="helper-text mt-4">
        当前联动业态：{property} · {area}。业态颜色对应环形图；柱状图统一使用指标蓝。
      </p>
    </AnalysisPanel>
  );
}

function renderPropertyAnalysisViewPart1(model: ReturnType<typeof usePropertyAnalysisModel>) {
  const {
    projects,
    metric,
    setMetric,
    property,
    setProperty,
    area,
    setArea,
    dimension,
    setDimension,
    rows,
    areasData,
    projectValues,
    map,
    groups,
    colorIndex,
    color,
  } = model;
  return (
    <div className="supply-grid">
      <PropertyDonut
        rows={rows}
        selected={property}
        onSelect={setProperty}
        label={`${supplyMetricNames[metric]}业态结构`}
      />
      <div className="linked-arrow">→</div>
      <DistributionChart
        title={`${property} · ${supplyMetricNames[metric]} · 面积段分析`}
        rows={areasData}
        sort={false}
        color={token('--color-primary')}
        onSelect={setArea}
      />
      <div className="linked-arrow">→</div>
      <DistributionChart
        title={`${area} · ${supplyMetricNames[metric]}`}
        rows={groups}
        dimension={dimension}
        onDimension={setDimension}
        color={token('--color-primary')}
      />
    </div>
  );
}
