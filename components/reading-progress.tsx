"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight
      const percentage = (scrolled / maxHeight) * 100
      setProgress(Math.min(100, Math.max(0, percentage)))
    }

    window.addEventListener("scroll", updateProgress)
    updateProgress()

    return () => window.removeEventListener("scroll", updateProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50">
      <motion.div
        className="h-full bg-gradient-to-r from-gray-900 to-gray-700"
        style={{ width: `${progress}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}
