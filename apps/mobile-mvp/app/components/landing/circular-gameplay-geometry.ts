export const gameplayRevealTiming = { delay: 3000, emerge: 600, hold: 2000, pulse: 3000, expand: 2500 };
export const gameplayRevealDuration = Object.values(gameplayRevealTiming).reduce((sum, value) => sum + value, 0);

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => value * value * (3 - 2 * value);

export function getGameplayReveal(elapsed: number, width: number, height: number, previousWidth: number, aspect = 16 / 9) {
  const { delay, emerge, hold, pulse, expand } = gameplayRevealTiming;
  const pulseStart = delay + emerge + hold;
  const expandStart = pulseStart + pulse;
  const baseWidth = previousWidth / 2; // Preserve the enlarged reveal's starting width.
  const viewportAspect = width / Math.max(1, height);
  const emergence = ease(clamp((elapsed - delay) / emerge));
  const pulseProgress = clamp((elapsed - pulseStart) / pulse);
  const growth = ease(clamp((elapsed - expandStart) / expand));
  let maskWidth = baseWidth * emergence;
  if (elapsed >= pulseStart && elapsed < expandStart) {
    // Exactly two movements: a small increase, then a larger decrease.
    const pulseScale = pulseProgress <= 0.4
      ? 1 + 0.1 * ease(pulseProgress / 0.4)
      : 1.1 - 0.4 * ease((pulseProgress - 0.4) / 0.6);
    maskWidth = baseWidth * pulseScale;
  } else if (elapsed >= expandStart) {
    const contractedWidth = baseWidth * 0.7;
    maskWidth = contractedWidth + (width * 1.04 - contractedWidth) * growth;
  }
  const maskHeight = maskWidth / viewportAspect;
  const fillViewport = width <= 1024;
  const previewAspect = fillViewport ? viewportAspect : aspect;
  // Cover the largest rectangular pulse; the focal-point crop handles phones.
  const largestWidth = baseWidth * 1.1;
  const previewHeight = Math.max(largestWidth / viewportAspect, largestWidth / previewAspect);
  const previewWidth = previewHeight * previewAspect;
  const fittedHeight = fillViewport ? height : Math.min(height, width / aspect);
  const fittedWidth = fillViewport ? width : fittedHeight * aspect;
  // Mobile/tablet boxes fill the viewport; FinalFrameVideo's existing cover
  // crop and focal point preserve the subject without stretching the source.
  // Wider screens retain the aspect-preserving fit and black margins.
  const videoScale = elapsed >= expandStart && baseWidth > 0 ? maskWidth / (baseWidth * 0.7) : 1;
  return {
    maskWidth,
    maskHeight,
    videoWidth: Math.min(fittedWidth, previewWidth * videoScale),
    videoHeight: Math.min(fittedHeight, previewHeight * videoScale),
    videoOpacity: ease(clamp((elapsed - pulseStart) / 1600)),
    preview: elapsed < gameplayRevealDuration,
    playing: elapsed >= pulseStart,
  };
}
