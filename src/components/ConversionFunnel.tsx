import { useMemo } from 'react';
import type { Stage } from '../../shared/types';
import { funnelOption } from '../utils/funnelOption';
import { useWorkspace } from '../stores/useWorkspace';
import { EChart } from './EChart';
interface Props {
  quantities: Record<Stage, number>;
  stage: Stage;
  onStage: (stage: Stage) => void;
}
const stages: Stage[] = ['leads', 'visits', 'buy', 'sign'];
export function ConversionFunnel({ quantities, stage, onStage }: Props) {
  const theme = useWorkspace((s) => s.theme),
    option = useMemo(() => funnelOption(quantities, stage), [quantities, stage, theme]);
  return (
    <div className="conversion-funnel">
      <EChart
        option={option}
        size="tall"
        label="获客、到访、认购、签约漏斗，点击阶段联动渠道结构"
        onClick={(event) => {
          if (stages.includes(event.name as Stage)) onStage(event.name as Stage);
        }}
      />
      <p className="helper-text section-gap">漏斗宽度为阶段示意；当期量比不等同于同批客户转化。</p>
    </div>
  );
}
