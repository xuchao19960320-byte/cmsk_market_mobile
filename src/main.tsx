import React from 'react';
import ReactDOM from 'react-dom/client';
import 'dayjs/locale/zh-cn';
import { StyleProvider } from '@ant-design/cssinjs';
import './styles/tokens.css';
import './styles/app.css';
import { ThemeProvider } from './components/ThemeProvider';
import { AppRouter } from './router/AppRouter';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StyleProvider layer>
      <ThemeProvider>
        <AppRouter />
      </ThemeProvider>
    </StyleProvider>
  </React.StrictMode>,
);
