"use client";

import { useState, ReactNode, useRef } from "react";
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
import { usePermissions, showPermissionError } from "@/hooks/use-permissions";
import { uploadFile } from "@/lib/storage-utils";
import { Upload, X, Link, MapPin } from "lucide-react";
import Image from "next/image";

const productSchema = z.object({
  name: z.string().min(1, "Product name required"),
  brand: z.string().min(1, "Brand required"),
  category: z.string().min(1, "Category required"),
  subCategory: z.string().min(1, "Sub-category required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  stock: z.coerce.number().min(0, "Stock must be non-negative"),
  status: z.string().min(1, "Status required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().optional(),
  deliveryAvailable: z.boolean().default(true),
  pickupAvailable: z.boolean().default(false),
  pickupLocations: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface CreateProductDialogProps {
  children: ReactNode;
}

export function CreateProductDialog({ children }: CreateProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageInputMethod, setImageInputMethod] = useState<"url" | "upload">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPickupLocations, setSelectedPickupLocations] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addProduct } = useShop();
  const { locations } = usePickupLocations();
  const { toast } = useToast();
  const permissions = usePermissions();

  const { register, handleSubmit, watch, control, formState: { errors }, reset, setValue } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: "",
      subCategory: "",
      status: "",
      imageUrl: "",
      deliveryAvailable: true,
      pickupAvailable: false,
      pickupLocations: [],
    },
  });

  const selectedCategory = watch("category");
  const imageUrl = watch("imageUrl");
  const pickupAvailable = watch("pickupAvailable");
  const deliveryAvailable = watch("deliveryAvailable");

  const subCategoryMap: { [key: string]: string[] } = {
    electrical: ["Servos & Actuators", "ESCs", "Batteries & Chargers", "Wiring & Harnesses"],
    airframe: ["Foam & Sheet Materials", "Wood & Composites", "Adhesives & Tools"],
    mechanical: ["Linkages", "Control Surfaces", "Fasteners & Hardware"],
    drone: ["Frames & Hardware", "Flight Controllers", "FPV Gear", "Propellers"],
  };

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

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setValue("imageUrl", url);
    setImagePreview(url || "");
  };

  const removeImage = () => {
    setImagePreview("");
    setSelectedFile(null);
    setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
    return undefined;
  };

  const handlePickupLocationToggle = (locationId: string) => {
    setSelectedPickupLocations(prev => {
      if (prev.includes(locationId)) {
        return prev.filter(id => id !== locationId);
      } else {
        return [...prev, locationId];
      }
    });
  };

  const onSubmit = async (data: ProductFormData) => {
    // Check permission first
    if (!permissions.canManageShop) {
      toast(showPermissionError());
      return;
    }

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
      const finalImageUrl = await uploadImage();

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
        image: finalImageUrl || imagePreview,
        images: finalImageUrl ? [finalImageUrl] : (imagePreview ? [imagePreview] : []),
        // @ts-ignore
        deliveryAvailable: data.deliveryAvailable,
        // @ts-ignore
        pickupAvailable: data.pickupAvailable,
        // @ts-ignore
        pickupLocations: data.pickupAvailable ? selectedPickupLocations : [],
      });

      toast({
        title: "Success",
        description: `${data.name} has been added to the shop!`,
      });

      reset();
      setImagePreview("");
      setSelectedFile(null);
      setSelectedPickupLocations([]);
      setValue("imageUrl", "");
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Fill in the product details to add it to the shop</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Image Upload/URL Section */}
          <div>
            <label className="text-sm font-medium mb-2 block">Product Image</label>

            {imagePreview ? (
              <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
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

                <TabsContent value="url" className="space-y-3 mt-3">
                  <Input
                    placeholder="Enter image URL"
                    value={imageUrl || ""}
                    onChange={handleUrlChange}
                  />
                </TabsContent>

                <TabsContent value="upload" className="mt-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <label
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload image</p>
                    </div>
                  </label>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category *</label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
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
                )}
              />
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>

            {selectedCategory && (
              <div>
                <label className="text-sm font-medium">Sub-Category *</label>
                <Controller
                  name="subCategory"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-category" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategoryMap[selectedCategory].map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subCategory && <p className="text-xs text-red-500 mt-1">{errors.subCategory.message}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Price (₹) *</label>
              <Input {...register("price")} placeholder="0.00" type="number" step="0.01" />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Stock *</label>
              <Input {...register("stock")} placeholder="0" type="number" />
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
                      <SelectValue placeholder="Select status" />
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
              placeholder="Product description..."
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
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
            <Button type="submit" disabled={isUploading || !permissions.canManageShop}>
              {isUploading ? "Uploading..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
