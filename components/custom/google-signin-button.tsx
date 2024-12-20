"use client";

import { signIn } from "next-auth/react";

import { GoogleIcon } from "./icons";
import { Button } from "../ui/button";

export function GoogleSignInButton() {
  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={() => signIn("google", { callbackUrl: "/" })}
    >
      <GoogleIcon size={18} />
      <span>Sign in with Google</span>
    </Button>
  );
}
