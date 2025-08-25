"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calculator, Smartphone, Percent, User } from "lucide-react"
import { storage, type Order, formatPrice } from "@/lib/storage"

interface CashierModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: () => void
  cashierType: "food" | "drinks" | "general"
}

export function CashierModal({ order, isOpen, onClose, onPaymentComplete, cashierType }: CashierModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "yape">("cash")
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [tipPercent, setTipPercent] = useState<number>(0)
  const [receivedAmount, setReceivedAmount] = useState<string>("")

  if (!order) return null

  const foodTotal = order.foodItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const drinkTotal = order.drinkItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const subtotal = foodTotal + drinkTotal

  const discountAmount = (subtotal * discountPercent) / 100
  const subtotalAfterDiscount = subtotal - discountAmount
  const tipAmount = (subtotalAfterDiscount * tipPercent) / 100
  const finalTotal = subtotalAfterDiscount + tipAmount

  const handlePayment = () => {
    if (paymentMethod === "cash" && Number.parseFloat(receivedAmount) < finalTotal) {
      alert("El monto recibido es insuficiente")
      return
    }

    storage.updateOrder(order.id, { status: "paid" })

    onPaymentComplete()
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setPaymentMethod("cash")
    setDiscountPercent(0)
    setTipPercent(0)
    setReceivedAmount("")
  }

  const change = paymentMethod === "cash" ? Math.max(0, Number.parseFloat(receivedAmount || "0") - finalTotal) : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {cashierType === "general"
              ? `Pago General - Mesa ${order.tableNumber}`
              : `Cobrar Mesa ${order.tableNumber} - ${cashierType === "food" ? "Comida" : "Bebidas"}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-slate-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4" />
                <span className="font-medium">Atendido por:</span>
                <span className="text-slate-800 font-semibold">{order.waiterName || "No especificado"}</span>
              </div>
            </CardContent>
          </Card>

          {foodTotal > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-orange-600">Comida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.foodItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Subtotal Comida:</span>
                  <span>{formatPrice(foodTotal)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {drinkTotal > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-600">Bebidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.drinkItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Subtotal Bebidas:</span>
                  <span>{formatPrice(drinkTotal)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between font-medium">
                <span>Subtotal Total:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Descuento (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) =>
                      setDiscountPercent(Math.max(0, Math.min(100, Number.parseFloat(e.target.value) || 0)))
                    }
                    className="w-20"
                  />
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  {discountAmount > 0 && <span className="text-sm text-green-600">-{formatPrice(discountAmount)}</span>}
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Después de descuento:</span>
                  <span>{formatPrice(subtotalAfterDiscount)}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tip">Propina (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="tip"
                    type="number"
                    min="0"
                    max="50"
                    value={tipPercent}
                    onChange={(e) => setTipPercent(Math.max(0, Math.min(50, Number.parseFloat(e.target.value) || 0)))}
                    className="w-20"
                  />
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  {tipAmount > 0 && <span className="text-sm text-blue-600">+{formatPrice(tipAmount)}</span>}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total a Pagar:</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(value: "cash" | "yape") => setPaymentMethod(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2">
                    <span className="text-sm font-medium">S/</span>
                    Efectivo
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yape" id="yape" />
                  <Label htmlFor="yape" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Yape
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "cash" && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="received">Monto Recibido</Label>
                  <Input
                    id="received"
                    type="number"
                    step="0.01"
                    min="0"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  {receivedAmount && Number.parseFloat(receivedAmount) >= finalTotal && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Cambio: </span>
                      <span className="font-medium text-green-600">{formatPrice(change)}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={paymentMethod === "cash" && (!receivedAmount || Number.parseFloat(receivedAmount) < finalTotal)}
            >
              Procesar Pago
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
