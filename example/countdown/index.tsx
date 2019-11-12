import React from 'react'

import { useCountdown } from '../../src'

const date = Date.now() + 60 * 60 * 1000

export const Countdown = () => {
  const [time, start, pause] = useCountdown(date, { autoStart: true })
  const { hours, minutes, seconds } = time

  return (
    <div>
      {`${hours}:${minutes}:${seconds}`}
      <div>
        <button onClick={start}>start</button>
        <button onClick={pause}>pause</button>
      </div>
    </div>
  )
}