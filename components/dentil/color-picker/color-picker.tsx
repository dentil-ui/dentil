'use client';

import { HexColorPicker } from 'react-colorful';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const HEX = /^[0-9a-f]{6}$/;

/** A saturated color, so an empty picker doesn't open on black. */
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

/** Six hex digits, with a leading `#` and any other characters removed. */
function toHex(value: string) {
  return value
    .replace(/^#/, '')
    .replace(/[^0-9a-fA-F]/g, '')
    .slice(0, 6)
    .toLowerCase();
}

export interface ColorPickerProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'type' | 'defaultValue' | 'size'
> {
  /** 6-digit hex without `#`, e.g. `'ed5656'`. A leading `#` is ignored. */
  value: string | null | undefined;
  /** Called with the hex without `#`, including a partial value. Non-hex characters are removed. */
  onChange: (value: string) => void;
}

export function ColorPicker({
  value,
  onChange,
  disabled,
  placeholder = 'ed5656',
  className,
  ...props
}: ColorPickerProps) {
  const hex = toHex(value ?? '');
  const swatch = HEX.test(hex) ? `#${hex}` : undefined;
  // Keep the last valid color so a half-typed value doesn't jump the picker.
  const [fallback, setFallback] = React.useState(() => swatch ?? `#${randomHex()}`);
  if (swatch && fallback !== swatch) setFallback(swatch);

  const commit = (next: string) => onChange(toHex(next));

  return (
    <div data-slot="color-picker" className={cn('flex w-full items-center gap-2', className)}>
      <InputGroup data-disabled={disabled ? true : undefined} className="min-w-0 flex-1">
        <InputGroupAddon>
          <InputGroupText>#</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          placeholder={placeholder}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          {...props}
          value={hex}
          onChange={(event) => commit(event.target.value)}
          className="font-mono"
        />
      </InputGroup>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            aria-label={swatch ? `Pick a color, current ${swatch}` : 'Pick a color'}
            className={cn('shrink-0', !swatch && 'bg-muted')}
            style={swatch ? { backgroundColor: swatch } : undefined}
          />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <div className="flex w-[200px] flex-col gap-3">
            <HexColorPicker
              color={swatch ?? fallback}
              onChange={commit}
              className="focus-within:ring-ring/50 rounded-md focus-within:ring-2"
            />
            <InputGroup className="w-full">
              <InputGroupAddon>
                <InputGroupText>#</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                value={hex}
                onChange={(event) => commit(event.target.value)}
                disabled={disabled}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="off"
                aria-label="Hex color"
                className="font-mono"
              />
            </InputGroup>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
