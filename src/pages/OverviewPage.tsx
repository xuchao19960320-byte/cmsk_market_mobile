import { useDashboard } from '../hooks/useDashboard';
import { DataState } from '../components/DataState';
import { MetricCards } from '../components/MetricCards';
import { ChannelAnalysis } from '../components/ChannelAnalysis';
import { PropertyAnalysis } from '../components/PropertyAnalysis';
import { MarketingTrend } from '../components/MarketingTrend';
import { MarketingRanking } from '../components/MarketingRanking';
export default function OverviewPage() {
  const result = useDashboard();
  return (
    <div className="page-content">
      <DataState
        loading={result.loading}
        error={result.error}
        empty={!result.data?.projects.length}
        retry={result.reload}>
        {result.data && (
          <>
            <MetricCards data={result.data} />
            <ChannelAnalysis projects={result.data.projects} />
            <MarketingTrend data={result.data} />
            <PropertyAnalysis projects={result.data.projects} />
            <MarketingRanking />
          </>
        )}
      </DataState>
    </div>
  );
}
