'use client'
import { useEffect, useState } from 'react'
import { getScoreColor, getScoreLabel } from '@/lib/formatters'
import { motion } from 'framer-motion'

export default function ScoreRing({ score = 0, size = 200, showDimensions = false, dimensions = null }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0
      const increment = score / 60
      const interval = setInterval(() => {
        current += increment
        if (current >= score) {
          setAnimatedScore(score)
          clearInterval(interval)
        } else {
          setAnimatedScore(Math.floor(current))
        }
      }, 16)
      return () => clearInterval(interval)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  const radius = (size - 24) / 2
  const circumference = 2 * Math.PI * radius
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 drop-shadow-xl">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-slate-800"
            strokeWidth={14}
          />
          {/* Progress ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 12px ${color}80)` }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span 
            className="font-black leading-none"
            style={{ fontSize: size > 160 ? '3rem' : '2rem', color }}
          >
            {animatedScore}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            / 100
          </span>
          <span 
            className="text-sm font-bold mt-1"
            style={{ color }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Dimension bars */}
      {showDimensions && dimensions && (
        <div className="w-full flex flex-col gap-4 mt-4">
          {Object.entries(dimensions).map(([key, dim]) => (
            <div key={key} className="w-full">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{dim.label}</span>
                <span className="text-xs font-bold text-slate-200">{dim.score}<span className="text-slate-500">/{dim.max}</span></span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(dim.score / dim.max) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
