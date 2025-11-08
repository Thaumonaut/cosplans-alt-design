/**
 * Color format conversion utilities
 */

type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla';

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Parse hex color to HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert hex color to specified format
 */
export function convertColorFormat(hex: string, format: ColorFormat): string {
  if (!hex || !hex.match(/^#[0-9A-Fa-f]{6}$/)) {
    return hex || '';
  }

  switch (format) {
    case 'hex':
      return hex.toLowerCase();

    case 'rgb': {
      const rgb = hexToRgb(hex);
      if (!rgb) return hex;
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    case 'rgba': {
      const rgb = hexToRgb(hex);
      if (!rgb) return hex;
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
    }

    case 'hsl': {
      const hsl = hexToHsl(hex);
      if (!hsl) return hex;
      return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }

    case 'hsla': {
      const hsl = hexToHsl(hex);
      if (!hsl) return hex;
      return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`;
    }

    default:
      return hex;
  }
}

/**
 * Parse color string to hex
 */
export function parseColorToHex(color: string): string | null {
  if (!color) return null;

  const trimmed = color.trim();

  // Already hex
  if (trimmed.match(/^#[0-9A-Fa-f]{6}$/)) {
    return trimmed.toLowerCase();
  }

  // RGB/RGBA
  const rgbMatch = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  }

  // HSL/HSLA
  const hslMatch = trimmed.match(/^hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)$/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360;
    const s = parseInt(hslMatch[2], 10) / 100;
    const l = parseInt(hslMatch[3], 10) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = l - c / 2;

    let r = 0,
      g = 0,
      b = 0;

    if (h * 6 < 1) {
      r = c;
      g = x;
      b = 0;
    } else if (h * 6 < 2) {
      r = x;
      g = c;
      b = 0;
    } else if (h * 6 < 3) {
      r = 0;
      g = c;
      b = x;
    } else if (h * 6 < 4) {
      r = 0;
      g = x;
      b = c;
    } else if (h * 6 < 5) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  }

  return null;
}

export type { ColorFormat };

