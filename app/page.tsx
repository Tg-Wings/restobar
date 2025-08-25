"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { storage, type Table, type Order, getTotalsByType, formatPrice } from "@/lib/storage"
import { Users, ChefHat, CreditCard, Coffee, Clock, DollarSign, Calculator, LogOut, Settings } from "lucide-react"
import { TableOrderModal } from "@/components/table-order-modal"
import { CashierModal } from "@/components/cashier-modal"
import { KitchenInterface } from "@/components/kitchen-interface"
import { LoadingScreen } from "@/components/loading-screen"
import { LoginModal } from "@/components/login-modal"
import { useRouter } from "next/navigation"

type UserRole = "admin" | "mesero" | "cocina" | "caja"

export default function RestaurantSystem() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [userName, setUserName] = useState<string>("")
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState<UserRole | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const [tables, setTables] = useState<Table[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [currentView, setCurrentView] = useState<
    "tables" | "kitchen" | "cashier-food" | "cashier-drinks" | "cashier-general"
  >("tables")
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false)
  const [isGeneralPaymentModalOpen, setIsGeneralPaymentModalOpen] = useState(false)
  const [cashierType, setCashierType] = useState<"food" | "drinks">("food")

  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [isLoggedIn])

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRoleForLogin(role)
    setShowRoleSelection(false)
    setShowLoginModal(true)
  }

  const handleBackToRoleSelection = () => {
    setShowLoginModal(false)
    setSelectedRoleForLogin(null)
    setShowRoleSelection(true)
  }

  const handleLogin = (success: boolean, username?: string) => {
    if (success && selectedRoleForLogin) {
      setUserRole(selectedRoleForLogin)
      setUserName(username || "")
      setIsLoggedIn(true)
      setShowLoginModal(false)

      if (selectedRoleForLogin === "mesero") {
        setCurrentView("tables")
      } else if (selectedRoleForLogin === "cocina") {
        setCurrentView("kitchen")
      } else if (selectedRoleForLogin === "caja") {
        setCurrentView("cashier-general")
      } else {
        setCurrentView("tables")
      }
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole(null)
    setSelectedRoleForLogin(null)
    setUserName("")
    setCurrentView("tables")
    setShowRoleSelection(true)
  }

  const hasViewPermission = (view: string): boolean => {
    if (userRole === "admin") return true

    switch (userRole) {
      case "mesero":
        return view === "tables"
      case "cocina":
        return view === "kitchen"
      case "caja":
        return ["cashier-food", "cashier-drinks", "cashier-general"].includes(view)
      default:
        return false
    }
  }

  const loadData = () => {
    setTables(storage.getTables())
    setOrders(storage.getOrders())
  }

  const getTableStatus = (tableNumber: number) => {
    const tableOrders = orders.filter((o) => o.tableNumber === tableNumber && o.status !== "paid")
    if (tableOrders.length > 0) return "occupied"
    return "available"
  }

  const getTableDetails = (tableNumber: number) => {
    const tableOrders = orders.filter((o) => o.tableNumber === tableNumber && o.status !== "paid")
    const readyOrders = tableOrders.filter((o) => o.status === "ready")
    const preparingOrders = tableOrders.filter((o) => o.status === "preparing" || o.status === "in-kitchen")
    const pendingOrders = tableOrders.filter((o) => o.status === "pending")

    return {
      totalOrders: tableOrders.length,
      readyOrders: readyOrders.length,
      preparingOrders: preparingOrders.length,
      pendingOrders: pendingOrders.length,
      hasUnpaidOrders: tableOrders.length > 0,
      needsAttention: readyOrders.length > 0,
    }
  }

  const handleTakeOrder = (tableNumber: number) => {
    setSelectedTable(tableNumber)
    setIsOrderModalOpen(true)
  }

  const handleOrderCreated = () => {
    loadData()
  }

  const handleStartPayment = (order: Order, type: "food" | "drinks") => {
    setSelectedOrder(order)
    setCashierType(type)
    setIsCashierModalOpen(true)
  }

  const handleStartGeneralPayment = (order: Order) => {
    setSelectedOrder(order)
    setIsGeneralPaymentModalOpen(true)
  }

  const handlePaymentComplete = () => {
    loadData()
  }

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    storage.updateOrder(orderId, { status: newStatus })
    loadData()
  }

  const readyOrders = orders.filter((o) => o.status === "ready")
  const ordersWithBothTypes = readyOrders.filter((order) => order.foodItems.length > 0 && order.drinkItems.length > 0)

  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.timestamp).toDateString()
    const today = new Date().toDateString()
    return orderDate === today && order.status === "paid"
  })

  const todayFoodTotal = todayOrders.reduce(
    (sum, order) => sum + order.foodItems.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
    0,
  )

  const todayDrinksTotal = todayOrders.reduce(
    (sum, order) => sum + order.drinkItems.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
    0,
  )

  const { foodTotal, drinkTotal, generalTotal } = getTotalsByType()

  const handleLoadingComplete = () => {
    setShowLoadingScreen(false)
    setShowRoleSelection(true)
  }

  if (showLoadingScreen) {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  if (showRoleSelection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Sistema Restobar</CardTitle>
            <p className="text-muted-foreground">Selecciona tu rol para continuar</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" size="lg" onClick={() => handleRoleSelection("admin")}>
              <Users className="w-5 h-5 mr-3" />
              Administrador
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              size="lg"
              variant="outline"
              onClick={() => handleRoleSelection("mesero")}
            >
              <Users className="w-5 h-5 mr-3" />
              Mesero
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              size="lg"
              variant="outline"
              onClick={() => handleRoleSelection("cocina")}
            >
              <ChefHat className="w-5 h-5 mr-3" />
              Cocina
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              size="lg"
              variant="outline"
              onClick={() => handleRoleSelection("caja")}
            >
              <Calculator className="w-5 h-5 mr-3" />
              Caja
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showLoginModal && selectedRoleForLogin) {
    return (
      <LoginModal
        isOpen={true}
        onLogin={handleLogin}
        selectedRole={selectedRoleForLogin}
        onBack={handleBackToRoleSelection}
      />
    )
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header - Hidden on mobile, visible on desktop */}
      <header className="bg-primary text-primary-foreground p-3 sm:p-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold">Sistema Restobar</h1>
            <Badge variant="secondary" className="text-xs">
              {userRole === "admin"
                ? "Administrador"
                : userRole === "mesero"
                  ? "Mesero"
                  : userRole === "cocina"
                    ? "Cocina"
                    : "Caja"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
              {hasViewPermission("tables") && (
                <Button
                  variant={currentView === "tables" ? "secondary" : "ghost"}
                  onClick={() => setCurrentView("tables")}
                  className={`text-primary-foreground hover:text-primary-foreground hover:bg-blue-600/20 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 ${
                    currentView === "tables" ? "bg-blue-600/30 text-white" : ""
                  }`}
                  size="sm"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Mesas
                </Button>
              )}
              {hasViewPermission("kitchen") && (
                <Button
                  variant={currentView === "kitchen" ? "secondary" : "ghost"}
                  onClick={() => setCurrentView("kitchen")}
                  className={`text-primary-foreground hover:text-primary-foreground hover:bg-orange-600/20 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 ${
                    currentView === "kitchen" ? "bg-orange-600/30 text-white" : ""
                  }`}
                  size="sm"
                >
                  <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Cocina
                </Button>
              )}
              {hasViewPermission("cashier-food") && (
                <Button
                  variant={currentView === "cashier-food" ? "secondary" : "ghost"}
                  onClick={() => setCurrentView("cashier-food")}
                  className={`text-primary-foreground hover:text-primary-foreground hover:bg-green-600/20 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 ${
                    currentView === "cashier-food" ? "bg-green-600/30 text-white" : ""
                  }`}
                  size="sm"
                >
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Caja Comida
                </Button>
              )}
              {hasViewPermission("cashier-drinks") && (
                <Button
                  variant={currentView === "cashier-drinks" ? "secondary" : "ghost"}
                  onClick={() => setCurrentView("cashier-drinks")}
                  className={`text-primary-foreground hover:text-primary-foreground hover:bg-cyan-600/20 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 ${
                    currentView === "cashier-drinks" ? "bg-cyan-600/30 text-white" : ""
                  }`}
                  size="sm"
                >
                  <Coffee className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Caja Bebidas
                </Button>
              )}
              {hasViewPermission("cashier-general") && (
                <Button
                  variant={currentView === "cashier-general" ? "secondary" : "ghost"}
                  onClick={() => setCurrentView("cashier-general")}
                  className={`text-primary-foreground hover:text-primary-foreground hover:bg-purple-600/20 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 ${
                    currentView === "cashier-general" ? "bg-purple-600/30 text-white" : ""
                  }`}
                  size="sm"
                >
                  <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Caja General
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-primary-foreground hover:text-primary-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <header className="bg-primary text-primary-foreground p-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Sistema Restobar</h1>
            <Badge variant="secondary" className="text-xs">
              {userRole === "admin"
                ? "Admin"
                : userRole === "mesero"
                  ? "Mesero"
                  : userRole === "cocina"
                    ? "Cocina"
                    : "Caja"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-primary-foreground hover:text-primary-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Vista de Mesas */}
        {currentView === "tables" && hasViewPermission("tables") && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Gestión de Mesas</h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
              {tables.map((table) => {
                const status = getTableStatus(table.number)
                const tableDetails = getTableDetails(table.number)

                return (
                  <Card key={table.number} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-2 sm:p-3 md:p-4 text-center">
                      <div className="text-base sm:text-lg md:text-2xl font-bold mb-1 sm:mb-2">Mesa {table.number}</div>
                      <Badge
                        variant={
                          status === "available" ? "secondary" : tableDetails.needsAttention ? "destructive" : "default"
                        }
                        className="w-full mb-1 sm:mb-2 text-xs"
                      >
                        {status === "available" ? "Disponible" : tableDetails.needsAttention ? "Listo" : "Ocupada"}
                      </Badge>

                      {status === "occupied" && (
                        <div className="text-xs text-muted-foreground mb-1 sm:mb-2 space-y-1">
                          <div>
                            {tableDetails.totalOrders} pedido{tableDetails.totalOrders > 1 ? "s" : ""}
                          </div>
                          {tableDetails.readyOrders > 0 && (
                            <div className="text-green-600 font-medium">
                              {tableDetails.readyOrders} listo{tableDetails.readyOrders > 1 ? "s" : ""}
                            </div>
                          )}
                          {tableDetails.preparingOrders > 0 && (
                            <div className="text-orange-600">{tableDetails.preparingOrders} prep.</div>
                          )}
                          {tableDetails.pendingOrders > 0 && (
                            <div className="text-red-600">{tableDetails.pendingOrders} pend.</div>
                          )}
                        </div>
                      )}

                      <Button
                        className={`w-full text-xs sm:text-sm ${
                          status === "available"
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                            : tableDetails.needsAttention
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                        size="sm"
                        onClick={() => handleTakeOrder(table.number)}
                      >
                        {status === "available" ? (
                          <>
                            <span className="hidden sm:inline">Tomar Pedido</span>
                            <span className="sm:hidden">Tomar</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">Agregar Pedido</span>
                            <span className="sm:hidden">Agregar</span>
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Vista de Cocina */}
        {currentView === "kitchen" && hasViewPermission("kitchen") && <KitchenInterface onOrderUpdate={loadData} />}

        {/* Vista de Caja Comida */}
        {currentView === "cashier-food" && hasViewPermission("cashier-food") && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">Caja - Comida (Historial)</h2>
              <Card className="px-3 sm:px-4 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Hoy: {formatPrice(todayFoodTotal)}</span>
                </div>
              </Card>
            </div>
            <div className="grid gap-3 sm:gap-4">
              {orders
                .filter((order) => order.foodItems.length > 0)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((order) => (
                  <Card key={order.id} className={order.status === "paid" ? "opacity-75 bg-muted/50" : ""}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-base sm:text-lg">Mesa {order.tableNumber}</span>
                          {order.waiterName && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span>Atendido por: {order.waiterName}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              order.status === "paid" ? "secondary" : order.status === "ready" ? "default" : "outline"
                            }
                            className="text-xs"
                          >
                            {order.status === "paid"
                              ? "Pagado"
                              : order.status === "ready"
                                ? "Listo"
                                : order.status === "preparing"
                                  ? "Preparando"
                                  : "Pendiente"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(order.timestamp).toLocaleTimeString()}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.foodItems.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-2 border-t">
                        <div className="flex justify-between font-bold">
                          <span>Total Comida:</span>
                          <span>
                            {formatPrice(order.foodItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                          </span>
                        </div>
                      </div>
                      {order.status !== "paid" && (
                        <div className="mt-4 p-3 bg-muted rounded-lg text-center">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Para procesar el pago, usar el botón de "Pago General"
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Vista de Caja Bebidas */}
        {currentView === "cashier-drinks" && hasViewPermission("cashier-drinks") && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">Caja - Bebidas (Historial)</h2>
              <Card className="px-3 sm:px-4 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Hoy: {formatPrice(todayDrinksTotal)}</span>
                </div>
              </Card>
            </div>
            <div className="grid gap-3 sm:gap-4">
              {orders
                .filter((order) => order.drinkItems.length > 0)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((order) => (
                  <Card key={order.id} className={order.status === "paid" ? "opacity-75 bg-muted/50" : ""}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-base sm:text-lg">Mesa {order.tableNumber}</span>
                          {order.waiterName && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span>Atendido por: {order.waiterName}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge
                            variant={
                              order.status === "paid" ? "secondary" : order.status === "ready" ? "default" : "outline"
                            }
                            className="text-xs"
                          >
                            {order.status === "paid"
                              ? "Pagado"
                              : order.status === "ready"
                                ? "Listo"
                                : order.status === "preparing"
                                  ? "Preparando"
                                  : "Pendiente"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(order.timestamp).toLocaleTimeString()}
                          </Badge>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {order.drinkItems.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-2 border-t">
                        <div className="flex justify-between font-bold">
                          <span>Total Bebidas:</span>
                          <span>
                            {formatPrice(order.drinkItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                          </span>
                        </div>
                      </div>
                      {order.status !== "paid" && (
                        <div className="mt-4 p-3 bg-muted rounded-lg text-center">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Para procesar el pago, usar el botón de "Pago General"
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Vista de Caja General */}
        {currentView === "cashier-general" && hasViewPermission("cashier-general") && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Caja General - Resumen Total</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                    Caja Comida
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{formatPrice(foodTotal)}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Entradas, platos y postres</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
                    Caja Bebidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{formatPrice(drinkTotal)}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Bebidas y refrescos</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
                    Total General
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{formatPrice(generalTotal)}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">Suma de ambas cajas</p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Pedidos Listos para Pago</h3>
              <div className="grid gap-3 sm:gap-4">
                {readyOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-base sm:text-lg">Mesa {order.tableNumber}</span>
                          {order.waiterName && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span>Atendido por: {order.waiterName}</span>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(order.timestamp).toLocaleTimeString()}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {order.foodItems.length > 0 && (
                          <div>
                            <h4 className="font-medium text-orange-600 mb-2 text-sm sm:text-base">Comida</h4>
                            <div className="space-y-1">
                              {order.foodItems.map((item, index) => (
                                <div key={index} className="flex justify-between text-xs sm:text-sm">
                                  <span>
                                    {item.quantity}x {item.productName}
                                  </span>
                                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 pt-2 border-t text-xs sm:text-sm font-medium">
                              Subtotal:{" "}
                              {formatPrice(order.foodItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                            </div>
                          </div>
                        )}

                        {order.drinkItems.length > 0 && (
                          <div>
                            <h4 className="font-medium text-blue-600 mb-2 text-sm sm:text-base">Bebidas</h4>
                            <div className="space-y-1">
                              {order.drinkItems.map((item, index) => (
                                <div key={index} className="flex justify-between text-xs sm:text-sm">
                                  <span>
                                    {item.quantity}x {item.productName}
                                  </span>
                                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 pt-2 border-t text-xs sm:text-sm font-medium">
                              Subtotal:{" "}
                              {formatPrice(order.drinkItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-base sm:text-lg font-bold">Total General:</span>
                          <span className="text-base sm:text-lg font-bold text-primary">
                            {formatPrice(
                              order.foodItems.reduce((sum, item) => sum + item.price * item.quantity, 0) +
                                order.drinkItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
                            )}
                          </span>
                        </div>
                        <Button className="w-full text-sm" onClick={() => handleStartGeneralPayment(order)}>
                          <Calculator className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Pago General</span>
                          <span className="sm:hidden">Pago</span>
                          <span className="ml-1">({readyOrders.length})</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Ventas de Hoy - Comida</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl font-semibold text-green-600">{formatPrice(todayFoodTotal)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Ventas de Hoy - Bebidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg sm:text-xl font-semibold text-blue-600">{formatPrice(todayDrinksTotal)}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-4 sm:mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Total del Día</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {formatPrice(todayFoodTotal + todayDrinksTotal)}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">Ingresos totales del día actual</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-primary border-t border-primary-foreground/20 md:hidden z-40">
        <div className="flex items-center justify-around py-2 px-1">
          {hasViewPermission("tables") && (
            <button
              onClick={() => setCurrentView("tables")}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                currentView === "tables"
                  ? "bg-blue-600/30 text-white"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-blue-600/20"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs font-medium truncate">Mesas</span>
            </button>
          )}
          {hasViewPermission("kitchen") && (
            <button
              onClick={() => setCurrentView("kitchen")}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                currentView === "kitchen"
                  ? "bg-orange-600/30 text-white"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-orange-600/20"
              }`}
            >
              <ChefHat className="w-5 h-5" />
              <span className="text-xs font-medium truncate">Cocina</span>
            </button>
          )}
          {hasViewPermission("cashier-food") && (
            <button
              onClick={() => setCurrentView("cashier-food")}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                currentView === "cashier-food"
                  ? "bg-green-600/30 text-white"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-green-600/20"
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs font-medium truncate">Comida</span>
            </button>
          )}
          {hasViewPermission("cashier-drinks") && (
            <button
              onClick={() => setCurrentView("cashier-drinks")}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                currentView === "cashier-drinks"
                  ? "bg-cyan-600/30 text-white"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-cyan-600/20"
              }`}
            >
              <Coffee className="w-5 h-5" />
              <span className="text-xs font-medium truncate">Bebidas</span>
            </button>
          )}
          {hasViewPermission("cashier-general") && (
            <button
              onClick={() => setCurrentView("cashier-general")}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                currentView === "cashier-general"
                  ? "bg-purple-600/30 text-white"
                  : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-purple-600/20"
              }`}
            >
              <Calculator className="w-5 h-5" />
              <span className="text-xs font-medium truncate">General</span>
            </button>
          )}
        </div>
      </nav>

      {readyOrders.length > 0 && currentView !== "cashier-general" && hasViewPermission("cashier-general") && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
          <Button
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base px-4 sm:px-6"
            onClick={() => setCurrentView("cashier-general")}
          >
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Pago General</span>
            <span className="sm:hidden">Pago</span>
            <span className="ml-1">({readyOrders.length})</span>
          </Button>
        </div>
      )}

      {userRole === "admin" && (
        <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
          <Button
            size="lg"
            onClick={() => router.push("/admin/menu")}
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Settings className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Gestionar Menú</span>
            <span className="sm:hidden">Menú</span>
          </Button>
        </div>
      )}

      <TableOrderModal
        tableNumber={selectedTable}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderCreated={handleOrderCreated}
        waiterName={userName}
      />

      <CashierModal
        order={selectedOrder}
        isOpen={isCashierModalOpen}
        onClose={() => setIsCashierModalOpen(false)}
        onPaymentComplete={handlePaymentComplete}
        cashierType={cashierType}
      />

      <CashierModal
        order={selectedOrder}
        isOpen={isGeneralPaymentModalOpen}
        onClose={() => setIsGeneralPaymentModalOpen(false)}
        onPaymentComplete={handlePaymentComplete}
        cashierType="general"
      />
    </div>
  )
}
