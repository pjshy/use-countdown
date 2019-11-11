import { useState, useMemo, useLayoutEffect } from 'react'

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
  controller?: boolean
}

function noop() {}

export function calcTimeDelta(
  date: number | string | Date,
  {
    offsetTime = 0,
    now = Date.now,
    controller = false,
  }: CalcTimeDeltaOptions = {}
): TimeDelta {
  let startTimestamp: number

  if (typeof date === 'string') {
    startTimestamp = new Date(date).getTime()
  } else if (date instanceof Date) {
    startTimestamp = date.getTime()
  } else {
    startTimestamp = date
  }

  const total = Math.max(
    0,
    controller ? startTimestamp : startTimestamp + offsetTime - now()
  )
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

export interface CountdownOptions {
  autoStart?: boolean
  controller?: boolean
  onStart?: (delta: TimeDelta) => void
  onComplete?: (delta: TimeDelta) => void
  onTick?: (TimeDelta: TimeDelta) => void
}

type Start = () => void
type Pause = () => void

/**
 *
 * @param date target date
 * @param options countdown callback
 */
export function useCountdown(
  date: number | string | Date,
  {
    autoStart = true,
    controller = false,
    onStart = noop,
    onTick = noop,
    onComplete = noop,
  }: CountdownOptions = {}
): [TimeDelta, Start, Pause] {
  let timer: number | null = null
  const initOffsetState = Date.now()
  const [offsetStart, setOffsetStart] = useState(initOffsetState)

  const initOffsetTime = 0
  const [offsetTime, setOffsetTime] = useState(initOffsetTime)

  const initState = useMemo(() => getTimeDeleta(), [getTimeDeleta])
  const [delta, setTimeDelta] = useState(initState)

  function getTimeDeleta() {
    return calcTimeDelta(date, { offsetTime, controller })
  }

  function createDelayTimer(timeDelta: TimeDelta) {
    timer !== null && clearTimeout(timer)

    const delayTime = 1 * 1000

    if (timeDelta.completed) {
      onComplete(timeDelta)
    } else {
      timer = window.setTimeout(() => {
        tick()
      }, delayTime)
    }
  }

  function clearDelayTimer() {
    timer !== null && clearTimeout(timer)
  }

  function tick() {
    const nextTimeDelta = getTimeDeleta()

    setTimeDelta(nextTimeDelta)
    createDelayTimer(nextTimeDelta)

    if (!nextTimeDelta.completed) {
      onTick(nextTimeDelta)
    }
  }

  function start() {
    setOffsetTime(Date.now() - offsetStart)

    const nextTimeDelta = getTimeDeleta()

    setTimeDelta(nextTimeDelta)
    createDelayTimer(nextTimeDelta)

    onStart(nextTimeDelta)
  }

  function pause() {
    setOffsetStart(Date.now())

    clearDelayTimer()
  }

  // https://github.com/facebook/react/issues/14050
  useLayoutEffect(() => {
    autoStart && start()

    return () => clearDelayTimer()
  }, [autoStart, clearDelayTimer, start])

  return [delta, start, pause]
}
