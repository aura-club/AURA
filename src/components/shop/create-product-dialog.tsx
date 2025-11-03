"use client";

import { useState, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShop } from "@/hooks/use-shop";
import { useToast } from "@/hooks/use-toast";

const productSchema = z.object({
  name: z.string().min(1, "Product name required"),
  brand: z.string().min(1, "Brand required"),
  category: z.enum(["electrical", "airframe", "mechanical", "drone"]),
  subCategory: z.string().min(1, "Sub-category required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  stock: z.coerce.number().min(0, "Stock must be non-negative"),
  status: z.enum(["in-stock", "pre-order", "low-stock", "out-of-stock"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface CreateProductDialogProps {
  children: ReactNode;
}

export function CreateProductDialog({ children }: CreateProductDialogProps) {
  const [open, setOpen] = useState(false);
  const { addProduct } = useShop();
  const { toast } = useToast();
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const selectedCategory = watch("category");

  const subCategoryMap: { [key: string]: string[] } = {
    electrical: ["Servos & Actuators", "ESCs", "Batteries & Chargers", "Wiring & Harnesses"],
    airframe: ["Foam & Sheet Materials", "Wood & Composites", "Adhesives & Tools"],
    mechanical: ["Linkages", "Control Surfaces", "Fasteners & Hardware"],
    drone: ["Frames & Hardware", "Flight Controllers", "FPV Gear", "Propellers"],
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      await addProduct({
        name: data.name,
        brand: data.brand,
        category: data.category as any,
        subCategory: data.subCategory,
        price: data.price,
        stock: data.stock,
        status: data.status as any,
        description: data.description,
        specifications: {},
        tags: [],
        image: "",
        images: [],
      });
      toast({
        title: "Success",
        description: `${data.name} has been added to the shop!`,
      });
      reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Fill in the product details to add it to the shop</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Product Name *</label>
            <Input {...register("name")} placeholder="e.g., Servo SG90" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Brand *</label>
            <Input {...register("brand")} placeholder="e.g., Tower Pro" />
            {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Category *</label>
            <Select {...register("category")} defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electrical">Electrical & Power</SelectItem>
                <SelectItem value="airframe">Airframe Materials</SelectItem>
                <SelectItem value="mechanical">Mechanical & Control</SelectItem>
                <SelectItem value="drone">Drone Specific</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
          </div>

          {selectedCategory && (
            <div>
              <label className="text-sm font-medium">Sub-Category *</label>
              <Select {...register("subCategory")} defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  {subCategoryMap[selectedCategory].map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subCategory && <p className="text-xs text-red-500 mt-1">{errors.subCategory.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Price ($) *</label>
              <Input {...register("price")} placeholder="0.00" type="number" step="0.01" />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Stock *</label>
              <Input {...register("stock")} placeholder="0" type="number" />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Status *</label>
            <Select {...register("status")} defaultValue="">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="pre-order">Pre-Order</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Description *</label>
            <textarea 
              {...register("description")} 
              placeholder="Product description..."
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={3}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Add Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
