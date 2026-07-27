import CommentCard from "@/components/web/CommentCard";
import CreateCommentForm from "@/components/web/CreateCommentForm";
import PostCard from "@/components/web/PostCard";
import { connectDB } from "@/lib/db";
import { Comment } from "@/lib/models/Comment";
import { Post } from "@/lib/models/Post";
import { notFound } from "next/navigation";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;

  await connectDB();

  const post = await Post.findById(id)
    .populate("author", "username displayName avatarUrl")
    .lean();

  if (!post) {
    notFound();
  }

  const comments = await Comment.find({ post: id })
    .sort()
    .populate("author", "username displayName avatarUrl")
    .lean();

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl border-x border-border bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold text-foreground">Post</h1>
      </div>

      <PostCard post={JSON.parse(JSON.stringify(post))} />

      <CreateCommentForm postId={id} />

       <div className="divide-y divide-border">
        {comments.map((comment) => (
          <CommentCard key={comment._id.toString()} comment={JSON.parse(JSON.stringify(comment))} /> 
        ))}
       </div>
    </main>
  );
}
