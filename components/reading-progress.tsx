"use client"

import { useEffect, useState } from "react"

/** A chunky pixel progress bar. The lab assistant hangs from its tip. */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      setProgress(p)
      // Snap to whole 8px blocks so the bar fills like a pixel meter.
      setWidth(Math.floor((p * window.innerWidth) / 8) * 8)
    }
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    update()
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <div data-buddy-bar className="pixel-progress" role="progressbar" aria-label="Reading progress" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="pixel-progress-fill" style={{ width }} />
    </div>
  )
}
