"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { User, ChefHat, Calculator, Shield, Eye, EyeOff, ArrowLeft } from "lucide-react"

type UserRole = "admin" | "mesero" | "cocina" | "caja"

interface LoginModalProps {
  isOpen: boolean
  onLogin: (success: boolean, username?: string) => void
  selectedRole: UserRole
  onBack?: () => void
}

export function LoginModal({ isOpen, onLogin, selectedRole, onBack }: LoginModalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const credentials = {
    admin: { username: "admin", password: "admin123", displayName: "Administrador" },
    mesero: { username: "mesero", password: "mesero123", displayName: "Juan Pérez" },
    cocina: { username: "cocina", password: "cocina123", displayName: "Chef María" },
    caja: { username: "caja", password: "caja123", displayName: "Ana García" },
  }

  const roleInfo = {
    admin: { name: "Administrador", icon: Shield, color: "text-red-600" },
    mesero: { name: "Mesero", icon: User, color: "text-blue-600" },
    cocina: { name: "Cocina", icon: ChefHat, color: "text-green-600" },
    caja: { name: "Caja", icon: Calculator, color: "text-orange-600" },
  }

  const handleLogin = () => {
    const roleCredentials = credentials[selectedRole]

    if (username === roleCredentials.username && password === roleCredentials.password) {
      setError("")
      onLogin(true, roleCredentials.displayName)
    } else {
      setError("Usuario o contraseña incorrectos")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  const Icon = roleInfo[selectedRole].icon

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-sm [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold flex items-center justify-center gap-2">
            <Icon className={`w-5 h-5 ${roleInfo[selectedRole].color}`} />
            {roleInfo[selectedRole].name}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Ingresa tus credenciales para acceder al sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ingresa tu contraseña"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="flex gap-2">
            {onBack && (
              <Button onClick={onBack} variant="outline" className="flex-1 flex items-center gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Regresar
              </Button>
            )}
            <Button onClick={handleLogin} className="flex-1">
              Iniciar Sesión
            </Button>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Credenciales Demo:</p>
              <p className="text-xs">
                Usuario: <span className="font-mono">{credentials[selectedRole].username}</span>
              </p>
              <p className="text-xs">
                Contraseña: <span className="font-mono">{credentials[selectedRole].password}</span>
              </p>
              <p className="text-xs mt-1">
                Nombre: <span className="font-medium">{credentials[selectedRole].displayName}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
