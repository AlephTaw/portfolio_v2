const arcTarget = new Date("2026-12-05T00:00:00-05:00").getTime();
const arcTotalDays = 117;

export function getArcTimeRemaining(now: number) {
  const totalSeconds = Math.floor(Math.max(arcTarget - now, 0) / 1_000);

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function getArcDay(daysRemaining: number) {
  return {
    current: Math.min(arcTotalDays, Math.max(0, arcTotalDays - daysRemaining)),
    total: arcTotalDays,
  };
}

export function formatActivityElapsed(milliseconds: number) {
  const totalSeconds = Math.floor(Math.max(milliseconds, 0) / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
