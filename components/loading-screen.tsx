"use client"

import { useState, useEffect, useRef } from "react"

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      return mobileRegex.test(userAgent.toLowerCase()) || window.innerWidth <= 768
    }

    setIsMobile(checkMobile())
    setIsVideoLoaded(true)

    const playVideo = async () => {
      if (videoRef.current && !checkMobile()) {
        try {
          videoRef.current.load()
          await videoRef.current.play()
          console.log("[v0] Video playing successfully")
        } catch (error) {
          console.log("[v0] Video autoplay failed:", error)
          setTimeout(async () => {
            try {
              if (videoRef.current) {
                await videoRef.current.play()
                console.log("[v0] Video playing on retry")
              }
            } catch (retryError) {
              console.log("[v0] Video retry failed, keeping video visible")
            }
          }, 500)
        }
      }
    }

    const videoTimeout = setTimeout(playVideo, 50)

    const totalDuration = 10000
    const intervalTime = 100
    const incrementPerInterval = 100 / (totalDuration / intervalTime)

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
      clearTimeout(videoTimeout)
    }
  }, [onComplete])

  const handleCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("[v0] CanPlay video failed:", error)
      })
    }
  }

  const handleLoadedData = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("[v0] LoadedData video failed:", error)
      })
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-800 ${
        fadeOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{
        backgroundColor: isMobile ? "#000000" : "transparent",
      }}
    >
      <style jsx>{`
        video::-webkit-media-controls {
          display: none !important;
        }
        video::-webkit-media-controls-panel {
          display: none !important;
        }
        video::-webkit-media-controls-play-button {
          display: none !important;
        }
        video::-webkit-media-controls-start-playback-button {
          display: none !important;
        }
        video::-moz-media-controls {
          display: none !important;
        }
        video::-ms-media-controls {
          display: none !important;
        }
        video {
          outline: none !important;
        }
      `}</style>

      {!isMobile && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          webkit-playsinline="true"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplaybook"
          controls={false}
          preload="auto"
          onCanPlay={handleCanPlay}
          onLoadedData={handleLoadedData}
          onError={(e) => {
            console.log("[v0] Video error:", e)
          }}
          style={{
            pointerEvents: "none",
            minWidth: "100%",
            minHeight: "100%",
          }}
        >
          <source src="/restobar.mp4" type="video/mp4" />
        </video>
      )}

      <div className={`absolute inset-0 ${isMobile ? "bg-black/20" : "bg-black/40"}`} />

      <div className="relative z-10 flex flex-col items-center space-y-12 px-6 text-center">
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

      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}
