import {
  useState,
  useLayoutEffect,
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
  const timerRef = useRef<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)

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

  const start = useCallback(() => {
    setOffsetTime(pre => Date.now() - offsetStart + pre)
    setIsPlaying(true)
    onStart()
  }, [offsetStart])

  const pause = useCallback(() => {
    setOffsetStart(Date.now())
    setIsPlaying(false)
  }, [])

  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [])

  // https://github.com/facebook/react/issues/14050
  useLayoutEffect(() => {
    if (isPlaying) {
      const tick = () => {
        const nextTimeDelta = getTimeDeleta()
        setTimeDelta(nextTimeDelta)
        if (nextTimeDelta.completed) {
          onComplete()
          setIsPlaying(false)
        } else {
          onTick()
          timerRef.current = window.setTimeout(() => tick(), DELAY_TIME)
        }
      }

      timerRef.current = window.setTimeout(() => tick(), DELAY_TIME)

      return () => clearDelayTimer()
    }
    return
  }, [isPlaying, getTimeDeleta, onComplete, onTick])

  return [timeDelta, start, pause]
}
