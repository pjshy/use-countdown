export interface TimeDelta {
  total: number
  milliseconds: number
  seconds: number
  minutes: number
  hours: number
  days: number
  completed: boolean
}

interface CalcTimeDeltaOptions {
  now?: () => number
  offsetTime?: number
}

export function noop() {}

export function getTimestamp(date: number | string | Date) {
  if (typeof date === 'string') {
    return new Date(date).getTime()
  }
  if (date instanceof Date) {
    return date.getTime()
  }
  return date
}

export function calcTimeDelta(
  date: number | string | Date,
  { offsetTime = 0, now = Date.now }: CalcTimeDeltaOptions = {}
): TimeDelta {
  const startTimestamp = getTimestamp(date)

  const total = Math.max(0, startTimestamp + offsetTime - now())
  const seconds = total / 1000

  return {
    total,
    milliseconds: Number(((seconds % 1) * 1000).toFixed()),
    seconds: Math.floor(seconds % 60),
    minutes: Math.floor((seconds / 60) % 60),
    hours: Math.floor((seconds / 60 / 60) % 24),
    days: Math.floor(seconds / 60 / 60 / 24),
    completed: total <= 0,
  }
}
