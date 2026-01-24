
"use client";

import { uploadFile } from "@/lib/storage-utils";

import { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, Upload, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

const projectFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  thumbnailType: z.enum(['upload', 'url']).default('upload'),
  thumbnailImage: z.any().optional(),
  thumbnailImageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters.").max(150, "Excerpt must be 150 characters or less."),
  description: z.string().min(50, "Description must be at least 50 characters."),
  objectives: z.array(z.object({ value: z.string().min(1, "Objective cannot be empty.") })).min(1, "At least one objective is required."),
  methodology: z.string().min(20, "Methodology must be at least 20 characters."),
  outcomes: z.string().min(20, "Outcomes must be at least 20 characters."),
  teamMembers: z.array(z.object({ value: z.string().min(1, "Team member name cannot be empty.") })).min(1, "At least one team member is required."),
  galleryType: z.enum(['upload', 'url']).default('upload'),
  galleryImages: z.any().optional(),
  galleryImageUrls: z.array(z.object({ value: z.string().url("Must be a valid URL.").or(z.literal('')) })).optional(),
  externalLinks: z.array(z.object({
    label: z.string().min(1, "Link label cannot be empty."),
    url: z.string().url("Must be a valid URL."),
  })).optional(),
}).refine(data => {
  if (data.thumbnailType === 'upload') {
    return data.thumbnailImage && data.thumbnailImage.length > 0;
  }
  if (data.thumbnailType === 'url') {
    return !!data.thumbnailImageUrl;
  }
  return false;
}, {
  message: "Thumbnail image is required.",
  path: ["thumbnailImage"],
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface AddProjectDialogProps {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  isPage?: boolean;
}

export function AddProjectDialog({ children, open: controlledOpen, setOpen: setControlledOpen, isPage = false }: AddProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();

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

  const { addProject } = useAuth();
  const { toast } = useToast();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      thumbnailImageUrl: "",
      excerpt: "",
      description: "",
      objectives: [{ value: "" }],
      methodology: "",
      outcomes: "",
      teamMembers: [{ value: "" }],
      externalLinks: [],
      galleryImageUrls: [{ value: "" }],
      thumbnailType: 'upload',
      galleryType: 'upload',
    },
  });

  const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
    control: form.control,
    name: "objectives",
  });
  const { fields: teamMemberFields, append: appendTeamMember, remove: removeTeamMember } = useFieldArray({
    control: form.control,
    name: "teamMembers",
  });
  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control: form.control,
    name: "externalLinks",
  });
  const { fields: galleryUrlFields, append: appendGalleryUrl, remove: removeGalleryUrl } = useFieldArray({
    control: form.control,
    name: "galleryImageUrls",
  });

  const thumbnailFile = form.watch('thumbnailImage');
  const thumbnailUrl = form.watch('thumbnailImageUrl');
  const thumbnailType = form.watch('thumbnailType');

  useEffect(() => {
    let fileUrl: string | null = null;

    if (thumbnailType === 'upload' && thumbnailFile && thumbnailFile.length > 0) {
      fileUrl = URL.createObjectURL(thumbnailFile[0]);
      setThumbnailPreview(fileUrl);
    } else if (thumbnailType === 'url' && thumbnailUrl) {
      try {
        new URL(thumbnailUrl);
        setThumbnailPreview(thumbnailUrl);
      } catch (e) {
        setThumbnailPreview(null);
      }
    } else {
      setThumbnailPreview(null);
    }

    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [thumbnailFile, thumbnailUrl, thumbnailType]);


  async function onSubmit(data: ProjectFormValues) {
    try {
      const getThumbnail = async () => {
        if (data.thumbnailType === 'url' && data.thumbnailImageUrl) {
          return data.thumbnailImageUrl;
        }
        if (data.thumbnailType === 'upload' && data.thumbnailImage && data.thumbnailImage.length > 0) {
          return await uploadFile(data.thumbnailImage[0], 'projects');
        }
        // Fallback placeholder if something goes wrong, though validation should catch it
        return `https://placehold.co/600x400.png?text=No+Image`;
      }

      const getGallery = async () => {
        let urls: string[] = [];

        if (data.galleryType === 'url' && data.galleryImageUrls && data.galleryImageUrls.length > 0) {
          const linkUrls = data.galleryImageUrls.map(u => u.value).filter(Boolean);
          urls = [...urls, ...linkUrls];
        }

        if (data.galleryType === 'upload' && data.galleryImages && data.galleryImages.length > 0) {
          const uploadPromises = Array.from(data.galleryImages as FileList).map(file => uploadFile(file, 'projects'));
          const uploadedUrls = await Promise.all(uploadPromises);
          urls = [...urls, ...uploadedUrls];
        }

        // If totally empty, return placeholders? Or just empty array.
        // Let's return empty array if no images, or maybe keep the placeholder logic only if absolutely nothing.
        if (urls.length === 0) {
          return [
            `https://placehold.co/1000x700.png?text=Gallery+1`,
            `https://placehold.co/1000x700.png?text=Gallery+2`,
          ];
        }
        return urls;
      }

      const thumbnailImage = await getThumbnail();
      const galleryImages = await getGallery();

      const newProject = {
        title: data.title,
        excerpt: data.excerpt,
        thumbnailImage: thumbnailImage,
        description: data.description,
        objectives: data.objectives.map(o => o.value),
        methodology: data.methodology,
        outcomes: data.outcomes,
        teamMembers: data.teamMembers.map(m => m.value),
        galleryImages: galleryImages,
        externalLinks: data.externalLinks || [],
      };

      await addProject(newProject);

      toast({
        title: "Project Submitted!",
        description: "Your project is now pending review by an admin.",
      });
      form.reset();
      setOpen(false);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not submit your project. Please try again.",
      });
    }
  }

  const thumbnailRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const galleryValue = form.watch('galleryImages');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isPage && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">Add a New Project</DialogTitle>
          <DialogDescription>
            Showcase your work to the community. Fill out the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Form Errors:", errors))} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl><Input placeholder="e.g., High-Altitude Weather Balloon" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnailType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail Image</FormLabel>
                  <FormDescription>The cover image for the project card.</FormDescription>
                  <FormControl>
                    <Tabs value={field.value} onValueChange={(value) => field.onChange(value as 'upload' | 'url')} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Upload</TabsTrigger>
                        <TabsTrigger value="url"><LinkIcon className="mr-2 h-4 w-4" />Link</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="mt-4">
                        <FormField
                          control={form.control}
                          name="thumbnailImage"
                          render={() => (
                            <FormItem>
                              <div className="flex items-center gap-4">
                                <Button type="button" variant="outline" onClick={() => thumbnailRef.current?.click()}>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Image
                                </Button>
                                <Input
                                  {...form.register("thumbnailImage")}
                                  ref={(e) => {
                                    form.register("thumbnailImage").ref(e);
                                    if (thumbnailRef) thumbnailRef.current = e;
                                  }}
                                  type="file"
                                  accept="image/png, image/jpeg, image/gif"
                                  className="hidden"
                                />
                                <span className="text-sm text-muted-foreground">
                                  {thumbnailFile?.[0]?.name || "No file selected."}
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
                          name="thumbnailImageUrl"
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
                  <FormMessage className="text-red-500">{form.formState.errors.thumbnailImage?.message}</FormMessage>

                  {thumbnailPreview && (
                    <div className="mt-4 p-2 border border-dashed rounded-lg">
                      <Image
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
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
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt / Short Summary</FormLabel>
                  <FormControl><Textarea placeholder="A brief, one or two sentence summary of your project." {...field} /></FormControl>
                  <FormDescription>Maximum 150 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl><Textarea className="min-h-32" placeholder="Describe your project in detail. What was the goal? What did you build?" {...field} /></FormControl>
                  <FormDescription>Feel free to use Markdown for formatting.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Objectives</FormLabel>
              <FormDescription>What were the key goals of the project?</FormDescription>
              {objectiveFields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`objectives.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Input {...field} placeholder={`Objective #${index + 1}`} /></FormControl>
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeObjective(index)} disabled={objectiveFields.length <= 1}><Trash2 /></Button>
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendObjective({ value: "" })}><PlusCircle className="mr-2" />Add Objective</Button>
            </div>

            <FormField
              control={form.control}
              name="methodology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Methodology</FormLabel>
                  <FormControl><Textarea placeholder="Describe the approach, techniques, or methods used." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="outcomes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outcomes</FormLabel>
                  <FormControl><Textarea placeholder="What were the results, findings, or conclusions of the project?" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Team Members</FormLabel>
              <FormDescription>List the names or emails of contributors.</FormDescription>
              {teamMemberFields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`teamMembers.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Input {...field} placeholder={`Team Member #${index + 1}`} /></FormControl>
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeTeamMember(index)} disabled={teamMemberFields.length <= 1}><Trash2 /></Button>
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendTeamMember({ value: "" })}><PlusCircle className="mr-2" />Add Member</Button>
            </div>

            <FormField
              control={form.control}
              name="galleryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gallery Images (Optional)</FormLabel>
                  <FormDescription>Upload additional images or provide links.</FormDescription>
                  <FormControl>
                    <Tabs value={field.value} onValueChange={(value) => field.onChange(value as 'upload' | 'url')} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Upload</TabsTrigger>
                        <TabsTrigger value="url"><LinkIcon className="mr-2 h-4 w-4" />Links</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="mt-4">
                        <FormField
                          control={form.control}
                          name="galleryImages"
                          render={() => (
                            <FormItem>
                              <div className="flex items-center gap-4">
                                <Button type="button" variant="outline" onClick={() => galleryRef.current?.click()}>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Images
                                </Button>
                                <Input
                                  {...form.register("galleryImages")}
                                  ref={(e) => {
                                    form.register("galleryImages").ref(e);
                                    // @ts-ignore
                                    if (galleryRef) galleryRef.current = e;
                                  }}
                                  type="file"
                                  accept="image/png, image/jpeg, image/gif"
                                  multiple
                                  className="hidden"
                                />
                              </div>
                              {galleryValue?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {Array.from(galleryValue).map((file: any, index: number) => (
                                    <Badge key={index} variant="secondary">{file.name}</Badge>
                                  ))}
                                </div>
                              )}
                              <FormDescription>Accepted formats: PNG, JPG, GIF.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="url" className="mt-4 space-y-4">
                        {galleryUrlFields.map((field, index) => (
                          <FormField
                            key={field.id}
                            control={form.control}
                            name={`galleryImageUrls.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <FormControl><Input {...field} placeholder={`https://example.com/gallery-image-${index + 1}.png`} /></FormControl>
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeGalleryUrl(index)} disabled={galleryUrlFields.length <= 1}><Trash2 /></Button>
                              </FormItem>
                            )}
                          />
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendGalleryUrl({ value: "" })}><PlusCircle className="mr-2" />Add Image Link</Button>
                      </TabsContent>
                    </Tabs>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>External Links (Optional)</FormLabel>
              <FormDescription>Add links to GitHub, research papers, etc.</FormDescription>
              {linkFields.map((field, index) => (
                <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border p-4 rounded-md">
                  <FormField
                    control={form.control}
                    name={`externalLinks.${index}.label`}
                    render={({ field }) => <FormItem className="flex-1 w-full"><FormLabel className="sr-only">Label</FormLabel><FormControl><Input {...field} placeholder="Link Label (e.g., GitHub Repo)" /></FormControl><FormMessage /></FormItem>}
                  />
                  <FormField
                    control={form.control}
                    name={`externalLinks.${index}.url`}
                    render={({ field }) => <FormItem className="flex-1 w-full"><FormLabel className="sr-only">URL</FormLabel><FormControl><Input {...field} placeholder="https://..." /></FormControl><FormMessage /></FormItem>}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(index)}><Trash2 className="text-destructive" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendLink({ label: "", url: "" })}><PlusCircle className="mr-2" />Add Link</Button>
            </div>

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
