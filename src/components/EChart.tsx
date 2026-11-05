import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart, FunnelChart, ScatterChart, TreemapChart } from 'echarts/charts';
import {
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  DataZoomComponent,
  MarkAreaComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  FunnelChart,
  ScatterChart,
  TreemapChart,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  DataZoomComponent,
  MarkAreaComponent,
  CanvasRenderer,
]);
import type { EChartsOption } from 'echarts';
import { useWorkspace } from '../stores/useWorkspace';
export interface ChartClick {
  name: string;
  id: string;
  seriesName: string;
}
interface Props {
  option: EChartsOption;
  onClick?: (event: ChartClick) => void;
  label: string;
  activeId?: string | null;
  size?: 'normal' | 'tall' | 'small';
}
export function EChart({ option, onClick, label, activeId, size = 'normal' }: Props) {
  const element = useRef<HTMLDivElement>(null),
    chart = useRef<echarts.ECharts | null>(null),
    callback = useRef(onClick);
  const theme = useWorkspace((s) => s.theme);
  callback.current = onClick;
  useEffect(() => {
    if (!element.current) return;
    const instance = echarts.init(element.current);
    chart.current = instance;
    instance.on('click', (event) => {
      const raw = event as { name?: string; seriesName?: string; data?: { id?: string } };
      callback.current?.({
        name: raw.name || '',
        id: raw.data?.id || raw.name || '',
        seriesName: raw.seriesName || '',
      });
    });
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(element.current);
    return () => {
      observer.disconnect();
      instance.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    chart.current?.setOption(option, { notMerge: false, replaceMerge: ['series', 'dataZoom'] });
    if (activeId) {
      const series = Array.isArray(option.series) ? option.series : [],
        first = series[0] as { data?: { id?: string }[] } | undefined,
        index = first?.data?.findIndex((row) => row?.id === activeId) ?? -1;
      if (index >= 0) chart.current?.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: index });
    }
  }, [option, theme, activeId]);
  useEffect(() => {
    if (!element.current) return;
    return attachKeyboardChart(element.current);
  }, []);
  return <div ref={element} className={`plot ${size === 'normal' ? '' : size}`} role="img" aria-label={label} />;
}
function attachKeyboardChart(element: HTMLDivElement) {
  element.tabIndex = 0;
  const handler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') element.blur();
  };
  element.addEventListener('keydown', handler);
  return () => element.removeEventListener('keydown', handler);
}
