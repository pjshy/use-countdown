import {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react'

import { calcTimeDelta, TimeDelta, noop } from './utils'

export interface CountdownOptions {
  autoStart?: boolean
  onStart?: () => void
  onComplete?: () => void
  onTick?: () => void
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
  const timestamp = Date.now()

  const timerRef = useRef<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)

  const [offsetStart, setOffsetStart] = useState(timestamp)

  const [offsetTime, setOffsetTime] = useState(0)

  const [timeDelta, setTimeDelta] = useState(calcTimeDelta(date, { now: () => timestamp }))

  const getTimeDeleta = useCallback(() => {
    return calcTimeDelta(date, { offsetTime, now: () => timestamp })
  }, [date, offsetTime, timestamp])

  const clearDelayTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (!isPlaying) {
      setOffsetTime(pre => timestamp - offsetStart + pre)
      setIsPlaying(true)
      onStart()
    }
  }, [offsetStart, isPlaying, timestamp])

  const pause = useCallback(() => {
    if (isPlaying) {
      setOffsetStart(timestamp)
      setIsPlaying(false)
    }
  }, [isPlaying, timestamp])

  const tick = useCallback(() => {
    const nextTimeDelta = getTimeDeleta()

    setTimeDelta(nextTimeDelta)
    nextTimeDelta.completed && setIsPlaying(false)
  }, [getTimeDeleta])

  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      if (timeDelta.completed) {
        onComplete()
      } else {
        onTick()
        timerRef.current = window.setTimeout(() => tick(), DELAY_TIME)
      }
      return () => clearDelayTimer()
    }
    return
  }, [isPlaying, timeDelta])

  return [timeDelta, start, pause]
}
