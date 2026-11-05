import { useLayoutEffect, useMemo, useState } from 'react';
import { App, ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type { ReactNode } from 'react';
import { useWorkspace } from '../stores/useWorkspace';
import { token } from '../utils/tokens';
export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useWorkspace((s) => s.theme),
    [ready, setReady] = useState(0);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
    setReady((value) => value + 1);
  }, [mode]);
  const theme = useMemo(
    () => ({
      cssVar: true,
      algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: token('--color-primary'),
        colorBgContainer: token('--color-surface'),
        colorText: token('--color-ink'),
        colorBorder: token('--color-line'),
        fontFamily: token('--font-sans'),
        fontSize: 14,
        borderRadius: 6,
      },
      components: {
        Table: {
          headerBg: token('--color-primary-soft'),
          headerColor: token('--color-muted'),
          rowHoverBg: token('--color-primary-soft'),
          cellPaddingBlock: 12,
          cellFontSize: 12,
          fontFamily: token('--font-sans'),
        },
        Tabs: { inkBarColor: token('--color-primary'), itemSelectedColor: token('--color-primary') },
      },
    }),
    [mode, ready],
  );
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
