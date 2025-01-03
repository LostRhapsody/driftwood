"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Edit } from "lucide-react";
import  type { Post } from "@/types/post";
import { useSelectedSite } from "@/contexts/SelectedSiteContext";
import { invoke } from "@tauri-apps/api/core";
import { type DriftResponse, processResponse } from "@/types/response";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Add schema at top of file
const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string(),
  image: z.string(),
  published: z.boolean(),
  tags: z.array(z.string()),
});

type PostFormValues = z.infer<typeof postFormSchema>;

export default function PostEditor({ post }:{
  post: Post,
}) {
  const [title, setTitle] = useState(post?.title || '');
  const [tags, setTags] = useState(post?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [image, setImage] = useState(post?.image || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [published, setPublished] = useState(post?.published || false);
  const { selectedSite } = useSelectedSite();

   // Set up form
   const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post?.title || '',
      excerpt: post?.excerpt || '',
      image: post?.image || '',
      published: post?.published || false,
      tags: tags,
    },
  });

  // Watch tags field for changes
  useEffect(() => {
    form.setValue('tags', tags);
  }, [tags, form]);

  const watchImage = form.watch('image');

  // Add useEffect to sync form with local state
  useEffect(() => {
    setImage(watchImage);
  }, [watchImage]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault(); // Prevent form submission

      const newTag = currentTag.trim();
      if (!tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        setCurrentTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
  };

  const handleSubmit = async (post: PostFormValues) => {
    console.log(post);

		setTitle(post.title);

    // TODO - on the backend, need to give this post a post_id before
    // attempting to serialize it, otherwise it will fail

		// const response = await invoke<DriftResponse>("create_post", {
		// 	postData: JSON.stringify(post),
		// 	siteData: JSON.stringify(selectedSite),
		// });

		// const result = processResponse(response);

		// if (result) alert("Post created successfully");
		// else alert(response.message);

	};

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Panel - Metadata */}
      <Card>
        <CardContent className="space-y-6 pt-6">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setImage(e.target.value);
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Published</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag and press Enter"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag}>
                      {tag}
                      <Button onClick={() => removeTag(tag)}>×</Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button type="submit">Save Post</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Right Panel - Preview/Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
              {image ? (
                <img
                  src={image}
                  alt={title}
                  className="rounded-lg object-cover w-full h-full"
                />
              ) : (
                <p className="text-muted-foreground">No image selected</p>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{title || 'Untitled Post'}</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground">
                {excerpt || 'No excerpt provided'}
              </p>
            </div>

            <Button className="w-full" variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Post Content
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}