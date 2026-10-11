import { ImageResponse } from 'next/og';

import { siteConfig } from '@/lib/site';

export const ogSize = { width: 1200, height: 630 };

const colors = { background: '#0a0a0a', foreground: '#fafafa', muted: '#a1a1a1', border: '#262626', chip: '#171717' };

/** The shared social card. Satori only supports flexbox layout and inline styles, so this mirrors the site by hand. */
export function ogImage({ title, description, items = [] }: { title: string; description: string; items?: string[] }) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: colors.background,
        color: colors.foreground,
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 32 }}>
        <div style={{ display: 'flex', width: 40, height: 40, borderRadius: 10, background: colors.foreground }}>
          <svg width="40" height="40" viewBox="0 0 16 16">
            <rect x="1" y="4" width="14" height="2" fill={colors.background} />
            {[1, 4, 7, 10, 13].map((x) => (
              <rect key={x} x={x} y="7" width="2" height="4" fill={colors.background} />
            ))}
          </svg>
        </div>
        {siteConfig.name}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 980 }}>
        <div style={{ fontSize: 76, letterSpacing: -2, lineHeight: 1.05 }}>{title}</div>
        <div style={{ fontSize: 30, lineHeight: 1.4, color: colors.muted }}>{description}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 22 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {items.map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${colors.border}`,
                background: colors.chip,
              }}>
              {item}
            </div>
          ))}
        </div>
        <div style={{ color: colors.muted }}>{new URL(siteConfig.url).host}</div>
      </div>
    </div>,
    ogSize
  );
}
