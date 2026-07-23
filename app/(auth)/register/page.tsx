"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/context/AuthContext";
import { RegisterFormValues, registerSchema } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema as any),
    values: {
      displayName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  async function onRegisterFormSubmit(values: RegisterFormValues) {
    setServerError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Registration failed");
        return;
      }

      setAuth(json.data.user, json.data.accessToken);
      router.push("/");
    } catch {
      setServerError("Something went wrong. Please try again");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm flex-col items-center justify-between space-y-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-lg font-bold text-foreground">
            C
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Join Chirp today
          </h1>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              Create your account
            </CardTitle>
            <CardDescription>It only takes a minute.</CardDescription>
          </CardHeader>

          <CardContent>
            {serverError && (
              <p
                className="mb-4 rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-400"
                role="alert"
              >
                {serverError}
              </p>
            )}

            <form
              onSubmit={form.handleSubmit(onRegisterFormSubmit)}
              className="space-y-4 text-foreground font-bold"
            >
              <Controller
                name="displayName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className={"font-bold"}>
                      Display Name
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your name"
                      autoComplete="name"
                      className={"border-2 border-stone-500 rounded-sm p-2"}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="font-bold">
                      Username
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your username"
                      autoComplete="username"
                      className={"border-2 border-stone-500 rounded-sm p-2"}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className={"font-bold"}>
                      Email
                    </FieldLabel>

                    <Input
                      type="email"
                      id={field.name}
                      {...field}
                      placeholder="Enter your email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      className={"border-2 border-stone-500 rounded-sm p-2"}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className={"font-bold"}>
                      Password
                    </FieldLabel>

                    <Input
                      type="password"
                      id={field.name}
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your password"
                      autoComplete="new-password"
                      className={"border-2 border-stone-500 rounded-sm p-2"}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button
                disabled={form.formState.isSubmitting}
                type="submit"
                className={
                  "w-full hover:cursor-pointer bg-sky-500 hover:bg-sky-400"
                }
              >
                {form.formState.isSubmitting ? "Signing up..." : "Sign up"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-sky-400 hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
