"use client";

import { Button } from "@/components/ui/button";
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
import { LoginFormValues, loginSchema } from "@/lib/validations/auth";
import { Input } from "@base-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onLoginFormSubmit(values: LoginFormValues) {
    setServerError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Login failed");
        return;
      }

      setAuth(json.data.user, json.data.accessToken);
      router.push("/");
    } catch {
      setServerError("Something went wrong. Please try again later");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-bold">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-lg font-bold text-foreground">
            C
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Welcome back to Chirp
          </h1>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground font-bold">Log in</CardTitle>
            <CardDescription>
              Enter your credentials to continue.
            </CardDescription>
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
              onSubmit={form.handleSubmit(onLoginFormSubmit)}
              className="space-y-4 text-foreground font-bold"
            >
              <Controller
                name="identifier"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="font-bold">
                      Username or email
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter email or username"
                      autoComplete="username"
                      className="border-2 border-stone-500 rounded-sm py-2 px-2"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="font-bold">
                      Password
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Enter your password"
                      aria-invalid={fieldState.invalid}
                      autoComplete={"current-password"}
                      type="password"
                      className="border-2 border-stone-500 rounded-sm py-2 px-2"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button
                className="w-full bg-sky-500 hover:bg-sky-400 hover:cursor-pointer"
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-sky-400 hover:underline hover:cursor-pointer"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
