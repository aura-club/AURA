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
  price: z.coerce.number().min(0, "Price must be positive"),
  stock: z.coerce.number().min(0, "Stock must be non-negative"),
  status: z.enum(["in-stock", "pre-order", "low-stock", "out-of-stock"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductDialogProps {
  product: any;
  children: ReactNode;
}

export function EditProductDialog({ product, children }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateProduct } = useShop();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      status: product.status,
      description: product.description,
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      await updateProduct(product.id, {
        name: data.name,
        brand: data.brand,
        price: data.price,
        stock: data.stock,
        status: data.status as any,
        description: data.description,
      });
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Product Name *</label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Brand *</label>
            <Input {...register("brand")} />
            {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Price ($) *</label>
              <Input {...register("price")} type="number" step="0.01" />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Stock *</label>
              <Input {...register("stock")} type="number" />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Status *</label>
            <Select {...register("status")} defaultValue={product.status}>
              <SelectTrigger>
                <SelectValue />
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
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={3}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Update Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
