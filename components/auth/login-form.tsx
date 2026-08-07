"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  loginSchema,
  type LoginSchema,
} from "@/schemas/login-schema";

import { signIn } from "@/lib/auth/login";

export function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] =
    useState(false);

  const [authError, setAuthError] =
    useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = watch("email");
  const password = watch("password");

  const isReady =
    email.trim().length > 0 &&
    password.trim().length >= 6;

  async function onSubmit(data: LoginSchema) {
    setAuthError("");

    const { error } = await signIn(
      data.email,
      data.password
    );

    if (error) {
      setAuthError(error.message);
      return;
    }

    router.replace("/admin/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div>
        <Input
          type="email"
          placeholder="Email address"
          {...register("email")}
        />

        {errors.email && (
          <p className="mt-2 text-sm text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="relative">
        <Input
          type={
            showPassword
              ? "text"
              : "password"
          }
          placeholder="Password"
          {...register("password")}
        />

        <button
          type="button"
          className="absolute right-3 top-3 text-neutral-500"
          onClick={() =>
            setShowPassword(!showPassword)
          }
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>

        {errors.password && (
          <p className="mt-2 text-sm text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      {authError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {authError}
        </div>
      )}

      <Button
        type="submit"
        disabled={!isReady || isSubmitting}
        className={`w-full transition ${
          isReady
            ? "bg-sky-600 hover:bg-sky-700"
            : "border border-neutral-300 bg-white text-neutral-400"
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}