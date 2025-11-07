"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Search, ChevronDown } from "lucide-react";
import { useShop } from "@/hooks/use-shop";
import { useToast } from "@/hooks/use-toast";
import { CreateProductDialog } from "@/components/shop/create-product-dialog";
import { EditProductDialog } from "@/components/shop/edit-product-dialog";
import { DeleteProductDialog } from "@/components/shop/delete-product-dialog";

export default function ShopManagementPage() {
  const { products, loading, deleteProduct } = useShop();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "electrical" | "airframe" | "mechanical" | "drone">("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const categories = [
    { value: "all", label: "All Products" },
    { value: "electrical", label: "Electrical & Power" },
    { value: "airframe", label: "Airframe Materials" },
    { value: "mechanical", label: "Mechanical & Control" },
    { value: "drone", label: "Drone Specific" },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      toast({
        title: "Product Deleted",
        description: `${selectedProduct.name} has been removed from the shop.`,
      });
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline">Shop Management</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Manage products, inventory, and orders</p>
        </div>
        <CreateProductDialog>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </CreateProductDialog>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold">{products.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold">{products.filter(p => p.status === 'in-stock').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl md:text-3xl font-bold text-yellow-600">{products.filter(p => p.status === 'low-stock').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div>
            <label className="text-xs md:text-sm font-medium mb-2 block">Search Products</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>

          {/* Category Filter - Mobile: Dropdown, Desktop: Buttons */}
          <div>
            <label className="text-xs md:text-sm font-medium mb-2 block">Category</label>
            
            {/* Mobile Dropdown */}
            <div className="md:hidden">
              <button
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className="w-full flex items-center justify-between px-3 py-2 border rounded-md text-sm bg-background hover:bg-muted"
              >
                <span>{categories.find(c => c.value === activeCategory)?.label}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showCategoryFilter ? 'rotate-180' : ''}`} />
              </button>
              {showCategoryFilter && (
                <div className="absolute top-full mt-1 w-[calc(100%-2rem)] bg-background border rounded-md shadow-lg z-50">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setActiveCategory(cat.value as any);
                        setShowCategoryFilter(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${
                        activeCategory === cat.value ? 'bg-accent text-accent-foreground' : ''
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat.value}
                  variant={activeCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.value as any)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-sm">Loading products...</div>
          ) : filteredProducts.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Product Name</th>
                      <th className="text-left py-2 px-2">Brand</th>
                      <th className="text-left py-2 px-2">Category</th>
                      <th className="text-left py-2 px-2">Price</th>
                      <th className="text-left py-2 px-2">Stock</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">{product.name}</td>
                        <td className="py-3 px-2 text-muted-foreground">{product.brand}</td>
                        <td className="py-3 px-2 text-muted-foreground capitalize">{product.category}</td>
                        <td className="py-3 px-2">₹{product.price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-2">{product.stock}</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            product.status === 'in-stock' ? 'bg-green-500/20 text-green-600' :
                            product.status === 'low-stock' ? 'bg-yellow-500/20 text-yellow-600' :
                            product.status === 'pre-order' ? 'bg-blue-500/20 text-blue-600' :
                            'bg-red-500/20 text-red-600'
                          }`}>
                            {product.status === 'in-stock' ? 'In Stock' :
                             product.status === 'low-stock' ? 'Low Stock' :
                             product.status === 'pre-order' ? 'Pre-Order' :
                             'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-2 space-x-2 flex">
                          <EditProductDialog product={product}>
                            <Button size="sm" variant="outline">
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </EditProductDialog>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="border">
                    <CardContent className="pt-4 space-y-3">
                      {/* Product Header */}
                      <div>
                        <h3 className="font-semibold text-sm md:text-base line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>

                      {/* Product Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Category</p>
                          <p className="font-medium capitalize">{product.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium">₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Stock</p>
                          <p className="font-medium">{product.stock} units</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <span className={`text-xs px-2 py-1 rounded inline-block ${
                            product.status === 'in-stock' ? 'bg-green-500/20 text-green-600' :
                            product.status === 'low-stock' ? 'bg-yellow-500/20 text-yellow-600' :
                            product.status === 'pre-order' ? 'bg-blue-500/20 text-blue-600' :
                            'bg-red-500/20 text-red-600'
                          }`}>
                            {product.status === 'in-stock' ? 'In Stock' :
                             product.status === 'low-stock' ? 'Low Stock' :
                             product.status === 'pre-order' ? 'Pre-Order' :
                             'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <EditProductDialog product={product}>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </EditProductDialog>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No products found. Create your first product!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteProductDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteProduct}
        productName={selectedProduct?.name}
      />
    </div>
  );
}
