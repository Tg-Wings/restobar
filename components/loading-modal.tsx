"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface LoadingModalProps {
  isOpen: boolean
  onComplete?: () => void // Agregando callback para manejar el cierre suave
}

export function LoadingModal({ isOpen, onComplete }: LoadingModalProps) {
  const [progress, setProgress] = useState(0)
  const [isClosing, setIsClosing] = useState(false) // Estado para controlar el efecto de salida

  useEffect(() => {
    if (isOpen) {
      setProgress(0) // Resetear progreso al abrir
      setIsClosing(false) // Resetear estado de cierre

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setIsClosing(true)
              setTimeout(() => {
                onComplete?.()
              }, 800) // Esperar 800ms para que termine la animación de salida
            }, 500) // Esperar 500ms después de completar la carga
            return 100
          }
          return prev + 100 / 300 // 30 segundos = 300 intervalos de 100ms
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isOpen, onComplete])

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-full max-h-full w-screen h-screen border-none bg-transparent p-0 overflow-hidden [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Cargando sistema</DialogTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <DialogDescription>El sistema se está cargando, por favor espere</DialogDescription>
        </VisuallyHidden>

        <div
          className={`relative w-full h-full flex flex-col items-center justify-center transition-opacity duration-800 ${isClosing ? "opacity-0" : "opacity-100"}`}
        >
          <video
            className="absolute inset-0 w-full h-full object-cover lg:object-contain"
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            style={{
              pointerEvents: "none",
              minWidth: "100%",
              minHeight: "100%",
            }}
          >
            <source src="/restobar.mp4" type="video/mp4" />
          </video>


          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 flex flex-col items-center space-y-6 px-4">
            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider text-center drop-shadow-2xl">
              CARGANDO...
            </h2>

            <div className="w-72 sm:w-96 md:w-[28rem] lg:w-[32rem]">
              <div className="w-full bg-white/25 rounded-full h-2 backdrop-blur-sm border border-white/20">
                <div
                  className="bg-gradient-to-r from-white to-gray-200 h-2 rounded-full transition-all duration-100 ease-out shadow-xl"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/90 text-center mt-3 text-sm sm:text-base font-medium drop-shadow-lg">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
