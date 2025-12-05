/**
 * Design Tokens Demo Component
 * 
 * This component demonstrates how to use the design tokens extracted from the landing page.
 * It shows both CSS variable usage and TypeScript token usage.
 */

import React from 'react';
import { tokens } from '@/theme';

export const TokensDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: tokens.colors.primary.hex }}>
          Design Tokens Demo
        </h1>
        <p className="text-slate-700">
          This demo showcases the design tokens extracted from the landing page.
        </p>
      </div>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: tokens.colors.primary.hex }}>
          Color Palette
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Primary Color */}
          <div className="p-6 rounded-lg" style={{ background: 'var(--color-primary)', color: 'white' }}>
            <h3 className="font-semibold mb-2">Primary</h3>
            <p className="text-sm opacity-90">{tokens.colors.primary.hex}</p>
            <p className="text-xs opacity-75">var(--color-primary)</p>
          </div>

          {/* Accent Color */}
          <div className="p-6 rounded-lg" style={{ background: 'var(--color-accent)', color: 'white' }}>
            <h3 className="font-semibold mb-2">Accent</h3>
            <p className="text-sm opacity-90">{tokens.colors.accent.hex}</p>
            <p className="text-xs opacity-75">var(--color-accent)</p>
          </div>

          {/* Accent-2 Color */}
          <div className="p-6 rounded-lg" style={{ background: 'var(--color-accent-2)', color: 'white' }}>
            <h3 className="font-semibold mb-2">Accent-2</h3>
            <p className="text-sm opacity-90">{tokens.colors.accent2.hex}</p>
            <p className="text-xs opacity-75">var(--color-accent-2)</p>
          </div>
        </div>
      </section>

      {/* Gradients */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: tokens.colors.primary.hex }}>
          Gradients
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hero Gradient */}
          <div className="p-6 rounded-xl text-white" style={{ background: 'var(--gradient-hero)' }}>
            <h3 className="font-semibold mb-2">Hero Gradient</h3>
            <p className="text-sm opacity-90">Primary → Accent</p>
            <p className="text-xs opacity-75">var(--gradient-hero)</p>
          </div>

          {/* Dashboard Button Gradient */}
          <div className="p-6 rounded-xl" style={{ 
            background: 'var(--gradient-dashboard-button)',
            color: tokens.colors.slate[800].hex
          }}>
            <h3 className="font-semibold mb-2">Dashboard Button</h3>
            <p className="text-sm opacity-90">Yellow 400 → Yellow 500</p>
            <p className="text-xs opacity-75">var(--gradient-dashboard-button)</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: tokens.colors.primary.hex }}>
          Button Examples
        </h2>
        <div className="flex flex-wrap gap-4">
          <button 
            className="px-6 py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg"
            style={{ background: 'var(--color-primary)' }}
          >
            Primary Button
          </button>

          <button 
            className="px-6 py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg"
            style={{ background: 'var(--color-accent)' }}
          >
            Accent Button
          </button>

          <button 
            className="px-6 py-3 rounded-full text-white font-semibold transition-all hover:shadow-lg"
            style={{ background: 'var(--gradient-dashboard-button)', color: tokens.colors.slate[800].hex }}
          >
            Dashboard Access
          </button>
        </div>
      </section>

      {/* Cards with Gradients */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: tokens.colors.primary.hex }}>
          Service Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            className="p-6 rounded-xl shadow-sm"
            style={{ 
              background: 'var(--gradient-card-accent)',
              borderLeft: `4px solid var(--color-accent)`
            }}
          >
            <h3 className="font-semibold mb-2" style={{ color: tokens.colors.primary.hex }}>
              Accent Card
            </h3>
            <p className="text-slate-700 text-sm">
              Uses gradient from white to accent with 10% opacity
            </p>
          </div>

          <div 
            className="p-6 rounded-xl shadow-sm"
            style={{ 
              background: 'var(--gradient-card-primary)',
              borderLeft: `4px solid var(--color-primary)`
            }}
          >
            <h3 className="font-semibold mb-2" style={{ color: tokens.colors.primary.hex }}>
              Primary Card
            </h3>
            <p className="text-slate-700 text-sm">
              Uses gradient from white to primary with 10% opacity
            </p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: tokens.colors.primary.hex }}>
          Typography Scale
        </h2>
        <div className="space-y-2">
          <p style={{ fontSize: 'var(--font-size-xs)' }}>Extra Small (xs) - 12px</p>
          <p style={{ fontSize: 'var(--font-size-sm)' }}>Small (sm) - 14px</p>
          <p style={{ fontSize: 'var(--font-size-base)' }}>Base - 16px</p>
          <p style={{ fontSize: 'var(--font-size-lg)' }}>Large (lg) - 18px</p>
          <p style={{ fontSize: 'var(--font-size-xl)' }}>Extra Large (xl) - 20px</p>
          <p style={{ fontSize: 'var(--font-size-2xl)' }}>2XL - 24px</p>
        </div>
      </section>

      {/* Shadows */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: tokens.colors.primary.hex }}>
          Shadow Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className="p-6 bg-white rounded-lg"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <p className="text-sm font-semibold">Card Shadow</p>
            <p className="text-xs text-slate-600">var(--shadow-card)</p>
          </div>

          <div 
            className="p-6 bg-white rounded-lg"
            style={{ boxShadow: 'var(--shadow-elevated)' }}
          >
            <p className="text-sm font-semibold">Elevated Shadow</p>
            <p className="text-xs text-slate-600">var(--shadow-elevated)</p>
          </div>

          <div 
            className="p-6 bg-white rounded-lg"
            style={{ boxShadow: 'var(--shadow-xl)' }}
          >
            <p className="text-sm font-semibold">XL Shadow</p>
            <p className="text-xs text-slate-600">var(--shadow-xl)</p>
          </div>
        </div>
      </section>

      {/* Usage Code Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold" style={{ color: tokens.colors.primary.hex }}>
          Usage Examples
        </h2>
        
        <div className="bg-slate-900 text-white p-4 rounded-lg text-sm font-mono space-y-2">
          <p className="text-green-400">// Using CSS variables in styles</p>
          <p>{'<div style={{ background: "var(--color-primary)" }}>'}</p>
          
          <p className="text-green-400 mt-4">// Using TypeScript tokens</p>
          <p>{'import { tokens } from "@/theme";'}</p>
          <p>{'const color = tokens.colors.primary.hex; // "#1E3A5F"'}</p>
          
          <p className="text-green-400 mt-4">// Using in Tailwind (via arbitrary values)</p>
          <p>{'<div className="bg-[var(--color-primary)]">'}</p>
        </div>
      </section>
    </div>
  );
};

export default TokensDemo;
