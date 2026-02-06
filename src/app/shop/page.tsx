"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Search, ShoppingCart, X, Filter, SlidersHorizontal } from "lucide-react";
import Image from "next/image";
import { useShop, ProductCategory } from "@/hooks/use-shop";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'electrical', label: 'Electrical & Power Systems' },
  { value: 'airframe', label: 'Airframe Building Materials' },
  { value: 'mechanical', label: 'Mechanical & Control Components' },
  { value: 'drone', label: 'Drone & Multi-Rotor Specific' },
];

const STOCK_STATUS = [
  { value: 'in-stock', label: 'In Stock' },
  { value: 'pre-order', label: 'Pre-Order' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
];

export default function ShopPage() {
  const { products, loading } = useShop();
  const { toast } = useToast();
  const { cart, addToCart } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get unique brands
  const brands = useMemo(() => {
    return [...new Set(products.map(p => p.brand))].sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(product.status);

      return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, priceRange, selectedBrands, selectedStatus]);

  const handleAddToCart = (product: any) => {
    addToCart({
      productId: product.id,
      quantity: 1,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} added successfully`,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 100000]);
    setSelectedBrands([]);
    setSelectedStatus([]);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    selectedStatus.length +
    (priceRange[0] !== 0 || priceRange[1] !== 100000 ? 1 : 0);

  // Filter Component (reusable for both sidebar and mobile sheet)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Category</h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
            <Checkbox
              checked={selectedCategory === 'all'}
              onCheckedChange={() => setSelectedCategory('all')}
            />
            <span className="text-sm">All Categories</span>
          </label>
          {CATEGORIES.map(cat => (
            <label key={cat.value} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
              <Checkbox
                checked={selectedCategory === cat.value}
                onCheckedChange={() => setSelectedCategory(cat.value)}
              />
              <span className="text-sm">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Price Range (₹)</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={100000}
          step={500}
          className="mb-4"
        />
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="h-9 text-sm"
          />
          <Input
            type="number"
            placeholder="Max"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="h-9 text-sm"
          />
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 text-sm">Brands</h3>
          <div className="space-y-2.5 max-h-40 overflow-y-auto pr-2">
            {brands.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedBrands([...selectedBrands, brand]);
                    } else {
                      setSelectedBrands(selectedBrands.filter(b => b !== brand));
                    }
                  }}
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Stock Status */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Stock Status</h3>
        <div className="space-y-2.5">
          {STOCK_STATUS.map(status => (
            <label key={status.value} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
              <Checkbox
                checked={selectedStatus.includes(status.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedStatus([...selectedStatus, status.value]);
                  } else {
                    setSelectedStatus(selectedStatus.filter(s => s !== status.value));
                  }
                }}
              />
              <span className="text-sm">{status.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleClearFilters}
        className="w-full"
        disabled={activeFiltersCount === 0}
      >
        Clear All Filters
        {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">Club Shop</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Quality components for RC enthusiasts and model builders
              </p>
            </div>
            <Button asChild size="default" className="gap-2 w-full sm:w-auto">
              <Link href="/shop/cart">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Cart</span>
                {cartItemCount > 0 && (
                  <span className="bg-primary-foreground text-primary px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex gap-4 lg:gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <Card className="sticky top-20">
              <CardHeader className="pb-4">
                <CardTitle className="font-headline flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Products */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button & Results Count */}
            <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing <span className="font-semibold">{filteredProducts.length}</span> of {products.length} products
              </p>

              {/* Mobile Filter Button */}
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden relative">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground h-5 w-5 rounded-full text-xs flex items-center justify-center font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                      <SlidersHorizontal className="h-5 w-5" />
                      Filters
                    </SheetTitle>
                    <SheetDescription>
                      Refine your product search
                    </SheetDescription>
                  </SheetHeader>
                  <FilterContent />
                </SheetContent>
              </Sheet>
            </div>

            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                    <button onClick={() => setSelectedCategory('all')} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedBrands.map(brand => (
                  <span key={brand} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {brand}
                    <button
                      onClick={() => setSelectedBrands(selectedBrands.filter(b => b !== brand))}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedStatus.map(status => (
                  <span key={status} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {STOCK_STATUS.find(s => s.value === status)?.label}
                    <button
                      onClick={() => setSelectedStatus(selectedStatus.filter(s => s !== status))}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-pulse text-muted-foreground">Loading products...</div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow">
                    {product.image && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-muted p-4">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader className="flex-1 p-3 sm:p-4 md:p-6">
                      <CardTitle className="font-headline text-sm sm:text-base line-clamp-2 mb-1">
                        {product.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{product.brand}</CardDescription>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-0.5 sm:py-1 rounded-full font-medium ${product.status === 'in-stock' ? 'bg-green-500/20 text-green-700' :
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
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-2 sm:space-y-3">
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg sm:text-xl md:text-2xl font-bold">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.salePrice && (
                          <span className="text-xs sm:text-sm line-through text-muted-foreground">
                            ₹{product.salePrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.status === 'out-of-stock'}
                        className="w-full h-9 sm:h-10 text-sm"
                        size="sm"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                  No products match your filters
                </p>
                <Button variant="outline" onClick={handleClearFilters} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
