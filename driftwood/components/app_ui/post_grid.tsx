import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, } from "lucide-react";
import type { Post } from "@/types/post";
import { useSelectedPage } from "@/contexts/SelectedPageContext";
import { useSelectedPost } from "@/contexts/SelectedPostContext";
import { useCallback } from 'react';

interface RecentPostsProps {
  posts: Post[];
}

export default function RecentPosts({
  posts,
}: RecentPostsProps) {
  const { setSelectedPage } = useSelectedPage();
  const { setSelectedPost } = useSelectedPost();

  const handleEditClick = useCallback(() => {
    setSelectedPage("Edit Post");
  }, [setSelectedPage]);


  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.title}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>{new Date(post.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs
                  ${post.published
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}>
                  {post.published ? "Published" : "Draft"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedPost(post);
                      handleEditClick();
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {/* Don't think we want a quick-delete button here */}
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(post)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button> */}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}