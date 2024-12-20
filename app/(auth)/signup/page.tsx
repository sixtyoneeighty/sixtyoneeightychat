"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/custom/auth-form";
import { GoogleSignInButton } from "@/components/custom/google-signin-button";
import { SubmitButton } from "@/components/custom/submit-button";

import { register, RegisterActionState } from "../actions";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: "idle",
    },
  );

  useEffect(() => {
    if (state.status === "failed") {
      toast.error("Failed to create account!");
    } else if (state.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state.status === "user_exists") {
      toast.error("An account with this email already exists!");
    } else if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign Up</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Create an account or use Google to sign up
          </p>
        </div>

        <div className="flex flex-col gap-6 px-4 sm:px-16">
          <GoogleSignInButton />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-gray-500 dark:text-zinc-400">Or continue with</span>
            </div>
          </div>

          <AuthForm action={handleSubmit} defaultEmail={email}>
            <SubmitButton>Create Account</SubmitButton>
            <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-gray-800 dark:text-zinc-200"
              >
                Sign in
              </Link>
            </p>
          </AuthForm>
        </div>
      </div>
    </div>
  );
}
