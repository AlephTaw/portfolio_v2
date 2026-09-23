"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type TouchEventHandler,
  type WheelEventHandler,
} from "react";

export type SwipeDirection = -1 | 1;

const WHEEL_THRESHOLD = 36;
const TOUCH_THRESHOLD = 44;
const GESTURE_IDLE_MS = 180;

export function getAdjacentItem<T>(
  items: readonly T[],
  current: T | undefined,
  direction: SwipeDirection,
) {
  if (!items.length) return current;
  const currentIndex = current === undefined ? -1 : items.indexOf(current);
  if (currentIndex < 0) {
    return direction > 0 ? items[0] : items[items.length - 1];
  }
  const nextIndex = Math.max(
    0,
    Math.min(items.length - 1, currentIndex + direction),
  );
  return items[nextIndex];
}

export function useHorizontalSwipeNavigation(
  onNavigate: (direction: SwipeDirection) => void,
) {
  const wheelDistance = useRef(0);
  const wheelTriggered = useRef(false);
  const wheelResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const resetWheelGesture = useCallback(() => {
    wheelDistance.current = 0;
    wheelTriggered.current = false;
    wheelResetTimer.current = null;
  }, []);

  useEffect(
    () => () => {
      if (wheelResetTimer.current) clearTimeout(wheelResetTimer.current);
    },
    [],
  );

  const onWheel = useCallback<WheelEventHandler<HTMLElement>>(
    (event) => {
      const horizontalDelta =
        event.shiftKey && event.deltaX === 0 ? event.deltaY : event.deltaX;
      const verticalDelta = event.shiftKey ? 0 : event.deltaY;

      if (
        Math.abs(horizontalDelta) < 2 ||
        Math.abs(horizontalDelta) <= Math.abs(verticalDelta)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (wheelResetTimer.current) clearTimeout(wheelResetTimer.current);
      wheelResetTimer.current = setTimeout(
        resetWheelGesture,
        GESTURE_IDLE_MS,
      );

      if (wheelTriggered.current) return;
      wheelDistance.current += horizontalDelta;
      if (Math.abs(wheelDistance.current) < WHEEL_THRESHOLD) return;

      wheelTriggered.current = true;
      onNavigate(wheelDistance.current > 0 ? 1 : -1);
    },
    [onNavigate, resetWheelGesture],
  );

  const onTouchStart = useCallback<TouchEventHandler<HTMLElement>>((event) => {
    const touch = event.touches[0];
    if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback<TouchEventHandler<HTMLElement>>(
    (event) => {
      const start = touchStart.current;
      const touch = event.changedTouches[0];
      touchStart.current = null;
      if (!start || !touch) return;

      const horizontalDistance = start.x - touch.clientX;
      const verticalDistance = start.y - touch.clientY;
      if (
        Math.abs(horizontalDistance) < TOUCH_THRESHOLD ||
        Math.abs(horizontalDistance) <= Math.abs(verticalDistance)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      onNavigate(horizontalDistance > 0 ? 1 : -1);
    },
    [onNavigate],
  );

  return { onTouchEnd, onTouchStart, onWheel };
}
