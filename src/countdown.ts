import { useState, useLayoutEffect, useRef, useCallback } from 'react'

import { calcTimeDelta, TimeDelta, noop } from './utils'

export interface CountdownOptions {
  autoStart?: boolean
  onStart?: (delta: TimeDelta) => void
  onComplete?: (delta: TimeDelta) => void
  onTick?: (TimeDelta: TimeDelta) => void
}

type Start = () => void
type Pause = () => void

const DELAY_TIME = 1000

/**
 *
 * @param date target date
 * @param options countdown callback
 */
export function useCountdown(
  date: number | string | Date,
  {
    autoStart = true,
    onStart = noop,
    onTick = noop,
    onComplete = noop,
  }: CountdownOptions = {}
): [TimeDelta, Start, Pause] {
  const timerRef = useRef<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(autoStart)

  const [offsetStart, setOffsetStart] = useState(Date.now())

  const [offsetTime, setOffsetTime] = useState(0)

  const [timeDelta, setTimeDelta] = useState(calcTimeDelta(date))

  const getTimeDeleta = useCallback(() => {
    return calcTimeDelta(date, { offsetTime })
  }, [date, offsetTime])

  const clearDelayTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  function start() {
    setOffsetTime(Date.now() - offsetStart)

    setIsPlaying(true)
  }

  function pause() {
    setOffsetStart(Date.now())

    setIsPlaying(false)
  }

  // https://github.com/facebook/react/issues/14050
  useLayoutEffect(() => {
    if (isPlaying) {
      onStart(timeDelta)
      const tick = () => {
        const nextTimeDelta = getTimeDeleta()
        setTimeDelta(nextTimeDelta)
        if (nextTimeDelta.completed) {
          onComplete(nextTimeDelta)
        } else {
          onTick(nextTimeDelta)
          window.setTimeout(() => tick(), DELAY_TIME)
        }
      }

      window.setTimeout(() => tick(), DELAY_TIME)

      return () => clearDelayTimer()
    }
    return
  }, [
    isPlaying,
    getTimeDeleta,
    onStart,
    timeDelta,
    onComplete,
    onTick,
    clearDelayTimer,
  ])

  return [timeDelta, start, pause]
}
