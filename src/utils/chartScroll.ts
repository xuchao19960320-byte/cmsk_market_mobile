import type { DataZoomComponentOption } from 'echarts';
export function chartScroll(total: number, visible: number): DataZoomComponentOption[] {
  if (total <= visible) return [];
  return [{
    type: 'slider',
    xAxisIndex: 0,
    startValue: 0,
    endValue: visible - 1,
    minValueSpan: visible - 1,
    maxValueSpan: visible - 1,
    zoomLock: true,
    brushSelect: false,
    showDataShadow: false,
    showDetail: false,
    handleSize: 0,
    moveHandleSize: 0,
    height: 12,
    bottom: 30,
    borderColor: 'transparent',
    filterMode: 'filter',
  }];
}
