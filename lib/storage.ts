export interface Product {
  id: string
  name: string
  price: number
  category: "entrada" | "plato" | "bebida" | "postre"
  available: boolean
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  category: "entrada" | "plato" | "bebida" | "postre"
}

export interface Order {
  id: string
  tableNumber: number
  items: OrderItem[]
  status: "pending" | "in-kitchen" | "ready" | "paid"
  timestamp: string
  total: number
  // Separar por tipo de caja
  foodItems: OrderItem[] // entradas, platos, postres
  drinkItems: OrderItem[] // bebidas
  waiterName?: string
}

export interface Table {
  number: number
  status: "available" | "occupied" | "reserved"
  currentOrderId?: string
}

// Funciones para manejar localStorage
export const storage = {
  // Productos
  getProducts: (): Product[] => {
    if (typeof window === "undefined") return getDefaultProducts()
    const products = localStorage.getItem("restobar_products")
    return products ? JSON.parse(products) : getDefaultProducts()
  },

  saveProducts: (products: Product[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("restobar_products", JSON.stringify(products))
  },

  // Agregar nuevo producto
  addProduct: (product: Product) => {
    if (typeof window === "undefined") return
    const products = storage.getProducts()
    products.push(product)
    storage.saveProducts(products)
  },

  // Actualizar producto
  updateProduct: (productId: string, updates: Partial<Product>) => {
    if (typeof window === "undefined") return
    const products = storage.getProducts()
    const index = products.findIndex((p) => p.id === productId)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates }
      storage.saveProducts(products)
    }
  },

  // Eliminar producto
  deleteProduct: (productId: string) => {
    if (typeof window === "undefined") return
    const products = storage.getProducts()
    const filteredProducts = products.filter((p) => p.id !== productId)
    storage.saveProducts(filteredProducts)
  },

  toggleProductAvailability: (productId: string) => {
    if (typeof window === "undefined") return
    const products = storage.getProducts()
    const index = products.findIndex((p) => p.id === productId)
    if (index !== -1) {
      products[index].available = !products[index].available
      storage.saveProducts(products)
    }
  },

  // Mesas
  getTables: (): Table[] => {
    if (typeof window === "undefined") return getDefaultTables()
    const tables = localStorage.getItem("restobar_tables")
    return tables ? JSON.parse(tables) : getDefaultTables()
  },

  saveTables: (tables: Table[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("restobar_tables", JSON.stringify(tables))
  },

  // Pedidos
  getOrders: (): Order[] => {
    if (typeof window === "undefined") return []
    const orders = localStorage.getItem("restobar_orders")
    return orders ? JSON.parse(orders) : []
  },

  saveOrders: (orders: Order[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("restobar_orders", JSON.stringify(orders))
  },

  // Agregar nuevo pedido
  addOrder: (order: Order) => {
    if (typeof window === "undefined") return
    const orders = storage.getOrders()
    orders.push(order)
    storage.saveOrders(orders)
  },

  // Actualizar pedido
  updateOrder: (orderId: string, updates: Partial<Order>) => {
    if (typeof window === "undefined") return
    const orders = storage.getOrders()
    const index = orders.findIndex((o) => o.id === orderId)
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates }
      storage.saveOrders(orders)
    }
  },

  // Obtener pedidos por mesa
  getOrdersByTable: (tableNumber: number): Order[] => {
    if (typeof window === "undefined") return []
    const orders = storage.getOrders()
    return orders.filter((o) => o.tableNumber === tableNumber)
  },
}

// Productos por defecto
function getDefaultProducts(): Product[] {
  return [
    // Entradas
    { id: "1", name: "Tequeños", price: 28.5, category: "entrada", available: true },
    { id: "2", name: "Empanadas", price: 20.0, category: "entrada", available: true },
    { id: "3", name: "Patacones", price: 23.0, category: "entrada", available: true },

    // Platos principales
    { id: "4", name: "Pabellón Criollo", price: 50.0, category: "plato", available: true },
    { id: "5", name: "Asado Negro", price: 60.0, category: "plato", available: true },
    { id: "6", name: "Pollo a la Plancha", price: 40.0, category: "plato", available: true },

    // Bebidas
    { id: "7", name: "Cerveza Polar", price: 12.0, category: "bebida", available: true },
    { id: "8", name: "Coca Cola", price: 8.5, category: "bebida", available: true },
    { id: "9", name: "Jugo Natural", price: 13.0, category: "bebida", available: true },

    // Postres
    { id: "10", name: "Tres Leches", price: 18.5, category: "postre", available: true },
    { id: "11", name: "Quesillo", price: 15.0, category: "postre", available: true },
  ]
}

// Mesas por defecto (20 mesas)
function getDefaultTables(): Table[] {
  return Array.from({ length: 20 }, (_, i) => ({
    number: i + 1,
    status: "available",
  }))
}

// Función para generar ID único
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Función para separar items por tipo de caja
export function separateItemsByType(items: OrderItem[]): { foodItems: OrderItem[]; drinkItems: OrderItem[] } {
  const foodItems = items.filter(
    (item) => item.category === "entrada" || item.category === "plato" || item.category === "postre",
  )
  const drinkItems = items.filter((item) => item.category === "bebida")

  return { foodItems, drinkItems }
}

// Funciones para calcular totales de caja general
export function getTotalsByType(): { foodTotal: number; drinkTotal: number; generalTotal: number } {
  if (typeof window === "undefined") {
    return { foodTotal: 0, drinkTotal: 0, generalTotal: 0 }
  }

  const orders = storage.getOrders().filter((order) => order.status === "paid")

  let foodTotal = 0
  let drinkTotal = 0

  orders.forEach((order) => {
    order.foodItems.forEach((item) => {
      foodTotal += item.price * item.quantity
    })
    order.drinkItems.forEach((item) => {
      drinkTotal += item.price * item.quantity
    })
  })

  return {
    foodTotal,
    drinkTotal,
    generalTotal: foodTotal + drinkTotal,
  }
}

export function formatPrice(price: number): string {
  return `S/ ${price.toFixed(2)}`
}
