"use client";

import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/authFetch";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export default function FollowButton({
  targetUserId,
  initialIsFollowing,
}: FollowButtonProps) {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (isPending) {
      return;
    }

    const previous = isFollowing;
    setIsFollowing(!previous);
    setIsPending(true);

    try {
      const res = await authFetch(
        `/api/users/${targetUserId}/follow`,
        accessToken,
        {
          method: previous ? "DELETE" : "POST",
        },
      );

      if (!res.ok) {
        setIsFollowing(previous);
        return;
      }

      const json = await res.json();
      setIsFollowing(json.data.following);
    } catch {
      setIsFollowing(previous);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={isFollowing ? "outline" : "default"}
      className={isFollowing ? "" : "bg-sky-500 hover:bg-sky-400"}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
