import { Button, Segmented, Slider, Space } from 'antd';
import { PauseOutlined, CaretRightOutlined } from '@ant-design/icons';
interface Props {
  selected: boolean;
  loading: boolean;
  months: number;
  index: number;
  playing: boolean;
  month?: string;
  onMonths: (value: number) => void;
  onIndex: (value: number) => void;
  onToggle: () => void;
}
export function HistoryPlayer({
  selected,
  loading,
  months,
  index,
  playing,
  month,
  onMonths,
  onIndex,
  onToggle,
}: Props) {
  return renderHistoryPlayerView(
    useHistoryPlayerModel({ selected, loading, months, index, playing, month, onMonths, onIndex, onToggle }),
  );
}
function useHistoryPlayerModel({
  selected,
  loading,
  months,
  index,
  playing,
  month,
  onMonths,
  onIndex,
  onToggle,
}: Props) {
  const marks = Object.fromEntries(
    Array.from({ length: months }, (_, i) => [i, i === months - 1 ? '当月' : `T${i - months + 1}`]),
  );

  return { selected, loading, months, index, playing, month, onMonths, onIndex, onToggle, marks };
}
function renderHistoryPlayerView(model: ReturnType<typeof useHistoryPlayerModel>) {
  const { selected, loading, months, index, playing, month, onMonths, onIndex, onToggle, marks } = model;
  return (
    <div className="playback">
      <Button
        aria-label={playing ? '暂停顾问历史' : '播放顾问历史'}
        type={selected ? 'primary' : 'default'}
        shape="circle"
        disabled={!selected || loading}
        loading={loading}
        icon={playing ? <PauseOutlined /> : <CaretRightOutlined />}
        onClick={onToggle}
      />
      <div className="playback-slider">
        <Slider
          aria-label="顾问历史月份"
          min={0}
          max={months - 1}
          step={1}
          value={index}
          marks={marks}
          disabled={!selected || loading}
          onChange={onIndex}
        />
      </div>
      <Space direction="vertical">
        <span className="helper-text">{selected ? month || '加载中' : '请选择一位顾问'}</span>
        <Segmented<number>
          size="small"
          value={months}
          options={[
            { value: 3, label: '3个月' },
            { value: 6, label: '6个月' },
            { value: 12, label: '1年' },
          ]}
          onChange={onMonths}
        />
      </Space>
    </div>
  );
}
