"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { deletePostAction } from "@/lib/actions/post-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeletePostButtonProps {
  postId: string;
  author: string;
}

export default function DeletePostButton({ postId, author }: DeletePostButtonProps) {
  const {user, accessToken} = useAuth()
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null)

  if(!user || user.id !== author){
    return null
  }

  async function handleDelete(){
    setIsDeleting(true)
    setError(null)

    const response = await deletePostAction(accessToken, postId)

    if(!response.success){
      setError(response.error ?? "Failed to delete the post")
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <button
            className={"text-neutral-500 transition-colors hover:text-red-500"}
            aria-label={"Delete post"}
          >
            <Trash2 className={"h-4 w-4"} />
          </button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post
            {error && ` — ${error}`}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-500"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
