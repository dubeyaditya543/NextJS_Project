import FollowButton from "@/components/web/FollowButton";
import PostCard from "@/components/web/PostCard";
import { connectDB } from "@/lib/db";
import { Follow } from "@/lib/models/Follow";
import { Post } from "@/lib/models/Post";
import { User } from "@/lib/models/User";
import { getCurrentUserFromCookies } from "@/lib/serverAuth";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  await connectDB();

  const profileUser = await User.findOne({
    username: username.toLowerCase(),
  }).lean();

  if (!profileUser) {
    notFound();
  }

  const [posts, viewer] = await Promise.all([
    Post.find({ author: profileUser._id })
      .sort({ createdAt: -1 })
      .populate("author", "username displayName avatarUrl")
      .lean(),
    getCurrentUserFromCookies(),
  ]);

  let isFollowing = false;
  if (viewer && viewer.userId !== profileUser._id.toString()) {
    const followDoc = await Follow.findOne({
      follower: viewer.userId,
      following: profileUser._id,
    }).lean();
    isFollowing = !!followDoc;
  }

  const isOwnProfile = viewer?.userId === profileUser._id.toString();

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl border-x border-border bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <h1 className="text-xl font-bold text-foreground">
          {profileUser.displayName}
        </h1>
        <p className="text-sm text-muted-foreground">{posts.length} posts</p>
      </div>

      <div className="border-b border-border px-4 py-4">
        <div className="flex items-start justify-between">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-neutral-800 text-2xl font-semibold text-neutral-400">
            <div className="flex h-full w-full items-center justify-center">
              {profileUser.displayName.charAt(0).toUpperCase()}
            </div>
          </div>

          {!isOwnProfile && viewer && (
            <FollowButton
              targetUserId={profileUser._id.toString()}
              initialIsFollowing={isFollowing}
            />
          )}
        </div>

        <h2 className="mt-3 text-lg font-bold text-foreground">
          {profileUser.username}
        </h2>
        <p className="text-sm text-muted-foreground">@{profileUser.username}</p>

        {profileUser.bio && (
          <p className="mt-2 text-foreground">{profileUser.bio}</p>
        )}

        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-foreground">
            <strong>{profileUser.followingCount}</strong>{" "}
            <span className="text-muted-foreground">Following</span>
          </span>
          <span className="text-foreground">
            <strong>{profileUser.followerCount}</strong>{" "}
            <span className="text-muted-foreground">Followers</span>
          </span>
        </div>
      </div>
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <PostCard post={JSON.parse(JSON.stringify(post))} key={post._id.toString()} />
        ))}
      </div>
    </main>
  );
}
