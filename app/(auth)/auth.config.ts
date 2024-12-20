import { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      let isLoggedIn = !!auth?.user;
      let isOnChat = nextUrl.pathname.startsWith("/");
      let isOnLogin = nextUrl.pathname.startsWith("/login");
      let isOnSignup = nextUrl.pathname.startsWith("/signup");
      let isAuthRoute = nextUrl.pathname.startsWith("/api/auth");

      if (isAuthRoute) return true;

      if (isLoggedIn && (isOnLogin || isOnSignup)) {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isOnLogin || isOnSignup) {
        return true;
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
