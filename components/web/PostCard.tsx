import Image from "next/image";
import Link from "next/link";
import LikeButton from "./LikeButton";

interface PostCardProps {
  post: {
    _id: string;
    content: string;
    imageUrl: string;
    likeCount: number;
    commentCount: number;
    createdAt: string;
    author: {
      _id: string;
      username: string;
      displayName: string;
      avatarUrl: string;
    };
  };
}

function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="flex gap-3 px-4 py-3 transition-colors hover:bg-card">
      <Link href={`/profile/${post.author.username}`} className="shrink-0">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800">
          {post.author.avatarUrl ? (
            <Image
              src={post.author.avatarUrl}
              alt={post.author.displayName}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
              {post.author.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-sm">
          <Link
            href={`/profile/${post.author.username}`}
            className="font-semibold text-foreground hover:underline"
          >
            {post.author.displayName}
          </Link>
          <span className="text-neutral-500">@{post.author.username}</span>
          <span className="text-neutral-500">.</span>
          <span className="text-neutral-500">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        <p className="mt-1 whitespace-pre-wrap wrap-break-word text-foreground">
          {post.content}
        </p>

        {post.imageUrl && (
          <div className="relative mt-3 overflow-hidden rounded-2xl border border-border">
            <Image
              src={post.imageUrl}
              alt="Post image"
              width={600}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="mt-3 flex items-center gap-6 text-neutral-500">
          <LikeButton postId={post._id} initialLikeCount={post.likeCount} />
          <Link
            href={`/posts/${post._id}`}
            className="flex items-center gap-1.5 text-sm transition-colors hover:text-sky-400"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {post.commentCount}
          </Link>
        </div>
      </div>
    </article>
  );
}
