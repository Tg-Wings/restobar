"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Edit, Trash2, Save, X, ChefHat, AlertCircle } from "lucide-react"
import { storage, type Product, generateId } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

interface AdminMenuManagerProps {
  isOpen: boolean
  onClose: () => void
}

interface ProductForm {
  name: string
  price: string
  category: "entrada" | "plato" | "bebida" | "postre"
}

export function AdminMenuManager({ isOpen, onClose }: AdminMenuManagerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    price: "",
    category: "entrada",
  })
  const tabsContentRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadProducts()
    }
  }, [isOpen])

  const loadProducts = () => {
    setProducts(storage.getProducts())
  }

  const resetForm = () => {
    setProductForm({
      name: "",
      price: "",
      category: "entrada",
    })
    setIsAddingProduct(false)
    setEditingProduct(null)
  }

  const scrollToTop = () => {
    if (tabsContentRef.current) {
      tabsContentRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleAddProduct = () => {
    if (!productForm.name.trim() || !productForm.price.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    const price = Number.parseFloat(productForm.price)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser un número válido mayor a 0",
        variant: "destructive",
      })
      return
    }

    const newProduct: Product = {
      id: generateId(),
      name: productForm.name.trim(),
      price: price,
      category: productForm.category,
      available: true,
    }

    storage.addProduct(newProduct)
    loadProducts()
    resetForm()

    toast({
      title: "Producto agregado",
      description: `${newProduct.name} ha sido agregado al menú`,
    })
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
    })
  }

  const handleUpdateProduct = () => {
    if (!editingProduct || !productForm.name.trim() || !productForm.price.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    const price = Number.parseFloat(productForm.price)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser un número válido mayor a 0",
        variant: "destructive",
      })
      return
    }

    storage.updateProduct(editingProduct.id, {
      name: productForm.name.trim(),
      price: price,
      category: productForm.category,
    })

    loadProducts()
    resetForm()

    toast({
      title: "Producto actualizado",
      description: `${productForm.name} ha sido actualizado`,
    })
  }

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      storage.deleteProduct(product.id)
      loadProducts()

      toast({
        title: "Producto eliminado",
        description: `${product.name} ha sido eliminado del menú`,
      })
    }
  }

  const handleToggleAvailability = (product: Product) => {
    storage.toggleProductAvailability(product.id)
    loadProducts()

    toast({
      title: product.available ? "Producto deshabilitado" : "Producto habilitado",
      description: `${product.name} ahora está ${product.available ? "no disponible" : "disponible"}`,
    })
  }

  const productsByCategory = {
    entrada: products.filter((p) => p.category === "entrada"),
    plato: products.filter((p) => p.category === "plato"),
    bebida: products.filter((p) => p.category === "bebida"),
    postre: products.filter((p) => p.category === "postre"),
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case "entrada":
        return "Entradas"
      case "plato":
        return "Platos Principales"
      case "bebida":
        return "Bebidas"
      case "postre":
        return "Postres"
      default:
        return category
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-[98vw] sm:w-[95vw] md:w-[90vw] lg:w-[85vw] xl:w-[80vw] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
            <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
            Gestión de Menú - Solo Administrador
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="xl:col-span-1">
              <Card className="h-fit sticky top-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg md:text-xl">
                    {editingProduct ? "Editar Producto" : "Agregar Producto"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-5">
                  <div>
                    <Label htmlFor="productName" className="text-sm sm:text-base font-medium">
                      Nombre del Producto
                    </Label>
                    <Input
                      id="productName"
                      value={productForm.name}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Pabellón Criollo"
                      className="text-sm sm:text-base mt-1 h-10 sm:h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="productPrice" className="text-sm sm:text-base font-medium">
                      Precio (S/)
                    </Label>
                    <Input
                      id="productPrice"
                      type="number"
                      step="0.50"
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      className="text-sm sm:text-base mt-1 h-10 sm:h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="productCategory" className="text-sm sm:text-base font-medium">
                      Categoría
                    </Label>
                    <Select
                      value={productForm.category}
                      onValueChange={(value: "entrada" | "plato" | "bebida" | "postre") =>
                        setProductForm((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger className="text-sm sm:text-base mt-1 h-10 sm:h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="plato">Plato Principal</SelectItem>
                        <SelectItem value="bebida">Bebida</SelectItem>
                        <SelectItem value="postre">Postre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2 sm:pt-4">
                    {editingProduct ? (
                      <>
                        <Button onClick={handleUpdateProduct} className="flex-1 text-sm sm:text-base h-10 sm:h-11">
                          <Save className="w-4 h-4 mr-2" />
                          Actualizar
                        </Button>
                        <Button variant="outline" onClick={resetForm} className="h-10 sm:h-11 px-3 bg-transparent">
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleAddProduct} className="w-full text-sm sm:text-base h-10 sm:h-11">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Producto
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-2">
              <Tabs defaultValue="entrada" onValueChange={scrollToTop}>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 text-xs sm:text-sm mb-4 h-auto">
                  <TabsTrigger value="entrada" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    Entradas
                  </TabsTrigger>
                  <TabsTrigger value="plato" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    Platos
                  </TabsTrigger>
                  <TabsTrigger value="bebida" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    Bebidas
                  </TabsTrigger>
                  <TabsTrigger value="postre" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    Postres
                  </TabsTrigger>
                </TabsList>

                {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                  <TabsContent key={category} value={category} className="mt-0">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">{getCategoryName(category)}</h3>
                      <Badge variant="outline" className="text-xs sm:text-sm px-2 py-1">
                        {categoryProducts.length} producto{categoryProducts.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {categoryProducts.length === 0 ? (
                        <Card>
                          <CardContent className="p-6 sm:p-8 text-center">
                            <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-sm sm:text-base text-muted-foreground">
                              No hay productos en esta categoría
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        categoryProducts.map((product) => (
                          <Card key={product.id} className={!product.available ? "opacity-60" : ""}>
                            <CardContent className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-base sm:text-lg truncate">{product.name}</h4>
                                    <Badge
                                      variant={product.available ? "secondary" : "destructive"}
                                      className="text-xs sm:text-sm w-fit px-2 py-1"
                                    >
                                      {product.available ? "Disponible" : "No Disponible"}
                                    </Badge>
                                  </div>
                                  <p className="text-sm sm:text-base text-muted-foreground font-medium">
                                    S/ {product.price.toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant={product.available ? "outline" : "default"}
                                    onClick={() => handleToggleAvailability(product)}
                                    className="text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9"
                                  >
                                    {product.available ? "Deshabilitar" : "Habilitar"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditProduct(product)}
                                    className="px-2 sm:px-3 h-8 sm:h-9"
                                  >
                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteProduct(product)}
                                    className="px-2 sm:px-3 h-8 sm:h-9"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
