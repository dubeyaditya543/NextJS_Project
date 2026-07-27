"use client";

import { useAuth } from "@/context/AuthContext";
import { createPostAction } from "@/lib/actions/post-actions";
import { CreatePostFormValues, createPostSchema } from "@/lib/validations/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError } from "../ui/field";
import { Textarea } from "../ui/textarea";
import Image from "next/image";
import { Button } from "../ui/button";

export default function CreatePostForm() {
  const { user, accessToken } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState<number>(0);

  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema as any),
    defaultValues: {
      content: "",
    },
  });

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setFileInputKey((prev) => prev + 1);
  }

  async function onSubmit(values: CreatePostFormValues) {
    setServerError(null);

    const formData = new FormData();
    formData.append("content", values.content);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const result = await createPostAction(
      accessToken,
      { success: false },
      formData,
    );

    if (!result.success) {
      setServerError(result.error ?? "Something went wrong");
      return;
    }

    form.reset();
    clearImage();
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

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="content"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Textarea
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="What's happening?"
                maxLength={250}
                className="min-h-20 resize-none border-none bg-transparent text-lg focus-visible:ring-0"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {imagePreview && (
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <Image
              src={imagePreview}
              alt="selected image"
              width={500}
              height={300}
              unoptimized
              className="object-cover max-h-80 h-full w-full "
            />
            <Button
              type="button"
              onClick={clearImage}
              className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white hover:bg-black/90"
            >
              Remove
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <input
            key={fileInputKey}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className="text-sm text-muted-foreground"
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="bg-sky-500 hover:bg-sky-400"
          >
            {form.formState.isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
