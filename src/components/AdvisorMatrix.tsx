import { useMemo } from 'react';
import { matrixOption, type MatrixInput } from '../utils/matrixOption';
import { useWorkspace } from '../stores/useWorkspace';
import { EChart } from './EChart';
interface Props extends MatrixInput {
  playing: boolean;
  onSelect: (id: string) => void;
  onProject: (id: string) => void;
}
export function AdvisorMatrix(props: Props) {
  const theme = useWorkspace((s) => s.theme),
    option = useMemo(
      () => matrixOption(props),
      [props.rows, props.axes, props.selected, props.point, props.trajectory, theme],
    );
  const select = (id: string) =>
    id.startsWith('project:') ? props.onProject(id.replace('project:', '')) : props.onSelect(id);
  return (
    <EChart
      option={option}
      size="tall"
      label="营销效能九宫格，右上角为双指标前30%"
      activeId={!props.playing ? props.selected : undefined}
      onClick={(event) => select(event.id)}
    />
  );
}
