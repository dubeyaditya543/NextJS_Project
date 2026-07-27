"use client";

import { useAuth } from "@/context/AuthContext";
import { createCommentAction } from "@/lib/actions/comment-actions";
import {
  CreateCommentFormValues,
  createCommentSchema,
} from "@/lib/validations/comment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface CreateCommentProps {
  postId: string;
}

export default function CreateCommentForm({ postId }: CreateCommentProps) {
  const { user, accessToken } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateCommentFormValues>({
    resolver: zodResolver(createCommentSchema as any),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: CreateCommentFormValues) {
    setServerError(null);

    const formData = new FormData();
    formData.append("content", values.content);

    const result = await createCommentAction(accessToken, postId, formData);

    if (!result.success) {
      setServerError(result.error ?? "Something went wrong. Please try again");
      return;
    }

    form.reset();
  }

  if (!user) {
    return null;
  }

  return (
    <div className="border-b border-border px-4 py-3">
      {serverError && (
        <p
          className="mb-3 rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-400"
          role="alert"
        >
          {serverError}
        </p>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <Controller
          control={form.control}
          name="content"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Textarea
                id={field.name}
                {...field}
                aria-invalid={fieldState.invalid}
                maxLength={250}
                placeholder="Enter what's on your mind"
                className="min-h-16 resize-none border-none bg-transparent focus-visible:ring-0"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="bg-sky-500 hover:bg-sky-400"
          >
            {form.formState.isSubmitting ? "Replying..." : "Reply"}
          </Button>
        </div>
      </form>
    </div>
  );
}
