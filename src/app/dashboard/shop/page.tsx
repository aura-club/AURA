"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Search, ChevronDown, X } from "lucide-react";
import { useShop } from "@/hooks/use-shop";
import { useToast } from "@/hooks/use-toast";
import { usePermissions, showPermissionError } from "@/hooks/use-permissions";
import { CreateProductDialog } from "@/components/shop/create-product-dialog";
import { EditProductDialog } from "@/components/shop/edit-product-dialog";
import { DeleteProductDialog } from "@/components/shop/delete-product-dialog";
import { PickupLocationsManager } from "@/components/admin/pickup-locations-manager";

export default function ShopManagementPage() {
  const { products, loading, deleteProduct } = useShop();
  const { toast } = useToast();
  const permissions = usePermissions();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "electrical" | "airframe" | "mechanical" | "drone">("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  // Redirect if no permission
  useEffect(() => {
    if (!permissions.canManageShop) {
      router.push('/dashboard');
      toast({
        title: "Access Denied",
        description: "You don't have permission to access shop management.",
        variant: "destructive",
      });
    }
  }, [permissions.canManageShop, router, toast]);

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
    
    if (!permissions.canDelete) {
      toast(showPermissionError());
      setShowDeleteDialog(false);
      return;
    }
    
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

  // Show nothing while checking permissions (prevents flash)
  if (!permissions.canManageShop) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 sm:p-4 md:p-0">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline">Shop Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage products, inventory, and orders</p>
        </div>
        <CreateProductDialog>
          <Button className="w-full sm:w-auto" size="default">
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm">Add Product</span>
          </Button>
        </CreateProductDialog>
      </div>

      {/* Stats Cards - Fully Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl sm:text-3xl font-bold">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">In Stock</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{products.filter(p => p.status === 'in-stock').length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm xs:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{products.filter(p => p.status === 'low-stock').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pickup Locations Manager */}
      <PickupLocationsManager />

      {/* Filters - Mobile Optimized */}
      <Card className="shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          {/* Search */}
          <div>
            <label className="text-xs sm:text-sm font-medium mb-2 block">Search Products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 text-sm h-10 w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter - Mobile: Dropdown, Desktop: Buttons */}
          <div>
            <label className="text-xs sm:text-sm font-medium mb-2 block">Category</label>
            
            {/* Mobile Dropdown */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className="w-full flex items-center justify-between px-4 py-2.5 border rounded-lg text-sm bg-background hover:bg-muted transition-colors"
              >
                <span className="font-medium">{categories.find(c => c.value === activeCategory)?.label}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showCategoryFilter ? 'rotate-180' : ''}`} />
              </button>
              {showCategoryFilter && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowCategoryFilter(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
                    {categories.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          setActiveCategory(cat.value as any);
                          setShowCategoryFilter(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          activeCategory === cat.value 
                            ? 'bg-primary text-primary-foreground font-medium' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </>
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
                  className="text-xs sm:text-sm"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products - Mobile Optimized */}
      <Card className="shadow-sm">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-base sm:text-lg">
            Products 
            <span className="ml-2 text-sm font-normal text-muted-foreground">({filteredProducts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 pb-4">
          {loading ? (
            <div className="text-center py-12 text-sm">
              <div className="animate-pulse">Loading products...</div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-3 font-semibold">Product Name</th>
                      <th className="text-left py-3 px-3 font-semibold">Brand</th>
                      <th className="text-left py-3 px-3 font-semibold">Category</th>
                      <th className="text-left py-3 px-3 font-semibold">Price</th>
                      <th className="text-left py-3 px-3 font-semibold">Stock</th>
                      <th className="text-left py-3 px-3 font-semibold">Status</th>
                      <th className="text-left py-3 px-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-3 font-medium">{product.name}</td>
                        <td className="py-3 px-3 text-muted-foreground">{product.brand}</td>
                        <td className="py-3 px-3 text-muted-foreground capitalize">{product.category}</td>
                        <td className="py-3 px-3 font-semibold">₹{product.price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3">{product.stock}</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            product.status === 'in-stock' ? 'bg-green-500/20 text-green-700' :
                            product.status === 'low-stock' ? 'bg-yellow-500/20 text-yellow-700' :
                            product.status === 'pre-order' ? 'bg-blue-500/20 text-blue-700' :
                            'bg-red-500/20 text-red-700'
                          }`}>
                            {product.status === 'in-stock' ? 'In Stock' :
                             product.status === 'low-stock' ? 'Low Stock' :
                             product.status === 'pre-order' ? 'Pre-Order' :
                             'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2">
                            <EditProductDialog product={product}>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </EditProductDialog>
                            
                            {permissions.canDelete ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                disabled
                                onClick={() => toast(showPermissionError())}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile & Tablet Card View */}
              <div className="lg:hidden space-y-3">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      {/* Product Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${
                          product.status === 'in-stock' ? 'bg-green-500/20 text-green-700' :
                          product.status === 'low-stock' ? 'bg-yellow-500/20 text-yellow-700' :
                          product.status === 'pre-order' ? 'bg-blue-500/20 text-blue-700' :
                          'bg-red-500/20 text-red-700'
                        }`}>
                          {product.status === 'in-stock' ? 'In Stock' :
                           product.status === 'low-stock' ? 'Low Stock' :
                           product.status === 'pre-order' ? 'Pre-Order' :
                           'Out of Stock'}
                        </span>
                      </div>

                      {/* Product Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Category</p>
                          <p className="font-medium capitalize">{product.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Price</p>
                          <p className="font-semibold text-base">₹{product.price.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground mb-1">Stock Available</p>
                          <p className="font-medium">{product.stock} units</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t">
                        <EditProductDialog product={product}>
                          <Button size="sm" variant="outline" className="flex-1 h-9 text-sm">
                            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                          </Button>
                        </EditProductDialog>
                        
                        {permissions.canDelete ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-9 text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-9 text-sm"
                            disabled
                            onClick={() => toast(showPermissionError())}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="text-muted-foreground mb-2">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery || activeCategory !== "all" 
                  ? "No products match your filters. Try adjusting your search." 
                  : "No products found. Create your first product!"}
              </p>
              {(searchQuery || activeCategory !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
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
