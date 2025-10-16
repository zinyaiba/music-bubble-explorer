import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * アプリケーション全体にテーマを提供するプロバイダーコンポーネント
 * 要件6.1, 6.2, 6.4に対応
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <StyledThemeProvider theme={theme}>
      {children}
    </StyledThemeProvider>
  );
};