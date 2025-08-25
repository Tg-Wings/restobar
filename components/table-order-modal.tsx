"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Minus, ShoppingCart, Clock, AlertCircle, Filter, PackageX } from "lucide-react"
import { storage, type Product, type OrderItem, type Order, generateId, separateItemsByType } from "@/lib/storage"

interface TableOrderModalProps {
  tableNumber: number | null
  isOpen: boolean
  onClose: () => void
  onOrderCreated: () => void
  waiterName?: string
}

export function TableOrderModal({ tableNumber, isOpen, onClose, onOrderCreated, waiterName }: TableOrderModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [existingOrders, setExistingOrders] = useState<Order[]>([])
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("available")

  useEffect(() => {
    if (isOpen && tableNumber) {
      setProducts(storage.getProducts())
      setOrderItems([])
      const tableOrders = storage.getOrdersByTable(tableNumber).filter((order) => order.status !== "paid")
      setExistingOrders(tableOrders)
    }
  }, [isOpen, tableNumber])

  const addToOrder = (product: Product) => {
    const existingItem = orderItems.find((item) => item.productId === product.id)

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price,
          category: product.category,
        },
      ])
    }
  }

  const removeFromOrder = (productId: string) => {
    const existingItem = orderItems.find((item) => item.productId === productId)

    if (existingItem && existingItem.quantity > 1) {
      setOrderItems(
        orderItems.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item)),
      )
    } else {
      setOrderItems(orderItems.filter((item) => item.productId !== productId))
    }
  }

  const getItemQuantity = (productId: string) => {
    const item = orderItems.find((item) => item.productId === productId)
    return item ? item.quantity : 0
  }

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCreateOrder = () => {
    if (orderItems.length === 0 || !tableNumber) return

    const { foodItems, drinkItems } = separateItemsByType(orderItems)

    const newOrder: Order = {
      id: generateId(),
      tableNumber,
      items: orderItems,
      status: "pending",
      timestamp: new Date().toISOString(),
      total: getTotalAmount(),
      foodItems,
      drinkItems,
      waiterName: waiterName || "Sin asignar",
    }

    storage.addOrder(newOrder)
    onOrderCreated()
    onClose()
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "in-kitchen":
        return "En Cocina"
      case "ready":
        return "Listo"
      default:
        return status
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "destructive"
      case "in-kitchen":
        return "default"
      case "ready":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getFilteredProducts = (category: "entrada" | "plato" | "bebida" | "postre") => {
    const categoryProducts = products.filter((p) => p.category === category)

    switch (availabilityFilter) {
      case "available":
        return categoryProducts.filter((p) => p.available)
      case "unavailable":
        return categoryProducts.filter((p) => !p.available)
      default:
        return categoryProducts
    }
  }

  const productsByCategory = {
    entrada: getFilteredProducts("entrada"),
    plato: getFilteredProducts("plato"),
    bebida: getFilteredProducts("bebida"),
    postre: getFilteredProducts("postre"),
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Tomar Pedido - Mesa {tableNumber}
            {existingOrders.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {existingOrders.length} pedido{existingOrders.length > 1 ? "s" : ""} activo
                {existingOrders.length > 1 ? "s" : ""}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {existingOrders.length > 0 && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pedidos Actuales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-60">
                    <div className="space-y-3">
                      {existingOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={getStatusVariant(order.status)} className="text-xs">
                              {getStatusText(order.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {order.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="text-xs flex justify-between">
                                <span>
                                  {item.quantity}x {item.productName}
                                </span>
                                <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="text-xs text-muted-foreground">+{order.items.length - 3} más...</div>
                            )}
                          </div>
                          <div className="mt-2 pt-2 border-t">
                            <div className="text-xs font-medium flex justify-between">
                              <span>Total:</span>
                              <span>S/ {order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de Productos */}
          <div className={existingOrders.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Mostrar:</span>
              <Select
                value={availabilityFilter}
                onValueChange={(value: "all" | "available" | "unavailable") => setAvailabilityFilter(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Solo Disponibles</SelectItem>
                  <SelectItem value="unavailable">No Disponibles</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="entrada" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="entrada">Entradas</TabsTrigger>
                <TabsTrigger value="plato">Platos</TabsTrigger>
                <TabsTrigger value="bebida">Bebidas</TabsTrigger>
                <TabsTrigger value="postre">Postres</TabsTrigger>
              </TabsList>

              {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className="grid gap-3">
                    {categoryProducts.length === 0 ? (
                      <Card>
                        <CardContent className="p-6 text-center">
                          {availabilityFilter === "available" ? (
                            <>
                              <PackageX className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-muted-foreground">No hay productos disponibles en esta categoría</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Cambia el filtro para ver productos no disponibles
                              </p>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-muted-foreground">No hay productos en esta categoría</p>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      categoryProducts.map((product) => (
                        <Card
                          key={product.id}
                          className={`hover:shadow-md transition-shadow ${!product.available ? "opacity-60 bg-muted/50" : ""}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{product.name}</h3>
                                  {!product.available && (
                                    <Badge variant="destructive" className="text-xs">
                                      No Disponible
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">S/ {product.price.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {product.available ? (
                                  <>
                                    {getItemQuantity(product.id) > 0 && (
                                      <>
                                        <Button size="sm" variant="outline" onClick={() => removeFromOrder(product.id)}>
                                          <Minus className="w-4 h-4" />
                                        </Button>
                                        <Badge variant="secondary" className="min-w-[2rem] text-center">
                                          {getItemQuantity(product.id)}
                                        </Badge>
                                      </>
                                    )}
                                    <Button size="sm" onClick={() => addToOrder(product)}>
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button size="sm" disabled variant="outline">
                                    <PackageX className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Nuevo Pedido
                </CardTitle>
                {waiterName && <p className="text-sm text-muted-foreground">Mozo: {waiterName}</p>}
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.length === 0 ? (
                  <div className="text-center py-6">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">Selecciona productos para agregar al pedido</p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-60">
                      <div className="space-y-3">
                        {orderItems.map((item) => (
                          <div key={item.productId} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-sm">{item.productName}</span>
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                {item.quantity}x S/ {item.price.toFixed(2)}
                              </span>
                              <span className="font-medium text-sm">S/ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <Separator />

                    <div className="space-y-2">
                      {(() => {
                        const { foodItems, drinkItems } = separateItemsByType(orderItems)
                        const foodTotal = foodItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
                        const drinkTotal = drinkItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

                        return (
                          <>
                            {foodItems.length > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Comida:</span>
                                <span>S/ {foodTotal.toFixed(2)}</span>
                              </div>
                            )}
                            {drinkItems.length > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Bebidas:</span>
                                <span>S/ {drinkTotal.toFixed(2)}</span>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>S/ {getTotalAmount().toFixed(2)}</span>
                      </div>
                    </div>

                    <Button onClick={handleCreateOrder} className="w-full" size="lg">
                      Enviar a Cocina
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
