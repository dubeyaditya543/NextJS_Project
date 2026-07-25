import Image from "next/image"
import Link from "next/link"
import { formatRelativeTime } from "./PostCard"

interface CommentCardProps{
  comment: {
    _id: string,
    content: string,
    createdAt: string,
    author: {
      username: string,
      displayName: string,
      avatarUrl: string
    }
  }
}

export default function CommentCard({comment}: CommentCardProps){
  return (
    <article className="flex gap-3 px-4 py-3">
      <Link href={`/profile/${comment.author.username}`} className="shrink-0">
        <div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-800">
          {comment.author.avatarUrl ? (
            <Image
              src={comment.author.avatarUrl}
              alt={comment.author.displayName}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-400">
              {comment.author.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-sm">
          <Link
            href={`/profile/${comment.author.username}`}
            className="font-semibold text-foreground hover:underline"
          >
            {comment.author.displayName}
          </Link>
          <span className="text-muted-foreground">
            @{comment.author.username}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap wrap-break-words text-foreground">
          {comment.content}
        </p>
      </div>
    </article>
  )
}