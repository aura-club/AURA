
"use client";

import { uploadFile } from "@/lib/storage-utils";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Upload, Link as LinkIcon } from "lucide-react";

const resourceFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  category: z.string({ required_error: "Please select a category." }),
  description: z.string().min(20, "Description must be at least 20 characters."),
  link: z.string().url("Please enter a valid URL for the resource link."),
  authorName: z.string().optional(),
  tags: z.string().optional(),
  imageType: z.enum(['upload', 'url']).default('upload'),
  imageFile: z.any().optional(),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

const categories = ["Plug-ins", "Research Papers", "3D Designs", "Blueprints"];

interface AddResourceDialogProps {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  isPage?: boolean;
}

export function AddResourceDialog({ children, open: controlledOpen, setOpen: setControlledOpen, isPage = false }: AddResourceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();
  const { user, addResource } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const open = controlledOpen ?? internalOpen;
  const setOpen = (isOpen: boolean) => {
    if (isPage && !isOpen) {
      router.push('/dashboard/add');
    } else if (setControlledOpen) {
      setControlledOpen(isOpen);
    } else {
      setInternalOpen(isOpen);
    }
  }

  const { toast } = useToast();

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      authorName: user?.displayName || "",
      tags: "",
      imageType: 'upload',
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (user?.displayName && !form.getValues('authorName')) {
      form.setValue('authorName', user.displayName);
    }
  }, [user, form]);

  const imageFile = form.watch('imageFile');
  const imageUrl = form.watch('imageUrl');
  const imageType = form.watch('imageType');

  useEffect(() => {
    let fileUrl: string | null = null;

    if (imageType === 'upload' && imageFile && imageFile.length > 0) {
      fileUrl = URL.createObjectURL(imageFile[0]);
      setImagePreview(fileUrl);
    } else if (imageType === 'url' && imageUrl) {
      try {
        new URL(imageUrl);
        setImagePreview(imageUrl);
      } catch (e) {
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [imageFile, imageUrl, imageType]);

  async function onSubmit(data: ResourceFormValues) {
    try {
      let finalImageUrl = "";

      if (data.imageType === 'url' && data.imageUrl) {
        finalImageUrl = data.imageUrl;
      } else if (data.imageType === 'upload' && data.imageFile && data.imageFile.length > 0) {
        finalImageUrl = await uploadFile(data.imageFile[0], 'resources');
      }

      await addResource({
        ...data,
        imageUrl: finalImageUrl,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        category: data.category as any
      });

      toast({
        title: "Resource Submitted!",
        description: "Your resource is now pending review by an admin.",
      });
      form.reset();
      setOpen(false);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not submit your resource. Please try again.",
      });
    }
  }

  const imageFileRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isPage && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">Add a New Resource</DialogTitle>
          <DialogDescription>
            Contribute to the community by sharing a helpful resource.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resource category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Title</FormLabel>
                  <FormControl><Input placeholder="e.g., XFoil Analysis Plugin" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="A brief description of the resource and what it's used for." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl>
                  <FormDescription>A direct URL to download or view the resource.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Name (Optional)</FormLabel>
                  <FormControl><Input placeholder="Defaults to your name" {...field} /></FormControl>
                  <FormDescription>Credit the original author if it's not you.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image (Optional)</FormLabel>
                  <FormDescription>Add a visual for your resource.</FormDescription>
                  <FormControl>
                    <Tabs value={field.value} onValueChange={(value) => field.onChange(value as 'upload' | 'url')} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Upload</TabsTrigger>
                        <TabsTrigger value="url"><LinkIcon className="mr-2 h-4 w-4" />Link</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="mt-4">
                        <FormField
                          control={form.control}
                          name="imageFile"
                          render={() => (
                            <FormItem>
                              <div className="flex items-center gap-4">
                                <Button type="button" variant="outline" onClick={() => imageFileRef.current?.click()}>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Image
                                </Button>
                                <Input
                                  {...form.register("imageFile")}
                                  ref={imageFileRef}
                                  type="file"
                                  accept="image/png, image/jpeg, image/gif"
                                  className="hidden"
                                />
                                <span className="text-sm text-muted-foreground">
                                  {imageFile?.[0]?.name || "No file selected."}
                                </span>
                              </div>
                              <FormDescription>Accepted formats: PNG, JPG, GIF.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="url" className="mt-4">
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl>
                              <FormDescription>Paste a direct link to an image.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </FormControl>
                  {imagePreview && (
                    <div className="mt-4 p-2 border border-dashed rounded-lg">
                      <Image
                        src={imagePreview}
                        alt="Image preview"
                        width={200}
                        height={112}
                        className="rounded-md w-full max-w-xs object-cover aspect-video"
                        unoptimized
                      />
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional)</FormLabel>
                  <FormControl><Input placeholder="Simulation, CAD, Aerodynamics" {...field} /></FormControl>
                  <FormDescription>Comma-separated list of tags.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit for Review"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
