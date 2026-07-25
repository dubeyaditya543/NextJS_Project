"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/web/ThemeToggle";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import Image from "next/image";

export default function NavBar() {
  const { user, isLoading, clearAuth } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    clearAuth();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
            C
          </div>
          <span className="text-lg font-bold text-foreground">Chirp</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={"hover:cursor-pointer"}
                render={
                  <button className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-neutral-800 text-sm font-semibold text-foreground">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.displayName}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user.displayName.charAt(0).toUpperCase()
                    )}
                  </button>
                }
              />
              <DropdownMenuContent
                align="end"
                className={"hover:cursor-pointer"}
              >
                <DropdownMenuItem
                  className={"hover:cursor-pointer"}
                  render={
                    <Link href={`/profile/${user.username}`}>Profile</Link>
                  }
                />
                <DropdownMenuItem
                  className={"hover:cursor-pointer"}
                  onClick={handleLogout}
                  render={<span>Logout</span>}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button className="bg-sky-500 hover:bg-sky-400">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
