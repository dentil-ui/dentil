'use client';

import { useState, useSyncExternalStore } from 'react';

import { ColorPicker } from '@/components/color-picker/color-picker';

const HEX = /^[0-9a-f]{6}$/;

/** A saturated color. Cached so the client snapshot stays stable. */
let startingColor: string | undefined;

function randomHex() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 0.65;
  const lightness = 0.52;
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    const value = lightness - chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * value)
      .toString(16)
      .padStart(2, '0');
  };
  return `${channel(0)}${channel(8)}${channel(4)}`;
}

function startingHex() {
  startingColor ??= randomHex();
  return startingColor;
}

function subscribe() {
  return () => {};
}

function serverHex() {
  return '';
}

export function ColorPickerOverviewDemo() {
  // Empty during SSR so the random color doesn't mismatch hydration, then the client color.
  const starting = useSyncExternalStore(subscribe, startingHex, serverHex);
  const [brand, setBrand] = useState<string | null>(null);
  const [accent, setAccent] = useState('');
  const brandValue = brand ?? starting;
  const accentInvalid = accent.length > 0 && !HEX.test(accent);

  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-2">
        <ColorPicker value={brandValue} onChange={setBrand} aria-label="Brand color" />
        <span className="text-muted-foreground text-sm">
          Result: <code className="text-foreground">{brandValue ? `#${brandValue}` : '—'}</code>
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <ColorPicker
          value={accent}
          onChange={setAccent}
          aria-label="Accent color"
          aria-invalid={accentInvalid || undefined}
        />
        {accentInvalid ? (
          <p className="text-destructive text-sm">Use six hex digits.</p>
        ) : (
          <span className="text-muted-foreground text-sm">
            Result: <code className="text-foreground">{accent ? `#${accent}` : '—'}</code>
          </span>
        )}
      </div>
    </div>
  );
}
