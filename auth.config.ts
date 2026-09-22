import type { NextAuthConfig } from "next-auth";

const isProduction = process.env.NODE_ENV === "production";

export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  cookies: {
    sessionToken: {
      name: isProduction ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction
      }
    }
  },
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const publicPath =
        path === "/" ||
        path === "/login" ||
        path.startsWith("/api/auth");

      if (publicPath) return true;
      return Boolean(auth?.user);
    }
  }
} satisfies NextAuthConfig;
