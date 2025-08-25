"use client"

import { useState, useEffect } from "react"

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    setIsVideoLoaded(true)

    const totalDuration = 10000 // 10 segundos en milisegundos
    const intervalTime = 100 // Actualizar cada 100ms para suavidad
    const incrementPerInterval = 100 / (totalDuration / intervalTime) // Incremento por intervalo

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setFadeOut(true)
            setTimeout(() => {
              onComplete()
            }, 800)
          }, 500)
          return 100
        }
        return Math.min(prev + incrementPerInterval, 100)
      })
    }, intervalTime)

    return () => {
      clearInterval(interval)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-800 ${
        fadeOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
    >
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplaybook"
        preload="auto"
        style={{
          pointerEvents: "none",
          minWidth: "100%",
          minHeight: "100%",
        }}
      >
        <source src="/restobar.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex flex-col items-center space-y-12 px-6 text-center">
        {/* Título minimalista */}
        <div className="space-y-6">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-[0.2em] drop-shadow-2xl">
            RESTOBAR
          </h1>
          <div className="w-24 h-px bg-white/60 mx-auto"></div>
          <p className="text-white/80 text-lg sm:text-xl md:text-2xl font-light tracking-[0.15em] drop-shadow-xl">
            Sistema de Gestión
          </p>
        </div>

        <div className="w-72 sm:w-80 md:w-96 lg:w-[28rem] space-y-4">
          <div className="relative w-full bg-white/10 rounded-full h-1 backdrop-blur-sm overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-white/60 text-sm font-light tracking-wide">Cargando</p>
            <p className="text-white/80 font-light text-sm tracking-wider">{Math.round(progress)}%</p>
          </div>
        </div>

        <div className="flex space-x-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-1 h-1 bg-white/40 rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.3}s`,
                animationDuration: "1.5s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
