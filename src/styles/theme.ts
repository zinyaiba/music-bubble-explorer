import { DefaultTheme } from 'styled-components';

// パステルカラーパレット
export const pastelColors = [
  '#FFB6C1', // bubble-pink
  '#B6E5D8', // bubble-blue
  '#DDA0DD', // bubble-purple
  '#F0E68C', // bubble-yellow
  '#98FB98', // bubble-green
  '#FFDAB9', // bubble-orange
  '#E6E6FA', // bubble-lavender
  '#FFDAB9', // bubble-peach
  '#F0FFF0', // bubble-mint
  '#F08080', // bubble-coral
] as const;

// テーマ定義
export const theme: DefaultTheme = {
  colors: {
    // パステルカラーパレット
    pastel: {
      pink: '#FFB6C1',
      blue: '#B6E5D8',
      purple: '#DDA0DD',
      yellow: '#F0E68C',
      green: '#98FB98',
      orange: '#FFDAB9',
      lavender: '#E6E6FA',
      peach: '#FFDAB9',
      mint: '#F0FFF0',
      coral: '#F08080',
    },
    
    // 背景色
    background: {
      gradient: 'linear-gradient(135deg, #E8F4FD 0%, #FFF0F5 100%)',
      light: '#FAFCFF',
      soft: '#F8F9FA',
    },
    
    // テキスト色
    text: {
      primary: '#5A5A5A',
      secondary: '#8A8A8A',
      light: '#B0B0B0',
      white: '#FFFFFF',
    },
    
    // UI要素
    ui: {
      modalBackground: 'rgba(255, 255, 255, 0.95)',
      modalOverlay: 'rgba(0, 0, 0, 0.3)',
      borderLight: 'rgba(255, 255, 255, 0.3)',
      shadowSoft: 'rgba(0, 0, 0, 0.1)',
      hoverOverlay: 'rgba(255, 255, 255, 0.2)',
      activeOverlay: 'rgba(255, 255, 255, 0.4)',
    },
  },
  
  // ブレークポイント
  breakpoints: {
    mobileSmall: '480px',
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
    desktopLarge: '1440px',
  },
  
  // アニメーション設定
  animations: {
    duration: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s',
      verySlow: '0.8s',
    },
    easing: {
      easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    },
  },
  
  // シャボン玉サイズ設定
  bubble: {
    size: {
      min: 40,
      max: 120,
    },
    opacity: {
      default: 0.8,
      hover: 1.0,
      inactive: 0.3,
    },
  },
};

// TypeScript用の型定義
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      pastel: {
        pink: string;
        blue: string;
        purple: string;
        yellow: string;
        green: string;
        orange: string;
        lavender: string;
        peach: string;
        mint: string;
        coral: string;
      };
      background: {
        gradient: string;
        light: string;
        soft: string;
      };
      text: {
        primary: string;
        secondary: string;
        light: string;
        white: string;
      };
      ui: {
        modalBackground: string;
        modalOverlay: string;
        borderLight: string;
        shadowSoft: string;
        hoverOverlay: string;
        activeOverlay: string;
      };
    };
    breakpoints: {
      mobileSmall: string;
      mobile: string;
      tablet: string;
      desktop: string;
      desktopLarge: string;
    };
    animations: {
      duration: {
        fast: string;
        normal: string;
        slow: string;
        verySlow: string;
      };
      easing: {
        easeOut: string;
        easeIn: string;
        easeInOut: string;
      };
    };
    bubble: {
      size: {
        min: number;
        max: number;
      };
      opacity: {
        default: number;
        hover: number;
        inactive: number;
      };
    };
  }
}