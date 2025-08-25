"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Save, X, ChefHat, AlertCircle, ArrowLeft } from "lucide-react"
import { storage, type Product, generateId } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ProductForm {
  name: string
  price: string
  category: "entrada" | "plato" | "bebida" | "postre"
}

export default function AdminMenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    price: "",
    category: "entrada",
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = () => {
    setProducts(storage.getProducts())
  }

  const resetForm = () => {
    setProductForm({
      name: "",
      price: "",
      category: "entrada",
    })
    setEditingProduct(null)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
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
    scrollToTop()
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/")} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6" />
              <h1 className="text-xl sm:text-2xl font-bold">Gestión de Menú - Solo Administrador</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">{editingProduct ? "Editar Producto" : "Agregar Producto"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName" className="text-sm font-medium">
                    Nombre del Producto
                  </Label>
                  <Input
                    id="productName"
                    value={productForm.name}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Pabellón Criollo"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="productPrice" className="text-sm font-medium">
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
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="productCategory" className="text-sm font-medium">
                    Categoría
                  </Label>
                  <Select
                    value={productForm.category}
                    onValueChange={(value: "entrada" | "plato" | "bebida" | "postre") =>
                      setProductForm((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
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

                <div className="flex gap-2 pt-4">
                  {editingProduct ? (
                    <>
                      <Button onClick={handleUpdateProduct} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Actualizar
                      </Button>
                      <Button variant="outline" onClick={resetForm}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleAddProduct} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Producto
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="entrada" onValueChange={scrollToTop}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
                <TabsTrigger value="entrada">Entradas</TabsTrigger>
                <TabsTrigger value="plato">Platos</TabsTrigger>
                <TabsTrigger value="bebida">Bebidas</TabsTrigger>
                <TabsTrigger value="postre">Postres</TabsTrigger>
              </TabsList>

              {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <TabsContent key={category} value={category}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">{getCategoryName(category)}</h2>
                    <Badge variant="outline" className="text-sm">
                      {categoryProducts.length} producto{categoryProducts.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {categoryProducts.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No hay productos en esta categoría</p>
                        </CardContent>
                      </Card>
                    ) : (
                      categoryProducts.map((product) => (
                        <Card key={product.id} className={!product.available ? "opacity-60" : ""}>
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">{product.name}</h3>
                                  <Badge variant={product.available ? "secondary" : "destructive"} className="w-fit">
                                    {product.available ? "Disponible" : "No Disponible"}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground font-medium">S/ {product.price.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant={product.available ? "outline" : "default"}
                                  onClick={() => handleToggleAvailability(product)}
                                >
                                  {product.available ? "Deshabilitar" : "Habilitar"}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product)}>
                                  <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  )
}
