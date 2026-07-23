"use client";

import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/authFetch";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
}

export default function LikeButton({
  postId,
  initialLikeCount,
}: LikeButtonProps) {
  const { user, accessToken } = useAuth();
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (!user) {
      router.push("/login");
      return;
    }

    if (isPending) {
      return;
    }

    const previousLiked = liked;
    const previousCount = likeCount;

    setLiked(!previousLiked);
    setLikeCount(previousLiked ? previousCount - 1 : previousCount + 1);
    setIsPending(true);

    try {
      const res = await authFetch(`/api/posts/${postId}/like`, accessToken, {
        method: previousLiked ? "DELETE" : "POST",
      });

      if (!res.ok) {
        setLiked(previousLiked);
        setLikeCount(previousCount);
        return;
      }

      const json = await res.json();
      setLiked(json.data.liked);
      setLikeCount(json.data.likeCount);
    } catch {
      setLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
      onClick={handleClick}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        liked ? "text-pink-500" : "text-neutral-500 hover:text-pink-400"
      }`}
    >
      <svg
        className="h-4 w-4"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {likeCount}
    </Button>
  );
}
