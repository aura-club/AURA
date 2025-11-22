"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, Timestamp } from "firebase/firestore";
import { MapPin, Plus, Trash2, Edit2, X } from "lucide-react";

interface PickupLocation {
  id: string;
  name: string;
  address: string;
  contactNumber?: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export function PickupLocationsManager() {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "", contactNumber: "" });
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pickupLocations"), (snapshot) => {
      const locs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PickupLocation));
      setLocations(locs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    if (!formData.name || !formData.address) {
      toast({ title: "Error", description: "Name and address are required", variant: "destructive" });
      return;
    }

    try {
      await addDoc(collection(db, "pickupLocations"), {
        ...formData,
        isActive: true,
        createdAt: Timestamp.now(),
      });
      toast({ title: "Success", description: "Pickup location added" });
      setFormData({ name: "", address: "", contactNumber: "" });
      setIsAdding(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to add location", variant: "destructive" });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateDoc(doc(db, "pickupLocations", id), formData);
      toast({ title: "Success", description: "Pickup location updated" });
      setEditingId(null);
      setFormData({ name: "", address: "", contactNumber: "" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update location", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pickup location?")) return;
    
    try {
      await deleteDoc(doc(db, "pickupLocations", id));
      toast({ title: "Success", description: "Pickup location deleted" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete location", variant: "destructive" });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, "pickupLocations", id), { isActive: !isActive });
      toast({ title: "Success", description: `Location ${!isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const startEdit = (location: PickupLocation) => {
    setEditingId(location.id);
    setFormData({ name: location.name, address: location.address, contactNumber: location.contactNumber || "" });
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({ name: "", address: "", contactNumber: "" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pickup Locations
          </CardTitle>
          <Button size="sm" onClick={() => setIsAdding(true)} disabled={isAdding || editingId !== null}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(isAdding || editingId) && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
            <div>
              <label className="text-sm font-medium">Location Name *</label>
              <Input
                placeholder="e.g., Main Campus Gate"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Address *</label>
              <Input
                placeholder="Complete address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contact Number</label>
              <Input
                placeholder="+91 98765 43210"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={editingId ? () => handleUpdate(editingId) : handleAdd} size="sm">
                {editingId ? "Update" : "Add"} Location
              </Button>
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {locations.length > 0 ? (
          <div className="space-y-3">
            {locations.map((location) => (
              <div
                key={location.id}
                className={`p-4 border rounded-lg ${!location.isActive ? 'bg-muted/30' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold">{location.name}</h4>
                      {!location.isActive && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Inactive</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                    {location.contactNumber && (
                      <p className="text-xs text-muted-foreground mt-1">📞 {location.contactNumber}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(location)}
                      disabled={isAdding || editingId !== null}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(location.id, location.isActive)}
                    >
                      {location.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(location.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No pickup locations added yet</p>
        )}
      </CardContent>
    </Card>
  );
}
