import PostCard from "@/components/web/PostCard";
import { ThemeToggle } from "@/components/web/ThemeToggle";
import { connectDB } from "@/lib/db";
import { Post } from "@/lib/models/Post";

export default async function HomePage() {
  await connectDB();

  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("author", "username displayName avatarUrl")
    .lean();

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl border-x border-border bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold text-foreground">Home</h1>
        <ThemeToggle />
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
          <p className="text-lg font-semibold text-foreground">No posts yet</p>
          <p className="text-sm text-neutral-500">
            Be the first to say something.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-800">
          {posts.map((post) => (
            <PostCard
              post={JSON.parse(JSON.stringify(post))}
              key={post._id.toString()}
            />
          ))}
        </div>
      )}
    </main>
  );
}
