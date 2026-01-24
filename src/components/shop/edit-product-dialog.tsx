"use client";

import { useState, ReactNode, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShop } from "@/hooks/use-shop";
import { usePickupLocations } from "@/hooks/use-pickup-locations";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/storage-utils";
import { Upload, Link, MapPin } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Product name required"),
  brand: z.string().min(1, "Brand required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  stock: z.coerce.number().min(0, "Stock must be non-negative"),
  status: z.enum(["in-stock", "pre-order", "low-stock", "out-of-stock"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().optional(),
  deliveryAvailable: z.boolean().default(true),
  pickupAvailable: z.boolean().default(false),
  pickupLocations: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductDialogProps {
  product: any;
  children: ReactNode;
}

export function EditProductDialog({ product, children }: EditProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [imageInputMethod, setImageInputMethod] = useState<"url" | "upload">("url");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || product?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPickupLocations, setSelectedPickupLocations] = useState<string[]>(
    product?.pickupLocations || []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateProduct } = useShop();
  const { locations } = usePickupLocations();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue, watch, control } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      status: product.status,
      description: product.description,
      imageUrl: product.imageUrl || product.image || "",
      deliveryAvailable: product.deliveryAvailable ?? true,
      pickupAvailable: product.pickupAvailable ?? false,
      pickupLocations: product.pickupLocations || [],
    },
  });

  const imageUrl = watch("imageUrl");
  const pickupAvailable = watch("pickupAvailable");
  const deliveryAvailable = watch("deliveryAvailable");

  // Update selected pickup locations when product changes
  useEffect(() => {
    if (product?.pickupLocations) {
      setSelectedPickupLocations(product.pickupLocations);
    }
  }, [product]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setValue("imageUrl", url);
    setImagePreview(url || null);
  };

  // Handle pickup location toggle
  const handlePickupLocationToggle = (locationId: string) => {
    setSelectedPickupLocations(prev => {
      if (prev.includes(locationId)) {
        return prev.filter(id => id !== locationId);
      } else {
        return [...prev, locationId];
      }
    });
  };

  // Upload image to ImgBB
  const uploadImage = async (): Promise<string | undefined> => {
    if (imageInputMethod === "upload" && selectedFile) {
      setIsUploading(true);
      try {
        const downloadURL = await uploadFile(selectedFile, "shop-products");
        setIsUploading(false);
        return downloadURL;
      } catch (error) {
        setIsUploading(false);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return undefined;
      }
    } else if (imageInputMethod === "url" && imageUrl) {
      return imageUrl;
    }
    return product.imageUrl || product.image; // Keep existing image if no new image provided
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!data.deliveryAvailable && !data.pickupAvailable) {
      toast({
        title: "Error",
        description: "At least one fulfillment method (delivery or pickup) must be available",
        variant: "destructive",
      });
      return;
    }

    if (data.pickupAvailable && selectedPickupLocations.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one pickup location",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload image and get URL
      const finalImageUrl = await uploadImage();

      await updateProduct(product.id, {
        name: data.name,
        brand: data.brand,
        price: data.price,
        stock: data.stock,
        status: data.status as any,
        description: data.description,
        // @ts-ignore
        imageUrl: finalImageUrl || data.imageUrl,
        // @ts-ignore
        image: finalImageUrl || data.imageUrl, // For backward compatibility
        // @ts-ignore
        deliveryAvailable: data.deliveryAvailable,
        // @ts-ignore
        pickupAvailable: data.pickupAvailable,
        // @ts-ignore
        pickupLocations: data.pickupAvailable ? selectedPickupLocations : [],
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Price (₹) *</label>
              <Input {...register("price")} type="number" step="0.01" />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Stock *</label>
              <Input {...register("stock")} type="number" />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Status *</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
              {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
            </div>
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

          {/* Image Upload Section */}
          <div>
            <label className="text-sm font-medium mb-2 block">Product Image</label>
            <Tabs value={imageInputMethod} onValueChange={(value: any) => setImageInputMethod(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Image URL
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-3">
                <Input
                  placeholder="Enter image URL"
                  value={imageUrl || ""}
                  onChange={handleUrlChange}
                />
                {imagePreview && imageInputMethod === "url" && (
                  <div className="mt-2 border rounded-md p-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                      onError={() => setImagePreview(null)}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upload" className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {selectedFile ? "Change Image" : "Choose Image"}
                </Button>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {selectedFile.name}
                  </p>
                )}
                {imagePreview && imageInputMethod === "upload" && (
                  <div className="mt-2 border rounded-md p-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Fulfillment Options */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-sm">Fulfillment Options *</h3>

            <div className="space-y-3">
              <Controller
                name="deliveryAvailable"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="deliveryAvailable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="deliveryAvailable"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Home Delivery Available
                    </label>
                  </div>
                )}
              />

              <Controller
                name="pickupAvailable"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pickupAvailable"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="pickupAvailable"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Pickup Available
                    </label>
                  </div>
                )}
              />
            </div>

            {pickupAvailable && (
              <div className="mt-4 pt-4 border-t">
                <label className="text-sm font-medium mb-3 block">Select Pickup Locations *</label>
                {locations.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {locations.map((location) => (
                      <div
                        key={location.id}
                        className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded"
                      >
                        <Checkbox
                          id={`location-${location.id}`}
                          checked={selectedPickupLocations.includes(location.id)}
                          onCheckedChange={() => handlePickupLocationToggle(location.id)}
                        />
                        <label
                          htmlFor={`location-${location.id}`}
                          className="text-sm leading-none cursor-pointer flex-1"
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="font-medium">{location.name}</p>
                              <p className="text-xs text-muted-foreground">{location.address}</p>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No pickup locations available. Please add locations in admin settings.</p>
                )}
              </div>
            )}

            {!deliveryAvailable && !pickupAvailable && (
              <p className="text-xs text-amber-600">⚠️ At least one fulfillment method must be selected</p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Update Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
