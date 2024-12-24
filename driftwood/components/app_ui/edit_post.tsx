import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Edit } from "lucide-react";

export default function PostEditor({ post, onSave }) {
  const [title, setTitle] = useState(post?.title || '');
  const [tags, setTags] = useState(post?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [image, setImage] = useState(post?.image || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [published, setPublished] = useState(post?.published || false);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    onSave({
      title,
      tags,
      image,
      excerpt,
      published
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Panel - Metadata */}
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Post Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <Input
              id="tags"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type tag and press Enter"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Featured Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Enter image URL"
              />
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Enter a brief excerpt"
              className="h-32"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="published">Published</Label>
            <Switch
              id="published"
              checked={published}
              onCheckedChange={setPublished}
            />
          </div>
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

      <div className="lg:col-span-2 flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSubmit}>Save Post</Button>
      </div>
    </div>
  );
}