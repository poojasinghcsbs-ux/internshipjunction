import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Heart, Plus, Send, Users } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { Pagination } from "@/components/common/pagination";
import { QueryState, ListSkeletonRows } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useCommunityPosts } from "@/lib/queries";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import type { CommunityPost } from "@/lib/types";

interface Comment { id: number; author: string; authorRole: string; content: string; createdAt: string }

export default function Community() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [tag, setTag] = useState("all");
  const [search, setSearch] = useState("");
  const [composing, setComposing] = useState(false);
  const [commenting, setCommenting] = useState<CommunityPost | null>(null);

  const tags = useQuery({ queryKey: ["community-tags"], queryFn: () => api.get<string[]>("/community/tags").then((r) => r.data) });
  const posts = useCommunityPosts({ page, pageSize: 8, tag: tag !== "all" ? tag : undefined, search: search || undefined });

  const createPost = useMutation({
    mutationFn: async (payload: { title: string; content: string; tags: string }) => api.post("/community/posts", payload),
    onSuccess: () => {
      toast.success("Post published!");
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      setComposing(false);
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const like = useMutation({
    mutationFn: async (id: number) => api.post(`/community/posts/${id}/like`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
  });

  return (
    <div>
      <DashboardPageHeader
        title="Community"
        description="Ask questions, share wins and learn alongside other InternshipJunction learners."
        action={<Button variant="gradient" onClick={() => setComposing(true)}><Plus className="size-4" /> New post</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Input className="max-w-xs" placeholder="Search discussions..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => { setTag("all"); setPage(1); }} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", tag === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>All</button>
          {(tags.data ?? []).map((t) => (
            <button key={t} onClick={() => { setTag(t); setPage(1); }} className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors", tag === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>{t}</button>
          ))}
        </div>
      </div>

      <QueryState
        isLoading={posts.isLoading}
        isError={posts.isError}
        error={posts.error}
        onRetry={() => posts.refetch()}
        skeleton={<ListSkeletonRows rows={4} />}
        isEmpty={(posts.data?.data ?? []).length === 0}
        empty={<EmptyState icon={Users} title="No posts yet" description="Be the first to start a discussion!" action={<Button onClick={() => setComposing(true)}>Create a post</Button>} />}
      >
        <div className="flex flex-col gap-4">
          {(posts.data?.data ?? []).map((post) => (
            <Card key={post.id} className="p-5">
              <div className="flex items-start gap-3">
                <Avatar name={post.author} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{post.author}</span>
                    <Badge variant="secondary" className="font-normal capitalize">{post.authorRole.replace("_", " ")}</Badge>
                    <span className="text-xs text-muted-foreground">· {formatDate(post.createdAt)}</span>
                  </div>
                  <h3 className="mt-1 text-base font-semibold">{post.title}</h3>
                  <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{post.content}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map((t) => <Badge key={t} variant="outline" className="font-normal">#{t}</Badge>)}
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <button type="button" onClick={() => like.mutate(post.id)} className={cn("inline-flex items-center gap-1.5 transition-colors", post.liked ? "text-primary" : "text-muted-foreground hover:text-primary")}>
                      <Heart className={cn("size-4", post.liked && "fill-current")} /> {post.likes}
                    </button>
                    <button type="button" onClick={() => setCommenting(post)} className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                      <MessageSquare className="size-4" /> {post.commentsCount}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {posts.data && posts.data.totalPages > 1 && (
          <div className="mt-6">
            <Pagination page={posts.data.page} totalPages={posts.data.totalPages} onChange={setPage} />
          </div>
        )}
      </QueryState>

      <PostDialog open={composing} onClose={() => setComposing(false)} submitting={createPost.isPending} onSubmit={(payload) => createPost.mutate(payload)} />
      <CommentsDialog post={commenting} onClose={() => setCommenting(null)} />
    </div>
  );
}

function PostDialog({ open, onClose, onSubmit, submitting }: { open: boolean; onClose: () => void; onSubmit: (p: { title: string; content: string; tags: string }) => void; submitting: boolean }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()} title="Create post">
      <DialogHeader>
        <DialogTitle>Start a discussion</DialogTitle>
        <DialogDescription>Share a question, resource or win with the community.</DialogDescription>
      </DialogHeader>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you want to discuss?" /></div>
        <div className="flex flex-col gap-1.5"><Label>Content</Label><Textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Add details..." /></div>
        <div className="flex flex-col gap-1.5"><Label>Tags (comma separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, career" /></div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="gradient" loading={submitting} disabled={!title || !content} onClick={() => { onSubmit({ title, content, tags }); setTitle(""); setContent(""); setTags(""); }}>Publish</Button>
        </div>
      </div>
    </Dialog>
  );
}

function CommentsDialog({ post, onClose }: { post: CommunityPost | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const comments = useQuery({
    queryKey: ["post-comments", post?.id],
    queryFn: () => api.get<Comment[]>(`/community/posts/${post!.id}/comments`).then((r) => r.data),
    enabled: Boolean(post),
  });
  const addComment = useMutation({
    mutationFn: async () => api.post(`/community/posts/${post!.id}/comments`, { content }),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["post-comments", post?.id] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <Dialog open={Boolean(post)} onOpenChange={(o) => !o && onClose()} title="Comments">
      <DialogHeader>
        <DialogTitle>Comments</DialogTitle>
        <DialogDescription>{post?.title}</DialogDescription>
      </DialogHeader>
      <div className="mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto">
        {(comments.data ?? []).map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <Avatar name={comment.author} />
            <div className="rounded-lg bg-muted px-3 py-2">
              <p className="text-xs font-semibold">{comment.author} <span className="font-normal text-muted-foreground">· {formatDate(comment.createdAt)}</span></p>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
        {(comments.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>}
      </div>
      <div className="mt-4 flex items-end gap-2">
        <Textarea rows={2} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a comment..." />
        <Button size="icon" variant="gradient" loading={addComment.isPending} disabled={!content.trim()} onClick={() => addComment.mutate()}><Send className="size-4" /></Button>
      </div>
    </Dialog>
  );
}
