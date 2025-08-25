"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ChefHat, AlertTriangle, CheckCircle, Timer, Filter, Package, PackageX } from "lucide-react"
import { storage, type Order, type Product } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

interface KitchenInterfaceProps {
  onOrderUpdate: () => void
}

export function KitchenInterface({ onOrderUpdate }: KitchenInterfaceProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "in-kitchen">("all")
  const [sortBy, setSortBy] = useState<"time" | "table">("time")
  const [currentTab, setCurrentTab] = useState<"orders" | "availability">("orders")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    loadOrders()
    loadProducts()
  }

  const loadOrders = () => {
    const allOrders = storage.getOrders()
    const kitchenOrders = allOrders.filter(
      (order) => (order.status === "pending" || order.status === "in-kitchen") && order.foodItems.length > 0,
    )
    setOrders(kitchenOrders)
  }

  const loadProducts = () => {
    setProducts(storage.getProducts())
  }

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    storage.updateOrder(orderId, { status: newStatus })
    loadOrders()
    onOrderUpdate()
  }

  const handleToggleProductAvailability = (product: Product) => {
    storage.toggleProductAvailability(product.id)
    loadProducts()

    toast({
      title: product.available ? "Producto marcado como no disponible" : "Producto marcado como disponible",
      description: `${product.name} ahora está ${product.available ? "no disponible" : "disponible"} para los meseros`,
    })
  }

  const getOrderPriority = (order: Order) => {
    const orderTime = new Date(order.timestamp).getTime()
    const now = new Date().getTime()
    const minutesWaiting = (now - orderTime) / (1000 * 60)

    if (minutesWaiting > 30) return "high"
    if (minutesWaiting > 15) return "medium"
    return "low"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4" />
      case "medium":
        return <Clock className="w-4 h-4" />
      case "low":
        return <Timer className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getWaitingTime = (timestamp: string) => {
    const orderTime = new Date(timestamp).getTime()
    const now = new Date().getTime()
    const minutes = Math.floor((now - orderTime) / (1000 * 60))

    if (minutes < 1) return "Recién llegado"
    if (minutes === 1) return "1 minuto"
    return `${minutes} minutos`
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true
    return order.status === filter
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "time") {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    } else {
      return a.tableNumber - b.tableNumber
    }
  })

  const pendingCount = orders.filter((o) => o.status === "pending").length
  const inKitchenCount = orders.filter((o) => o.status === "in-kitchen").length

  const productsByCategory = {
    entrada: products.filter((p) => p.category === "entrada"),
    plato: products.filter((p) => p.category === "plato"),
    postre: products.filter((p) => p.category === "postre"),
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "entrada":
        return "Entradas"
      case "plato":
        return "Platos Principales"
      case "postre":
        return "Postres"
      default:
        return category
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
            Cocina
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="destructive" className="flex items-center gap-1 text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span className="hidden xs:inline">{pendingCount} Nuevos</span>
              <span className="xs:hidden">{pendingCount}</span>
            </Badge>
            <Badge variant="default" className="flex items-center gap-1 text-xs">
              <Clock className="w-3 h-3" />
              <span className="hidden xs:inline">{inKitchenCount} En Preparación</span>
              <span className="xs:hidden">{inKitchenCount}</span>
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={(value: "orders" | "availability") => setCurrentTab(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros:</span>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value: "all" | "pending" | "in-kitchen") => setFilter(value)}>
                <SelectTrigger className="w-full sm:w-36 lg:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="in-kitchen">En preparación</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: "time" | "table") => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-28 lg:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Tiempo</SelectItem>
                  <SelectItem value="table">Mesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4">
            {sortedOrders.length === 0 ? (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <ChefHat className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">No hay pedidos en cocina</h3>
                  <p className="text-sm text-muted-foreground">Los nuevos pedidos aparecerán aquí automáticamente</p>
                </CardContent>
              </Card>
            ) : (
              sortedOrders.map((order) => {
                const priority = getOrderPriority(order)
                const waitingTime = getWaitingTime(order.timestamp)

                return (
                  <Card
                    key={order.id}
                    className={`${priority === "high" ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20" : ""}`}
                  >
                    <CardHeader className="pb-3 sm:pb-4">
                      <CardTitle className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl font-bold">Mesa {order.tableNumber}</span>
                          <Badge variant={getPriorityColor(priority)} className="flex items-center gap-1 text-xs">
                            {getPriorityIcon(priority)}
                            <span className="hidden xs:inline">
                              {priority === "high" ? "Urgente" : priority === "medium" ? "Medio" : "Normal"}
                            </span>
                            <span className="xs:hidden">
                              {priority === "high" ? "!" : priority === "medium" ? "~" : "✓"}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3" />
                            <span className="hidden sm:inline">{waitingTime}</span>
                            <span className="sm:hidden">{waitingTime.split(" ")[0]}</span>
                          </Badge>
                          <Badge variant={order.status === "pending" ? "destructive" : "default"} className="text-xs">
                            {order.status === "pending" ? "Nuevo" : "En Prep."}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="space-y-2 sm:space-y-3">
                        {order.foodItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                                {item.quantity}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-sm sm:text-base block truncate">
                                  {item.productName}
                                </span>
                                <div className="text-xs sm:text-sm text-muted-foreground">
                                  {item.category === "entrada"
                                    ? "Entrada"
                                    : item.category === "plato"
                                      ? "Plato Principal"
                                      : "Postre"}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                              S/ {item.price.toFixed(2)}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-muted-foreground">
                        <span>Pedido: {new Date(order.timestamp).toLocaleTimeString()}</span>
                        <span className="font-medium">
                          Total: S/{" "}
                          {order.foodItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {order.status === "pending" && (
                          <Button
                            onClick={() => handleUpdateOrderStatus(order.id, "in-kitchen")}
                            className="flex-1 text-sm"
                          >
                            <ChefHat className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Iniciar Preparación</span>
                            <span className="sm:hidden">Iniciar</span>
                          </Button>
                        )}
                        {order.status === "in-kitchen" && (
                          <Button
                            variant="outline"
                            onClick={() => handleUpdateOrderStatus(order.id, "ready")}
                            className="flex-1 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Marcar Listo</span>
                            <span className="sm:hidden">Listo</span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Control de Disponibilidad</h3>
            <p className="text-sm text-muted-foreground">
              Marca los productos que ya no están disponibles. Los meseros no podrán seleccionarlos.
            </p>
          </div>

          <Tabs defaultValue="entrada" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="entrada">Entradas</TabsTrigger>
              <TabsTrigger value="plato">Platos</TabsTrigger>
              <TabsTrigger value="postre">Postres</TabsTrigger>
            </TabsList>

            {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{getCategoryName(category)}</h4>
                  <Badge variant="outline">
                    {categoryProducts.filter((p) => p.available).length} de {categoryProducts.length} disponibles
                  </Badge>
                </div>

                <div className="grid gap-3">
                  {categoryProducts.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No hay productos en esta categoría</p>
                      </CardContent>
                    </Card>
                  ) : (
                    categoryProducts.map((product) => (
                      <Card key={product.id} className={!product.available ? "opacity-75 bg-muted/50" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {product.available ? (
                                <Package className="w-5 h-5 text-green-600" />
                              ) : (
                                <PackageX className="w-5 h-5 text-red-600" />
                              )}
                              <div>
                                <h5 className="font-medium">{product.name}</h5>
                                <p className="text-sm text-muted-foreground">S/ {product.price.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={product.available ? "secondary" : "destructive"} className="text-xs">
                                {product.available ? "Disponible" : "No Disponible"}
                              </Badge>
                              <Button
                                size="sm"
                                variant={product.available ? "destructive" : "default"}
                                onClick={() => handleToggleProductAvailability(product)}
                              >
                                {product.available ? "Marcar No Disponible" : "Marcar Disponible"}
                              </Button>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
