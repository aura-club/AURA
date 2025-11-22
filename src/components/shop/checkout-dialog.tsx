"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Truck, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { usePickupLocations } from "@/hooks/use-pickup-locations";
import { useShop } from "@/hooks/use-shop";
import { useToast } from "@/hooks/use-toast";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone number required"),
  deliveryMethod: z.enum(["delivery", "pickup"], { required_error: "Please select delivery method" }),
  address: z.string().optional(),
  pickupLocationId: z.string().optional(),
}).refine((data) => {
  if (data.deliveryMethod === "delivery") {
    return data.address && data.address.length >= 10;
  }
  if (data.deliveryMethod === "pickup") {
    return data.pickupLocationId && data.pickupLocationId.length > 0;
  }
  return true;
}, {
  message: "Please provide delivery address or select pickup location",
  path: ["address"],
});

type CheckoutData = z.infer<typeof checkoutSchema>;

interface CheckoutDialogProps {
  cartItems: any[];
  totalPrice: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckoutDialog({
  cartItems,
  totalPrice,
  onClose,
  onSuccess,
}: CheckoutDialogProps) {
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const { locations } = usePickupLocations();
  const { products } = useShop();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Check which delivery methods are available for ALL items in cart
  const availableDeliveryMethods = useMemo(() => {
    const allDeliveryAvailable = cartItems.every(item => {
      const product = products.find(p => p.id === item.productId);
      return product?.deliveryAvailable ?? true; // Default to true if not set
    });

    const allPickupAvailable = cartItems.every(item => {
      const product = products.find(p => p.id === item.productId);
      return product?.pickupAvailable ?? false;
    });

    return {
      delivery: allDeliveryAvailable,
      pickup: allPickupAvailable && locations.length > 0,
    };
  }, [cartItems, products, locations]);

  // Get available pickup locations for cart items
  const availablePickupLocations = useMemo(() => {
    if (!availableDeliveryMethods.pickup) return [];

    // Get all pickup location IDs from cart products
    const locationIds = new Set<string>();
    cartItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product?.pickupLocations) {
        product.pickupLocations.forEach((locId: string) => locationIds.add(locId));
      }
    });

    // Filter locations to only show those available for ALL products
    return locations.filter(loc => {
      // Check if this location is available for ALL items in cart
      return cartItems.every(item => {
        const product = products.find(p => p.id === item.productId);
        return product?.pickupLocations?.includes(loc.id);
      });
    });
  }, [cartItems, products, locations, availableDeliveryMethods.pickup]);

  // Determine default delivery method
  const defaultDeliveryMethod = availableDeliveryMethods.delivery ? "delivery" : "pickup";
  
  const { register, handleSubmit, watch, control, formState: { errors }, setValue } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || "",
      deliveryMethod: defaultDeliveryMethod,
    },
  });

  const deliveryMethod = watch("deliveryMethod");
  const selectedPickupId = watch("pickupLocationId");
  const selectedLocation = availablePickupLocations.find(loc => loc.id === selectedPickupId);

  const onSubmit = async (data: CheckoutData) => {
  if (!user) {
    toast({
      title: "Error",
      description: "Please login to place an order",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  try {
    // Build order data object conditionally
    const orderData: any = {
      userId: user.uid,
      userEmail: data.email,
      userName: data.name,
      userPhone: data.phone,
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice,
      status: 'pending',
      deliveryMethod: data.deliveryMethod,
    };

    // Only add deliveryAddress if delivery method is selected
    if (data.deliveryMethod === 'delivery' && data.address) {
      orderData.deliveryAddress = data.address;
    }

    // Only add pickupLocation if pickup method is selected
    if (data.deliveryMethod === 'pickup' && selectedLocation) {
      orderData.pickupLocation = {
        id: selectedLocation.id,
        name: selectedLocation.name,
        address: selectedLocation.address,
        contactNumber: selectedLocation.contactNumber,
      };
    }

    const orderId = await createOrder(orderData);

    toast({
      title: "Order Placed Successfully! 🎉",
      description: `Your order #${orderId?.slice(0, 8)} has been placed. ${data.deliveryMethod === 'pickup' ? 'We will notify you when ready for pickup.' : 'Admin will contact you soon.'}`,
    });

    onSuccess();
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to place order",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-5xl mx-auto px-4">
      <Button variant="ghost" onClick={onClose} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Button>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Order Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map(item => (
              <div key={item.productId} className="flex justify-between pb-3 border-b">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-sm text-amber-600 mt-3 p-2 bg-amber-50 rounded">
                💳 Cash on Delivery / Cash on Pickup
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input {...register("name")} placeholder="Your full name" className="mt-1" />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium">Phone Number *</label>
                  <Input {...register("phone")} placeholder="+91 98765 43210" className="mt-1" />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input {...register("email")} placeholder="your@email.com" className="mt-1" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {/* Delivery Method Selection - Only show if at least one method is available */}
              {(availableDeliveryMethods.delivery || availableDeliveryMethods.pickup) && (
                <div>
                  <label className="text-sm font-medium mb-3 block">Delivery Method *</label>
                  <Controller
                    name="deliveryMethod"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup 
                        value={field.value} 
                        onValueChange={field.onChange} 
                        className="space-y-3"
                      >
                        {availableDeliveryMethods.delivery && (
                          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                            <RadioGroupItem value="delivery" id="delivery" />
                            <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                              <Truck className="h-4 w-4" />
                              <div>
                                <p className="font-medium">Home Delivery</p>
                                <p className="text-xs text-muted-foreground">Get it delivered to your address</p>
                              </div>
                            </Label>
                          </div>
                        )}
                        
                        {availableDeliveryMethods.pickup && (
                          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                            <RadioGroupItem value="pickup" id="pickup" />
                            <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
                              <MapPin className="h-4 w-4" />
                              <div>
                                <p className="font-medium">Pickup</p>
                                <p className="text-xs text-muted-foreground">Pick up from a location</p>
                              </div>
                            </Label>
                          </div>
                        )}
                      </RadioGroup>
                    )}
                  />
                  {errors.deliveryMethod && <p className="text-xs text-red-500 mt-1">{errors.deliveryMethod.message}</p>}
                </div>
              )}

              {/* Conditional Fields */}
              {deliveryMethod === "delivery" && availableDeliveryMethods.delivery && (
                <div>
                  <label className="text-sm font-medium">Delivery Address *</label>
                  <textarea
                    {...register("address")}
                    placeholder="Complete delivery address with house number, street, city, postal code"
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                    rows={3}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
                </div>
              )}

              {deliveryMethod === "pickup" && availableDeliveryMethods.pickup && (
                <div>
                  <label className="text-sm font-medium">Pickup Location *</label>
                  <Controller
                    name="pickupLocationId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select pickup location" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePickupLocations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              <div>
                                <p className="font-medium">{location.name}</p>
                                <p className="text-xs text-muted-foreground">{location.address}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.pickupLocationId && <p className="text-xs text-red-500 mt-1">{errors.pickupLocationId.message}</p>}
                  
                  {selectedLocation && (
                    <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {selectedLocation.name}
                      </p>
                      <p className="text-muted-foreground mt-1">{selectedLocation.address}</p>
                      {selectedLocation.contactNumber && (
                        <p className="text-muted-foreground mt-1">📞 {selectedLocation.contactNumber}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? "Processing..." : `Place Order (${deliveryMethod === 'pickup' ? 'Pickup' : 'COD'})`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
