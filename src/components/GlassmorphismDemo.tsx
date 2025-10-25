import React from 'react'
import { GlassmorphismThemeProvider } from './GlassmorphismThemeProvider'
import { GlassCard } from './GlassCard'
import { Typography } from './Typography'

/**
 * Glassmorphism Demo Component
 * Demonstrates the glassmorphism design system components
 * 
 * This component can be used for testing and showcasing the glassmorphism system
 */
export const GlassmorphismDemo: React.FC = () => {
  return (
    <GlassmorphismThemeProvider>
      <div style={{ 
        padding: '2rem', 
        background: 'linear-gradient(135deg, #fef7f7 0%, #fce8e8 50%, #f8d1d1 100%)',
        minHeight: '100vh'
      }}>
        <Typography variant="h1" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          ガラスモーフィズムデザインシステム
        </Typography>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Primary Card */}
          <GlassCard variant="primary" style={{ padding: '2rem' }}>
            <Typography variant="h3" style={{ marginBottom: '1rem' }}>
              プライマリカード
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '1rem' }}>
              透明度とぼかし効果を持つガラスモーフィズムカードです。
              白い枠線と半透明背景が特徴的です。
            </Typography>
            <Typography variant="body2" color="secondary">
              M PLUS Rounded 1cフォントを使用しています。
            </Typography>
          </GlassCard>
          
          {/* Secondary Card */}
          <GlassCard variant="secondary" style={{ padding: '2rem' }}>
            <Typography variant="h3" style={{ marginBottom: '1rem' }}>
              セカンダリカード
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '1rem' }}>
              より軽いガラス効果を持つセカンダリバリアントです。
              控えめなデザインで補助的な情報に適しています。
            </Typography>
            <Typography variant="caption" color="secondary">
              キャプションテキストの例
            </Typography>
          </GlassCard>
          
          {/* Accent Card */}
          <GlassCard variant="accent" style={{ padding: '2rem' }}>
            <Typography variant="h3" style={{ marginBottom: '1rem' }}>
              アクセントカード
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '1rem' }}>
              淡いピンクのティントが加えられたアクセントカードです。
              重要な情報や強調したい要素に使用します。
            </Typography>
            <Typography variant="button" color="accent">
              ボタンテキストスタイル
            </Typography>
          </GlassCard>
          
          {/* Interactive Card */}
          <GlassCard 
            variant="primary" 
            onClick={() => alert('カードがクリックされました！')}
            style={{ padding: '2rem' }}
            aria-label="インタラクティブカード"
          >
            <Typography variant="h3" style={{ marginBottom: '1rem' }}>
              インタラクティブカード
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '1rem' }}>
              クリック可能なカードです。ホバー効果とフォーカス状態が
              適用されています。
            </Typography>
            <Typography variant="body2" color="secondary">
              クリックしてみてください！
            </Typography>
          </GlassCard>
          
          {/* Typography Showcase */}
          <GlassCard variant="secondary" style={{ padding: '2rem' }}>
            <Typography variant="h4" style={{ marginBottom: '1rem' }}>
              タイポグラフィ
            </Typography>
            <Typography variant="h5" style={{ marginBottom: '0.5rem' }}>
              見出し5
            </Typography>
            <Typography variant="h6" style={{ marginBottom: '1rem' }}>
              見出し6
            </Typography>
            <Typography variant="body1" style={{ marginBottom: '0.5rem' }}>
              本文テキスト（Body1）- 標準的な本文に使用
            </Typography>
            <Typography variant="body2" style={{ marginBottom: '0.5rem' }}>
              本文テキスト（Body2）- 小さめの本文に使用
            </Typography>
            <Typography variant="caption" color="secondary">
              キャプション - 補足情報や注釈に使用
            </Typography>
          </GlassCard>
          
          {/* Color Showcase */}
          <GlassCard variant="accent" style={{ padding: '2rem' }}>
            <Typography variant="h4" style={{ marginBottom: '1rem' }}>
              カラーシステム
            </Typography>
            <Typography variant="body1" color="primary" style={{ marginBottom: '0.5rem' }}>
              プライマリテキスト
            </Typography>
            <Typography variant="body1" color="secondary" style={{ marginBottom: '0.5rem' }}>
              セカンダリテキスト
            </Typography>
            <Typography variant="body1" color="accent" style={{ marginBottom: '0.5rem' }}>
              アクセントテキスト
            </Typography>
            <Typography variant="body1" color="onGlass">
              ガラス上のテキスト
            </Typography>
          </GlassCard>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Typography variant="body2" color="secondary">
            ガラスモーフィズムデザインシステム - 淡いピンクと白を基調とした現代的なUI
          </Typography>
        </div>
      </div>
    </GlassmorphismThemeProvider>
  )
}

export default GlassmorphismDemo