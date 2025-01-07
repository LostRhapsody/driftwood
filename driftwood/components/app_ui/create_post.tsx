// Copy of edit post but for creating a new post
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import type { Post } from "@/types/post";
import { useSelectedSite } from "@/contexts/SelectedSiteContext";
import { useSelectedPost } from "@/contexts/SelectedPostContext";
import { useSelectedPage } from "@/contexts/SelectedPageContext";
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
import { invoke } from "@tauri-apps/api/core";
import { type DriftResponse, processResponse } from "@/types/response";

// Add schema at top of file
const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string(),
  image: z.string(),
  published: z.boolean(),
  tags: z.array(z.string()),
});

type PostFormValues = z.infer<typeof postFormSchema>;

export default function CreatePost() {
  const { selectedPost, setSelectedPost } = useSelectedPost();
  // Clear selected post when component is mounted, clears stale data
  setSelectedPost(null);

  const [title, setTitle] = useState(selectedPost?.title || '');
  const [tags, setTags] = useState(selectedPost?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [image, setImage] = useState(selectedPost?.image || '');
  const [excerpt, setExcerpt] = useState(selectedPost?.excerpt || '');
  const [published, setPublished] = useState(selectedPost?.published || false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const { selectedSite } = useSelectedSite();
  const { setSelectedPage } = useSelectedPage();

  // Set up form
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: selectedPost?.title || '',
      excerpt: selectedPost?.excerpt || '',
      image: selectedPost?.image || '',
      published: selectedPost?.published || false,
      tags: tags,
    },
  });

  // Watch tags field for changes
  useEffect(() => {
    form.setValue('tags', tags);
  }, [tags, form]);

  const watchImage = form.watch('image');

  useEffect(() => {
    const checkUrl = async (url: string) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(response);
        setIsValidUrl(response.ok);
      } catch (error) {
        setIsValidUrl(false);
      }
    };

    console.log(watchImage);
    if (watchImage) {
      checkUrl(watchImage);
    } else {
      setIsValidUrl(false);
    }
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

  const handleSubmit = async (form_data: PostFormValues) => {

    // if image URL has been set and is not valid, alert the user
    console.log(isValidUrl);
    console.log(image);
    if(!isValidUrl && image !== "") {
      alert("The image URL is not valid, please check it and try again.");
      return;
    }

    const new_post: Post = {
      ...form_data,
      post_id: selectedPost?.post_id ?? 0,
      site_id: selectedPost?.site_id ?? "",
      date: selectedPost?.date ?? "",
      filename: selectedPost?.filename ?? "",
      content: selectedPost?.content ?? "",
    };

    console.log(new_post);

    // TODO - on the backend, need to give this post a post_id before
    // attempting to serialize it, otherwise it will fail

    const response = await invoke<DriftResponse>("create_post", {
      postData: JSON.stringify(new_post),
      siteData: JSON.stringify(selectedSite),
    });

    const result = processResponse(response);

    if (result) {
      alert("Post created successfully");
      setSelectedPage("Edit Post");
      setSelectedPost(new_post);
    } else alert(response.message);

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
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setTitle(e.target.value);
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
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setExcerpt(e.target.value);
                        }}
                      />
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

              <Button type="submit">Create Post</Button>
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