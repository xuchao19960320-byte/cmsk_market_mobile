import { useState } from 'react';
import { Alert, Button, Drawer } from 'antd';
import type { Advisor, Dashboard } from '../../shared/types';
import { useDashboard } from '../hooks/useDashboard';
import { useAdvisorAnalysis } from '../hooks/useAdvisorAnalysis';
import { useAdvisorHistory } from '../hooks/useAdvisorHistory';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { DataState } from '../components/DataState';
import { AdvisorFilters } from '../components/AdvisorFilters';
import { AdvisorMatrix } from '../components/AdvisorMatrix';
import { HistoryPlayer } from '../components/HistoryPlayer';
import { ProjectList } from '../components/ProjectList';
import { AdvisorContribution } from '../components/AdvisorContribution';
import { number } from '../utils/format';
function AdvisorWorkspace({ data }: { data: Dashboard }) {
  return renderAdvisorWorkspaceView(useAdvisorWorkspaceModel({ data }));
}
function useAdvisorWorkspaceModel({ data }: { data: Dashboard }) {
  const analysis = useAdvisorAnalysis(data),
    history = useAdvisorHistory(analysis.selected, analysis.scope, analysis.axes),
    [contribution, setContribution] = useState<Advisor | null>(null);
  const trajectory = history.data?.slice(0, history.index + 1) || [];

  return { data, analysis, history, contribution, setContribution, trajectory };
}
function renderAdvisorWorkspaceView(model: ReturnType<typeof useAdvisorWorkspaceModel>) {
  const { data, analysis, history, contribution, setContribution, trajectory } = model;
  return (
    <>
      <AnalysisPanel title="营销效能九宫格分析" description="Y轴、X轴独立按指标降序排名；右上角为双指标前30%。">
        <AdvisorFilters
          data={data}
          scope={analysis.scope}
          axes={analysis.axes}
          onScope={analysis.changeScope}
          onAxes={analysis.setAxes}
        />
        {renderAdvisorWorkspaceViewPart3(model)}
      </AnalysisPanel>
      <AdvisorContribution
        scope={analysis.scope}
        onSelect={(id) => setContribution(analysis.rows.find((a) => a.id === id) || null)}
      />
      {renderAdvisorWorkspaceViewPart1(model)}
    </>
  );
}
export default function AdvisorPage() {
  const result = useDashboard();
  return (
    <div className="page-content">
      <DataState
        loading={result.loading}
        error={result.error}
        empty={!result.data?.projects.length}
        retry={result.reload}>
        {result.data && <AdvisorWorkspace data={result.data} />}
      </DataState>
    </div>
  );
}

function renderAdvisorWorkspaceViewPart1(model: ReturnType<typeof useAdvisorWorkspaceModel>) {
  const { data, analysis, history, contribution, setContribution, trajectory } = model;
  return (
    <Drawer title="顾问贡献明细" open={!!contribution} onClose={() => setContribution(null)}>
      {contribution && (
        <div className="chart-detail">
          <h3>{contribution.name}</h3>
          <p>
            {contribution.projectName} / {contribution.company}
          </p>
          <div>
            本月到访人数 <b>{number(contribution.monthly.visits)} 人</b>
          </div>
          <div>
            本月认购套数 <b>{number(contribution.monthly.buy)} 套</b>
          </div>
          <div>
            本月签约套数 <b>{number(contribution.monthly.sign)} 套</b>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function renderAdvisorWorkspaceViewPart2(model: ReturnType<typeof useAdvisorWorkspaceModel>) {
  const { data, analysis, history, contribution, setContribution, trajectory } = model;
  return (
    <DataState
      loading={false}
      error={null}
      empty={!analysis.rows.length}
      retry={() => analysis.changeScope({ tier: '全部' })}>
      <AdvisorMatrix
        rows={analysis.rows}
        axes={analysis.axes}
        selected={analysis.selected}
        point={history.point}
        trajectory={trajectory}
        playing={history.playing}
        onSelect={analysis.setSelected}
        onProject={(projectId) => analysis.changeScope({ projectId })}
      />
    </DataState>
  );
}

function renderAdvisorWorkspaceViewPart3(model: ReturnType<typeof useAdvisorWorkspaceModel>) {
  const { data, analysis, history, contribution, setContribution, trajectory } = model;
  return (
    <div className="advisor-layout">
      <div>
        {renderAdvisorWorkspaceViewPart2(model)}
        <HistoryPlayer
          selected={!!analysis.selected}
          loading={history.loading}
          months={history.months}
          index={history.index}
          playing={history.playing}
          month={history.point?.month}
          onMonths={history.setMonths}
          onIndex={history.selectIndex}
          onToggle={history.toggle}
        />
        {history.error && (
          <Alert type="error" message="历史数据加载失败" action={<Button onClick={history.reload}>重试</Button>} />
        )}
        <p className="helper-text mt-4">
          {analysis.rows.length > 100
            ? '当前超过100位顾问，按项目聚合展示；点击项目气泡或右侧项目进入顾问明细。'
            : '点击顾问显示图内详情。'}
          仅选中顾问沿轨迹播放，其他顾问保持当月位置；同值按稳定编号排序。
        </p>
      </div>
      <ProjectList
        projects={data.projects}
        scope={analysis.scope}
        onSelect={(projectId) => analysis.changeScope({ projectId })}
      />
    </div>
  );
}
