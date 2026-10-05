export type GlassTintConfig = { enabled: boolean; threshold: number; strength: number; blur: number };
export const defaultGlassTint: GlassTintConfig = { enabled: true, threshold: 0.18, strength: 0.82, blur: 48 };

export function relativeLuminance(red: number, green: number, blue: number) {
  const linear = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

export function glassTintOpacity(luminance: number, config: GlassTintConfig, theme: "dark" | "light") {
  if (!config.enabled) return 0;
  const brightness = theme === "dark" ? luminance : 1 - luminance;
  const threshold = Math.min(0.9, Math.max(0, config.threshold));
  const amount = Math.min(1, Math.max(0, (brightness - threshold) / (1 - threshold)));
  // Ease into tinting; bright backdrops gain protection before reaching white.
  return Math.min(0.95, Math.max(0, config.strength)) * Math.sqrt(amount);
}
