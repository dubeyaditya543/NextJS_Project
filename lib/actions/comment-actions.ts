"use server";

import {revalidatePath} from "next/cache";
import {connectDB} from "../db";
import {verifyAccessToken} from "../jwt";
import {Comment} from "../models/Comment";
import {Post} from "../models/Post";
import {createCommentSchema} from "../validations/comment";

export interface CreateCommentState {
    success: boolean;
    error?: string;
}

export async function createCommentAction(
    accessToken: string | null,
    postId: string,
    formData: FormData,
): Promise<CreateCommentState> {
    if (!accessToken) {
        return {success: false, error: "You must be logged in to comment"};
    }

    let authUser;
    try {
        authUser = verifyAccessToken(accessToken);
    } catch {
        return {success: false, error: "Your session has expired. Please log in"};
    }

    const parsed = createCommentSchema.safeParse({
        content: formData.get("content"),
    });

    if (!parsed.success) {
        return {success: false, error: parsed.error.issues[0].message};
    }

    try {
        await connectDB();

        const post = await Post.findById(postId);
        if (!post) {
            return {success: false, error: "Post with given id not found"};
        }

        await Comment.create({
            content: parsed.data.content,
            author: authUser.userId,
            post: postId,
        });

        await Post.findByIdAndUpdate(postId, {$inc: {commentCount: 1}});
    } catch {
        return {
            success: false,
            error: "Something went wrong. Please try again later",
        };
    }

    revalidatePath(`/posts/${postId}`);
    revalidatePath("/")
    return {success: true};
}

export async function deleteComments(accessToken: string | null, postId: string, commentId: string): Promise<{
    success: boolean,
    error?: string
}> {
    if (!accessToken) {
        return {success: false, error: "You must be logged in"}
    }

    let authUser;
    try {
        authUser = verifyAccessToken(accessToken)
    } catch {
        return {success: false, error: "Session expired. Please log in"}
    }

    try {
        await connectDB()

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return {success: false, error: "Comment not found"}
        }

        if (comment.author.toString() !== authUser.userId) {
            return {success: false, error: "Unauthorized"}
        }

        await comment.deleteOne()
        await Post.findByIdAndUpdate(postId, {$inc: {commentCount: -1}});
    } catch {
        return {success: false, error: "Something went wrong. Please try again"}
    }

    revalidatePath(`/posts/${postId}`)
    revalidatePath("/")
    return {success: true}
}